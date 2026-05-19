import type { LeadReportDraft, RawCheckData, ScoreResult } from "./types";

const RECOMMENDATION_LABELS: Record<LeadReportDraft["recommendation"], string> = {
  webdesign: "Webdesign & UX",
  seo: "SEO & Performance",
  site_care: "Technik & Compliance (Site Care)",
  mixed: "Gemischter Ansatz",
};

function hostFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function topCategories(breakdown: ScoreResult["breakdown"], n: number): string[] {
  const entries: Array<{ cat: string; abs: number }> = [
    { cat: "Technik", abs: Math.abs(breakdown.tech) },
    { cat: "Performance", abs: Math.abs(breakdown.performance) },
    { cat: "SEO", abs: Math.abs(breakdown.seo) },
    { cat: "Design", abs: Math.abs(breakdown.design) },
    { cat: "Content", abs: Math.abs(breakdown.content) },
    { cat: "Legal", abs: Math.abs(breakdown.legal) },
    { cat: "Conversion", abs: Math.abs(breakdown.conversion) },
  ];
  return entries
    .sort((a, b) => b.abs - a.abs)
    .filter((e) => e.abs > 0)
    .slice(0, n)
    .map((e) => e.cat);
}

function buildSummary(score: ScoreResult): string {
  const tops = topCategories(score.breakdown, 2);
  const top1 = tops[0] ?? "mehreren Bereichen";
  const top2 = tops[1] ?? top1;

  if (score.final_score <= 40) {
    return `Die Website weist erhebliche Schwächen in ${top1} und ${top2} auf. Hoher Optimierungsbedarf erkennbar.`;
  }
  if (score.final_score <= 70) {
    return `Die Website ist grundsätzlich funktional, zeigt aber Schwächen in ${top1}.`;
  }
  return "Die Website ist solide. Geringer Handlungsbedarf erkennbar.";
}

function pickRecommendation(
  breakdown: ScoreResult["breakdown"]
): LeadReportDraft["recommendation"] {
  const groups = {
    webdesign:
      Math.abs(breakdown.design) +
      Math.abs(breakdown.content) +
      Math.abs(breakdown.conversion),
    seo: Math.abs(breakdown.seo) + Math.abs(breakdown.performance),
    site_care: Math.abs(breakdown.tech) + Math.abs(breakdown.legal),
  };

  const sorted = Object.entries(groups).sort((a, b) => b[1] - a[1]);
  const worst = sorted[0];
  const second = sorted[1];

  if (!worst || worst[1] === 0) return "mixed";
  if (second && Math.abs(worst[1] - second[1]) < 10) return "mixed";
  return worst[0] as LeadReportDraft["recommendation"];
}

const POTENTIAL_LABEL: Record<string, string> = {
  high: "Hoch",
  medium: "Mittel",
  low: "Niedrig",
};

export function generateReport(args: {
  url: string;
  finalUrl: string | null;
  score: ScoreResult;
  rawData: RawCheckData;
}): LeadReportDraft {
  const host = hostFromUrl(args.finalUrl ?? args.url);
  const summary = buildSummary(args.score);
  const recommendation = pickRecommendation(args.score.breakdown);
  const topFindings = args.score.findings.slice(0, 5);

  const problemsBlock =
    topFindings.length > 0
      ? topFindings
          .map(
            (f) =>
              `### ${f.label} (${f.severity})\n- **Kategorie:** ${f.category}\n- **Punktabzug:** ${f.points}\n- **Befund:** ${f.evidence}`
          )
          .join("\n\n")
      : "_Keine kritischen Findings registriert._";

  const errorNote =
    args.rawData.errors.length > 0
      ? `\n\n## Hinweise\n\nFolgende Prüfungen waren unvollständig: ${args.rawData.errors.map((e) => `${e.phase}: ${e.message}`).join("; ")}`
      : "";

  const body_markdown = `# Lead-Bericht: ${host}

**URL:** ${args.finalUrl ?? args.url}
**Geprüft am:** ${args.rawData.checked_at}
**Score:** ${args.score.final_score}/100
**Potenzial:** ${POTENTIAL_LABEL[args.score.potential] ?? args.score.potential}
**Empfohlener Ansatz:** ${RECOMMENDATION_LABELS[recommendation]}

## Kurz-Einschätzung

${summary}

## Hauptprobleme

${problemsBlock}

## Score-Aufschlüsselung

| Kategorie | Punkte |
|-----------|--------|
| Tech | ${args.score.breakdown.tech} |
| Performance | ${args.score.breakdown.performance} |
| SEO | ${args.score.breakdown.seo} |
| Design | ${args.score.breakdown.design} |
| Content | ${args.score.breakdown.content} |
| Legal | ${args.score.breakdown.legal} |
| Conversion | ${args.score.breakdown.conversion} |
| **Gesamt-Abzug** | **${args.score.breakdown.total_deductions}** |
| **Finaler Score** | **${args.score.final_score}/100** |
${errorNote}`;

  return {
    title: `Lead-Bericht: ${host}`,
    summary,
    body_markdown,
    recommendation,
    key_findings: topFindings.map((f) => ({
      label: f.label,
      category: f.category,
      severity: f.severity,
      evidence: f.evidence,
    })),
  };
}
