import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  getClientPackage,
  pickTopClientFindings,
  scoreColor,
} from "@/lib/reports/clientFindingCopy";
import { FOOTER } from "@/lib/reports/constants";
import type { LeadReportPdfData } from "@/lib/reports/types";

const colors = {
  black: "#0a0a0a",
  white: "#ffffff",
  red: "#dc2626",
  gray: "#525252",
  lightGray: "#f5f5f5",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 56,
    paddingBottom: 56,
    paddingHorizontal: 56,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: colors.black,
    backgroundColor: colors.white,
    lineHeight: 1.5,
  },
  brandLarge: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 3,
    color: colors.red,
    marginBottom: 48,
  },
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    marginBottom: 8,
    lineHeight: 1.2,
  },
  coverSubtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 24,
  },
  coverDate: {
    fontSize: 11,
    color: colors.gray,
    marginBottom: 40,
  },
  scoreBlock: {
    marginTop: 24,
    marginBottom: 20,
  },
  scoreValue: {
    fontSize: 80,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1,
  },
  scoreSuffix: {
    fontSize: 24,
    color: colors.gray,
    marginTop: 4,
  },
  scoreExplain: {
    fontSize: 11,
    color: colors.gray,
    lineHeight: 1.55,
    maxWidth: 420,
  },
  h1: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginBottom: 16,
    color: colors.black,
  },
  h2: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 8,
    color: colors.red,
  },
  body: {
    fontSize: 11,
    lineHeight: 1.55,
    marginBottom: 12,
  },
  findingCard: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGray,
  },
  findingTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.red,
    marginBottom: 4,
    marginTop: 6,
  },
  bullet: {
    fontSize: 11,
    marginBottom: 6,
    paddingLeft: 8,
  },
  box: {
    backgroundColor: colors.lightGray,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
  },
  cta: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: colors.red,
    marginTop: 16,
    marginBottom: 8,
  },
  contactLine: {
    fontSize: 12,
    marginBottom: 6,
    fontFamily: "Helvetica-Bold",
  },
  disclaimer: {
    fontSize: 8,
    color: colors.gray,
    lineHeight: 1.45,
    marginTop: 32,
    borderTopWidth: 1,
    borderTopColor: colors.lightGray,
    paddingTop: 12,
  },
  pageFooter: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    fontSize: 8,
    color: colors.gray,
    textAlign: "center",
  },
});

function formatDateDe(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", {
    dateStyle: "long",
  }).format(new Date(iso));
}

export function ClientReportPdfDocument({ data }: { data: LeadReportPdfData }) {
  const score = data.check.score;
  const topFindings = pickTopClientFindings(data.check.findings ?? [], 3);
  const pkg = getClientPackage(data.report.recommendation);
  const accent = scoreColor(score);

  return (
    <Document title={`Website-Audit ${data.lead.firma}`}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.brandLarge}>SARACI DESIGN</Text>
        <Text style={styles.coverTitle}>
          Website-Audit für {data.lead.firma}
        </Text>
        <Text style={styles.coverSubtitle}>Ihre individuelle Auswertung</Text>
        <Text style={styles.coverDate}>{formatDateDe(data.generatedAt)}</Text>

        <View style={styles.scoreBlock}>
          <Text style={[styles.scoreValue, { color: accent }]}>
            {score != null ? score : "—"}
          </Text>
          <Text style={styles.scoreSuffix}>/ 100 Punkte</Text>
        </View>

        <Text style={styles.scoreExplain}>
          Dieser Score (0–100) bewertet Ihre Website nach 7 Kategorien: Technik,
          Performance, SEO, Design, Inhalt, Recht und Conversion. Je niedriger der
          Score, desto größer das Verbesserungspotenzial.
        </Text>

        <Text style={styles.pageFooter} fixed>
          {FOOTER.brand} · Vertraulich · Nur für den Empfänger bestimmt
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Zusammenfassung</Text>

        <Text style={styles.h2}>Was wir geprüft haben</Text>
        <Text style={styles.body}>
          Wir haben Ihre Website automatisiert auf über 18 Kriterien geprüft,
          die für Sichtbarkeit, Conversions und rechtliche Sicherheit entscheidend
          sind. Hier sind Ihre wichtigsten Ergebnisse.
        </Text>

        <Text style={styles.h2}>Die 3 wichtigsten Befunde</Text>
        {topFindings.length === 0 ? (
          <Text style={styles.body}>
            In dieser Auswertung wurden keine kritischen Mängel festgestellt.
            Für eine vertiefte Analyse empfehlen wir ein persönliches Gespräch.
          </Text>
        ) : (
          topFindings.map((f, i) => (
            <View key={`finding-${i}`} style={styles.findingCard}>
              <Text style={styles.findingTitle}>{f.title}</Text>
              <Text style={styles.label}>Was wir gefunden haben</Text>
              <Text style={styles.body}>{f.found}</Text>
              <Text style={styles.label}>Was das für Sie bedeutet</Text>
              <Text style={styles.body}>{f.meaning}</Text>
              <Text style={styles.label}>Was zu tun ist</Text>
              <Text style={styles.body}>{f.action}</Text>
            </View>
          ))
        )}

        <Text style={styles.pageFooter} fixed>
          Seite 2 · Website-Audit {data.lead.firma}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Unsere Empfehlung für Sie</Text>

        <Text style={[styles.h2, { marginTop: 0 }]}>{pkg.title}</Text>
        {pkg.bullets.map((bullet) => (
          <Text key={bullet} style={styles.bullet}>
            • {bullet}
          </Text>
        ))}

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Ihre Investition</Text>
          <Text style={styles.body}>auf Anfrage</Text>
        </View>

        <View style={styles.box}>
          <Text style={styles.boxTitle}>Nächste Schritte</Text>
          <Text style={styles.bullet}>
            1. Sie kontaktieren uns für ein kostenfreies Erstgespräch (30 Min)
          </Text>
          <Text style={styles.bullet}>
            2. Wir besprechen Ihre Ziele und Prioritäten
          </Text>
          <Text style={styles.bullet}>
            3. Sie erhalten ein konkretes Angebot
          </Text>
          <Text style={styles.bullet}>
            4. Bei Auftrag: Start innerhalb von 2 Wochen
          </Text>
        </View>

        <Text style={styles.pageFooter} fixed>
          Seite 3 · Website-Audit {data.lead.firma}
        </Text>
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.h1}>Kontakt & Über uns</Text>

        <Text style={styles.body}>
          Saraci-Design ist Ihre Webdesign-Agentur für minimalistische,
          hochwertige Websites. Wir konzentrieren uns auf das Wesentliche: klare
          Struktur, schnelle Ladezeiten und Inhalte, die Ihre Kunden zum Handeln
          bewegen.
        </Text>

        <Text style={styles.cta}>Termin vereinbaren</Text>
        <Text style={styles.contactLine}>E-Mail: {FOOTER.email}</Text>
        <Text style={styles.contactLine}>Web: {FOOTER.website}</Text>
        <Text style={styles.contactLine}>Telefon: auf Anfrage</Text>

        <Text style={styles.disclaimer}>
          Diese Auswertung basiert auf automatisierten Tests und stellt keine
          vollständige Beurteilung dar. Für eine ausführliche Analyse vereinbaren
          Sie gerne ein Beratungsgespräch.
        </Text>

        <Text style={styles.pageFooter} fixed>
          {FOOTER.brand} · {FOOTER.website}
        </Text>
      </Page>
    </Document>
  );
}
