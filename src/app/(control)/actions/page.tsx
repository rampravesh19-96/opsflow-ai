import { ActionRunList } from "@/components/actions/action-run-list";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getActionRunsList } from "@/server/repositories/dashboard";

export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const actionRuns = await getActionRunsList();
  const completedRuns = actionRuns.filter((run) => run.status === "completed").length;
  const failedRuns = actionRuns.filter((run) => run.status === "failed").length;
  const uniqueOrders = new Set(actionRuns.map((run) => run.orderId)).size;

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Action Runs"
        title="Recovery execution history"
        description="A running record of operational interventions, their outcomes, and where recovery efforts are concentrating."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Total runs
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">{actionRuns.length}</p>
          <p className="mt-2 text-sm text-muted">All recorded recovery executions in the current seed dataset.</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Successful recoveries
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">{completedRuns}</p>
          <p className="mt-2 text-sm text-muted">Runs that completed and pushed the order forward.</p>
        </Panel>
        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Orders touched
          </p>
          <p className="mt-4 text-3xl font-semibold text-white">{uniqueOrders}</p>
          <p className="mt-2 text-sm text-muted">
            {failedRuns} failed runs remain visible for follow-up review.
          </p>
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Action ledger
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Execution detail</h2>
          </div>
          <StatusBadge tone="accent">Ops audit trail</StatusBadge>
        </div>
        <div className="mt-5">
          <ActionRunList runs={actionRuns} />
        </div>
      </Panel>
    </div>
  );
}
