import { evaluateOnPage } from "./evaluateOnPage";
import { fetchHtml } from "./fetchHtml";
import { loadActiveScoreRules } from "./loadScoreRules";
import { normalizeUrl } from "./normalizeUrl";
import { evaluatePageSpeed, runPageSpeed } from "./pagespeed";
import { parseHtml } from "./parseHtml";
import { persistCheckResult } from "./persistCheck";
import { checkReachability } from "./reachability";
import { generateReport } from "./reportGenerator";
import { applyDetectedIndustryToLead } from "./detectIndustry";
import { applyDetectedRegionToLead } from "./detectRegion";
import { calculateScore } from "./scoring";
import type {
  ParsedHtmlData,
  RawCheckData,
  TriggeredRule,
  WebsiteCheckInput,
  WebsiteCheckResult,
} from "./types";

function emptyParsed(): ParsedHtmlData {
  return {
    title: null,
    meta_description: null,
    body_text: "",
    h1_count: 0,
    h1_texts: [],
    lang: null,
    viewport_meta: null,
    favicon_present: false,
    image_count: 0,
    images_without_alt: 0,
    text_word_count: 0,
    has_mixed_content: false,
    footer_links: [],
    contact_signals: {
      tel_links: 0,
      mailto_links: 0,
      visible_phone_pattern: false,
      visible_email_pattern: false,
    },
    cta_signals: { contact_buttons: 0, form_count: 0 },
  };
}

function reconcileMobileFriendly(
  findings: TriggeredRule[],
  pageSpeedMobileOk: boolean
): TriggeredRule[] {
  if (!pageSpeedMobileOk) return findings;
  return findings.filter((f) => f.rule_key !== "not_mobile_friendly");
}

export async function runWebsiteCheck(
  input: WebsiteCheckInput
): Promise<WebsiteCheckResult> {
  let normalizedUrl = "";
  let fetchUrl = "";

  try {
    const rules = await loadActiveScoreRules();
    const { url, normalized } = normalizeUrl(input.url);
    normalizedUrl = normalized;
    fetchUrl = url;

    const rawData: RawCheckData = {
      version: "1.0",
      checked_at: new Date().toISOString(),
      input_url: input.url,
      final_url: null,
      phases: {},
      errors: [],
    };

    const reach = await checkReachability(url);
    rawData.phases.reachability = reach;
    rawData.final_url = reach.final_url;

    if (!reach.ok) {
      const { check_id, report_id } = await persistCheckResult({
        input,
        checkedUrl: reach.final_url,
        normalizedUrl,
        rawData,
        score: null,
        report: null,
        status: "failed",
        errorMessage: reach.error ?? "Seite nicht erreichbar",
      });

      return {
        ok: false,
        check_id,
        report_id,
        score: null,
        potential: null,
        status: "failed",
        error: reach.error ?? "Seite nicht erreichbar",
      };
    }

    let parsed = emptyParsed();
    let fetchStatus: number | undefined = reach.status_code ?? undefined;

    const htmlResult = await fetchHtml(reach.final_url);
    if ("error" in htmlResult) {
      rawData.errors.push({
        phase: "fetch",
        message: htmlResult.error,
        recoverable: true,
      });
      if (htmlResult.fetch.status_code) {
        fetchStatus = htmlResult.fetch.status_code;
        rawData.phases.fetch = {
          status_code: htmlResult.fetch.status_code,
          response_time_ms: htmlResult.fetch.response_time_ms ?? 0,
          content_type: htmlResult.fetch.content_type ?? "",
          body_size_bytes: htmlResult.fetch.body_size_bytes ?? 0,
          truncated: htmlResult.fetch.truncated ?? false,
        };
      }
    } else {
      rawData.phases.fetch = htmlResult.fetch;
      fetchStatus = htmlResult.fetch.status_code;

      try {
        parsed = parseHtml(htmlResult.html, reach.final_url);
        rawData.phases.html = parsed;
      } catch (err) {
        rawData.errors.push({
          phase: "parse",
          message: err instanceof Error ? err.message : String(err),
          recoverable: true,
        });
        rawData.phases.html = parsed;
      }
    }

    let findings = evaluateOnPage(parsed, reach, rules, fetchStatus);

    const psResult = await runPageSpeed(reach.final_url);
    if (psResult.ok) {
      rawData.phases.pagespeed = psResult.data;
      const psFindings = evaluatePageSpeed(psResult.data, rules);
      findings = [...findings, ...psFindings];

      if (psResult.data.mobile_friendly === true) {
        findings = reconcileMobileFriendly(findings, true);
      }
    } else {
      rawData.errors.push({
        phase: "pagespeed",
        message: psResult.error,
        recoverable: true,
      });
    }

    const score = calculateScore(findings);
    const report = generateReport({
      url: input.url,
      finalUrl: reach.final_url,
      score,
      rawData,
    });

    const { check_id, report_id } = await persistCheckResult({
      input,
      checkedUrl: reach.final_url,
      normalizedUrl,
      rawData,
      score,
      report,
      status: "completed",
    });

    if (input.target.type === "lead") {
      try {
        await applyDetectedIndustryToLead(input.target.id, parsed);
      } catch (detectErr) {
        console.error(
          "[runWebsiteCheck] Branchen-Erkennung:",
          detectErr instanceof Error ? detectErr.message : detectErr
        );
      }
      try {
        await applyDetectedRegionToLead(input.target.id, parsed);
      } catch (detectErr) {
        console.error(
          "[runWebsiteCheck] Regions-Erkennung:",
          detectErr instanceof Error ? detectErr.message : detectErr
        );
      }
    }

    return {
      ok: true,
      check_id,
      report_id,
      score: score.final_score,
      potential: score.potential,
      status: "completed",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[runWebsiteCheck] unerwarteter Fehler:", message);

    try {
      const { check_id, report_id } = await persistCheckResult({
        input,
        checkedUrl: fetchUrl || input.url,
        normalizedUrl: normalizedUrl || input.url,
        rawData: {
          version: "1.0",
          checked_at: new Date().toISOString(),
          input_url: input.url,
          final_url: null,
          phases: {},
          errors: [
            {
              phase: "reachability",
              message,
              recoverable: false,
            },
          ],
        },
        score: null,
        report: null,
        status: "failed",
        errorMessage: message,
      });

      return {
        ok: false,
        check_id,
        report_id,
        score: null,
        potential: null,
        status: "failed",
        error: message,
      };
    } catch (persistErr) {
      const persistMsg =
        persistErr instanceof Error ? persistErr.message : String(persistErr);
      return {
        ok: false,
        check_id: "",
        report_id: null,
        score: null,
        potential: null,
        status: "failed",
        error: `${message} (Persistenz: ${persistMsg})`,
      };
    }
  }
}
