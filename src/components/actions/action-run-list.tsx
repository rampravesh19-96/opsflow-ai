import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import { formatDateTime } from "@/lib/format";
import type { ActionRunRecord } from "@/server/types/domain";

export function ActionRunList({
  runs,
  compact = false,
}: {
  runs: ActionRunRecord[];
  compact?: boolean;
}) {
  if (!runs.length) {
    return <p className="text-sm text-muted">No action runs found for the current view.</p>;
  }

  return (
    <div className="space-y-3">
      {runs.map((run) => (
        <div
          key={run.id}
          className={`rounded-2xl border border-white/8 bg-white/[0.03] ${
            compact ? "p-4" : "p-5"
          }`}
        >
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-white">{run.actionType}</p>
                <StatusBadge tone={run.status === "failed" ? "danger" : "success"}>
                  {run.status}
                </StatusBadge>
              </div>
              <p className="text-sm text-muted">
                <Link href={`/orders/${run.orderId}`} className="text-white hover:text-teal-100">
                  {run.orderDisplayId}
                </Link>{" "}
                · Requested by {run.requestedBy} on {formatDateTime(run.createdAt)}
              </p>
              {run.resultSummary ? (
                <p className="text-sm leading-6 text-muted">{run.resultSummary}</p>
              ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
