import Link from "next/link";

import { OrderFilters } from "@/components/orders/order-filters";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { parseOrderFilters } from "@/lib/order-filters";
import { getIssueOrdersList, getOrderOperators } from "@/server/repositories/orders";

export const dynamic = "force-dynamic";

export default async function IssuesPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseOrderFilters((await searchParams) ?? {});
  const [issueOrders, operators] = await Promise.all([
    getIssueOrdersList(filters),
    getOrderOperators(),
  ]);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Issues"
        title="Problematic order queue"
        description="A dedicated triage lane for blocked, at-risk, and review-driven orders."
        action={<StatusBadge tone="warning">{issueOrders.length} in queue</StatusBadge>}
      />

      <Panel className="p-4">
        <OrderFilters
          action="/issues"
          filters={filters}
          operators={operators}
          title="Refine issue queue"
          showHealth
        />
      </Panel>

      <div className="grid gap-4 lg:grid-cols-3">
        {issueOrders.map((order) => (
          <Link key={order.id} href={`/orders/${order.id}`}>
            <Panel className="h-full p-5 transition hover:border-white/12 hover:bg-white/[0.04]">
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
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusBadge tone="default">{order.queueStatus}</StatusBadge>
                <StatusBadge tone="default">{order.priority}</StatusBadge>
              </div>
            </Panel>
          </Link>
        ))}
      </div>

      {!issueOrders.length ? (
        <Panel className="p-8">
          <p className="text-sm text-muted">
            No issue orders match the current search and filter state.
          </p>
        </Panel>
      ) : null}
    </div>
  );
}
