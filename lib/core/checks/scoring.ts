import type { ScoreBreakdown, ScoreResult, TriggeredRule } from "./types";

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

function emptyBreakdown(): ScoreBreakdown {
  return {
    tech: 0,
    performance: 0,
    seo: 0,
    design: 0,
    content: 0,
    legal: 0,
    conversion: 0,
    total_deductions: 0,
    final_score: 100,
  };
}

export function calculateScore(triggered: TriggeredRule[]): ScoreResult {
  const breakdown = emptyBreakdown();

  for (const finding of triggered) {
    breakdown[finding.category] += finding.points;
    breakdown.total_deductions += finding.points;
  }

  const final_score = Math.max(
    0,
    Math.min(100, 100 + breakdown.total_deductions)
  );
  breakdown.final_score = final_score;

  let potential: ScoreResult["potential"];
  if (final_score <= 40) potential = "high";
  else if (final_score <= 70) potential = "medium";
  else potential = "low";

  const findings = [...triggered].sort((a, b) => {
    const sev =
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9);
    if (sev !== 0) return sev;
    return Math.abs(b.points) - Math.abs(a.points);
  });

  return { final_score, potential, breakdown, findings };
}
