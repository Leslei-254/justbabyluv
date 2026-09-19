"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListTree, Sparkles, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <Link href="/dashboard" className="px-2 pb-6">
          <span className="font-display text-xl text-ink">JustBaby Luv</span>
          <span className="block text-xs text-ink-soft">Baby Care</span>
        </Link>
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-teal-soft text-teal-strong"
                  : "text-ink-soft hover:bg-cream"
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
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border px-2 py-1.5 flex justify-around"
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] text-[11px] font-medium",
                active ? "text-teal-strong" : "text-ink-faint"
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
