export function normalizeUrl(input: string): {
  url: string;
  normalized: string;
} {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL darf nicht leer sein.");
  }

  let withProtocol = trimmed;
  if (!/^https?:\/\//i.test(withProtocol)) {
    withProtocol = `https://${withProtocol}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(withProtocol);
  } catch {
    throw new Error("Ungültige URL – kein Hostname extrahierbar.");
  }

  if (!parsed.hostname) {
    throw new Error("Ungültige URL – kein Hostname extrahierbar.");
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "");
  const normalized = host;

  parsed.hostname = host;
  parsed.pathname = "";
  parsed.search = "";
  parsed.hash = "";

  const url = `${parsed.protocol}//${host}`;

  return { url, normalized };
}
