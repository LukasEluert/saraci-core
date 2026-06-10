import { toZonedTime } from "date-fns-tz";

const DISPLAY_TZ = "Europe/Berlin";

/** Kalendertag in Europe/Berlin: updated_at gehoert zu "heute"? */
export function isUpdatedTodayBerlin(value: string | null | undefined): boolean {
  if (!value) return false;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const zoned = toZonedTime(date, DISPLAY_TZ);
  const today = toZonedTime(new Date(), DISPLAY_TZ);

  return (
    zoned.getFullYear() === today.getFullYear() &&
    zoned.getMonth() === today.getMonth() &&
    zoned.getDate() === today.getDate()
  );
}
