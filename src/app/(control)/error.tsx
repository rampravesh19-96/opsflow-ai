"use client";

import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";

export default function ControlError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const message =
    process.env.NODE_ENV === "development"
      ? error.message || "An unexpected error interrupted this route."
      : "An unexpected server-side issue interrupted this route.";

  return (
    <div className="space-y-7">
      <SectionHeader
        eyebrow="Operational Error"
        title="This workspace could not be loaded"
        description="OpsFlow AI hit an unexpected server-side issue while preparing this view."
      />

      <Panel strong className="p-6">
        <p className="text-sm leading-6 text-muted">{message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-2xl border border-teal-300/24 bg-teal-300/12 px-4 py-3 text-sm font-medium text-teal-100"
          >
            Retry route
          </button>
          <Link
            href="/"
            className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white"
          >
            Return to command center
          </Link>
        </div>
      </Panel>
    </div>
  );
}
