import type { OrderListFilters } from "@/server/types/domain";

export const queueStatusOptions = ["active", "pending_review", "resolved"] as const;
export const paymentStatusOptions = [
  "paid",
  "pending",
  "requires_action",
  "failed",
  "refunded",
] as const;
export const fulfillmentStatusOptions = [
  "unfulfilled",
  "allocated",
  "packing",
  "shipped",
  "delayed",
  "delivered",
] as const;
export const priorityOptions = ["low", "normal", "high", "critical"] as const;
export const healthOptions = ["healthy", "watch", "at_risk", "blocked"] as const;

const defaultFilters: OrderListFilters = {
  q: "",
  queueStatus: "",
  paymentStatus: "",
  fulfillmentStatus: "",
  priority: "",
  assignedUserId: "",
  health: "",
};

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export function parseOrderFilters(
  searchParams?: Record<string, string | string[] | undefined>,
  overrides?: Partial<OrderListFilters>,
): OrderListFilters {
  const filters = {
    ...defaultFilters,
    ...overrides,
  };

  if (!searchParams) {
    return filters;
  }

  return {
    q: getSingleValue(searchParams.q).trim(),
    queueStatus: getSingleValue(searchParams.queueStatus).trim(),
    paymentStatus: getSingleValue(searchParams.paymentStatus).trim(),
    fulfillmentStatus: getSingleValue(searchParams.fulfillmentStatus).trim(),
    priority: getSingleValue(searchParams.priority).trim(),
    assignedUserId: getSingleValue(searchParams.assignedUserId).trim(),
    health: getSingleValue(searchParams.health).trim(),
  };
}
