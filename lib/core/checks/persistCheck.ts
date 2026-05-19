import { createAdminClient } from "@/lib/supabase/admin";
import type {
  LeadReportDraft,
  RawCheckData,
  ScoreResult,
  WebsiteCheckInput,
} from "./types";

export async function persistCheckResult(args: {
  input: WebsiteCheckInput;
  checkedUrl: string;
  normalizedUrl: string;
  rawData: RawCheckData;
  score: ScoreResult | null;
  report: LeadReportDraft | null;
  status: "completed" | "failed";
  errorMessage?: string;
}): Promise<{ check_id: string; report_id: string | null }> {
  const supabase = createAdminClient();
  const ps = args.rawData.phases.pagespeed;

  const { data: checkRow, error: checkError } = await supabase
    .from("website_checks")
    .insert({
      lead_id: args.input.target.type === "lead" ? args.input.target.id : null,
      result_id:
        args.input.target.type === "result" ? args.input.target.id : null,
      input_url: args.input.url,
      checked_url: args.checkedUrl,
      normalized_url: args.normalizedUrl,
      status: args.status,
      error_message: args.errorMessage ?? null,
      score: args.score?.final_score ?? null,
      potential: args.score?.potential ?? null,
      findings: args.score?.findings ?? [],
      score_breakdown: args.score?.breakdown ?? null,
      raw_data: args.rawData,
      perf_score: ps?.perf_score ?? null,
      seo_score: ps?.seo_score ?? null,
      a11y_score: ps?.a11y_score ?? null,
      lcp_ms: ps?.lcp_ms ?? null,
      cls: ps?.cls ?? null,
    })
    .select("id")
    .single();

  if (checkError || !checkRow) {
    throw new Error(
      checkError?.message ?? "website_checks insert fehlgeschlagen."
    );
  }

  const checkId = checkRow.id;
  let reportId: string | null = null;

  if (args.report && args.status === "completed") {
    const { data: reportRow, error: reportError } = await supabase
      .from("lead_reports")
      .insert({
        check_id: checkId,
        lead_id: args.input.target.type === "lead" ? args.input.target.id : null,
        result_id:
          args.input.target.type === "result" ? args.input.target.id : null,
        title: args.report.title,
        summary: args.report.summary,
        body_markdown: args.report.body_markdown,
        recommendation: args.report.recommendation,
        key_findings: args.report.key_findings,
      })
      .select("id")
      .single();

    if (reportError) {
      console.error("[persistCheck] lead_reports insert:", reportError.message);
    } else {
      reportId = reportRow?.id ?? null;
    }
  }

  const now = new Date().toISOString();

  if (args.input.target.type === "lead" && args.status === "completed" && args.score) {
    const { error } = await supabase
      .from("leads")
      .update({
        last_check_id: checkId,
        score: args.score.final_score,
        potential: args.score.potential,
        last_checked_at: now,
        updated_at: now,
      })
      .eq("id", args.input.target.id);

    if (error) {
      console.error("[persistCheck] leads update:", error.message);
    }
  }

  if (args.input.target.type === "result" && args.status === "completed" && args.score) {
    const { error } = await supabase
      .from("research_results")
      .update({
        last_check_id: checkId,
        score: args.score.final_score,
        potential: args.score.potential,
        status: "checked",
        updated_at: now,
      })
      .eq("id", args.input.target.id);

    if (error) {
      console.error("[persistCheck] research_results update:", error.message);
    }
  }

  const eventType =
    args.status === "completed" ? "check.completed" : "check.failed";

  const { error: eventError } = await supabase.from("core_events").insert({
    type: eventType,
    source_id: checkId,
    source_label: args.checkedUrl,
    task_text: args.errorMessage ?? `Check ${args.status}`,
    metadata: {
      score: args.score?.final_score ?? null,
      potential: args.score?.potential ?? null,
      target: args.input.target,
    },
  });

  if (eventError) {
    console.error("[persistCheck] core_events insert:", eventError.message);
  }

  if (args.status === "completed" && args.score?.potential === "high") {
    const { error: hpError } = await supabase.from("core_events").insert({
      type: "lead.high_potential_detected",
      source_id:
        args.input.target.type === "lead"
          ? args.input.target.id
          : args.input.target.type === "result"
            ? args.input.target.id
            : checkId,
      source_label: args.checkedUrl,
      task_text: `Hohes Potenzial erkannt (Score ${args.score.final_score})`,
      metadata: { check_id: checkId, score: args.score.final_score },
    });
    if (hpError) {
      console.error("[persistCheck] high_potential event:", hpError.message);
    }
  }

  return { check_id: checkId, report_id: reportId };
}
