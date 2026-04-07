import Link from "next/link";

import { StatusBadge } from "@/components/ui/status-badge";
import type { QueueSegment } from "@/server/types/domain";

export function QueueSegments({ segments }: { segments: QueueSegment[] }) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-5">
      {segments.map((segment) => (
        <Link
          key={segment.label}
          href={segment.href}
          className="rounded-2xl border border-white/8 bg-white/[0.03] p-4 transition hover:border-white/12 hover:bg-white/[0.05]"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-white">{segment.label}</p>
              <p className="mt-2 text-sm leading-6 text-muted">{segment.description}</p>
            </div>
            <StatusBadge tone={segment.tone}>{segment.count}</StatusBadge>
          </div>
        </Link>
      ))}
    </div>
  );
}
