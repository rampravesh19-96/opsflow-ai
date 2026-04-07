import { count, eq, ne } from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { actionRuns, orders, users } from "@/server/db/schema";
import type { ActionRunRecord, CommandCenterMetric, IssueBucket } from "@/server/types/domain";
import { getIssueOrdersList, getOrdersList } from "@/server/repositories/orders";

export async function getCommandCenterData() {
  const db = getDb();
  const ordersList = await getOrdersList();

  const [openQueuesRow, paymentFailuresRow, issueReviewRow, actionRowsRaw] = await Promise.all([
    db.select({ value: count() }).from(orders).where(ne(orders.queueStatus, "resolved")),
    db.select({ value: count() }).from(orders).where(ne(orders.paymentStatus, "paid")),
    db
      .select({ value: count() })
      .from(orders)
      .where(eq(orders.queueStatus, "pending_review")),
    db
      .select({
        id: actionRuns.id,
        actionType: actionRuns.actionType,
        status: actionRuns.status,
        createdAt: actionRuns.createdAt,
        orderExternalId: orders.externalOrderId,
        orderDisplayId: orders.displayId,
        requestedBy: users.fullName,
      })
      .from(actionRuns)
      .innerJoin(orders, eq(actionRuns.orderId, orders.id))
      .leftJoin(users, eq(actionRuns.requestedByUserId, users.id)),
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
      value: `$${(atRiskOrders.reduce((sum, order) => sum + order.totalAmount, 0) / 1000).toFixed(1)}K`,
      delta: `${criticalOrders.length} critical orders`,
    },
    {
      label: "Payment failures",
      value: String(paymentFailuresRow[0]?.value ?? 0),
      delta: `${ordersList.filter((order) => order.paymentStatus === "failed").length} hard failures`,
    },
    {
      label: "SLA nearing breach",
      value: String(slaRiskOrders.length),
      delta: `${ordersList.filter((order) => order.fulfillmentStatus === "delayed").length} delayed shipments`,
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

  const actionRunsList: ActionRunRecord[] = actionRowsRaw.map((actionRun) => ({
    id: actionRun.id,
    orderId: actionRun.orderExternalId,
    orderDisplayId: actionRun.orderDisplayId,
    actionType: actionRun.actionType,
    status: actionRun.status,
    requestedBy: actionRun.requestedBy ?? "System",
    createdAt: actionRun.createdAt.toISOString(),
  }));

  return {
    metrics,
    issueBuckets,
    criticalOrders: ordersList
      .filter((order) => order.health === "blocked" || order.health === "at_risk")
      .slice(0, 3),
    issueOrders: ordersList.filter((order) => order.health !== "healthy"),
    actionRuns: actionRunsList,
  };
}

export async function getIssuesList() {
  return getIssueOrdersList();
}

export async function getActionRunsList() {
  const { actionRuns } = await getCommandCenterData();
  return actionRuns;
}
