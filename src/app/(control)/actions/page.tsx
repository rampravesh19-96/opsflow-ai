import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { formatDateTime } from "@/lib/format";
import { getActionRunsList } from "@/server/repositories/dashboard";

export const dynamic = "force-dynamic";

export default async function ActionsPage() {
  const actionRuns = await getActionRunsList();

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Action Runs"
        title="Recovery execution history"
        description="This surface is intentionally scaffolded first so later intervention workflows land in a clear operational home."
      />

      <div className="space-y-3">
        {actionRuns.map((run) => (
          <Panel key={run.id} className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {run.actionType} - {run.orderDisplayId}
                </p>
                <p className="mt-2 text-sm text-muted">
                  Requested by {run.requestedBy} on {formatDateTime(run.createdAt)}.
                </p>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-subtle">{run.status}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
