import { NextResponse } from "next/server";
import Papa from "papaparse";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import { createLeadRecord, DuplicateLeadError } from "@/lib/leads/createLead";
import { emitCheckRequested } from "@/lib/leads/events";
import { resolveIndustryBySlug, resolveRegionBySlug } from "@/lib/leads/lookup";
import { triggerProcessQueue } from "@/lib/leads/queue";

export const runtime = "nodejs";

const MAX_ROWS = 100;

type CsvRow = {
  url?: string;
  company_name?: string;
  industry?: string;
  region?: string;
};

export async function POST(req: Request) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Keine CSV-Datei übergeben." }, { status: 400 });
  }

  const text = await file.text();
  const parsed = Papa.parse<CsvRow>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  if (parsed.errors.length > 0) {
    return NextResponse.json(
      {
        error: "CSV konnte nicht gelesen werden.",
        details: parsed.errors.slice(0, 5),
      },
      { status: 400 }
    );
  }

  const rows = parsed.data.slice(0, MAX_ROWS);
  const lead_ids: string[] = [];
  const errors: Array<{ row: number; reason: string }> = [];
  let skipped = 0;

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const rowNum = i + 2;

    if (!row.url?.trim()) {
      errors.push({ row: rowNum, reason: "URL fehlt" });
      skipped += 1;
      continue;
    }

    let industry_id: string | undefined;
    let region_id: string | undefined;

    if (row.industry?.trim()) {
      const industry = await resolveIndustryBySlug(row.industry.trim());
      if (!industry) {
        errors.push({
          row: rowNum,
          reason: `Branche '${row.industry}' unbekannt`,
        });
        skipped += 1;
        continue;
      }
      industry_id = industry.id;
    }

    if (row.region?.trim()) {
      const region = await resolveRegionBySlug(row.region.trim());
      if (!region) {
        errors.push({
          row: rowNum,
          reason: `Region '${row.region}' unbekannt`,
        });
        skipped += 1;
        continue;
      }
      region_id = region.id;
    }

    try {
      const lead = await createLeadRecord({
        url: row.url.trim(),
        company_name: row.company_name?.trim(),
        industry_id,
        region_id,
      });

      lead_ids.push(lead.id);
      await emitCheckRequested(lead.id, lead.domain);
    } catch (err) {
      if (err instanceof DuplicateLeadError) {
        errors.push({ row: rowNum, reason: "Duplikat – Lead existiert bereits" });
        skipped += 1;
        continue;
      }

      errors.push({
        row: rowNum,
        reason: err instanceof Error ? err.message : String(err),
      });
      skipped += 1;
    }
  }

  if (lead_ids.length > 0) {
    triggerProcessQueue();
  }

  return NextResponse.json({
    imported: lead_ids.length,
    skipped,
    errors,
    lead_ids,
  });
}
