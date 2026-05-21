"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { APP_NAV, isNavActive } from "@/components/app-nav";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function SidebarBrand() {
  return (
    <Link
      href="/overview"
      className="block border-b border-[var(--border)] px-3 py-4"
    >
      <span className="inline-flex items-baseline gap-1 font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-[var(--text-primary)]">
        <span>SARACI</span>
        <span className="text-[var(--accent)]">CORE</span>
      </span>
    </Link>
  );
}

function SidebarFooter() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  return (
    <div className="mt-auto shrink-0 border-t border-[var(--border)] px-3 py-4">
      {email && (
        <p
          className="mb-3 truncate text-xs text-[var(--text-muted)]"
          title={email}
        >
          {email}
        </p>
      )}
      <LogoutButton />
    </div>
  );
}

export function AppSidebarContent({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SidebarBrand />
      <nav className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-0 py-3">
        {APP_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "focus-ring flex items-center gap-3 rounded-[6px] border-l-2 px-3 text-sm transition-colors",
                mobile ? "min-h-12 py-2.5" : "py-2",
                active
                  ? "border-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                  : "border-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
              )}
            >
              <Icon
                className={cn(
                  "size-[18px] shrink-0",
                  active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]"
                )}
                strokeWidth={1.75}
                aria-hidden
              />
              <span className="font-medium tracking-[-0.01em]">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <SidebarFooter />
    </div>
  );
}

export function AppSidebarDesktop() {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-[var(--border)] bg-[var(--bg)] px-3 py-4 lg:flex"
      aria-label="Hauptnavigation"
    >
      <AppSidebarContent />
    </aside>
  );
}
