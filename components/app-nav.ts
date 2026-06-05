import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  FileText,
  Inbox,
  LayoutDashboard,
  ListChecks,
  Phone,
  Search,
  Settings,
  Users,
  UserCog,
} from "lucide-react";

export type Role = "admin" | "vertrieb";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const ADMIN_NAV: AppNavItem[] = [
  { href: "/overview", label: "Übersicht", icon: LayoutDashboard },
  { href: "/research", label: "Lead Research", icon: Search },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/berichte", label: "Berichte", icon: FileText },
  { href: "/admin/uebersicht", label: "Handlungsbedarf", icon: Inbox },
  { href: "/akquise", label: "Akquise", icon: Phone },
  { href: "/akquise/heute", label: "Heute", icon: CalendarClock },
  { href: "/admin/nutzer", label: "Nutzer", icon: UserCog },
  { href: "/admin/zuweisung", label: "Zuweisung", icon: ListChecks },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

const VERTRIEB_NAV: AppNavItem[] = [
  { href: "/akquise", label: "Meine Leads", icon: Phone },
  { href: "/akquise/heute", label: "Heute", icon: CalendarClock },
];

export function navForRole(role: Role): AppNavItem[] {
  return role === "admin" ? ADMIN_NAV : VERTRIEB_NAV;
}

/**
 * Aktiver Nav-Eintrag = laengster passender Prefix.
 * Verhindert Doppel-Markierung bei verschachtelten Routen (z. B. /akquise vs. /akquise/heute).
 */
export function activeNavHref(
  pathname: string,
  items: AppNavItem[]
): string | null {
  const matches = items.filter(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );
  if (matches.length === 0) return null;
  return matches.reduce((best, item) =>
    item.href.length > best.href.length ? item : best
  ).href;
}
