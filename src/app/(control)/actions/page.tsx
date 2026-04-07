import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";

const actionRuns = [
  {
    label: "retry_payment_capture",
    order: "OF-48231",
    status: "Placeholder",
    detail: "Execution wiring lands in milestone 2 alongside audit-safe server actions.",
  },
  {
    label: "resync_order",
    order: "OF-48212",
    status: "Placeholder",
    detail: "UI position is reserved for future action history and operator confirmations.",
  },
];

export default function ActionsPage() {
  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Action Runs"
        title="Recovery execution history"
        description="This surface is intentionally scaffolded first so later intervention workflows land in a clear operational home."
      />

      <div className="space-y-3">
        {actionRuns.map((run) => (
          <Panel key={`${run.label}-${run.order}`} className="p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {run.label} · {run.order}
                </p>
                <p className="mt-2 text-sm text-muted">{run.detail}</p>
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-subtle">{run.status}</p>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
