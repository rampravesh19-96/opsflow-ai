import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getIssuesList } from "@/server/repositories/dashboard";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const issueOrders = await getIssuesList();

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Issues"
        title="Problematic order queue"
        description="A dedicated triage lane for blocked, at-risk, and review-driven orders."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {issueOrders.map((order) => (
          <Panel key={order.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{order.displayId}</p>
                <p className="mt-2 text-sm text-muted">{order.issueLabel}</p>
              </div>
              <StatusBadge tone={order.health === "blocked" ? "danger" : "warning"}>
                {order.health}
              </StatusBadge>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">{order.riskReason}</p>
          </Panel>
        ))}
      </div>
    </div>
  );
}
