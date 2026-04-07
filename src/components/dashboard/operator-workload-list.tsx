import type { OperatorWorkload } from "@/server/types/domain";

export function OperatorWorkloadList({ operators }: { operators: OperatorWorkload[] }) {
  if (!operators.length) {
    return <p className="text-sm text-muted">No active operator assignments right now.</p>;
  }

  return (
    <div className="space-y-3">
      {operators.map((operator) => (
        <div
          key={operator.operatorId}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-white">{operator.operatorName}</p>
            <p className="text-sm text-muted">{operator.activeCases} active cases</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <WorkloadPill label="Critical" value={operator.criticalCases} />
            <WorkloadPill label="Blocked" value={operator.blockedCases} />
            <WorkloadPill label="Pending review" value={operator.pendingReviewCases} />
          </div>
        </div>
      ))}
    </div>
  );
}

function WorkloadPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/6 bg-slate-950/40 px-3 py-3">
      <p className="text-[11px] uppercase tracking-[0.22em] text-subtle">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
