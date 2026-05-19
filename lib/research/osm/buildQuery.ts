import { createAdminClient } from "@/lib/supabase/admin";

export async function buildOverpassQuery(args: {
  industryId: string;
  regionId: string;
  radiusKm: number;
}): Promise<string> {
  const supabase = createAdminClient();

  const { data: mappings, error: mappingError } = await supabase
    .from("industry_osm_mapping")
    .select("osm_key, osm_value")
    .eq("industry_id", args.industryId);

  if (mappingError) {
    throw new Error(
      `OSM-Mapping für Branche nicht ladbar: ${mappingError.message}`
    );
  }

  if (!mappings?.length) {
    throw new Error("Keine OSM-Tags für diese Branche konfiguriert.");
  }

  const { data: region, error: regionError } = await supabase
    .from("regions")
    .select("lat, lng, name")
    .eq("id", args.regionId)
    .single();

  if (regionError || !region) {
    throw new Error(
      regionError?.message ?? "Region nicht gefunden."
    );
  }

  if (region.lat == null || region.lng == null) {
    throw new Error(
      `Region „${region.name}“ hat keine Koordinaten (lat/lng).`
    );
  }

  const radiusM = Math.round(args.radiusKm * 1000);
  const lat = Number(region.lat);
  const lng = Number(region.lng);

  const lines: string[] = [];
  for (const m of mappings) {
    const selector = `["${m.osm_key}"="${m.osm_value}"]`;
    lines.push(
      `  node${selector}(around:${radiusM},${lat},${lng});`,
      `  way${selector}(around:${radiusM},${lat},${lng});`
    );
  }

  return `[out:json][timeout:25];
(
${lines.join("\n")}
);
out center tags;`;
}
