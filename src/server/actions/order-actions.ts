"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getDb } from "@/server/db/client";
import { orderEvents, orderNotes, orders, users } from "@/server/db/schema";

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

function revalidateOrderSurfaces(orderId: string, customerExternalId: string) {
  revalidatePath("/");
  revalidatePath("/orders");
  revalidatePath("/issues");
  revalidatePath(`/orders/${orderId}`);
  revalidatePath(`/customers/${customerExternalId}`);
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

  revalidateOrderSurfaces(parsed.orderId, parsed.customerExternalId);
}
