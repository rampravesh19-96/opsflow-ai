import { notFound } from "next/navigation";

import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";
import { demoOrders, getCustomerById } from "@/server/demo-data/orders";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = getCustomerById(id);

  if (!customer) {
    notFound();
  }

  const customerOrders = demoOrders.filter((order) => order.customer.id === customer.id);

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Customer Context"
        title={customer.name}
        description={`${customer.email} · ${customer.segment} segment · ${customer.region}`}
      />

      <div className="grid gap-4 xl:grid-cols-[0.9fr,1.1fr]">
        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Profile
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted">Total orders</dt>
              <dd className="text-white">{customer.totalOrders}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Segment</dt>
              <dd className="text-white">{customer.segment}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted">Region</dt>
              <dd className="text-white">{customer.region}</dd>
            </div>
          </dl>
        </Panel>

        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Related Orders
          </p>
          <div className="mt-4 space-y-3">
            {customerOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                <p className="text-sm font-medium text-white">{order.displayId}</p>
                <p className="mt-2 text-sm text-muted">{order.issueLabel}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
