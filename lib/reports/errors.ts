export class LeadReportPdfError extends Error {
  status: number;

  constructor(message: string, status = 404) {
    super(message);
    this.name = "LeadReportPdfError";
    this.status = status;
  }
}
