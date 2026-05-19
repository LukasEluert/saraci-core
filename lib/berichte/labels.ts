export const RECOMMENDATION_LABELS: Record<string, string> = {
  webdesign: "Webdesign & UX",
  seo: "SEO & Performance",
  site_care: "Technik & Compliance (Site Care)",
  mixed: "Gemischter Ansatz",
};

export function recommendationLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return RECOMMENDATION_LABELS[value] ?? value;
}
