import {
  and,
  count,
  desc,
  eq,
  ilike,
  isNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import { getDb } from "@/server/db/client";
import { customers, orderEvents, orderNotes, orders, users } from "@/server/db/schema";
import type {
  Customer,
  OperatorRecord,
  OrderListFilters,
  OrderRecord,
} from "@/server/types/domain";

function formatIso(value: Date | string | null | undefined) {
  if (!value) {
    return new Date().toISOString();
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function buildOrderWhereClause(filters?: Partial<OrderListFilters>, issueOnly = false) {
  const conditions: SQL[] = [];

  if (issueOnly) {
    conditions.push(neHealthHealthy());
  }

  if (filters?.q) {
    conditions.push(
      or(
        ilike(orders.displayId, `%${filters.q}%`),
        ilike(orders.externalOrderId, `%${filters.q}%`),
        ilike(customers.name, `%${filters.q}%`),
        ilike(customers.email, `%${filters.q}%`),
        ilike(orders.issueLabel, `%${filters.q}%`),
      )!,
    );
  }

  if (filters?.queueStatus) {
    conditions.push(eq(orders.queueStatus, filters.queueStatus as typeof orders.$inferSelect.queueStatus));
  }

  if (filters?.paymentStatus) {
    conditions.push(
      eq(orders.paymentStatus, filters.paymentStatus as typeof orders.$inferSelect.paymentStatus),
    );
  }

  if (filters?.fulfillmentStatus) {
    conditions.push(
      eq(
        orders.fulfillmentStatus,
        filters.fulfillmentStatus as typeof orders.$inferSelect.fulfillmentStatus,
      ),
    );
  }

  if (filters?.priority) {
    conditions.push(eq(orders.priority, filters.priority as typeof orders.$inferSelect.priority));
  }

  if (filters?.health) {
    conditions.push(eq(orders.health, filters.health as typeof orders.$inferSelect.health));
  }

  if (filters?.assignedUserId === "unassigned") {
    conditions.push(isNull(orders.assignedUserId));
  } else if (filters?.assignedUserId) {
    conditions.push(eq(orders.assignedUserId, filters.assignedUserId));
  }

  if (!conditions.length) {
    return undefined;
  }

  return conditions.length === 1 ? conditions[0] : and(...conditions);
}

function neHealthHealthy() {
  return or(
    eq(orders.health, "watch"),
    eq(orders.health, "at_risk"),
    eq(orders.health, "blocked"),
  )!;
}

function mapOrderRow(row: {
  externalOrderId: string;
  displayId: string;
  channel: string;
  createdAt: Date;
  totalAmount: number;
  currencyCode: string;
  health: OrderRecord["health"];
  priority: OrderRecord["priority"];
  queueStatus: OrderRecord["queueStatus"];
  paymentStatus: OrderRecord["paymentStatus"];
  fulfillmentStatus: OrderRecord["fulfillmentStatus"];
  issueLabel: string | null;
  riskReason: string | null;
  shippingMethod: string | null;
  customerExternalId: string;
  customerName: string;
  customerEmail: string;
  customerSegment: string;
  customerRegion: string;
  assignedTo: string | null;
  customerOrderCount: number;
}): OrderRecord {
  return {
    id: row.externalOrderId,
    displayId: row.displayId,
    channel: row.channel as OrderRecord["channel"],
    createdAt: formatIso(row.createdAt),
    totalAmount: row.totalAmount,
    currency: row.currencyCode as "USD",
    health: row.health,
    priority: row.priority,
    queueStatus: row.queueStatus,
    paymentStatus: row.paymentStatus,
    fulfillmentStatus: row.fulfillmentStatus,
    assignedTo: row.assignedTo ?? "Unassigned",
    issueLabel: row.issueLabel ?? "No issue label",
    riskReason: row.riskReason ?? "No risk notes recorded.",
    shippingMethod: row.shippingMethod ?? "Not assigned",
    customer: {
      id: row.customerExternalId,
      name: row.customerName,
      email: row.customerEmail,
      segment: row.customerSegment,
      region: row.customerRegion,
      totalOrders: row.customerOrderCount,
    },
    timeline: [],
    notes: [],
  };
}

export async function getOrderOperators() {
  const db = getDb();

  const rows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
    })
    .from(users)
    .orderBy(users.fullName);

  return rows as OperatorRecord[];
}

export async function getOrdersList(filters?: Partial<OrderListFilters>) {
  const db = getDb();

  const rows = await db
    .select({
      externalOrderId: orders.externalOrderId,
      displayId: orders.displayId,
      channel: orders.channel,
      createdAt: orders.createdAt,
      totalAmount: orders.totalAmount,
      currencyCode: orders.currencyCode,
      health: orders.health,
      priority: orders.priority,
      queueStatus: orders.queueStatus,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      issueLabel: orders.issueLabel,
      riskReason: orders.riskReason,
      shippingMethod: orders.shippingMethod,
      customerExternalId: customers.externalCustomerId,
      customerName: customers.name,
      customerEmail: customers.email,
      customerSegment: customers.segment,
      customerRegion: customers.region,
      assignedTo: users.fullName,
      customerOrderCount:
        sql<number>`count(*) over (partition by ${customers.id})`.mapWith(Number),
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(users, eq(orders.assignedUserId, users.id))
    .where(buildOrderWhereClause(filters))
    .orderBy(desc(orders.createdAt));

  return rows.map(mapOrderRow);
}

export async function getIssueOrdersList(filters?: Partial<OrderListFilters>) {
  const db = getDb();

  const rows = await db
    .select({
      externalOrderId: orders.externalOrderId,
      displayId: orders.displayId,
      channel: orders.channel,
      createdAt: orders.createdAt,
      totalAmount: orders.totalAmount,
      currencyCode: orders.currencyCode,
      health: orders.health,
      priority: orders.priority,
      queueStatus: orders.queueStatus,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      issueLabel: orders.issueLabel,
      riskReason: orders.riskReason,
      shippingMethod: orders.shippingMethod,
      customerExternalId: customers.externalCustomerId,
      customerName: customers.name,
      customerEmail: customers.email,
      customerSegment: customers.segment,
      customerRegion: customers.region,
      assignedTo: users.fullName,
      customerOrderCount:
        sql<number>`count(*) over (partition by ${customers.id})`.mapWith(Number),
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(users, eq(orders.assignedUserId, users.id))
    .where(buildOrderWhereClause(filters, true))
    .orderBy(desc(orders.createdAt));

  return rows.map(mapOrderRow);
}

export async function getOrderDetailById(orderId: string) {
  const db = getDb();

  const orderRow = await db
    .select({
      internalId: orders.id,
      customerId: orders.customerId,
      externalOrderId: orders.externalOrderId,
      displayId: orders.displayId,
      channel: orders.channel,
      createdAt: orders.createdAt,
      totalAmount: orders.totalAmount,
      currencyCode: orders.currencyCode,
      health: orders.health,
      priority: orders.priority,
      queueStatus: orders.queueStatus,
      paymentStatus: orders.paymentStatus,
      fulfillmentStatus: orders.fulfillmentStatus,
      issueLabel: orders.issueLabel,
      riskReason: orders.riskReason,
      shippingMethod: orders.shippingMethod,
      customerExternalId: customers.externalCustomerId,
      customerName: customers.name,
      customerEmail: customers.email,
      customerSegment: customers.segment,
      customerRegion: customers.region,
      assignedTo: users.fullName,
      assignedUserId: orders.assignedUserId,
    })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .leftJoin(users, eq(orders.assignedUserId, users.id))
    .where(eq(orders.externalOrderId, orderId))
    .limit(1);

  const base = orderRow[0];

  if (!base) {
    return null;
  }

  const [customerCountRow, events, notes] = await Promise.all([
    db.select({ value: count() }).from(orders).where(eq(orders.customerId, base.customerId)),
    db
      .select({
        id: orderEvents.id,
        type: orderEvents.eventType,
        occurredAt: orderEvents.occurredAt,
        actor: orderEvents.actorLabel,
        description: orderEvents.summary,
      })
      .from(orderEvents)
      .where(eq(orderEvents.orderId, base.internalId))
      .orderBy(desc(orderEvents.occurredAt)),
    db
      .select({
        id: orderNotes.id,
        body: orderNotes.body,
        createdAt: orderNotes.createdAt,
        author: users.fullName,
      })
      .from(orderNotes)
      .innerJoin(users, eq(orderNotes.authorUserId, users.id))
      .where(eq(orderNotes.orderId, base.internalId))
      .orderBy(desc(orderNotes.createdAt)),
  ]);

  return {
    id: base.externalOrderId,
    displayId: base.displayId,
    channel: base.channel as OrderRecord["channel"],
    createdAt: formatIso(base.createdAt),
    totalAmount: base.totalAmount,
    currency: base.currencyCode as "USD",
    health: base.health,
    priority: base.priority,
    queueStatus: base.queueStatus,
    paymentStatus: base.paymentStatus,
    fulfillmentStatus: base.fulfillmentStatus,
    assignedTo: base.assignedTo ?? "Unassigned",
    issueLabel: base.issueLabel ?? "No issue label",
    riskReason: base.riskReason ?? "No risk notes recorded.",
    shippingMethod: base.shippingMethod ?? "Not assigned",
    customer: {
      id: base.customerExternalId,
      name: base.customerName,
      email: base.customerEmail,
      segment: base.customerSegment,
      region: base.customerRegion,
      totalOrders: customerCountRow[0]?.value ?? 1,
    },
    timeline: events.map((event) => ({
      id: event.id,
      type: event.type,
      occurredAt: formatIso(event.occurredAt),
      actor: event.actor,
      description: event.description,
    })),
    notes: notes.map((note) => ({
      id: note.id,
      body: note.body,
      createdAt: formatIso(note.createdAt),
      author: note.author,
    })),
  } satisfies OrderRecord;
}

export async function getCustomerContext(customerId: string) {
  const db = getDb();
  const customerLookupColumn = isUuid(customerId)
    ? customers.id
    : customers.externalCustomerId;

  const customerRows = await db
    .select({
      id: customers.id,
      externalCustomerId: customers.externalCustomerId,
      name: customers.name,
      email: customers.email,
      segment: customers.segment,
      region: customers.region,
    })
    .from(customers)
    .where(eq(customerLookupColumn, customerId))
    .limit(1);

  const customer = customerRows[0];

  if (!customer) {
    return null;
  }

  const [ordersForCustomer, totalOrdersRow] = await Promise.all([
    db
      .select({
        externalOrderId: orders.externalOrderId,
        displayId: orders.displayId,
        issueLabel: orders.issueLabel,
      })
      .from(orders)
      .where(eq(orders.customerId, customer.id))
      .orderBy(desc(orders.createdAt)),
    db.select({ value: count() }).from(orders).where(eq(orders.customerId, customer.id)),
  ]);

  return {
    customer: {
      id: customer.externalCustomerId,
      name: customer.name,
      email: customer.email,
      segment: customer.segment,
      region: customer.region,
      totalOrders: totalOrdersRow[0]?.value ?? 0,
    } satisfies Customer,
    orders: ordersForCustomer.map((order) => ({
      id: order.externalOrderId,
      displayId: order.displayId,
      issueLabel: order.issueLabel ?? "No issue label",
    })),
  };
}
