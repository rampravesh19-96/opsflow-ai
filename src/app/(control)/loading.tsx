import { Panel } from "@/components/ui/panel";

function SkeletonLine({
  className,
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-full bg-white/[0.08] ${className ?? ""}`} />;
}

export default function ControlLoading() {
  return (
    <div className="space-y-7">
      <div className="space-y-3">
        <SkeletonLine className="h-3 w-40" />
        <SkeletonLine className="h-8 w-72" />
        <SkeletonLine className="h-4 w-full max-w-3xl" />
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Panel key={index} className="p-5">
            <SkeletonLine className="h-3 w-24" />
            <SkeletonLine className="mt-4 h-9 w-20" />
            <SkeletonLine className="mt-3 h-4 w-28" />
          </Panel>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr,0.8fr]">
        <Panel className="p-5">
          <SkeletonLine className="h-3 w-32" />
          <div className="mt-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/6 bg-white/[0.03] p-4"
              >
                <SkeletonLine className="h-4 w-48" />
                <SkeletonLine className="mt-3 h-4 w-full" />
                <SkeletonLine className="mt-2 h-4 w-5/6" />
              </div>
            ))}
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-5">
            <SkeletonLine className="h-3 w-28" />
            <div className="mt-5 space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between">
                    <SkeletonLine className="h-4 w-20" />
                    <SkeletonLine className="h-4 w-8" />
                  </div>
                  <SkeletonLine className="mt-3 h-2 w-full" />
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <SkeletonLine className="h-3 w-32" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-white/6 bg-white/[0.03] p-4">
                  <SkeletonLine className="h-4 w-24" />
                  <SkeletonLine className="mt-3 h-4 w-full" />
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}
