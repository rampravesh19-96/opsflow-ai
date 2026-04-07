import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";

export default function SettingsPage() {
  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Settings"
        title="Platform configuration"
        description="A future home for queues, status taxonomies, integrations, and team-level workflow controls."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Integrations
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            Ecommerce connectors, payment providers, and warehouse systems are intentionally deferred.
          </p>
        </Panel>

        <Panel className="p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Workflow controls
          </p>
          <p className="mt-4 text-sm leading-6 text-muted">
            Queue rules, SLA thresholds, and intervention permissions will be added after core order workflows are wired.
          </p>
        </Panel>
      </div>
    </div>
  );
}
