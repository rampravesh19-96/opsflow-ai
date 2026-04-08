import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import { SectionHeader } from "@/components/ui/section-header";

export default function NotFoundPage() {
  return (
    <div className="surface-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[980px] items-center px-4 py-8">
        <div className="w-full space-y-7 rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur sm:p-8">
          <SectionHeader
            eyebrow="Not Found"
            title="This route is not available"
            description="The requested OpsFlow AI page could not be found. The link may be stale, or the record may no longer exist in the current environment."
          />

          <Panel strong className="p-6">
            <p className="text-sm leading-6 text-muted">
              Head back to the command center to continue exploring the current seeded environment.
            </p>
            <div className="mt-5">
              <Link
                href="/"
                className="inline-flex rounded-2xl border border-teal-300/24 bg-teal-300/12 px-4 py-3 text-sm font-medium text-teal-100"
              >
                Open command center
              </Link>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
