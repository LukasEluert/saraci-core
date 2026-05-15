import type {
  CoreSiteCheckRow,
  PotenzialLevel,
  SiteCheckResult,
} from "@/lib/types/core";
import { FETCH_TIMEOUT_MS, SCORE_WEIGHTS, SITE_CHECK_MAX_BODY } from "@/lib/constants";

export interface SiteFlagsInput {
  ssl_aktiv: boolean;
  http_status: number | null;
  ladezeit_ms: number | null;
  meta_title: boolean;
  meta_description: boolean;
  h1_vorhanden: boolean;
  sitemap: boolean;
  robots_txt: boolean;
  impressum: boolean;
  datenschutz: boolean;
  kontakt: boolean;
}

export function flagsFromSiteCheckRow(row: CoreSiteCheckRow): SiteFlagsInput {
  return {
    ssl_aktiv: row.ssl_aktiv ?? false,
    http_status:
      row.http_status === null || row.http_status === undefined ? 0 : row.http_status,
    ladezeit_ms: row.ladezeit_ms ?? 0,
    meta_title: row.meta_title ?? false,
    meta_description: row.meta_description ?? false,
    h1_vorhanden: row.h1_vorhanden ?? false,
    sitemap: row.sitemap ?? false,
    robots_txt: row.robots_txt ?? false,
    impressum: row.impressum ?? false,
    datenschutz: row.datenschutz ?? false,
    kontakt: row.kontakt ?? false,
  };
}

export function potenzialFromScore(score: number): PotenzialLevel {
  if (score <= 30) return "niedrig";
  if (score <= 70) return "mittel";
  return "hoch";
}

export function computeScore(flags: SiteFlagsInput): number {
  let score = 0;
  if (!flags.ssl_aktiv) score += 25;
  if (flags.http_status !== 200) score += 30;
  if ((flags.ladezeit_ms ?? 0) > 3000) score += 20;
  if (!flags.meta_title) score += 15;
  if (!flags.meta_description) score += 10;
  if (!flags.h1_vorhanden) score += 10;
  if (!flags.sitemap) score += 10;
  if (!flags.robots_txt) score += 5;
  if (!flags.impressum) score += 15;
  if (!flags.datenschutz) score += 15;
  if (!flags.kontakt) score += 10;
  return score;
}

export function listIssues(flags: SiteFlagsInput): string[] {
  const issues: string[] = [];
  SCORE_WEIGHTS.forEach((w) => {
    let hit = false;
    switch (w.id) {
      case "ssl":
        hit = !flags.ssl_aktiv;
        break;
      case "http":
        hit = flags.http_status !== 200;
        break;
      case "latency":
        hit = (flags.ladezeit_ms ?? 0) > 3000;
        break;
      case "title":
        hit = !flags.meta_title;
        break;
      case "description":
        hit = !flags.meta_description;
        break;
      case "h1":
        hit = !flags.h1_vorhanden;
        break;
      case "sitemap":
        hit = !flags.sitemap;
        break;
      case "robots":
        hit = !flags.robots_txt;
        break;
      case "impressum":
        hit = !flags.impressum;
        break;
      case "datenschutz":
        hit = !flags.datenschutz;
        break;
      case "kontakt":
        hit = !flags.kontakt;
        break;
      default:
        break;
    }
    if (hit) issues.push(w.label);
  });
  return issues;
}

export function normalizeSiteUrl(raw: string): string {
  const trimmed = raw.trim().replace(/^\/+/, "");
  if (!trimmed) {
    throw new Error("Bitte gib eine gültige URL ein.");
  }
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function hostnameFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    throw new Error("Ungültige URL.");
  }
}

export async function runSiteCheck(rawUrl: string): Promise<SiteCheckResult> {
  const urlString = normalizeSiteUrl(rawUrl);
  const parsedUrl = new URL(urlString);
  const origin = `${parsedUrl.protocol}//${parsedUrl.host}`;
  const ssl_aktiv = parsedUrl.protocol === "https:";

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  const started = Date.now();
  let http_status: number | null = null;
  let erreichbar = false;
  let html = "";

  try {
    const response = await fetch(urlString, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent": "SaraciCoreSiteCheck/1.0 (+https://saraci.design)",
      },
    });
    http_status = response.status;
    erreichbar = response.ok;
    const text = await response.text();
    html =
      text.length > SITE_CHECK_MAX_BODY
        ? text.slice(0, SITE_CHECK_MAX_BODY)
        : text;
  } catch {
    erreichbar = false;
    if (http_status === null) {
      http_status = 0;
    }
  } finally {
    clearTimeout(timeoutId);
  }

  const ladezeit_ms = Math.max(0, Date.now() - started);

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const meta_title = !!(titleMatch && titleMatch[1].trim().length > 0);

  const meta_description =
    /<meta[^>]*name\s*=\s*["']description["'][^>]*>/i.test(html);

  const h1_vorhanden = /<h1[\s>]/i.test(html);

  const normalizedHtml = html.toLowerCase();

  const impressum = /\bimpressum\b/i.test(normalizedHtml);
  const datenschutz = /\bdatenschutz\b|\bprivacy\b/i.test(normalizedHtml);
  const kontakt = /\bkontakt\b|\bcontact\b/i.test(normalizedHtml);

  let sitemap = false;
  try {
    const sm = await fetch(`${origin}/sitemap.xml`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "SaraciCoreSiteCheck/1.0 (+https://saraci.design)",
      },
    });
    sitemap = sm.status === 200;
  } catch {
    sitemap = false;
  }

  let robots_txt = false;
  try {
    const rb = await fetch(`${origin}/robots.txt`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        "User-Agent": "SaraciCoreSiteCheck/1.0 (+https://saraci.design)",
      },
    });
    robots_txt = rb.status === 200;
  } catch {
    robots_txt = false;
  }

  const scoringInput: SiteFlagsInput = {
    ssl_aktiv,
    http_status: http_status === null ? 0 : http_status,
    ladezeit_ms,
    meta_title,
    meta_description,
    h1_vorhanden,
    sitemap,
    robots_txt,
    impressum,
    datenschutz,
    kontakt,
  };

  const score = computeScore(scoringInput);
  const potenzial = potenzialFromScore(score);

  return {
    domain: hostnameFromUrl(urlString),
    url: urlString,
    score,
    potenzial,
    erreichbar,
    ssl_aktiv,
    http_status,
    ladezeit_ms,
    meta_title,
    meta_description,
    h1_vorhanden,
    sitemap,
    robots_txt,
    impressum,
    datenschutz,
    kontakt,
  };
}
