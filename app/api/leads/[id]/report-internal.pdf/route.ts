import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/apiGuard";
import {
  generateInternalReportPdf,
  LeadReportPdfError,
} from "@/lib/reports/generateInternalReportPdf";

export const runtime = "nodejs";
export const maxDuration = 60;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id } = await context.params;

  try {
    const { buffer, filename } = await generateInternalReportPdf(id);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    if (err instanceof LeadReportPdfError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }

    const message = err instanceof Error ? err.message : String(err);
    console.error("[report-internal.pdf]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
