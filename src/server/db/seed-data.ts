import { demoOrders } from "@/server/demo-data/orders";

export const seedUsers = [
  {
    key: "nina",
    fullName: "Nina Alvarez",
    email: "nina.alvarez@opsflow.ai",
    team: "operations",
  },
  {
    key: "marcus",
    fullName: "Marcus Reid",
    email: "marcus.reid@opsflow.ai",
    team: "support",
  },
];

export const seedCustomers = [
  ...new Map(
    demoOrders.map((order) => [
      order.customer.id,
      {
        externalCustomerId: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        segment: order.customer.segment,
        region: order.customer.region,
      },
    ]),
  ).values(),
];

export const seedOrders = demoOrders.map((order) => ({
  externalOrderId: order.id,
  displayId: order.displayId,
  customerExternalId: order.customer.id,
  assignedUserEmail:
    order.assignedTo === "Nina Alvarez"
      ? "nina.alvarez@opsflow.ai"
      : order.assignedTo === "Marcus Reid"
        ? "marcus.reid@opsflow.ai"
        : null,
  channel: order.channel,
  queueStatus: order.queueStatus,
  health: order.health,
  priority: order.priority,
  paymentStatus: order.paymentStatus,
  fulfillmentStatus: order.fulfillmentStatus,
  issueLabel: order.issueLabel,
  riskReason: order.riskReason,
  shippingMethod: order.shippingMethod,
  currencyCode: order.currency,
  totalAmount: order.totalAmount,
  createdAt: order.createdAt,
  updatedAt: order.timeline.at(-1)?.occurredAt ?? order.createdAt,
}));

export const seedPayments = demoOrders.map((order) => ({
  orderExternalId: order.id,
  provider: order.channel === "marketplace" ? "marketplace-pay" : "stripe",
  status: order.paymentStatus,
  amount: order.totalAmount,
  currencyCode: order.currency,
  providerReference: `payref_${order.id}`,
  lastErrorCode: order.paymentStatus === "failed" ? "auth_expired" : null,
  lastErrorMessage:
    order.paymentStatus === "failed"
      ? "Authorization expired before capture completed."
      : null,
  capturedAt: order.paymentStatus === "paid" ? order.timeline.at(1)?.occurredAt ?? null : null,
  createdAt: order.createdAt,
}));

export const seedFulfillments = demoOrders.map((order) => ({
  orderExternalId: order.id,
  status: order.fulfillmentStatus,
  warehouseCode:
    order.fulfillmentStatus === "delayed" ? "DC-2" : order.fulfillmentStatus === "allocated" ? "DC-1" : null,
  carrier:
    order.fulfillmentStatus === "delayed" || order.fulfillmentStatus === "allocated"
      ? "UPS"
      : null,
  trackingNumber: null,
  estimatedShipAt:
    order.fulfillmentStatus === "delayed" ? "2026-04-08T16:00:00.000Z" : null,
  updatedAt: order.timeline.at(-1)?.occurredAt ?? order.createdAt,
}));

export const seedOrderEvents = demoOrders.flatMap((order) =>
  order.timeline.map((event) => ({
    orderExternalId: order.id,
    eventType: event.type,
    actorLabel: event.actor,
    summary: event.description,
    payload: null,
    occurredAt: event.occurredAt,
  })),
);

export const seedOrderNotes = demoOrders.flatMap((order) =>
  order.notes.map((note) => ({
    orderExternalId: order.id,
    authorEmail:
      note.author === "Nina Alvarez" ? "nina.alvarez@opsflow.ai" : "marcus.reid@opsflow.ai",
    body: note.body,
    isPinned: false,
    createdAt: note.createdAt,
  })),
);

export const seedActionRuns = [
  {
    orderExternalId: "ord_1001",
    actionType: "retry_payment_capture" as const,
    status: "failed" as const,
    requestedByEmail: "nina.alvarez@opsflow.ai",
    input: { mode: "safe_retry" },
    result: { message: "Retry blocked until fresh authorization is obtained." },
    createdAt: "2026-04-07T05:05:00.000Z",
    finishedAt: "2026-04-07T05:05:08.000Z",
  },
  {
    orderExternalId: "ord_1002",
    actionType: "resync_order" as const,
    status: "queued" as const,
    requestedByEmail: "marcus.reid@opsflow.ai",
    input: { source: "warehouse" },
    result: null,
    createdAt: "2026-04-07T06:25:00.000Z",
    finishedAt: null,
  },
];

export const seedAiInsights = [
  {
    orderExternalId: "ord_1001",
    type: "support_summary" as const,
    content: "Placeholder only. AI summaries will be enabled in a later milestone.",
    confidenceScore: 0,
  },
];
