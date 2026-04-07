import "dotenv/config";
import { getDb } from "../src/server/db/client";
import {
  actionRuns,
  aiInsights,
  customers,
  fulfillments,
  orderEvents,
  orderNotes,
  orders,
  payments,
  users,
} from "../src/server/db/schema";
import {
  seedActionRuns,
  seedAiInsights,
  seedCustomers,
  seedFulfillments,
  seedOrderEvents,
  seedOrderNotes,
  seedOrders,
  seedPayments,
  seedUsers,
} from "../src/server/db/seed-data";

async function main() {
  const db = getDb();

  await db.transaction(async (tx) => {
    await tx.delete(aiInsights);
    await tx.delete(actionRuns);
    await tx.delete(orderNotes);
    await tx.delete(orderEvents);
    await tx.delete(fulfillments);
    await tx.delete(payments);
    await tx.delete(orders);
    await tx.delete(customers);
    await tx.delete(users);

    const insertedUsers = await tx
      .insert(users)
      .values(seedUsers.map(({ fullName, email, team }) => ({ fullName, email, team })))
      .returning({ id: users.id, email: users.email, fullName: users.fullName });

    const insertedCustomers = await tx
      .insert(customers)
      .values(seedCustomers)
      .returning({
        id: customers.id,
        externalCustomerId: customers.externalCustomerId,
      });

    const userIdByEmail = new Map(insertedUsers.map((user) => [user.email, user.id]));
    const customerIdByExternalId = new Map(
      insertedCustomers.map((customer) => [customer.externalCustomerId, customer.id]),
    );

    const insertedOrders = await tx
      .insert(orders)
      .values(
        seedOrders.map((order) => ({
          externalOrderId: order.externalOrderId,
          displayId: order.displayId,
          customerId: customerIdByExternalId.get(order.customerExternalId)!,
          assignedUserId: order.assignedUserEmail
            ? userIdByEmail.get(order.assignedUserEmail) ?? null
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
          currencyCode: order.currencyCode,
          totalAmount: order.totalAmount,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
        })),
      )
      .returning({ id: orders.id, externalOrderId: orders.externalOrderId });

    const orderIdByExternalId = new Map(
      insertedOrders.map((order) => [order.externalOrderId, order.id]),
    );

    await tx.insert(payments).values(
      seedPayments.map((payment) => ({
        orderId: orderIdByExternalId.get(payment.orderExternalId)!,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
        currencyCode: payment.currencyCode,
        providerReference: payment.providerReference,
        lastErrorCode: payment.lastErrorCode,
        lastErrorMessage: payment.lastErrorMessage,
        capturedAt: payment.capturedAt ? new Date(payment.capturedAt) : null,
        createdAt: new Date(payment.createdAt),
      })),
    );

    await tx.insert(fulfillments).values(
      seedFulfillments.map((fulfillment) => ({
        orderId: orderIdByExternalId.get(fulfillment.orderExternalId)!,
        status: fulfillment.status,
        warehouseCode: fulfillment.warehouseCode,
        carrier: fulfillment.carrier,
        trackingNumber: fulfillment.trackingNumber,
        estimatedShipAt: fulfillment.estimatedShipAt
          ? new Date(fulfillment.estimatedShipAt)
          : null,
        updatedAt: new Date(fulfillment.updatedAt),
      })),
    );

    await tx.insert(orderEvents).values(
      seedOrderEvents.map((event) => ({
        orderId: orderIdByExternalId.get(event.orderExternalId)!,
        eventType: event.eventType,
        actorLabel: event.actorLabel,
        summary: event.summary,
        payload: event.payload,
        occurredAt: new Date(event.occurredAt),
      })),
    );

    await tx.insert(orderNotes).values(
      seedOrderNotes.map((note) => ({
        orderId: orderIdByExternalId.get(note.orderExternalId)!,
        authorUserId: userIdByEmail.get(note.authorEmail)!,
        body: note.body,
        isPinned: note.isPinned,
        createdAt: new Date(note.createdAt),
      })),
    );

    await tx.insert(actionRuns).values(
      seedActionRuns.map((actionRun) => ({
        orderId: orderIdByExternalId.get(actionRun.orderExternalId)!,
        actionType: actionRun.actionType,
        status: actionRun.status,
        requestedByUserId: userIdByEmail.get(actionRun.requestedByEmail)!,
        input: actionRun.input,
        result: actionRun.result,
        createdAt: new Date(actionRun.createdAt),
        finishedAt: actionRun.finishedAt ? new Date(actionRun.finishedAt) : null,
      })),
    );

    await tx.insert(aiInsights).values(
      seedAiInsights.map((insight) => ({
        orderId: orderIdByExternalId.get(insight.orderExternalId)!,
        type: insight.type,
        content: insight.content,
        confidenceScore: insight.confidenceScore,
      })),
    );

    console.log("OpsFlow AI seed complete");
    console.log(`Users inserted: ${insertedUsers.length}`);
    console.log(`Customers inserted: ${insertedCustomers.length}`);
    console.log(`Orders inserted: ${insertedOrders.length}`);
    console.log(`Action runs inserted: ${seedActionRuns.length}`);
    console.log(`AI insights inserted: ${seedAiInsights.length}`);
  });

  await db.$client.end();
}

main().catch((error) => {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exit(1);
});
