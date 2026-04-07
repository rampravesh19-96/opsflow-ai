import { Panel } from "@/components/ui/panel";

export function StatCard({
  label,
  value,
  delta,
}: {
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <Panel className="p-5">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">{label}</p>
      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-3xl font-semibold tracking-tight text-white">{value}</p>
        <p className="text-right text-sm text-muted">{delta}</p>
      </div>
    </Panel>
  );
}
