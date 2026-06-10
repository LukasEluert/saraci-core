import { endOfWeek, getISOWeek, startOfWeek, subWeeks } from "date-fns";
import { de } from "date-fns/locale";

/** Wochenstart Montag 00:00 (System-Lokalzeit). */
export type WeekRange = {
  start: Date;
  end: Date;
  label: string;
  isCurrent: boolean;
};

export function getWeekRange(weeksAgo: number): WeekRange {
  const now = new Date();
  const start = startOfWeek(subWeeks(now, weeksAgo), {
    weekStartsOn: 1,
    locale: de,
  });
  const end = endOfWeek(start, { weekStartsOn: 1, locale: de });
  const mondayLabel = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(start);

  return {
    start,
    end,
    label: weeksAgo === 0 ? `KW ${getISOWeek(start)}` : mondayLabel,
    isCurrent: weeksAgo === 0,
  };
}

/** Letzte 4 Wochen + aktuelle Woche (5 Eintraege, aelteste zuerst). */
export function getLastFiveWeekRanges(): WeekRange[] {
  return [4, 3, 2, 1, 0].map((weeksAgo) => getWeekRange(weeksAgo));
}

export function daysSince(iso: string | null | undefined): number {
  if (!iso) return 0;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}
