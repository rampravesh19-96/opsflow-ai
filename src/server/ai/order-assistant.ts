import type { ActionRunRecord, AiGuidance, OrderRecord } from "@/server/types/domain";

function latestAction(actionRuns: ActionRunRecord[]) {
  return actionRuns[0];
}

function latestNote(order: OrderRecord) {
  return order.notes[0];
}

export function deriveOrderAiGuidance(
  order: OrderRecord,
  actionRuns: ActionRunRecord[],
): AiGuidance {
  const recentAction = latestAction(actionRuns);
  const recentNote = latestNote(order);

  let issueType = "Operational follow-up";
  let nextAction =
    "Review the latest timeline event and confirm whether the case can move toward resolution.";
  let confidence = 78;

  if (order.paymentStatus === "failed" || order.paymentStatus === "requires_action") {
    issueType = "Payment recovery";
    nextAction =
      "Contact the customer for fresh authorization or a replacement payment method before releasing fulfillment.";
    confidence = 93;
  } else if (order.paymentStatus === "pending" && order.queueStatus === "pending_review") {
    issueType = "Risk and payment review";
    nextAction =
      "Review the risk hold, decide whether capture can proceed, and keep the shipment blocked until payment is cleared.";
    confidence = 89;
  } else if (order.fulfillmentStatus === "delayed") {
    issueType = "Fulfillment delay";
    nextAction =
      "Coordinate with the warehouse to release inventory or reroute the shipment, then resync the order state.";
    confidence = 91;
  } else if (order.queueStatus === "resolved") {
    issueType = "Resolved and monitoring";
    nextAction =
      "Monitor the downstream status for confirmation and reopen only if a new exception appears.";
    confidence = 74;
  }

  const summaryParts = [
    `${order.displayId} for ${order.customer.name} is currently ${order.health} with ${order.paymentStatus} payment and ${order.fulfillmentStatus} fulfillment.`,
    `The case is ${order.queueStatus} and assigned to ${order.assignedTo}.`,
  ];

  if (recentAction) {
    summaryParts.push(
      `Most recent recovery action: ${recentAction.actionType} finished as ${recentAction.status}.`,
    );
  }

  if (recentNote) {
    summaryParts.push(`Latest operator note: ${recentNote.body}`);
  }

  return {
    summary: summaryParts.join(" "),
    issueType,
    nextAction,
    confidence,
  };
}
