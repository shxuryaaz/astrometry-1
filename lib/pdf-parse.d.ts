declare module "pdf-parse" {
  interface PDFResult {
    numpages: number;
    text: string;
    info?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }

  function pdfParse(buffer: Buffer): Promise<PDFResult>;
  export = pdfParse;
}



