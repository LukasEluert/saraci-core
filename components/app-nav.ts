import type { LucideIcon } from "lucide-react";
import {
  FileText,
  LayoutDashboard,
  Search,
  Settings,
  Users,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const APP_NAV: AppNavItem[] = [
  { href: "/overview", label: "Übersicht", icon: LayoutDashboard },
  { href: "/research", label: "Lead Research", icon: Search },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/berichte", label: "Berichte", icon: FileText },
  { href: "/einstellungen", label: "Einstellungen", icon: Settings },
];

export function isNavActive(pathname: string, href: string): boolean {
  return (
    pathname === href ||
    (href !== "/overview" && pathname.startsWith(href))
  );
}
