import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import type { QueueSegment } from "@/server/types/domain";

export function QueuePresets({
  segments,
  title,
}: {
  segments: QueueSegment[];
  title: string;
}) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">{title}</p>
      <div className="flex flex-wrap gap-3">
        {segments.map((segment) => (
          <Link
            key={segment.label}
            href={segment.href}
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:border-white/12 hover:bg-white/[0.05]"
          >
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium text-white">{segment.label}</p>
                <p className="mt-1 text-xs text-muted">{segment.description}</p>
              </div>
              <StatusBadge tone={segment.tone}>{segment.count}</StatusBadge>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
