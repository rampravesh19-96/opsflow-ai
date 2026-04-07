export type OrderChannel = "web" | "marketplace" | "manual";
export type OrderHealth = "healthy" | "watch" | "at_risk" | "blocked";
export type OrderPriority = "low" | "normal" | "high" | "critical";
export type QueueStatus = "active" | "pending_review" | "resolved";
export type PaymentStatus =
  | "paid"
  | "pending"
  | "requires_action"
  | "failed"
  | "refunded";
export type FulfillmentStatus =
  | "unfulfilled"
  | "allocated"
  | "packing"
  | "shipped"
  | "delayed"
  | "delivered";

export interface Customer {
  id: string;
  name: string;
  email: string;
  segment: string;
  region: string;
  totalOrders: number;
}

export interface OrderEvent {
  id: string;
  type: string;
  occurredAt: string;
  actor: string;
  description: string;
}

export interface OrderNote {
  id: string;
  author: string;
  createdAt: string;
  body: string;
}

export interface OrderRecord {
  id: string;
  displayId: string;
  channel: OrderChannel;
  customer: Customer;
  createdAt: string;
  totalAmount: number;
  currency: "USD";
  health: OrderHealth;
  priority: OrderPriority;
  queueStatus: QueueStatus;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  assignedTo: string;
  issueLabel: string;
  riskReason: string;
  shippingMethod: string;
  timeline: OrderEvent[];
  notes: OrderNote[];
}
