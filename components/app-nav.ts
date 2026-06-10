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
  roles: Role[];
};

export type AppNavGroup = {
  title: string;
  roles: Role[];
  items: AppNavItem[];
};

const NAV_GROUPS: AppNavGroup[] = [
  {
    title: "Arbeitsbereich",
    roles: ["admin"],
    items: [
      {
        href: "/overview",
        label: "Übersicht",
        icon: LayoutDashboard,
        roles: ["admin"],
      },
      {
        href: "/admin/uebersicht",
        label: "Handlungsbedarf",
        icon: Inbox,
        roles: ["admin"],
      },
    ],
  },
  {
    title: "Lead-Management",
    roles: ["admin"],
    items: [
      {
        href: "/research",
        label: "Lead Research",
        icon: Search,
        roles: ["admin"],
      },
      { href: "/leads", label: "Leads", icon: Users, roles: ["admin"] },
      { href: "/berichte", label: "Berichte", icon: FileText, roles: ["admin"] },
    ],
  },
  {
    title: "Vertrieb",
    roles: ["admin", "vertrieb"],
    items: [
      { href: "/akquise", label: "Akquise", icon: Phone, roles: ["admin", "vertrieb"] },
      {
        href: "/akquise/heute",
        label: "Heute",
        icon: CalendarClock,
        roles: ["admin", "vertrieb"],
      },
    ],
  },
  {
    title: "System",
    roles: ["admin"],
    items: [
      { href: "/admin/nutzer", label: "Nutzer", icon: UserCog, roles: ["admin"] },
      {
        href: "/admin/zuweisung",
        label: "Zuweisung",
        icon: ListChecks,
        roles: ["admin"],
      },
      {
        href: "/einstellungen",
        label: "Einstellungen",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
];

export function navGroupsForRole(role: Role): AppNavGroup[] {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.roles.includes(role) && group.items.length > 0);
}

export function navForRole(role: Role): AppNavItem[] {
  return navGroupsForRole(role).flatMap((group) => group.items);
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
