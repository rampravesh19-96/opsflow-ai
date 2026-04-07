import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { commandCenterMetrics, issueBuckets } from "@/server/demo-data/metrics";
import { demoOrders } from "@/server/demo-data/orders";

export default function CommandCenterPage() {
  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Phase 1 / Command Center"
        title="Operations command center"
        description="A serious internal workspace for monitoring order risk, queue pressure, payment failures, and fulfillment bottlenecks."
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {commandCenterMetrics.map((metric) => (
          <StatCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr,0.9fr]">
        <Panel strong className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
                Critical queue
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">Orders needing intervention</h2>
            </div>
            <StatusBadge tone="danger">Live priority view</StatusBadge>
          </div>
          <div className="mt-5 space-y-3">
            {demoOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white">
                      {order.displayId} · {order.customer.name}
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
              Recovery execution
            </p>
            <div className="mt-4 space-y-3 text-sm text-muted">
              <p>Retry and recovery buttons are intentionally non-executable in milestone 1.</p>
              <p>The platform shell reserves these workflows so later milestones can add guarded server actions and audit logging cleanly.</p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
