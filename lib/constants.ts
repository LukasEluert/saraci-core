export const FETCH_TIMEOUT_MS = 8000;
export const AUX_FETCH_TIMEOUT_MS = 5000;

export const SITE_CHECK_MAX_BODY = 750_000;

export const STANDARD_BRANCHEN = [
  "Retail & Handel",
  "Gastronomie",
  "Hotellerie",
  "Handwerk",
  "Produktion & Industrie",
  "IT & Software",
  "Marketing & Werbung",
  "Beratung",
  "Gesundheitswesen",
  "Recht",
  "Finanzen",
  "Immobilien",
  "Bildung",
  "Logistik",
  "E‑Commerce",
] as const;

export const STATUS_OPTIONS = [
  { value: "neu", label: "Neu" },
  { value: "kontaktiert", label: "Kontaktiert" },
  { value: "qualifiziert", label: "Qualifiziert" },
  { value: "angebot", label: "Angebot" },
  { value: "gewonnen", label: "Gewonnen" },
  { value: "verloren", label: "Verloren" },
  { value: "abgelehnt", label: "Abgelehnt" },
] as const;

export const POTENZIAL_OPTIONS = [
  { value: "alle", label: "Alle Potenziale" },
  { value: "hoch", label: "Hoch" },
  { value: "mittel", label: "Mittel" },
  { value: "niedrig", label: "Niedrig" },
] as const;

export const SCORE_WEIGHTS = [
  { id: "ssl", label: "Kein SSL (HTTPS)", points: 25 },
  { id: "http", label: "HTTP-Status nicht 200", points: 30 },
  { id: "latency", label: "Ladezeit über 3000 ms", points: 20 },
  { id: "title", label: "Meta Title fehlt", points: 15 },
  { id: "description", label: "Meta Description fehlt", points: 10 },
  { id: "h1", label: "H1 fehlt", points: 10 },
  { id: "sitemap", label: "Sitemap fehlt (/sitemap.xml)", points: 10 },
  { id: "robots", label: "robots.txt fehlt", points: 5 },
  { id: "impressum", label: 'Impressum-Link/-Hinweis fehlt ("Impressum")', points: 15 },
  { id: "datenschutz", label: "Datenschutz/Privacy-Hinweis fehlt", points: 15 },
  { id: "kontakt", label: "Kontakt/Contact-Hinweis fehlt", points: 10 },
] as const;

export const SITE_CHECK_MAX_POINTS = SCORE_WEIGHTS.reduce(
  (acc, x) => acc + x.points,
  0
);
