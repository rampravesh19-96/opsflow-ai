"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  fulfillmentStatusOptions,
  healthOptions,
  paymentStatusOptions,
  priorityOptions,
  queueStatusOptions,
} from "@/lib/order-filters";
import type { OperatorRecord, OrderListFilters } from "@/server/types/domain";

export function OrderFilters({
  action,
  filters,
  operators,
  title,
  showHealth = false,
}: {
  action: string;
  filters: OrderListFilters;
  operators: OperatorRecord[];
  title: string;
  showHealth?: boolean;
}) {
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    for (const [key, value] of formData.entries()) {
      const normalizedValue = value.toString().trim();

      if (normalizedValue) {
        params.set(key, normalizedValue);
      }
    }

    const nextUrl = params.toString() ? `${action}?${params.toString()}` : action;
    router.replace(nextUrl, { scroll: false });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 xl:grid-cols-[1.4fr,repeat(6,minmax(0,1fr)),auto]"
    >
      <label className="space-y-2 xl:col-span-2">
        <span className="text-xs uppercase tracking-[0.22em] text-subtle">{title}</span>
        <input
          name="q"
          defaultValue={filters.q}
          placeholder="Search order ID, customer, email, issue"
          className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
      </label>

      <FilterSelect name="queueStatus" value={filters.queueStatus} label="Case status">
        <option value="">All</option>
        {queueStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect name="priority" value={filters.priority} label="Priority">
        <option value="">All</option>
        {priorityOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect name="paymentStatus" value={filters.paymentStatus} label="Payment">
        <option value="">All</option>
        {paymentStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect
        name="fulfillmentStatus"
        value={filters.fulfillmentStatus}
        label="Fulfillment"
      >
        <option value="">All</option>
        {fulfillmentStatusOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </FilterSelect>

      <FilterSelect name="assignedUserId" value={filters.assignedUserId} label="Assigned">
        <option value="">Anyone</option>
        <option value="unassigned">Unassigned</option>
        {operators.map((operator) => (
          <option key={operator.id} value={operator.id}>
            {operator.fullName}
          </option>
        ))}
      </FilterSelect>

      {showHealth ? (
        <FilterSelect name="health" value={filters.health} label="Health">
          <option value="">Any issue</option>
          {healthOptions
            .filter((option) => option !== "healthy")
            .map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
        </FilterSelect>
      ) : null}

      <div className="flex items-end gap-2">
        <button
          type="submit"
          className="rounded-2xl border border-teal-300/24 bg-teal-300/12 px-4 py-3 text-sm font-medium text-teal-100"
        >
          Apply
        </button>
        <Link
          href={action}
          scroll={false}
          className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-muted"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}

function FilterSelect({
  children,
  label,
  name,
  value,
}: {
  children: React.ReactNode;
  label: string;
  name: string;
  value: string;
}) {
  return (
    <label className="space-y-2">
      <span className="text-xs uppercase tracking-[0.22em] text-subtle">{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="w-full rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none"
      >
        {children}
      </select>
    </label>
  );
}
