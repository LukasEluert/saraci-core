import type { TriggeredRule } from "@/lib/core/checks/types";

export type ClientFindingCopy = {
  title: string;
  found: string;
  meaning: string;
  action: string;
};

const SEO_VISIBILITY: ClientFindingCopy = {
  title: "Ihre Seite ist bei Google schlecht auffindbar",
  found:
    "Titel, Beschreibung oder Struktur Ihrer Seite sind für Suchmaschinen nicht optimal.",
  meaning:
    "Suchmaschinen zeigen Ihre Seite in den Trefferlisten unattraktiv oder gar nicht an. Sie verlieren potenzielle Kunden, die nach Ihren Leistungen suchen.",
  action:
    "Wir optimieren Titel, Beschreibungen und Struktur Ihrer Seite für Google.",
};

const LEGAL_COMPLIANCE: ClientFindingCopy = {
  title: "Ihre Website erfüllt nicht alle rechtlichen Anforderungen",
  found:
    "Impressum oder Datenschutzerklärung fehlen oder sind nicht ausreichend verlinkt.",
  meaning:
    "In Deutschland sind Impressum und Datenschutzerklärung Pflicht. Bei Verstößen drohen Abmahnungen und Bußgelder bis 50.000 €.",
  action:
    "Wir erstellen rechtssichere Texte für Impressum und Datenschutz und binden sie korrekt ein.",
};

const CLIENT_FINDING_MAP: Record<string, ClientFindingCopy> = {
  no_https: {
    title: "Ihre Website ist nicht sicher verschlüsselt",
    found: "Die Verbindung zu Ihrer Website erfolgt nicht über HTTPS.",
    meaning:
      "Besucher sehen in modernen Browsern eine Warnung, dass Ihre Seite unsicher ist. Das kostet Vertrauen und Conversions.",
    action:
      "Wir installieren ein SSL-Zertifikat und richten automatische HTTPS-Weiterleitungen ein.",
  },
  http_status_error: {
    title: "Ihre Website ist nicht zuverlässig erreichbar",
    found: "Der Server liefert keinen erfolgreichen Seitenstatus.",
    meaning:
      "Besucher und Suchmaschinen stoßen auf Fehlerseiten – Anfragen gehen verloren, bevor jemand Ihr Angebot sieht.",
    action:
      "Wir beheben Server- und Konfigurationsfehler für eine stabile Erreichbarkeit.",
  },
  mixed_content: {
    title: "Sicherheitswarnungen durch gemischte Inhalte",
    found: "Auf Ihrer HTTPS-Seite werden noch unsichere HTTP-Ressourcen geladen.",
    meaning:
      "Browser zeigen Warnungen, die Vertrauen mindern – besonders auf mobilen Geräten.",
    action:
      "Wir stellen alle Ressourcen auf sichere Verbindungen um und testen die Seite erneut.",
  },
  perf_score_low: {
    title: "Ihre Website lädt zu langsam",
    found: "Die Performance-Werte liegen deutlich unter dem empfohlenen Niveau.",
    meaning:
      "Über 50 % der Besucher verlassen Seiten, die länger als 3 Sekunden laden. Auch Google straft langsame Seiten im Ranking ab.",
    action:
      "Wir optimieren Bilder, Code und Serverkonfiguration für schnelle Ladezeiten.",
  },
  lcp_slow: {
    title: "Der Hauptinhalt erscheint zu spät",
    found: "Der sichtbare Hauptinhalt (LCP) lädt verzögert.",
    meaning:
      "Besucher sehen zunächst eine leere oder langsame Seite – das wirkt unprofessionell und erhöht die Absprungrate.",
    action:
      "Wir priorisieren kritische Inhalte und optimieren Lade-Reihenfolge und Medien.",
  },
  cls_bad: {
    title: "Die Seite springt beim Laden",
    found: "Layout verschiebt sich während des Ladens (CLS).",
    meaning:
      "Buttons und Texte rutschen – Nutzer klicken versehentlich falsch und verlieren das Vertrauen in Ihre Marke.",
    action:
      "Wir reservieren Platz für Bilder und Schriften, damit die Seite stabil bleibt.",
  },
  not_mobile_friendly: {
    title: "Ihre Website ist nicht für Smartphones optimiert",
    found: "Die mobile Darstellung entspricht nicht den aktuellen Standards.",
    meaning:
      "Über 60 % der Besucher kommen heute mobil. Eine nicht optimierte Seite verliert diese Kunden sofort.",
    action:
      "Wir machen Ihre Website responsiv – sie passt sich automatisch allen Bildschirmgrößen an.",
  },
  no_impressum: LEGAL_COMPLIANCE,
  no_privacy_policy: LEGAL_COMPLIANCE,
  no_meta_description: SEO_VISIBILITY,
  no_title: SEO_VISIBILITY,
  title_length_bad: SEO_VISIBILITY,
  no_h1: {
    title: "Ihre Seitenstruktur ist für Besucher unklar",
    found: "Überschriften (H1) fehlen oder sind mehrfach vorhanden.",
    meaning:
      "Besucher und Suchmaschinen erkennen das Hauptthema Ihrer Seite schlechter – wichtige Inhalte wirken weniger relevant.",
    action:
      "Wir strukturieren Überschriften und Inhalte klar und suchmaschinenfreundlich.",
  },
  no_contact_info: {
    title: "Besucher finden keinen einfachen Weg, Sie zu kontaktieren",
    found: "Kontaktdaten sind auf der Website nicht gut erkennbar.",
    meaning:
      "Ohne sichtbare Kontaktmöglichkeiten verlieren Sie Anfragen, selbst wenn Besucher interessiert sind.",
    action:
      "Wir platzieren klare Kontakt-Buttons und gut sichtbare Telefonnummern strategisch auf Ihrer Seite.",
  },
  no_cta: {
    title: "Besucher finden keinen einfachen Weg, Sie zu kontaktieren",
    found: "Es fehlen klare Handlungsaufforderungen (Call-to-Action).",
    meaning:
      "Ohne sichtbare Kontaktmöglichkeiten verlieren Sie Anfragen, selbst wenn Besucher interessiert sind.",
    action:
      "Wir platzieren klare Kontakt-Buttons und gut sichtbare Telefonnummern strategisch auf Ihrer Seite.",
  },
  no_favicon: {
    title: "Ihr Tab in Browsern wirkt unvollständig",
    found: "Ein Favicon (kleines Seiten-Icon) fehlt.",
    meaning:
      "In Browser-Tabs und Lesezeichen wirkt Ihre Marke weniger professionell und wiedererkennbar.",
    action: "Wir ergänzen ein passendes Favicon für alle gängigen Browser.",
  },
  images_no_alt: {
    title: "Bilder sind für Suchmaschinen unsichtbar",
    found: "Viele Bilder haben keinen beschreibenden Alternativtext.",
    meaning:
      "Google kann Inhalte schlechter einordnen – Barrierefreiheit und SEO leiden.",
    action:
      "Wir versehen Bilder mit sinnvollen Alt-Texten und prüfen die Barrierefreiheit.",
  },
  low_text_content: {
    title: "Zu wenig aussagekräftiger Inhalt auf der Seite",
    found: "Der Textumfang ist für Suchmaschinen und Besucher gering.",
    meaning:
      "Wenig Inhalt erschwert Vertrauen und Ranking – Besucher verstehen Ihr Angebot nicht schnell genug.",
    action:
      "Wir ergänzen klare, relevante Texte, die Ihre Leistungen verständlich erklären.",
  },
};

const SEVERITY_WEIGHT: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
};

export function mapFindingToClientCopy(finding: TriggeredRule): ClientFindingCopy {
  const mapped = CLIENT_FINDING_MAP[finding.rule_key];
  if (mapped) return mapped;

  return {
    title: finding.label,
    found: finding.evidence?.trim() || finding.label,
    meaning:
      "Dieser Punkt kann sich auf Ihre Online-Präsenz, Ihr Vertrauen bei Besuchern und Ihre Sichtbarkeit auswirken.",
    action:
      "Wir besprechen diesen Bereich im Beratungsgespräch und schlagen einen passenden, priorisierten Lösungsweg vor.",
  };
}

export function pickTopClientFindings(
  findings: TriggeredRule[],
  limit = 3
): ClientFindingCopy[] {
  if (findings.length === 0) return [];

  const sorted = [...findings].sort((a, b) => {
    const severityDiff =
      (SEVERITY_WEIGHT[b.severity] ?? 0) - (SEVERITY_WEIGHT[a.severity] ?? 0);
    if (severityDiff !== 0) return severityDiff;
    return a.points - b.points;
  });

  const seen = new Set<string>();
  const result: ClientFindingCopy[] = [];

  for (const finding of sorted) {
    const copy = mapFindingToClientCopy(finding);
    if (seen.has(copy.title)) continue;
    seen.add(copy.title);
    result.push(copy);
    if (result.length >= limit) break;
  }

  return result;
}

export type ClientPackageCopy = {
  title: string;
  bullets: string[];
};

export const CLIENT_PACKAGE_MAP: Record<string, ClientPackageCopy> = {
  webdesign: {
    title: "Komplette Website-Überarbeitung",
    bullets: [
      "Neues, klares Design im Saraci-Stil – minimalistisch und hochwertig",
      "Responsive Umsetzung für Desktop, Tablet und Smartphone",
      "Technische Basis: SSL, schnelle Ladezeiten, saubere Struktur",
      "Übergabe mit kurzer Einweisung und Dokumentation",
    ],
  },
  seo: {
    title: "Suchmaschinenoptimierung (SEO)",
    bullets: [
      "Analyse Ihrer aktuellen Sichtbarkeit bei Google",
      "Optimierung von Titeln, Meta-Beschreibungen und Seitenstruktur",
      "Technische SEO: Geschwindigkeit, Mobile, Indexierung",
      "Monatliches Monitoring und Prioritätenliste",
    ],
  },
  site_care: {
    title: "Site Care – Wartung & Sicherheit",
    bullets: [
      "Regelmäßige Updates von System und Plugins",
      "SSL, Backups und Sicherheits-Checks",
      "Kleine inhaltliche Anpassungen inklusive",
      "Schneller Support bei Störungen",
    ],
  },
  mixed: {
    title: "Individuelles Paket – Beratungsgespräch empfohlen",
    bullets: [
      "Gemeinsame Priorisierung Ihrer wichtigsten Baustellen",
      "Maßgeschneiderte Kombination aus Design, SEO und Technik",
      "Klare Roadmap mit realistischen Meilensteinen",
      "Transparentes Angebot nach dem Erstgespräch",
    ],
  },
};

export function getClientPackage(
  recommendation: string | null
): ClientPackageCopy {
  if (recommendation && CLIENT_PACKAGE_MAP[recommendation]) {
    return CLIENT_PACKAGE_MAP[recommendation];
  }
  return CLIENT_PACKAGE_MAP.mixed;
}

export function scoreColor(score: number | null): string {
  if (score == null) return "#525252";
  if (score <= 40) return "#dc2626";
  if (score <= 70) return "#ca8a04";
  return "#16a34a";
}
