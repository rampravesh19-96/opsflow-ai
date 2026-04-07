import { OrderFilters } from "@/components/orders/order-filters";
import { OrderRow } from "@/components/orders/order-row";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { parseOrderFilters } from "@/lib/order-filters";
import { getOrderOperators, getOrdersList } from "@/server/repositories/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = parseOrderFilters((await searchParams) ?? {});
  const [orders, operators] = await Promise.all([
    getOrdersList(filters),
    getOrderOperators(),
  ]);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Orders"
        title="Order operations queue"
        description="Filter-heavy, queue-oriented order review surface for payment, fulfillment, and support issues."
        action={<StatusBadge tone="accent">{orders.length} visible</StatusBadge>}
      />

      <Panel className="p-4">
        <OrderFilters
          action="/orders"
          filters={filters}
          operators={operators}
          title="Find orders"
        />
      </Panel>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
        {!orders.length ? (
          <Panel className="p-8">
            <p className="text-sm text-muted">
              No orders match the current search and filter state.
            </p>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
