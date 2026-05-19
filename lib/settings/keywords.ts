export function parseKeywordsInput(input: string): string[] {
  return [
    ...new Set(
      input
        .split(/[,;]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length > 0)
    ),
  ];
}

export function formatKeywordsInput(keywords: string[] | null | undefined): string {
  return (keywords ?? []).join(", ");
}

export function normalizeKeywordsField(
  value: string[] | string | undefined
): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value.map((k) => k.trim().toLowerCase()).filter((k) => k.length > 0)
      ),
    ];
  }
  return parseKeywordsInput(value);
}

export function parsePostalCodesInput(input: string): string[] {
  return [
    ...new Set(
      input
        .split(/[,;]+/)
        .map((s) => s.trim())
        .filter((s) => /^\d{5}$/.test(s))
    ),
  ];
}

export function formatPostalCodesInput(
  codes: string[] | null | undefined
): string {
  return (codes ?? []).join(", ");
}

export function normalizePostalCodesField(
  value: string[] | string | undefined
): string[] | undefined {
  if (value === undefined) return undefined;
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value.map((c) => c.trim()).filter((c) => /^\d{5}$/.test(c))
      ),
    ];
  }
  return parsePostalCodesInput(value);
}
