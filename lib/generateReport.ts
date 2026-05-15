import type { PotenzialLevel } from "@/lib/types/core";
import type { SiteFlagsInput } from "@/lib/siteCheck";
import { listIssues } from "@/lib/siteCheck";
import { SITE_CHECK_MAX_POINTS } from "@/lib/constants";

function formatDatum(d: Date): string {
  return d.toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function potenzialLabel(p: PotenzialLevel | string): string {
  switch (p) {
    case "hoch":
      return "Hoch";
    case "mittel":
      return "Mittel";
    case "niedrig":
      return "Niedrig";
    default:
      return String(p);
  }
}

function ansatzText(score: number, issues: string[]): string {
  if (score >= 71) {
    return `Der Lead weist eine hohe Nachfrage nach Web-Modernisierung auf (${issues.length} größere Themenfelder). Saraci Design kann hier mit einem klaren Upgrade-Pfad starten: schnelle Quick-Wins zu Performance & Trust, anschließend ein konsistentes UI-System und belastbare Content-Strukturen.`;
  }
  if (score >= 31) {
    return `Es gibt mehrere belastbare Ansatzpunkte für ein Redesign (${issues.length} Auffälligkeiten). Ein moderater Scope mit Fokus auf Vertrauen, SEO-Basics und Lesbarkeit ist passend — danach können modulare Komponenten und Brand-Konsistenz nachgezogen werden.`;
  }
  return `Die Seite ist technisch relativ solide (${issues.length} größere Auffälligkeiten). Ein gezieltes Retainer- oder Paketangebot mit klarem Mehrwert (Conversion, Brand, Performance) und optionalen Iterationen passt besser als ein Voll-Relaunch.`;
}

export function generateReport(input: {
  domain: string;
  firma: string | null;
  branche: string | null;
  geprueftAm: Date;
  score: number;
  potenzial: PotenzialLevel | string;
  flags: SiteFlagsInput;
  issuesOverride?: string[];
}): string {
  const issues = input.issuesOverride ?? listIssues(input.flags);
  const issuesBlock =
    issues.length > 0
      ? issues.map((i) => `- ${i}`).join("\n")
      : "- Keine der geprüften Standard-Auffälligkeiten wurde eindeutig erkannt.";

  const ansatz = ansatzText(input.score, issues);

  return `# Lead Report: ${input.domain}

**Firma:** ${input.firma?.trim() || "—"}
**Branche:** ${input.branche?.trim() || "—"}
**Geprüft am:** ${formatDatum(input.geprueftAm)}
**Score:** ${input.score} / ${SITE_CHECK_MAX_POINTS}
**Potenzial:** ${potenzialLabel(input.potenzial)}

## Technische Auffälligkeiten

${issuesBlock}

## Möglicher Ansatz für Saraci Design

${ansatz}
`;
}
