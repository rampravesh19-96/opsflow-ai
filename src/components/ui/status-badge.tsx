import { cn } from "@/lib/utils";

type BadgeTone = "default" | "danger" | "warning" | "success" | "accent";

const toneClasses: Record<BadgeTone, string> = {
  default: "border-white/10 bg-white/5 text-slate-200",
  danger: "border-red-400/20 bg-red-500/12 text-red-200",
  warning: "border-amber-400/20 bg-amber-400/12 text-amber-100",
  success: "border-emerald-400/20 bg-emerald-400/12 text-emerald-100",
  accent: "border-teal-400/20 bg-teal-400/12 text-teal-100",
};

export function StatusBadge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
