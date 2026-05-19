import { normalizeWebsiteUrl } from "@/lib/research/normalizeWebsite";
import type { OSMElement, OSMResponse, ResearchResultDraft } from "@/lib/research/types";

function buildAddress(tags: Record<string, string>): string | null {
  const street = [
    tags["addr:street"],
    tags["addr:housenumber"],
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const cityLine = [tags["addr:postcode"], tags["addr:city"]]
    .filter(Boolean)
    .join(" ")
    .trim();

  const parts = [street, cityLine].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

function pickWebsite(tags: Record<string, string>): string | null {
  const raw = tags.website ?? tags["contact:website"] ?? null;
  if (!raw?.trim()) return null;
  return raw.trim();
}

function pickCoordinates(element: OSMElement): {
  lat: number | null;
  lng: number | null;
} {
  const lat = element.lat ?? element.center?.lat ?? null;
  const lng = element.lon ?? element.center?.lon ?? null;
  return { lat: lat ?? null, lng: lng ?? null };
}

export function parseOverpassResponse(
  response: OSMResponse
): ResearchResultDraft[] {
  const results: ResearchResultDraft[] = [];

  for (const element of response.elements ?? []) {
    const tags = element.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    const websiteRaw = pickWebsite(tags);
    let website_url: string | null = null;
    let url_normalized: string | null = null;

    if (websiteRaw) {
      const normalized = normalizeWebsiteUrl(websiteRaw);
      if (normalized) {
        website_url = normalized.url;
        url_normalized = normalized.normalized;
      } else {
        website_url = websiteRaw;
      }
    }

    const { lat, lng } = pickCoordinates(element);

    results.push({
      company_name: name,
      website_url,
      phone: tags.phone?.trim() ?? tags["contact:phone"]?.trim() ?? null,
      address: buildAddress(tags),
      lat,
      lng,
      source_ref: `${element.type}/${element.id}`,
      raw_data: element,
      has_website: website_url !== null,
      status: "new",
      url_normalized,
    });
  }

  return results;
}
