import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { OrderRecord } from "@/server/types/domain";

function toneFromHealth(health: OrderRecord["health"]) {
  switch (health) {
    case "blocked":
      return "danger";
    case "at_risk":
      return "warning";
    case "watch":
      return "accent";
    default:
      return "success";
  }
}

export function OrderRow({ order }: { order: OrderRecord }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="grid gap-4 rounded-2xl border border-white/6 bg-white/[0.02] px-4 py-4 transition hover:border-white/12 hover:bg-white/[0.04] xl:grid-cols-[1.2fr,0.7fr,0.7fr,0.9fr,1fr,0.8fr]"
    >
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-white">{order.displayId}</p>
          <StatusBadge tone={toneFromHealth(order.health)}>{order.health}</StatusBadge>
          <StatusBadge tone="default">{order.queueStatus}</StatusBadge>
        </div>
        <div className="text-sm text-muted">
          {order.customer.name} - {order.customer.region}
        </div>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Issue</p>
        <p className="mt-2 text-sm text-white">{order.issueLabel}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Payment</p>
        <p className="mt-2 text-sm text-white">{order.paymentStatus}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Fulfillment</p>
        <p className="mt-2 text-sm text-white">{order.fulfillmentStatus}</p>
      </div>
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-subtle">Assigned</p>
        <p className="mt-2 text-sm text-white">{order.assignedTo}</p>
      </div>
      <div className="space-y-2 xl:text-right">
        <p className="text-sm font-medium text-white">{formatCurrency(order.totalAmount)}</p>
        <p className="text-sm text-muted">{formatDateTime(order.createdAt)}</p>
      </div>
    </Link>
  );
}
