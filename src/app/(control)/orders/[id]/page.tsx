import { notFound } from "next/navigation";

import {
  addOrderNoteAction,
  runRecoveryAction,
  updateOrderWorkflowAction,
} from "@/server/actions/order-actions";
import { NoteList } from "@/components/orders/note-list";
import { TimelineList } from "@/components/orders/timeline-list";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { priorityOptions, queueStatusOptions } from "@/lib/order-filters";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { getOrderOperators, getOrderWorkspaceById } from "@/server/repositories/orders";

export const dynamic = "force-dynamic";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [workspace, operators] = await Promise.all([
    getOrderWorkspaceById(id),
    getOrderOperators(),
  ]);

  if (!workspace) {
    notFound();
  }

  const { actionRuns, ai, order } = workspace;
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
        <div className="space-y-4">
          <Panel strong className="p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
                AI Case Guidance
              </p>
              <StatusBadge tone="accent">{ai.confidence}% confidence</StatusBadge>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 lg:col-span-2">
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">
                  Support Summary
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{ai.summary}</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-subtle">Issue Type</p>
                <p className="mt-3 text-sm font-medium text-white">{ai.issueType}</p>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-subtle">
                  Suggested Next Action
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">{ai.nextAction}</p>
              </div>
            </div>
          </Panel>

          <Panel strong className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Timeline / Audit Trail
            </p>
            <div className="mt-5">
              <TimelineList events={order.timeline} />
            </div>
          </Panel>
        </div>

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
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Recovery Actions
            </p>

            <form action={runRecoveryAction} className="mt-4 space-y-4">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="customerExternalId" value={order.customer.id} />

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.22em] text-subtle">
                  Requested by
                </span>
                <select
                  name="requestedByUserId"
                  defaultValue={assignedOperator?.id ?? operators[0]?.id ?? ""}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
                >
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.fullName}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-3">
                <button
                  type="submit"
                  name="actionType"
                  value="retry_payment_capture"
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white"
                >
                  Retry payment capture
                </button>
                <button
                  type="submit"
                  name="actionType"
                  value="release_fulfillment_hold"
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white"
                >
                  Release fulfillment hold
                </button>
                <button
                  type="submit"
                  name="actionType"
                  value="resync_order"
                  className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white"
                >
                  Resync order state
                </button>
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {actionRuns.length ? (
                actionRuns.map((actionRun) => (
                  <div
                    key={actionRun.id}
                    className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{actionRun.actionType}</p>
                      <StatusBadge
                        tone={actionRun.status === "failed" ? "danger" : "success"}
                      >
                        {actionRun.status}
                      </StatusBadge>
                    </div>
                    <p className="mt-2 text-sm text-muted">
                      Requested by {actionRun.requestedBy} on {formatDateTime(actionRun.createdAt)}
                    </p>
                    {actionRun.resultSummary ? (
                      <p className="mt-3 text-sm leading-6 text-muted">
                        {actionRun.resultSummary}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted">
                  No recovery actions have been executed for this order yet.
                </p>
              )}
            </div>
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
        </div>
      </div>
    </div>
  );
}
