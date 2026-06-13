import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subWeeks,
} from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

const TZ = "Europe/Berlin";

export type OverviewPeriod = "this_week" | "last_week" | "this_month" | "last_30_days";

export const OVERVIEW_PERIODS: { value: OverviewPeriod; label: string }[] = [
  { value: "this_week", label: "Diese Woche" },
  { value: "last_week", label: "Letzte Woche" },
  { value: "this_month", label: "Diesen Monat" },
  { value: "last_30_days", label: "Letzten 30 Tage" },
];

export type PeriodRange = {
  start: Date;
  end: Date;
};

function berlinNow(): Date {
  return toZonedTime(new Date(), TZ);
}

function toUtcRange(startLocal: Date, endLocal: Date): PeriodRange {
  return {
    start: fromZonedTime(startOfDay(startLocal), TZ),
    end: fromZonedTime(endOfDay(endLocal), TZ),
  };
}

export function getPeriodRange(period: OverviewPeriod): PeriodRange {
  const now = berlinNow();

  switch (period) {
    case "this_week":
      return toUtcRange(
        startOfWeek(now, { weekStartsOn: 1 }),
        endOfWeek(now, { weekStartsOn: 1 })
      );
    case "last_week": {
      const ref = subWeeks(now, 1);
      return toUtcRange(
        startOfWeek(ref, { weekStartsOn: 1 }),
        endOfWeek(ref, { weekStartsOn: 1 })
      );
    }
    case "this_month":
      return toUtcRange(startOfMonth(now), endOfMonth(now));
    case "last_30_days":
      return toUtcRange(subDays(now, 29), now);
  }
}

export function getPreviousPeriodRange(period: OverviewPeriod): PeriodRange {
  const now = berlinNow();

  switch (period) {
    case "this_week": {
      const ref = subWeeks(now, 1);
      return toUtcRange(
        startOfWeek(ref, { weekStartsOn: 1 }),
        endOfWeek(ref, { weekStartsOn: 1 })
      );
    }
    case "last_week": {
      const ref = subWeeks(now, 2);
      return toUtcRange(
        startOfWeek(ref, { weekStartsOn: 1 }),
        endOfWeek(ref, { weekStartsOn: 1 })
      );
    }
    case "this_month": {
      const prev = subWeeks(startOfMonth(now), 1);
      return toUtcRange(startOfMonth(prev), endOfMonth(prev));
    }
    case "last_30_days":
      return toUtcRange(subDays(now, 59), subDays(now, 30));
  }
}

export function periodDays(period: OverviewPeriod): number {
  const { start, end } = getPeriodRange(period);
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86_400_000)
  );
}

export function berlinDayKey(value: string | Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export function berlinDayStartUtc(dayKey: string): Date {
  return fromZonedTime(`${dayKey}T00:00:00`, TZ);
}

export function berlinDayEndUtc(dayKey: string): Date {
  return fromZonedTime(`${dayKey}T23:59:59.999`, TZ);
}

export function periodLabel(period: OverviewPeriod): string {
  return OVERVIEW_PERIODS.find((p) => p.value === period)?.label ?? period;
}
