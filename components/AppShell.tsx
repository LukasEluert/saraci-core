"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoutButton } from "@/components/LogoutButton";

const NAV = [
  { href: "/overview", label: "Übersicht", short: "Übersicht" },
  { href: "/research", label: "Lead Research", short: "Research" },
  { href: "/leads", label: "Leads", short: "Leads" },
  { href: "/berichte", label: "Berichte", short: "Berichte" },
  { href: "/einstellungen", label: "Einstellungen", short: "Settings" },
] as const;

function LogoMark() {
  return (
    <Link href="/overview" className="group block shrink-0 font-mono">
      <span className="inline-flex gap-1 whitespace-nowrap text-[10px] font-medium uppercase leading-none tracking-[0.16em] text-[var(--text-primary)]">
        <span>SARACI</span>
        <span className="text-[var(--accent)] tracking-[0.16em]">CORE</span>
      </span>
    </Link>
  );
}

function NavDesktop() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-[180px] md:flex-col md:border-r md:border-[var(--border)] md:bg-[var(--bg-elevated)]">
      <div className="flex h-[52px] items-center border-b border-[var(--border)] px-4">
        <LogoMark />
      </div>
      <nav className="flex flex-col gap-0.5 p-2">
        {NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/overview" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "focus-ring rounded-md border border-transparent px-3 py-2 font-sans text-[13px] tracking-[-0.01em] transition-colors",
                active
                  ? "border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
              ].join(" ")}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function BottomNavMobile() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[var(--border)] bg-[rgba(12,12,12,0.92)] backdrop-blur-md md:hidden">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/overview" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            className={[
              "focus-ring relative flex flex-1 flex-col items-center justify-center gap-[2px] py-2 text-[10px] font-medium tracking-[-0.01em]",
              active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)]",
            ].join(" ")}
          >
            <span className="max-w-[64px] truncate text-center">{item.short}</span>
            <span
              className={[
                "h-[2px] w-6 rounded-full",
                active ? "bg-[var(--accent)]" : "bg-transparent",
              ].join(" ")}
            />
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShellHeader() {
  return (
    <header className="flex h-[52px] items-center justify-between border-b border-[var(--border)] bg-[rgba(16,16,16,0.75)] px-4 backdrop-blur-md md:px-6">
      <div className="md:hidden">
        <LogoMark />
      </div>
      <span className="hidden md:block text-[var(--text-tertiary)]">&nbsp;</span>
      <div className="flex items-center gap-3">
        <LogoutButton />
      </div>
    </header>
  );
}

export function AppSidebarDesktop() {
  return <NavDesktop />;
}
