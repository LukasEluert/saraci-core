import type {
  ParsedHtmlData,
  ReachabilityData,
  ScoreRule,
  TriggeredRule,
} from "./types";

function ruleMap(rules: ScoreRule[]): Map<string, ScoreRule> {
  return new Map(rules.map((r) => [r.key, r]));
}

function trigger(
  rules: Map<string, ScoreRule>,
  key: string,
  evidence: string
): TriggeredRule | null {
  const rule = rules.get(key);
  if (!rule) return null;
  return {
    rule_key: rule.key,
    label: rule.label,
    category: rule.category,
    severity: rule.severity,
    points: rule.points,
    evidence,
  };
}

function footerHasKeyword(links: string[], keywords: string[]): boolean {
  return links.some((link) => keywords.some((kw) => link.includes(kw)));
}

export function evaluateOnPage(
  parsed: ParsedHtmlData,
  reach: ReachabilityData,
  rules: ScoreRule[],
  fetchStatusCode?: number
): TriggeredRule[] {
  const map = ruleMap(rules);
  const findings: TriggeredRule[] = [];

  const push = (t: TriggeredRule | null) => {
    if (t) findings.push(t);
  };

  const statusCode = fetchStatusCode ?? reach.status_code;

  if (!reach.ok) {
    if (reach.used_protocol === "http" || reach.ssl?.valid === false) {
      push(
        trigger(
          map,
          "no_https",
          `Finale URL: ${reach.final_url} – kein HTTPS oder SSL ungültig${reach.ssl?.error ? `: ${reach.ssl.error}` : ""}`
        )
      );
    }
    push(
      trigger(
        map,
        "http_status_error",
        `HTTP-Status: ${statusCode ?? "keine Antwort"}`
      )
    );
    return findings;
  }

  if (statusCode !== null && statusCode !== 200) {
    push(
      trigger(
        map,
        "http_status_error",
        `HTTP-Status: ${statusCode} (erwartet: 200)`
      )
    );
  }

  if (reach.used_protocol === "http" || reach.ssl?.valid === false) {
    push(
      trigger(
        map,
        "no_https",
        `Finale URL: ${reach.final_url} – kein HTTPS oder SSL ungültig${reach.ssl?.error ? `: ${reach.ssl.error}` : ""}`
      )
    );
  }

  if (parsed.has_mixed_content) {
    push(
      trigger(
        map,
        "mixed_content",
        "HTTP-Ressourcen auf HTTPS-Seite geladen"
      )
    );
  }

  if (!parsed.favicon_present) {
    push(trigger(map, "no_favicon", "Kein Favicon im <head>"));
  }

  if (!parsed.title) {
    push(trigger(map, "no_title", "Kein <title>-Tag oder leer"));
  } else if (parsed.title.length < 20 || parsed.title.length > 70) {
    push(
      trigger(
        map,
        "title_length_bad",
        `Title-Länge: ${parsed.title.length} Zeichen (Zielbereich: 20-70)`
      )
    );
  }

  if (!parsed.meta_description) {
    push(
      trigger(
        map,
        "no_meta_description",
        "Keine Meta-Description gefunden"
      )
    );
  }

  if (parsed.h1_count === 0 || parsed.h1_count > 1) {
    push(
      trigger(
        map,
        "no_h1",
        `${parsed.h1_count} H1-Tags gefunden (sollte 1 sein)`
      )
    );
  }

  if (!parsed.viewport_meta) {
    push(
      trigger(
        map,
        "not_mobile_friendly",
        "Kein viewport-Meta-Tag"
      )
    );
  }

  if (
    parsed.image_count > 0 &&
    parsed.images_without_alt / parsed.image_count > 0.5
  ) {
    const percent = Math.round(
      (parsed.images_without_alt / parsed.image_count) * 100
    );
    push(
      trigger(
        map,
        "images_no_alt",
        `${parsed.images_without_alt}/${parsed.image_count} Bilder ohne Alt-Text (${percent}%)`
      )
    );
  }

  if (parsed.text_word_count < 200) {
    push(
      trigger(
        map,
        "low_text_content",
        `Nur ${parsed.text_word_count} Wörter Textinhalt`
      )
    );
  }

  if (
    !footerHasKeyword(parsed.footer_links, ["impressum", "imprint", "legal"])
  ) {
    push(
      trigger(
        map,
        "no_impressum",
        "Kein Impressum-Link im Footer"
      )
    );
  }

  if (
    !footerHasKeyword(parsed.footer_links, [
      "datenschutz",
      "privacy",
      "dsgvo",
    ])
  ) {
    push(
      trigger(
        map,
        "no_privacy_policy",
        "Kein Datenschutz-Link im Footer"
      )
    );
  }

  const { tel_links, mailto_links, visible_phone_pattern, visible_email_pattern } =
    parsed.contact_signals;

  if (
    tel_links + mailto_links === 0 &&
    !visible_phone_pattern &&
    !visible_email_pattern
  ) {
    push(
      trigger(
        map,
        "no_contact_info",
        "Keine Telefon- oder E-Mail-Angabe sichtbar"
      )
    );
  }

  const { contact_buttons, form_count } = parsed.cta_signals;
  if (contact_buttons === 0 && form_count === 0) {
    push(
      trigger(
        map,
        "no_cta",
        "Keine Kontakt-Buttons oder Formulare gefunden"
      )
    );
  }

  return findings;
}
