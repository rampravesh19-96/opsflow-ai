import { OrderRow } from "@/components/orders/order-row";
import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getOrdersList } from "@/server/repositories/orders";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrdersList();

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Orders"
        title="Order operations queue"
        description="Filter-heavy, queue-oriented order review surface for payment, fulfillment, and support issues."
        action={<StatusBadge tone="accent">PostgreSQL</StatusBadge>}
      />

      <Panel className="p-4">
        <div className="flex flex-wrap gap-3">
          {["All orders", "Payment issues", "Fulfillment delay", "Pending review", "Assigned to me"].map(
            (filter, index) => (
              <button
                key={filter}
                className={`rounded-full border px-3 py-2 text-sm ${
                  index === 0
                    ? "border-teal-300/24 bg-teal-300/12 text-teal-100"
                    : "border-white/8 bg-white/[0.03] text-muted"
                }`}
              >
                {filter}
              </button>
            ),
          )}
        </div>
      </Panel>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderRow key={order.id} order={order} />
        ))}
      </div>
    </div>
  );
}
