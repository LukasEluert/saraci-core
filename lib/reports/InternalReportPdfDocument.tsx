import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import type { LeadReportPdfData } from "@/lib/reports/types";
import {
  CATEGORY_LABELS,
  FOOTER,
  POTENTIAL_LABELS,
  RECOMMENDATION_LABELS,
  SEVERITY_LABELS,
} from "@/lib/reports/constants";

const colors = {
  black: "#0a0a0a",
  white: "#ffffff",
  red: "#dc2626",
  gray: "#525252",
  lightGray: "#e5e5e5",
  yellow: "#ca8a04",
  green: "#16a34a",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 48,
    paddingBottom: 64,
    paddingHorizontal: 48,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: colors.black,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 32,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.red,
  },
  brand: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
  },
  brandSub: {
    fontSize: 8,
    color: colors.gray,
    marginTop: 4,
    letterSpacing: 1,
  },
  date: {
    fontSize: 9,
    color: colors.gray,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: colors.gray,
    marginBottom: 8,
    marginTop: 20,
  },
  leadName: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 4,
  },
  muted: {
    color: colors.gray,
    fontSize: 9,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  infoLabel: {
    width: 72,
    color: colors.gray,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginTop: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  potentialBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 2,
  },
  potentialText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.black,
    paddingBottom: 4,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGray,
  },
  colCategory: { flex: 2 },
  colPoints: { width: 48, textAlign: "right", fontFamily: "Helvetica-Bold" },
  findingRow: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.lightGray,
  },
  findingLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  findingMeta: {
    fontSize: 8,
    color: colors.gray,
    marginBottom: 3,
  },
  findingEvidence: {
    fontSize: 9,
    lineHeight: 1.4,
  },
  recommendation: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginTop: 4,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 10,
    fontSize: 8,
    color: colors.gray,
  },
});

const CATEGORY_ORDER = [
  "tech",
  "performance",
  "seo",
  "design",
  "content",
  "legal",
  "conversion",
  "total_deductions",
  "final_score",
];

function formatDateDe(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long",
  }).format(new Date(iso));
}

function potentialStyle(potential: string | null) {
  switch (potential) {
    case "high":
      return { backgroundColor: colors.red };
    case "medium":
      return { backgroundColor: colors.yellow };
    case "low":
      return { backgroundColor: colors.green };
    default:
      return { backgroundColor: colors.gray };
  }
}

export function InternalReportPdfDocument({ data }: { data: LeadReportPdfData }) {
  const breakdown = data.check.scoreBreakdown ?? {};
  const breakdownKeys = CATEGORY_ORDER.filter((k) => k in breakdown);
  const findings = data.check.findings ?? [];
  const recommendationLabel = data.report.recommendation
    ? (RECOMMENDATION_LABELS[data.report.recommendation] ??
      data.report.recommendation)
    : "—";

  return (
    <Document title={data.report.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>SARACI DESIGN</Text>
            <Text style={styles.brandSub}>INTERNER WEBSITE-AUDIT</Text>
          </View>
          <Text style={styles.date}>{formatDateDe(data.generatedAt)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Lead</Text>
        <Text style={styles.leadName}>{data.lead.firma}</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Website</Text>
          <Text>{data.lead.domain}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Branche</Text>
          <Text>{data.lead.industryName ?? "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Region</Text>
          <Text>{data.lead.regionName ?? "—"}</Text>
        </View>

        <Text style={styles.sectionTitle}>Score</Text>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreValue}>
            {data.check.score != null ? `${data.check.score}` : "—"}
          </Text>
          {data.check.potential && (
            <View
              style={[
                styles.potentialBadge,
                potentialStyle(data.check.potential),
              ]}
            >
              <Text style={styles.potentialText}>
                Potenzial: {POTENTIAL_LABELS[data.check.potential] ?? data.check.potential}
              </Text>
            </View>
          )}
        </View>
        {data.check.checkedAt && (
          <Text style={[styles.muted, { marginTop: 6 }]}>
            Geprüft am {formatDateDe(data.check.checkedAt)}
          </Text>
        )}

        <Text style={styles.sectionTitle}>Score-Breakdown</Text>
        {breakdownKeys.length === 0 ? (
          <Text style={styles.muted}>Kein Breakdown verfügbar.</Text>
        ) : (
          <View>
            <View style={styles.tableHeader}>
              <Text style={[styles.colCategory, { fontFamily: "Helvetica-Bold" }]}>
                Kategorie
              </Text>
              <Text style={[styles.colPoints, { fontFamily: "Helvetica-Bold" }]}>
                Punkte
              </Text>
            </View>
            {breakdownKeys.map((key) => (
              <View key={key} style={styles.tableRow}>
                <Text style={styles.colCategory}>
                  {CATEGORY_LABELS[key] ?? key}
                </Text>
                <Text style={styles.colPoints}>{breakdown[key]}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.sectionTitle}>Findings</Text>
        {findings.length === 0 ? (
          <Text style={styles.muted}>Keine Findings festgestellt.</Text>
        ) : (
          findings.map((f, i) => (
            <View key={`${f.rule_key}-${i}`} style={styles.findingRow}>
              <Text style={styles.findingLabel}>{f.label}</Text>
              <Text style={styles.findingMeta}>
                {SEVERITY_LABELS[f.severity] ?? f.severity} · {f.points} Pkt. ·{" "}
                {CATEGORY_LABELS[f.category] ?? f.category}
              </Text>
              {f.evidence ? (
                <Text style={styles.findingEvidence}>{f.evidence}</Text>
              ) : null}
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Empfohlener Ansatz</Text>
        <Text style={styles.recommendation}>{recommendationLabel}</Text>
        {data.report.summary ? (
          <Text style={[styles.muted, { marginTop: 6, lineHeight: 1.4 }]}>
            {data.report.summary}
          </Text>
        ) : null}

        <View style={styles.footer} fixed>
          <Text>{FOOTER.brand} · {FOOTER.website}</Text>
          <Text>{FOOTER.email}</Text>
        </View>
      </Page>
    </Document>
  );
}
