import type { Customer, OrderRecord } from "@/server/types/domain";

const customers: Customer[] = [
  {
    id: "cus_1001",
    name: "Ava Thompson",
    email: "ava.thompson@example.com",
    segment: "VIP",
    region: "US-East",
    totalOrders: 12,
  },
  {
    id: "cus_1002",
    name: "Jordan Patel",
    email: "jordan.patel@example.com",
    segment: "Repeat",
    region: "US-West",
    totalOrders: 7,
  },
  {
    id: "cus_1003",
    name: "Mina Chen",
    email: "mina.chen@example.com",
    segment: "New",
    region: "Canada",
    totalOrders: 1,
  },
];

export const demoOrders: OrderRecord[] = [
  {
    id: "ord_1001",
    displayId: "OF-48231",
    channel: "web",
    customer: customers[0],
    createdAt: "2026-04-07T04:10:00.000Z",
    totalAmount: 420,
    currency: "USD",
    health: "blocked",
    priority: "critical",
    queueStatus: "active",
    paymentStatus: "failed",
    fulfillmentStatus: "unfulfilled",
    assignedTo: "Nina Alvarez",
    issueLabel: "Payment capture failure",
    riskReason: "Authorization expired before capture completed.",
    shippingMethod: "Priority Express",
    timeline: [
      {
        id: "evt_1001",
        type: "order_created",
        occurredAt: "2026-04-07T04:10:00.000Z",
        actor: "System",
        description: "Order created from storefront checkout.",
      },
      {
        id: "evt_1002",
        type: "payment_authorized",
        occurredAt: "2026-04-07T04:10:15.000Z",
        actor: "Payments Gateway",
        description: "Card authorized successfully.",
      },
      {
        id: "evt_1003",
        type: "payment_capture_failed",
        occurredAt: "2026-04-07T04:22:00.000Z",
        actor: "Recovery Worker",
        description: "Capture failed after auth expiration window closed.",
      },
    ],
    notes: [
      {
        id: "note_1001",
        author: "Nina Alvarez",
        createdAt: "2026-04-07T05:02:00.000Z",
        body: "Customer contacted support. Hold shipment until payment retry path exists.",
      },
    ],
  },
  {
    id: "ord_1002",
    displayId: "OF-48212",
    channel: "marketplace",
    customer: customers[1],
    createdAt: "2026-04-07T02:35:00.000Z",
    totalAmount: 186,
    currency: "USD",
    health: "at_risk",
    priority: "high",
    queueStatus: "pending_review",
    paymentStatus: "paid",
    fulfillmentStatus: "delayed",
    assignedTo: "Marcus Reid",
    issueLabel: "Warehouse allocation delay",
    riskReason: "Inventory allocated across split locations; dispatch SLA at risk.",
    shippingMethod: "Ground",
    timeline: [
      {
        id: "evt_1004",
        type: "order_created",
        occurredAt: "2026-04-07T02:35:00.000Z",
        actor: "Marketplace Connector",
        description: "Marketplace order ingested and validated.",
      },
      {
        id: "evt_1005",
        type: "payment_captured",
        occurredAt: "2026-04-07T02:36:05.000Z",
        actor: "Payments Gateway",
        description: "Payment captured successfully.",
      },
      {
        id: "evt_1006",
        type: "fulfillment_delayed",
        occurredAt: "2026-04-07T06:10:00.000Z",
        actor: "Fulfillment Service",
        description: "Packing paused due to stock transfer wait.",
      },
    ],
    notes: [
      {
        id: "note_1002",
        author: "Marcus Reid",
        createdAt: "2026-04-07T06:22:00.000Z",
        body: "Monitoring until transfer lands in DC-2. Customer not yet contacted.",
      },
    ],
  },
  {
    id: "ord_1003",
    displayId: "OF-48188",
    channel: "web",
    customer: customers[2],
    createdAt: "2026-04-06T21:45:00.000Z",
    totalAmount: 92,
    currency: "USD",
    health: "watch",
    priority: "normal",
    queueStatus: "active",
    paymentStatus: "pending",
    fulfillmentStatus: "allocated",
    assignedTo: "Unassigned",
    issueLabel: "Pending fraud review",
    riskReason: "First-time customer with velocity signal requiring manual review.",
    shippingMethod: "Standard",
    timeline: [
      {
        id: "evt_1007",
        type: "order_created",
        occurredAt: "2026-04-06T21:45:00.000Z",
        actor: "System",
        description: "Order created from storefront checkout.",
      },
      {
        id: "evt_1008",
        type: "fraud_review_pending",
        occurredAt: "2026-04-06T21:45:10.000Z",
        actor: "Risk Engine",
        description: "Queued for manual approval before capture.",
      },
    ],
    notes: [],
  },
];

export function getOrderById(orderId: string) {
  return demoOrders.find((order) => order.id === orderId);
}

export function getCustomerById(customerId: string) {
  return customers.find((customer) => customer.id === customerId);
}
