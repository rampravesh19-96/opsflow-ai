import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
  strong = false,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl",
        strong ? "surface-panel-strong" : "surface-panel",
        className,
      )}
    >
      {children}
    </section>
  );
}
