import type { OSMResponse } from "@/lib/research/types";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const TIMEOUT_MS = 30_000;

export async function fetchOverpass(query: string): Promise<OSMResponse> {
  const body = `data=${encodeURIComponent(query)}`;

  let res: Response;
  try {
    res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Saraci-Core/1.0 (+https://saraci-design.de)",
      },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Overpass-Anfrage fehlgeschlagen: ${message}`);
  }

  const text = await res.text();

  if (!res.ok) {
    throw new Error(
      `Overpass API ${res.status}: ${text.slice(0, 300) || res.statusText}`
    );
  }

  try {
    return JSON.parse(text) as OSMResponse;
  } catch {
    throw new Error("Overpass-Antwort ist kein gültiges JSON.");
  }
}
