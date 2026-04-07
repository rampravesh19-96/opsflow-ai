import { notFound } from "next/navigation";

import { NoteList } from "@/components/orders/note-list";
import { TimelineList } from "@/components/orders/timeline-list";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/format";
import { getOrderById } from "@/server/demo-data/orders";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Order Workspace"
        title={`${order.displayId} · ${order.customer.name}`}
        description={order.riskReason}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={order.health === "blocked" ? "danger" : "warning"}>
              {order.health}
            </StatusBadge>
            <StatusBadge tone="default">{order.priority}</StatusBadge>
          </div>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.35fr,0.85fr]">
        <Panel strong className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Timeline / Audit Trail
          </p>
          <div className="mt-5">
            <TimelineList events={order.timeline} />
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Order Context
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Amount</dt>
                <dd className="font-medium text-white">{formatCurrency(order.totalAmount)}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Payment</dt>
                <dd className="text-white">{order.paymentStatus}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Fulfillment</dt>
                <dd className="text-white">{order.fulfillmentStatus}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Assigned</dt>
                <dd className="text-white">{order.assignedTo}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-muted">Shipping</dt>
                <dd className="text-white">{order.shippingMethod}</dd>
              </div>
            </dl>
          </Panel>

          <Panel className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Internal Notes
            </p>
            <div className="mt-4">
              <NoteList notes={order.notes} />
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Recovery Actions
            </p>
            <div className="mt-4 space-y-3">
              {["Retry payment capture", "Release fulfillment hold", "Resync order state"].map(
                (action) => (
                  <button
                    key={action}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-muted"
                  >
                    {action} · placeholder only in milestone 1
                  </button>
                ),
              )}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
