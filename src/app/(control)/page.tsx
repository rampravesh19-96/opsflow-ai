import { ActionRunList } from "@/components/actions/action-run-list";
import { OperatorWorkloadList } from "@/components/dashboard/operator-workload-list";
import { QueueSegments } from "@/components/dashboard/queue-segments";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getCommandCenterData } from "@/server/repositories/dashboard";

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const { actionRuns, criticalOrders, issueBuckets, metrics, operatorWorkload, queueSegments } =
    await getCommandCenterData();

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Phase 1 / Command Center"
        title="Operations command center"
        description="A serious internal workspace for monitoring queue pressure, spotting operator bottlenecks, and intervening on transaction-heavy order failures."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Saved queue segments
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Quick operational views</h2>
          </div>
          <StatusBadge tone="accent">Shift-ready</StatusBadge>
        </div>
        <div className="mt-5">
          <QueueSegments segments={queueSegments} />
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-[1.3fr,0.9fr]">
        <Panel strong className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
                Critical queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Orders needing intervention</h2>
            </div>
            <StatusBadge tone="danger">Live priority view</StatusBadge>
          </div>
          <div className="mt-5 space-y-3">
            {criticalOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">
                      {order.displayId} - {order.customer.name}
                    </p>
                    <p className="text-sm text-muted">{order.riskReason}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge tone={order.health === "blocked" ? "danger" : "warning"}>
                      {order.health}
                    </StatusBadge>
                    <StatusBadge tone="default">{order.paymentStatus}</StatusBadge>
                    <StatusBadge tone="default">{order.fulfillmentStatus}</StatusBadge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Issue mix
            </p>
            <div className="mt-4 space-y-4">
              {issueBuckets.map((bucket) => (
                <div key={bucket.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white">{bucket.label}</span>
                    <span className="text-muted">{bucket.count}</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-teal-300"
                      style={{ width: `${Math.max(bucket.count * 24, 22)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Operator workload
            </p>
            <div className="mt-4">
              <OperatorWorkloadList operators={operatorWorkload} />
            </div>
          </Panel>
        </div>
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
              Recent recovery activity
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">Latest action history</h2>
          </div>
          <StatusBadge tone="success">{actionRuns.length} tracked runs</StatusBadge>
        </div>
        <div className="mt-5">
          <ActionRunList runs={actionRuns.slice(0, 4)} compact />
        </div>
      </Panel>
    </div>
  );
}
