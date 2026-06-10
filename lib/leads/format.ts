import { formatDistanceToNow } from "date-fns";
import { de } from "date-fns/locale";

const DISPLAY_TZ = "Europe/Berlin";

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: DISPLAY_TZ,
  }).format(new Date(value));
}

// Datum kurz: 08.06.2026 (Kalendertag in Europe/Berlin)
export function formatDateShort(value: string | null | undefined): string {
  if (!value) return "—";
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: DISPLAY_TZ,
  }).format(new Date(value));
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

// Relativ ("vor 3 Tagen") wenn juenger als 7 Tage, sonst Datum (08.06.2026).
export function formatCreatedAt(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Date.now() - date.getTime() < WEEK_MS) {
    return formatDistanceToNow(date, { addSuffix: true, locale: de });
  }
  return formatDateShort(value);
}

// Lead-Detail: "vor 3 Tagen (08.06.2026)"
export function formatCreatedAtVerbose(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  const relative = formatDistanceToNow(date, { addSuffix: true, locale: de });
  return `${relative} (${formatDateShort(value)})`;
}
