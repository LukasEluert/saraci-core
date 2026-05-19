import { fetch } from "undici";
import { PAGESPEED_TIMEOUT_MS } from "./timeouts";
import type { PageSpeedData, ScoreRule, TriggeredRule } from "./types";
const RETRY_PAUSE_MS = 2_000;

function extractPageSpeed(json: Record<string, unknown>): PageSpeedData {
  const lighthouse = json.lighthouseResult as Record<string, unknown> | undefined;
  const categories = (lighthouse?.categories ?? {}) as Record<
    string,
    { score?: number }
  >;
  const audits = (lighthouse?.audits ?? {}) as Record<
    string,
    { numericValue?: number; score?: number }
  >;

  const scorePct = (key: string) => {
    const s = categories[key]?.score;
    return s != null ? Math.round(s * 100) : null;
  };

  const auditMs = (key: string) => {
    const v = audits[key]?.numericValue;
    return v != null ? Math.round(v) : null;
  };

  const viewportScore = audits.viewport?.score;

  return {
    perf_score: scorePct("performance"),
    seo_score: scorePct("seo"),
    a11y_score: scorePct("accessibility"),
    lcp_ms: auditMs("largest-contentful-paint"),
    cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
    fcp_ms: auditMs("first-contentful-paint"),
    tbt_ms: auditMs("total-blocking-time"),
    mobile_friendly: viewportScore === 1 ? true : viewportScore === 0 ? false : null,
  };
}

async function fetchPageSpeedOnce(
  url: string,
  apiKey: string
): Promise<{ ok: true; data: PageSpeedData } | { ok: false; error: string }> {
  const params = new URLSearchParams({
    url,
    strategy: "mobile",
    key: apiKey,
  });
  params.append("category", "performance");
  params.append("category", "seo");
  params.append("category", "accessibility");

  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`;

  const res = await fetch(endpoint, {
    method: "GET",
    signal: AbortSignal.timeout(PAGESPEED_TIMEOUT_MS),
  });

  const body = await res.text();

  if (res.status >= 500) {
    return { ok: false, error: `PageSpeed API ${res.status}: ${body.slice(0, 200)}` };
  }

  if (res.status !== 200) {
    return { ok: false, error: `PageSpeed API ${res.status}: ${body.slice(0, 300)}` };
  }

  try {
    const json = JSON.parse(body) as Record<string, unknown>;
    return { ok: true, data: extractPageSpeed(json) };
  } catch {
    return { ok: false, error: "PageSpeed-Antwort konnte nicht geparst werden." };
  }
}

export async function runPageSpeed(
  url: string
): Promise<{ ok: true; data: PageSpeedData } | { ok: false; error: string }> {
  const apiKey = process.env.PAGESPEED_API_KEY;
  if (!apiKey) {
    return { ok: false, error: "PAGESPEED_API_KEY nicht gesetzt." };
  }

  let result = await fetchPageSpeedOnce(url, apiKey);

  if (!result.ok && /PageSpeed API 5\d{2}/.test(result.error)) {
    await new Promise((r) => setTimeout(r, RETRY_PAUSE_MS));
    result = await fetchPageSpeedOnce(url, apiKey);
  }

  return result;
}

export function evaluatePageSpeed(
  ps: PageSpeedData,
  rules: ScoreRule[]
): TriggeredRule[] {
  const map = new Map(rules.map((r) => [r.key, r]));
  const findings: TriggeredRule[] = [];

  const push = (key: string, evidence: string) => {
    const rule = map.get(key);
    if (!rule) return;
    findings.push({
      rule_key: rule.key,
      label: rule.label,
      category: rule.category,
      severity: rule.severity,
      points: rule.points,
      evidence,
    });
  };

  if (ps.perf_score !== null && ps.perf_score < 50) {
    push(
      "perf_score_low",
      `PageSpeed Mobile Performance: ${ps.perf_score}/100`
    );
  }

  if (ps.lcp_ms !== null && ps.lcp_ms > 4000) {
    push(
      "lcp_slow",
      `LCP: ${(ps.lcp_ms / 1000).toFixed(1)}s (Schwelle: 4.0s)`
    );
  }

  if (ps.cls !== null && ps.cls > 0.25) {
    push("cls_bad", `CLS: ${ps.cls.toFixed(2)} (Schwelle: 0.25)`);
  }

  if (ps.mobile_friendly === false) {
    push(
      "not_mobile_friendly",
      "PageSpeed Mobile-Friendly-Audit fehlgeschlagen"
    );
  }

  return findings;
}
