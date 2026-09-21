"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTree, Sparkles, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/timeline", label: "Timeline", icon: ListTree },
  { href: "/baby-steps", label: "Baby Steps", icon: Sparkles },
  { href: "/reminders", label: "Reminders", icon: Bell },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:w-60 sm:flex-col sm:border-r sm:border-border sm:bg-surface sm:px-4 sm:py-6 sm:gap-1">
        <Link href="/dashboard" className="px-2 pb-7 inline-flex">
          <Logo size="sm" />
        </Link>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-rose-soft text-rose-strong"
                  : "text-ink-soft hover:bg-cream hover:text-ink"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </aside>

      <main className="flex-1 pb-24 sm:pb-8">{children}</main>

      {/* Mobile bottom nav */}
      <nav
        aria-label="Primary"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border px-1 pt-1.5 flex justify-around"
        style={{ paddingBottom: "max(0.375rem, env(safe-area-inset-bottom, 0px))" }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 px-2 min-w-[56px] min-h-[44px] rounded-xl text-[11px] font-medium",
                active ? "text-rose-strong" : "text-ink-faint"
              )}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
