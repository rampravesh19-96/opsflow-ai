"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { deriveOrderAiGuidance } from "@/server/ai/order-assistant";
import { getDb } from "@/server/db/client";
import {
  actionRuns,
  aiInsights,
  fulfillments,
  orderEvents,
  orderNotes,
  orders,
  payments,
  users,
} from "@/server/db/schema";
import { getOrderWorkspaceById } from "@/server/repositories/orders";

const updateOrderWorkflowSchema = z.object({
  orderId: z.string().min(1),
  customerExternalId: z.string().min(1),
  assignedUserId: z.string().optional(),
  priority: z.enum(["low", "normal", "high", "critical"]),
  queueStatus: z.enum(["active", "pending_review", "resolved"]),
});

const addNoteSchema = z.object({
  orderId: z.string().min(1),
  customerExternalId: z.string().min(1),
  authorUserId: z.string().min(1),
  body: z.string().trim().min(3).max(2000),
});

const runRecoveryActionSchema = z.object({
  orderId: z.string().min(1),
  customerExternalId: z.string().min(1),
  requestedByUserId: z.string().min(1),
  actionType: z.enum(["retry_payment_capture", "release_fulfillment_hold", "resync_order"]),
});

function revalidateOrderSurfaces(orderId: string, customerExternalId: string) {
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/issues");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/customers/${customerExternalId}`);
}

async function refreshAiInsightsForOrder(orderId: string) {
  const workspace = await getOrderWorkspaceById(orderId);

  if (!workspace) {
    return;
  }

  const guidance = deriveOrderAiGuidance(workspace.order, workspace.actionRuns);
  const db = getDb();

  await db.transaction(async (tx) => {
    const rows = await tx
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.externalOrderId, orderId))
      .limit(1);

    const order = rows[0];

    if (!order) {
      return;
    }

    await tx.delete(aiInsights).where(eq(aiInsights.orderId, order.id));
    await tx.insert(aiInsights).values([
      {
        orderId: order.id,
        type: "support_summary",
        content: guidance.summary,
        confidenceScore: guidance.confidence,
      },
      {
        orderId: order.id,
        type: "issue_classification",
        content: guidance.issueType,
        confidenceScore: guidance.confidence,
      },
      {
        orderId: order.id,
        type: "next_action",
        content: guidance.nextAction,
        confidenceScore: guidance.confidence,
      },
    ]);
  });
}

export async function updateOrderWorkflowAction(formData: FormData) {
  const parsed = updateOrderWorkflowSchema.parse({
    orderId: formData.get("orderId"),
    customerExternalId: formData.get("customerExternalId"),
    assignedUserId: (formData.get("assignedUserId") ?? "").toString() || undefined,
    priority: formData.get("priority"),
    queueStatus: formData.get("queueStatus"),
  });

  const db = getDb();

  const currentRows = await db
    .select({
      id: orders.id,
      priority: orders.priority,
      queueStatus: orders.queueStatus,
      assignedUserId: orders.assignedUserId,
    })
    .from(orders)
    .where(eq(orders.externalOrderId, parsed.orderId))
    .limit(1);

  const current = currentRows[0];

  if (!current) {
    throw new Error("Order not found.");
  }

  const assignedUserRows =
    parsed.assignedUserId !== undefined
      ? await db
          .select({ fullName: users.fullName })
          .from(users)
          .where(eq(users.id, parsed.assignedUserId))
          .limit(1)
      : [];

  const assignedUserName = parsed.assignedUserId
    ? assignedUserRows[0]?.fullName ?? "Unknown operator"
    : "Unassigned";

  const changes: string[] = [];

  if (current.priority !== parsed.priority) {
    changes.push(`Priority updated to ${parsed.priority}.`);
  }

  if (current.queueStatus !== parsed.queueStatus) {
    changes.push(`Case status updated to ${parsed.queueStatus}.`);
  }

  if ((current.assignedUserId ?? null) !== (parsed.assignedUserId ?? null)) {
    changes.push(`Assignment updated to ${assignedUserName}.`);
  }

  if (!changes.length) {
    return;
  }

  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        assignedUserId: parsed.assignedUserId ?? null,
        priority: parsed.priority,
        queueStatus: parsed.queueStatus,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, current.id));

    await tx.insert(orderEvents).values(
      changes.map((summary, index) => ({
        orderId: current.id,
        eventType: "operator_update",
        actorLabel: "Operator Console",
        summary,
        payload: {
          changeIndex: index,
          assignedUserId: parsed.assignedUserId ?? null,
          priority: parsed.priority,
          queueStatus: parsed.queueStatus,
        },
        occurredAt: new Date(),
      })),
    );
  });

  await refreshAiInsightsForOrder(parsed.orderId);
  revalidateOrderSurfaces(parsed.orderId, parsed.customerExternalId);
}

export async function addOrderNoteAction(formData: FormData) {
  const parsed = addNoteSchema.parse({
    orderId: formData.get("orderId"),
    customerExternalId: formData.get("customerExternalId"),
    authorUserId: formData.get("authorUserId"),
    body: formData.get("body"),
  });

  const db = getDb();

  const [orderRow, authorRow] = await Promise.all([
    db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.externalOrderId, parsed.orderId))
      .limit(1),
    db
      .select({ fullName: users.fullName })
      .from(users)
      .where(eq(users.id, parsed.authorUserId))
      .limit(1),
  ]);

  const order = orderRow[0];
  const author = authorRow[0];

  if (!order || !author) {
    throw new Error("Unable to add note.");
  }

  await db.transaction(async (tx) => {
    await tx.insert(orderNotes).values({
      orderId: order.id,
      authorUserId: parsed.authorUserId,
      body: parsed.body,
    });

    await tx
      .update(orders)
      .set({
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    await tx.insert(orderEvents).values({
      orderId: order.id,
      eventType: "internal_note_added",
      actorLabel: author.fullName,
      summary: "Internal note added.",
      payload: {
        notePreview: parsed.body.slice(0, 120),
      },
      occurredAt: new Date(),
    });
  });

  await refreshAiInsightsForOrder(parsed.orderId);
  revalidateOrderSurfaces(parsed.orderId, parsed.customerExternalId);
}

export async function runRecoveryAction(formData: FormData) {
  const parsed = runRecoveryActionSchema.parse({
    orderId: formData.get("orderId"),
    customerExternalId: formData.get("customerExternalId"),
    requestedByUserId: formData.get("requestedByUserId"),
    actionType: formData.get("actionType"),
  });

  const db = getDb();

  const rows = await db
    .select({
      id: orders.id,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      queueStatus: orders.queueStatus,
      health: orders.health,
      issueLabel: orders.issueLabel,
      riskReason: orders.riskReason,
      paymentId: payments.id,
      paymentErrorCode: payments.lastErrorCode,
      fulfillmentId: fulfillments.id,
      requesterName: users.fullName,
    })
    .from(orders)
    .leftJoin(payments, eq(payments.orderId, orders.id))
    .leftJoin(fulfillments, eq(fulfillments.orderId, orders.id))
    .innerJoin(users, eq(users.id, parsed.requestedByUserId))
    .where(eq(orders.externalOrderId, parsed.orderId))
    .limit(1);

  const current = rows[0];

  if (!current) {
    throw new Error("Order not found for recovery action.");
  }

  const now = new Date();
  let runStatus: "completed" | "failed" = "completed";
  let resultSummary = "";

  await db.transaction(async (tx) => {
    if (parsed.actionType === "retry_payment_capture") {
      if (current.paymentStatus === "paid") {
        runStatus = "failed";
        resultSummary = "Retry skipped because payment is already settled.";
      } else {
        await tx
          .update(orders)
          .set({
            paymentStatus: "requires_action",
            queueStatus: "pending_review",
            health: "at_risk",
            priority: "high",
            issueLabel: "Payment requires customer reauthorization",
            riskReason:
              "Capture retry escalated the case to customer reauthorization before fulfillment can proceed.",
            updatedAt: now,
          })
          .where(eq(orders.id, current.id));

        if (current.paymentId) {
          await tx
            .update(payments)
            .set({
              status: "requires_action",
              lastErrorCode: current.paymentErrorCode ?? "reauthorization_required",
              lastErrorMessage:
                "Customer reauthorization required after capture retry was attempted.",
            })
            .where(eq(payments.id, current.paymentId));
        }

        resultSummary =
          "Payment retry was executed and escalated to customer reauthorization.";
      }
    }

    if (parsed.actionType === "release_fulfillment_hold") {
      if (current.paymentStatus !== "paid") {
        runStatus = "failed";
        resultSummary = "Fulfillment hold could not be released until payment is settled.";
      } else {
        await tx
          .update(orders)
          .set({
            fulfillmentStatus: "packing",
            queueStatus: "active",
            health: "watch",
            issueLabel: "Fulfillment released to warehouse",
            riskReason:
              "Operational hold released and the order returned to active warehouse processing.",
            updatedAt: now,
          })
          .where(eq(orders.id, current.id));

        if (current.fulfillmentId) {
          await tx
            .update(fulfillments)
            .set({
              status: "packing",
              updatedAt: now,
            })
            .where(eq(fulfillments.id, current.fulfillmentId));
        }

        resultSummary =
          "Fulfillment hold was released and the order moved back into packing.";
      }
    }

    if (parsed.actionType === "resync_order") {
      const nextHealth =
        current.paymentStatus === "paid" && current.fulfillmentStatus === "packing"
          ? "healthy"
          : current.paymentStatus === "paid"
            ? "watch"
            : "at_risk";
      const nextQueueStatus =
        current.paymentStatus === "paid" && current.fulfillmentStatus === "packing"
          ? "resolved"
          : "active";

      await tx
        .update(orders)
        .set({
          health: nextHealth,
          queueStatus: nextQueueStatus,
          issueLabel:
            nextQueueStatus === "resolved"
              ? "Resynced and stabilized"
              : current.issueLabel ?? "Resynced order state",
          riskReason:
            nextQueueStatus === "resolved"
              ? "State resync confirmed the order is stable and downstream processing is healthy."
              : "State resync completed and the order remains under active monitoring.",
          updatedAt: now,
        })
        .where(eq(orders.id, current.id));

      resultSummary =
        nextQueueStatus === "resolved"
          ? "Order state resynced and the case was resolved."
          : "Order state resynced and kept under active monitoring.";
    }

    await tx.insert(actionRuns).values({
      orderId: current.id,
      actionType: parsed.actionType,
      status: runStatus,
      requestedByUserId: parsed.requestedByUserId,
      input: {
        fromPaymentStatus: current.paymentStatus,
        fromFulfillmentStatus: current.fulfillmentStatus,
        fromQueueStatus: current.queueStatus,
      },
      result: {
        summary: resultSummary,
      },
      createdAt: now,
      finishedAt: now,
    });

    await tx.insert(orderEvents).values({
      orderId: current.id,
      eventType: "recovery_action_executed",
      actorLabel: current.requesterName,
      summary: `${parsed.actionType} finished as ${runStatus}.`,
      payload: {
        actionType: parsed.actionType,
        status: runStatus,
        resultSummary,
      },
      occurredAt: now,
    });
  });

  await refreshAiInsightsForOrder(parsed.orderId);
  revalidateOrderSurfaces(parsed.orderId, parsed.customerExternalId);
}
