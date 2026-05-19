import { renderToBuffer } from "@react-pdf/renderer";
import { InternalReportPdfDocument } from "@/lib/reports/InternalReportPdfDocument";
import {
  loadLeadReportPdfData,
  slugifyFirma,
} from "@/lib/reports/loadReportPdfData";

export { LeadReportPdfError } from "@/lib/reports/errors";

export function buildInternalReportPdfFilename(
  firma: string,
  generatedAt: string
): string {
  const date = generatedAt.slice(0, 10);
  return `saraci-lead-${slugifyFirma(firma) || "report"}-${date}.pdf`;
}

export async function generateInternalReportPdf(
  leadId: string
): Promise<{ buffer: Buffer; filename: string }> {
  const data = await loadLeadReportPdfData(leadId);
  const buffer = await renderToBuffer(<InternalReportPdfDocument data={data} />);
  return {
    buffer: Buffer.from(buffer),
    filename: buildInternalReportPdfFilename(data.lead.firma, data.generatedAt),
  };
}
