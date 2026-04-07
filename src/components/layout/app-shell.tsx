"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  ArrowUpRight,
  ChartColumn,
  FileClock,
  LayoutDashboard,
  Search,
  Settings,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    label: "Command Center",
    icon: LayoutDashboard,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ChartColumn,
  },
  {
    href: "/issues",
    label: "Issues",
    icon: AlertTriangle,
  },
  {
    href: "/actions",
    label: "Action Runs",
    icon: FileClock,
  },
  {
    href: "/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="surface-grid min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col px-4 py-4 lg:flex-row lg:gap-4">
        <Sidebar />
        <div className="flex min-h-[calc(100vh-2rem)] flex-1 flex-col overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/45 backdrop-blur xl:flex-row">
          <div className="flex min-h-full flex-1 flex-col">
            <TopBar />
            <main className="scrollbar-thin flex-1 overflow-y-auto p-5 sm:p-7">{children}</main>
          </div>
          <AsideRail />
        </div>
      </div>
    </div>
  );
}

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="mb-4 flex w-full flex-col rounded-[28px] border border-white/10 bg-slate-950/70 p-4 backdrop-blur lg:mb-0 lg:w-[278px]">
      <div className="surface-panel-strong rounded-2xl p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-teal-200/70">
          OpsFlow AI
        </p>
        <div className="mt-4 space-y-3">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Ecommerce Operations Control
          </h2>
          <p className="text-sm leading-6 text-muted">
            Operational visibility and intervention workspace for orders, payments, and support.
          </p>
        </div>
      </div>

      <nav className="mt-4 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3 transition",
                active
                  ? "border-teal-400/24 bg-teal-400/10 text-white"
                  : "border-white/6 bg-white/[0.03] text-slate-300 hover:border-white/12 hover:bg-white/[0.05]",
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </span>
              <ArrowUpRight className="h-4 w-4 opacity-60" />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-amber-300/12 bg-amber-300/8 p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-amber-100/80">
          Milestone 1
        </p>
        <p className="mt-2 text-sm leading-6 text-amber-50/88">
          Live integrations, auth, recovery execution, and AI actions remain intentionally staged for later milestones.
        </p>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="border-b border-white/8 px-5 py-4 sm:px-7">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            readOnly
            value="Search orders, customers, event IDs, payment refs"
            className="w-full rounded-2xl border border-white/8 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-slate-400 outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-muted">
            Shift queue: <span className="font-medium text-white">US East Core Ops</span>
          </div>
          <div className="rounded-2xl border border-teal-400/16 bg-teal-400/10 px-4 py-3 text-sm text-teal-100">
            3 critical orders require action
          </div>
        </div>
      </div>
    </header>
  );
}

function AsideRail() {
  return (
    <aside className="hidden w-[320px] border-l border-white/8 px-5 py-5 xl:block">
      <div className="space-y-4">
        <div className="surface-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 text-teal-100">
            <Sparkles className="h-4 w-4" />
            <p className="text-[11px] font-medium uppercase tracking-[0.24em]">
              AI Copilot Placeholder
            </p>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            Milestone 1 keeps AI disabled in behavior. This rail reserves space for issue summary,
            classification, and next-action guidance in later milestones.
          </p>
        </div>

        <div className="surface-panel rounded-2xl p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-subtle">
            Operating Principles
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-muted">
            <li>Queue-first workflows over vanity analytics.</li>
            <li>Every status change should be explainable through a timeline.</li>
            <li>Intervention paths should feel safe, auditable, and operator-centric.</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
