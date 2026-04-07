import { count, desc, eq, ne, sql } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { actionRuns, orders, users } from "@/server/db/schema";
import type {
  ActionRunRecord,
  CommandCenterMetric,
  IssueBucket,
  OperatorWorkload,
  QueueSegment,
} from "@/server/types/domain";
import { getOrdersList } from "@/server/repositories/orders";

export function buildQueueSegments(
  ordersList: Awaited<ReturnType<typeof getOrdersList>>,
): QueueSegment[] {
  return [
    {
      label: "Critical queue",
      href: "/orders?priority=critical",
      count: ordersList.filter((order) => order.priority === "critical").length,
      description: "Highest priority orders needing operator intervention.",
      tone: "danger",
    },
    {
      label: "Pending review",
      href: "/orders?queueStatus=pending_review",
      count: ordersList.filter((order) => order.queueStatus === "pending_review").length,
      description: "Cases waiting on manual review or approval.",
      tone: "warning",
    },
    {
      label: "Payment recovery",
      href: "/issues?paymentStatus=failed",
      count: ordersList.filter((order) => order.paymentStatus === "failed").length,
      description: "Orders blocked by failed capture or settlement issues.",
      tone: "accent",
    },
    {
      label: "Fulfillment delay",
      href: "/issues?fulfillmentStatus=delayed",
      count: ordersList.filter((order) => order.fulfillmentStatus === "delayed").length,
      description: "Orders delayed after payment is already cleared.",
      tone: "default",
    },
    {
      label: "Unassigned cases",
      href: "/orders?assignedUserId=unassigned",
      count: ordersList.filter((order) => order.assignedTo === "Unassigned").length,
      description: "Orders that still need an operator owner.",
      tone: "success",
    },
  ];
}

export function buildOperatorWorkload(
  operators: { id: string; fullName: string }[],
  ordersList: Awaited<ReturnType<typeof getOrdersList>>,
) {
  return operators
    .map<OperatorWorkload>((operator) => {
      const assignedOrders = ordersList.filter((order) => order.assignedTo === operator.fullName);

      return {
        operatorId: operator.id,
        operatorName: operator.fullName,
        activeCases: assignedOrders.filter((order) => order.queueStatus !== "resolved").length,
        criticalCases: assignedOrders.filter((order) => order.priority === "critical").length,
        blockedCases: assignedOrders.filter((order) => order.health === "blocked").length,
        pendingReviewCases: assignedOrders.filter((order) => order.queueStatus === "pending_review")
          .length,
      };
    })
    .filter((operator) => operator.activeCases > 0)
    .sort((left, right) => right.activeCases - left.activeCases);
}

export async function getActionRunsList(limit?: number) {
  const db = getDb();

  const rows = await db
    .select({
      id: actionRuns.id,
      actionType: actionRuns.actionType,
      status: actionRuns.status,
      createdAt: actionRuns.createdAt,
      orderExternalId: orders.externalOrderId,
      orderDisplayId: orders.displayId,
      requestedBy: users.fullName,
      resultSummary: sql<string>`coalesce(${actionRuns.result}->>'summary', '')`,
    })
    .from(actionRuns)
    .innerJoin(orders, eq(actionRuns.orderId, orders.id))
    .leftJoin(users, eq(actionRuns.requestedByUserId, users.id))
    .orderBy(desc(actionRuns.createdAt))
    .limit(limit ?? 100);

  return rows.map<ActionRunRecord>((actionRun) => ({
    id: actionRun.id,
    orderId: actionRun.orderExternalId,
    orderDisplayId: actionRun.orderDisplayId,
    actionType: actionRun.actionType,
    status: actionRun.status,
    requestedBy: actionRun.requestedBy ?? "System",
    createdAt: actionRun.createdAt.toISOString(),
    resultSummary: actionRun.resultSummary || undefined,
  }));
}

export async function getCommandCenterData() {
  const db = getDb();

  const [ordersList, openQueuesRow, paymentFailuresRow, issueReviewRow, actionRunsList, operatorRows] =
    await Promise.all([
      getOrdersList(),
      db.select({ value: count() }).from(orders).where(ne(orders.queueStatus, "resolved")),
      db.select({ value: count() }).from(orders).where(ne(orders.paymentStatus, "paid")),
      db
        .select({ value: count() })
        .from(orders)
        .where(eq(orders.queueStatus, "pending_review")),
      getActionRunsList(4),
      db
        .select({
          id: users.id,
          fullName: users.fullName,
        })
        .from(users)
        .orderBy(users.fullName),
    ]);

  const atRiskOrders = ordersList.filter(
    (order) => order.health === "blocked" || order.health === "at_risk",
  );
  const criticalOrders = ordersList.filter((order) => order.priority === "critical");
  const slaRiskOrders = ordersList.filter(
    (order) => order.fulfillmentStatus === "delayed" || order.paymentStatus !== "paid",
  );

  const metrics: CommandCenterMetric[] = [
    {
      label: "Open queues",
      value: String(openQueuesRow[0]?.value ?? 0),
      delta: `${issueReviewRow[0]?.value ?? 0} pending review`,
    },
    {
      label: "At-risk GMV",
      value: `$${(atRiskOrders.reduce((sum, order) => sum + order.totalAmount, 0) / 1000).toFixed(
        1,
      )}K`,
      delta: `${criticalOrders.length} critical orders`,
    },
    {
      label: "Payment failures",
      value: String(paymentFailuresRow[0]?.value ?? 0),
      delta: `${
        ordersList.filter((order) => order.paymentStatus === "failed").length
      } hard failures`,
    },
    {
      label: "SLA nearing breach",
      value: String(slaRiskOrders.length),
      delta: `${
        ordersList.filter((order) => order.fulfillmentStatus === "delayed").length
      } delayed shipments`,
    },
  ];

  const issueBuckets: IssueBucket[] = [
    {
      label: "Payment",
      count: ordersList.filter((order) => order.paymentStatus !== "paid").length,
    },
    {
      label: "Fulfillment",
      count: ordersList.filter((order) => order.fulfillmentStatus === "delayed").length,
    },
    {
      label: "Review",
      count: issueReviewRow[0]?.value ?? 0,
    },
  ];

  return {
    metrics,
    issueBuckets,
    criticalOrders: ordersList
      .filter((order) => order.health === "blocked" || order.health === "at_risk")
      .slice(0, 3),
    issueOrders: ordersList.filter((order) => order.health !== "healthy"),
    actionRuns: actionRunsList,
    queueSegments: buildQueueSegments(ordersList),
    operatorWorkload: buildOperatorWorkload(operatorRows, ordersList),
  };
}
