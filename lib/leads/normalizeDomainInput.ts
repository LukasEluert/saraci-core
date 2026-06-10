import { normalizeUrl } from "@/lib/core/checks/normalizeUrl";

/** Weiche Normalisierung fuer Live-Duplikat-Check (wirft nicht bei Teileingaben). */
export function normalizeDomainInput(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return normalizeUrl(trimmed).normalized;
  } catch {
    let s = trimmed.toLowerCase();
    s = s.replace(/^https?:\/\//, "");
    s = s.replace(/^www\./, "");
    s = s.replace(/\/+$/, "");
    const slash = s.indexOf("/");
    if (slash > 0) s = s.slice(0, slash);
    return s || null;
  }
}
