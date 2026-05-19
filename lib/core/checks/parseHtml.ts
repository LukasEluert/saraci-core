import * as cheerio from "cheerio";
import type { ParsedHtmlData } from "./types";

const BODY_TEXT_MAX = 8000;

const DEFAULT_PARSED: ParsedHtmlData = {
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
  cta_signals: {
    contact_buttons: 0,
    form_count: 0,
  },
};

export function parseHtml(html: string, baseUrl: string): ParsedHtmlData {
  try {
    const $ = cheerio.load(html);
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    const h1Texts = $("h1")
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(Boolean)
      .slice(0, 5);

    const footerLinks = new Set<string>();

    const addLinkSignal = (text: string, href: string) => {
      const t = text.trim().toLowerCase();
      const h = href.trim().toLowerCase();
      if (t) footerLinks.add(t);
      if (h) footerLinks.add(h);
      if (t || h) footerLinks.add(`${t} ${h}`.trim());
    };

    $(
      "footer a, [class*='footer'] a, [id*='footer'] a, [role='contentinfo'] a, nav a"
    ).each((_, el) => {
      addLinkSignal($(el).text(), $(el).attr("href") ?? "");
    });

    $("a").each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      const href = ($(el).attr("href") ?? "").toLowerCase();
      const blob = `${text} ${href}`;
      if (
        /impressum|imprint|legal|datenschutz|privacy|dsgvo|cookie/.test(blob)
      ) {
        addLinkSignal($(el).text(), $(el).attr("href") ?? "");
      }
    });

    let contactButtons = 0;
    $("a, button").each((_, el) => {
      const text = $(el).text().trim();
      if (/(kontakt|anfrage|termin|jetzt|angebot)/i.test(text)) {
        contactButtons += 1;
      }
    });

    const title = $("title").first().text().trim() || null;
    const metaDescription =
      $('meta[name="description"]').attr("content")?.trim() || null;

    const imageCount = $("img").length;
    const imagesWithoutAlt = $("img:not([alt]), img[alt='']").length;

    const hasMixedContent =
      baseUrl.startsWith("https://") &&
      /(?:src|href)\s*=\s*["']http:\/\//i.test(html);

    const phonePattern = /(?:\+49|0)[\s\-/]?\d{2,5}[\s\-/]?\d{3,}/;
    const emailPattern = /[\w.+-]+@[\w-]+\.[\w.-]+/;

    return {
      title,
      meta_description: metaDescription,
      body_text: bodyText.slice(0, BODY_TEXT_MAX),
      h1_count: $("h1").length,
      h1_texts: h1Texts,
      lang: $("html").attr("lang") || null,
      viewport_meta: $('meta[name="viewport"]').attr("content") || null,
      favicon_present:
        $('link[rel="icon"]').length > 0 ||
        $('link[rel*="icon"]').length > 0,
      image_count: imageCount,
      images_without_alt: imagesWithoutAlt,
      text_word_count: bodyText
        ? bodyText.split(/\s+/).filter(Boolean).length
        : 0,
      has_mixed_content: hasMixedContent,
      footer_links: [...footerLinks],
      contact_signals: {
        tel_links: $('a[href^="tel:"]').length,
        mailto_links: $('a[href^="mailto:"]').length,
        visible_phone_pattern: phonePattern.test(bodyText),
        visible_email_pattern: emailPattern.test(bodyText),
      },
      cta_signals: {
        contact_buttons: contactButtons,
        form_count: $("form").length,
      },
    };
  } catch {
    return { ...DEFAULT_PARSED };
  }
}
