import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdf";
import { getQuote } from "@/lib/storage";
import { renderDocumentHtml, type DocumentPayload } from "@/components/keter/document-html";
import { buildDocNumber } from "@/lib/i18n";
import fs from "fs";
import path from "path";

// Cache the logo data URI at module load (server-side only).
let logoDataUri: string | null = null;
function getLogoDataUri(): string {
  if (logoDataUri) return logoDataUri;
  const logoPath = path.join(process.cwd(), "public", "keter-logo.png");
  const buf = fs.readFileSync(logoPath);
  logoDataUri = `data:image/png;base64,${buf.toString("base64")}`;
  return logoDataUri;
}

// POST /api/pdf
// Body: DocumentPayload (full doc data) — generates PDF without saving.
// Query: ?id=<quoteId> — fetches saved quote and renders PDF.
//
// Returns: application/pdf
export async function POST(req: NextRequest) {
  try {
    let payload: DocumentPayload;
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (id) {
      const quote = await getQuote(id);
      if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
      payload = {
        docType: quote.docType,
        language: quote.language,
        clientNumber: quote.clientNumber,
        date: quote.date,
        fullName: quote.fullName,
        city: quote.city,
        country: quote.country,
        phone: quote.phone,
        email: quote.email,
        service: quote.service,
        priceCv: quote.priceCv,
        priceLinkedin: quote.priceLinkedin,
        accountHolder: quote.accountHolder,
        iban: quote.iban,
        bic: quote.bic,
        bank: quote.bank,
        paymentMode: quote.paymentMode,
        paymentConditions: quote.paymentConditions,
        paymentLink: quote.paymentLink,
        paymentStatus: quote.paymentStatus,
        paymentDate: quote.paymentDate,
        quoteNumber: quote.quoteNumber,
      };
    } else {
      payload = (await req.json()) as DocumentPayload;
    }

    // Ensure quoteNumber is set
    if (!payload.quoteNumber) {
      payload.quoteNumber = buildDocNumber(payload.clientNumber, payload.docType);
    }

    const pdf = await generatePdf(payload, getLogoDataUri());

    // Filename: Devis_D2600004_Eric_De_Lavarene.pdf
    const docTypeLabel = payload.docType === "devis" ? "Devis" : "Facture";
    const firstLast = payload.fullName.trim().split(/\s+/);
    const first = firstLast[0] || "Client";
    const last = firstLast.slice(1).join("_") || "";
    const safeName = `${first}${last ? "_" + last : ""}`.replace(/[^a-zA-Z0-9_]/g, "");
    const filename = `${docTypeLabel}_${payload.quoteNumber}_${safeName}.pdf`;

    return new NextResponse(pdf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
      },
    });
  } catch (e: any) {
    console.error("PDF generation failed:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  // Same as POST but uses query params for id-based retrieval
  return POST(req);
}
