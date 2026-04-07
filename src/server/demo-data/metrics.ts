import { demoOrders } from "@/server/demo-data/orders";

export const commandCenterMetrics = [
  {
    label: "Open queues",
    value: "148",
    delta: "+12 vs last shift",
  },
  {
    label: "At-risk GMV",
    value: "$38.4K",
    delta: "9 critical orders",
  },
  {
    label: "Payment failures",
    value: "23",
    delta: "6 need intervention",
  },
  {
    label: "SLA nearing breach",
    value: "17",
    delta: "2 within 30 mins",
  },
];

export const issueBuckets = [
  {
    label: "Payment",
    count: demoOrders.filter((order) => order.paymentStatus !== "paid").length,
  },
  {
    label: "Fulfillment",
    count: demoOrders.filter((order) => order.fulfillmentStatus === "delayed").length,
  },
  {
    label: "Review",
    count: demoOrders.filter((order) => order.queueStatus === "pending_review").length,
  },
];
