import { renderToBuffer } from "@react-pdf/renderer";
import { ClientReportPdfDocument } from "@/lib/reports/ClientReportPdfDocument";
import {
  loadLeadReportPdfData,
  slugifyFirma,
} from "@/lib/reports/loadReportPdfData";

export { LeadReportPdfError } from "@/lib/reports/errors";

export function buildClientReportPdfFilename(
  firma: string,
  generatedAt: string
): string {
  const date = generatedAt.slice(0, 10);
  return `saraci-audit-${slugifyFirma(firma) || "report"}-${date}.pdf`;
}

export async function generateClientReportPdf(
  leadId: string
): Promise<{ buffer: Buffer; filename: string }> {
  const data = await loadLeadReportPdfData(leadId);
  const buffer = await renderToBuffer(<ClientReportPdfDocument data={data} />);
  return {
    buffer: Buffer.from(buffer),
    filename: buildClientReportPdfFilename(data.lead.firma, data.generatedAt),
  };
}
