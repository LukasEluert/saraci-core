export function companyFromUrl(normalizedDomain: string): string {
  const hostPart = normalizedDomain.split(".")[0] ?? normalizedDomain;
  return hostPart
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
