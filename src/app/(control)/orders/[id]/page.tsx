import { notFound } from "next/navigation";

import { addOrderNoteAction, updateOrderWorkflowAction } from "@/server/actions/order-actions";
import { NoteList } from "@/components/orders/note-list";
import { TimelineList } from "@/components/orders/timeline-list";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { priorityOptions, queueStatusOptions } from "@/lib/order-filters";
import { formatCurrency } from "@/lib/format";
import { getOrderDetailById, getOrderOperators } from "@/server/repositories/orders";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, operators] = await Promise.all([
    getOrderDetailById(id),
    getOrderOperators(),
  ]);

  if (!order) {
    notFound();
  }

  const assignedOperator = operators.find((operator) => operator.fullName === order.assignedTo);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Order Workspace"
        title={`${order.displayId} - ${order.customer.name}`}
        description={order.riskReason}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone={order.health === "blocked" ? "danger" : "warning"}>
              {order.health}
            </StatusBadge>
            <StatusBadge tone="default">{order.priority}</StatusBadge>
            <StatusBadge tone="default">{order.queueStatus}</StatusBadge>
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
              Case Controls
            </p>
            <form action={updateOrderWorkflowAction} className="mt-4 space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="customerExternalId" value={order.customer.id} />

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-subtle">Assign to</span>
                <select
                  name="assignedUserId"
                  defaultValue={assignedOperator?.id ?? ""}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                >
                  <option value="">Unassigned</option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-subtle">
                    Priority
                  </span>
                  <select
                    name="priority"
                    defaultValue={order.priority}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-2">
                  <span className="text-xs uppercase tracking-[0.22em] text-subtle">
                    Case status
                  </span>
                  <select
                    name="queueStatus"
                    defaultValue={order.queueStatus}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                  >
                    {queueStatusOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl border border-teal-300/24 bg-teal-300/12 px-4 py-3 text-sm font-medium text-teal-100"
              >
                Save operational updates
              </button>
            </form>
          </Panel>

          <Panel className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
                Internal Notes
              </p>
              <StatusBadge tone="accent">{order.notes.length} notes</StatusBadge>
            </div>

            <form action={addOrderNoteAction} className="mt-4 space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="customerExternalId" value={order.customer.id} />

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-subtle">Author</span>
                <select
                  name="authorUserId"
                  defaultValue={operators[0]?.id ?? ""}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                >
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-subtle">Add note</span>
                <textarea
                  name="body"
                  rows={4}
                  required
                  placeholder="Capture internal context, next steps, or customer handling notes."
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white"
              >
                Add internal note
              </button>
            </form>

            <div className="mt-5">
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
                    type="button"
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-muted"
                  >
                    {action} - placeholder until recovery workflows are enabled
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
