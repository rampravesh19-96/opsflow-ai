import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const queueStatusEnum = pgEnum("queue_status", [
  "active",
  "pending_review",
  "resolved",
]);

export const orderHealthEnum = pgEnum("order_health", [
  "healthy",
  "watch",
  "at_risk",
  "blocked",
]);

export const priorityEnum = pgEnum("priority_level", [
  "low",
  "normal",
  "high",
  "critical",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "pending",
  "requires_action",
  "failed",
  "refunded",
]);

export const fulfillmentStatusEnum = pgEnum("fulfillment_status", [
  "unfulfilled",
  "allocated",
  "packing",
  "shipped",
  "delayed",
  "delivered",
]);

export const actionTypeEnum = pgEnum("action_type", [
  "retry_payment_capture",
  "release_fulfillment_hold",
  "resync_order",
]);

export const actionStatusEnum = pgEnum("action_status", [
  "queued",
  "running",
  "completed",
  "failed",
]);

export const aiInsightTypeEnum = pgEnum("ai_insight_type", [
  "support_summary",
  "issue_classification",
  "next_action",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  team: varchar("team", { length: 80 }).notNull().default("operations"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const customers = pgTable("customers", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalCustomerId: varchar("external_customer_id", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  segment: varchar("segment", { length: 60 }).notNull().default("standard"),
  region: varchar("region", { length: 80 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalOrderId: varchar("external_order_id", { length: 80 }).notNull().unique(),
    displayId: varchar("display_id", { length: 40 }).notNull(),
    customerId: uuid("customer_id")
      .references(() => customers.id)
      .notNull(),
    channel: varchar("channel", { length: 40 }).notNull(),
    queueStatus: queueStatusEnum("queue_status").notNull().default("active"),
    health: orderHealthEnum("health").notNull().default("healthy"),
    priority: priorityEnum("priority").notNull().default("normal"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    fulfillmentStatus: fulfillmentStatusEnum("fulfillment_status")
      .notNull()
      .default("unfulfilled"),
    assignedUserId: uuid("assigned_user_id").references(() => users.id),
    issueLabel: varchar("issue_label", { length: 120 }),
    riskReason: text("risk_reason"),
    shippingMethod: varchar("shipping_method", { length: 80 }),
    currencyCode: varchar("currency_code", { length: 3 }).notNull().default("USD"),
    totalAmount: integer("total_amount").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    queueIdx: index("orders_queue_idx").on(table.queueStatus, table.health, table.priority),
    createdIdx: index("orders_created_at_idx").on(table.createdAt),
  }),
);

export const payments = pgTable("payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  provider: varchar("provider", { length: 80 }).notNull(),
  status: paymentStatusEnum("status").notNull(),
  amount: integer("amount").notNull(),
  currencyCode: varchar("currency_code", { length: 3 }).notNull().default("USD"),
  providerReference: varchar("provider_reference", { length: 120 }),
  lastErrorCode: varchar("last_error_code", { length: 80 }),
  lastErrorMessage: text("last_error_message"),
  capturedAt: timestamp("captured_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const fulfillments = pgTable("fulfillments", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  status: fulfillmentStatusEnum("status").notNull(),
  warehouseCode: varchar("warehouse_code", { length: 40 }),
  carrier: varchar("carrier", { length: 80 }),
  trackingNumber: varchar("tracking_number", { length: 120 }),
  estimatedShipAt: timestamp("estimated_ship_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
      .references(() => orders.id)
      .notNull(),
    eventType: varchar("event_type", { length: 80 }).notNull(),
    actorLabel: varchar("actor_label", { length: 160 }).notNull(),
    summary: text("summary").notNull(),
    payload: jsonb("payload"),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderOccurredIdx: index("order_events_order_occurred_idx").on(table.orderId, table.occurredAt),
  }),
);

export const orderNotes = pgTable("order_notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  authorUserId: uuid("author_user_id")
    .references(() => users.id)
    .notNull(),
  body: text("body").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const actionRuns = pgTable("action_runs", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  actionType: actionTypeEnum("action_type").notNull(),
  status: actionStatusEnum("status").notNull().default("queued"),
  requestedByUserId: uuid("requested_by_user_id").references(() => users.id),
  input: jsonb("input"),
  result: jsonb("result"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
});

export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .references(() => orders.id)
    .notNull(),
  type: aiInsightTypeEnum("type").notNull(),
  content: text("content").notNull(),
  confidenceScore: integer("confidence_score"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
