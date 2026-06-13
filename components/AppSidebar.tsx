"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  activeNavHref,
  navForRole,
  navGroupsForRole,
  type Role,
} from "@/components/app-nav";
import { LogoutButton } from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

function SidebarBrand({ mobile = false }: { mobile?: boolean }) {
  return (
    <div
      className={cn(
        "border-b border-[var(--border)] px-3 py-4",
        mobile && "outline-none focus-visible:outline-none"
      )}
    >
      <BrandLogo size="md" linked showWordmark />
    </div>
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
  role = "vertrieb",
  mobile = false,
  onNavigate,
}: {
  role?: Role;
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const groups = navGroupsForRole(role);
  const items = navForRole(role);
  const active = activeNavHref(pathname, items);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <SidebarBrand mobile={mobile} />
      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto px-0 py-3">
        {groups.map((group, groupIndex) => (
          <div
            key={group.title}
            className={cn(
              groupIndex > 0 && "mt-1 border-t border-[var(--border)]"
            )}
          >
            <p
              className={cn(
                "px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]",
                groupIndex === 0 ? "pt-0" : "pt-4"
              )}
            >
              {group.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = item.href === active;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "focus-ring flex items-center gap-3 rounded-[6px] border-l-2 px-3 text-sm transition-colors",
                      mobile ? "min-h-12 py-2.5" : "py-2",
                      isActive
                        ? "border-[var(--accent)] bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                        : "border-transparent text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "size-[18px] shrink-0",
                        isActive
                          ? "text-[var(--text-primary)]"
                          : "text-[var(--text-tertiary)]"
                      )}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <span className="font-medium tracking-[-0.01em]">
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <SidebarFooter />
    </div>
  );
}

export function AppSidebarDesktop({ role }: { role?: Role }) {
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-[240px] flex-col border-r border-[var(--border)] bg-[var(--bg)] px-3 py-4 lg:flex"
      aria-label="Hauptnavigation"
    >
      <AppSidebarContent role={role} />
    </aside>
  );
}
