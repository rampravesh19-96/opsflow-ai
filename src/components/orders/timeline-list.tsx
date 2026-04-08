import { formatDateTime } from "@/lib/format";
import type { OrderEvent } from "@/server/types/domain";

export function TimelineList({ events }: { events: OrderEvent[] }) {
  if (!events.length) {
    return <p className="text-sm text-muted">No audit events have been recorded for this order yet.</p>;
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <div key={event.id} className="flex gap-4">
          <div className="mt-1 h-2.5 w-2.5 rounded-full bg-teal-300 shadow-[0_0_0_4px_rgba(45,212,191,0.12)]" />
          <div className="flex-1 border-b border-white/6 pb-4 last:border-b-0 last:pb-0">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-white">{event.description}</p>
              <p className="text-xs uppercase tracking-[0.22em] text-subtle">
                {formatDateTime(event.occurredAt)}
              </p>
            </div>
            <p className="mt-2 text-sm text-muted">
              {event.type} by {event.actor}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
