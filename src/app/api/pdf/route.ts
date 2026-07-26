import { NextRequest, NextResponse } from "next/server";
import { generatePdf } from "@/lib/pdf";
import { getQuote, saveQuote } from "@/lib/storage";
import { renderDocumentHtml, type DocumentPayload } from "@/components/keter/document-html";
import { buildDocNumber, formatDate } from "@/lib/i18n";
import { sendPdfSelfCopy, isEmailConfigured } from "@/lib/email";
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

type PdfRequestBody = DocumentPayload & {
  // When true, also save the quote to Supabase (idempotent: keyed by quoteNumber).
  saveToDb?: boolean;
  // When true, send a copy of the PDF to SELF_BCC_EMAIL via Resend.
  emailSelfCopy?: boolean;
  // Optional status override when saving (default: "saved" for devis, "invoiced" for facture)
  status?: string;
};

function buildFilename(payload: DocumentPayload): string {
  const docTypeLabel = payload.docType === "devis" ? "Devis" : "Facture";
  const firstLast = payload.fullName.trim().split(/\s+/);
  const first = firstLast[0] || "Client";
  const last = firstLast.slice(1).join("_") || "";
  const safeName = `${first}${last ? "_" + last : ""}`.replace(/[^a-zA-Z0-9_]/g, "");
  return `${docTypeLabel}_${payload.quoteNumber}_${safeName}.pdf`;
}

// POST /api/pdf
// Body: PdfRequestBody — generates PDF.
//   ?id=<quoteId> — fetches saved quote and renders PDF (GET-style on POST).
//
// Optional body flags:
//   saveToDb: true       — also upsert the quote to Supabase
//   emailSelfCopy: true  — send a copy of the PDF to SELF_BCC_EMAIL via Resend
//
// Returns: application/pdf (always), with X-Email-Sent header indicating BCC result.
export async function POST(req: NextRequest) {
  try {
    let payload: PdfRequestBody;
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
        cvQuantity: quote.cvQuantity,
        currency: quote.currency,
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
      payload = (await req.json()) as PdfRequestBody;
    }

    // Ensure quoteNumber is set
    if (!payload.quoteNumber) {
      payload.quoteNumber = buildDocNumber(payload.clientNumber, payload.docType);
    }

    const pdf = await generatePdf(payload, getLogoDataUri());
    const filename = buildFilename(payload);

    // Side-effect 1: optionally save the quote to Supabase.
    // Errors here don't fail the PDF download — the user still gets their PDF.
    if (payload.saveToDb) {
      try {
        await saveQuote({
          quoteNumber: payload.quoteNumber,
          docType: payload.docType,
          language: payload.language,
          clientNumber: payload.clientNumber,
          date: payload.date,
          fullName: payload.fullName,
          city: payload.city,
          country: payload.country,
          phone: payload.phone,
          email: payload.email,
          service: payload.service,
          priceCv: payload.priceCv,
          priceLinkedin: payload.priceLinkedin,
          accountHolder: payload.accountHolder,
          iban: payload.iban,
          bic: payload.bic,
          bank: payload.bank,
          paymentMode: payload.paymentMode,
          paymentConditions: payload.paymentConditions,
          paymentLink: payload.paymentLink,
          paymentStatus: payload.paymentStatus,
          paymentDate: payload.paymentDate,
          status: payload.status ?? (payload.docType === "facture" ? "invoiced" : "saved"),
        });
      } catch (e: any) {
        console.warn("[pdf] saveToDb failed (PDF still returned):", e.message);
      }
    }

    // Side-effect 2: optionally email a copy to the operator.
    // Errors here don't fail the PDF download either.
    let emailSent = false;
    let emailError: string | null = null;
    if (payload.emailSelfCopy) {
      if (!isEmailConfigured()) {
        emailError = "Email not configured (RESEND_API_KEY / SELF_BCC_EMAIL / RESEND_FROM_EMAIL missing)";
      } else {
        try {
          const docLabel = payload.docType === "devis" ? "Devis" : "Facture";
          const dateLabel = formatDate(payload.date, payload.language);
          const subject = `${docLabel} ${payload.quoteNumber} — ${payload.fullName}`;
          const bodyHtml = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; color: #1f2937;">
              <div style="background:#000028;padding:16px 24px;border-radius:4px 4px 0 0;">
                <div style="font-size:18px;font-weight:700;color:#D4AF37;font-family:ui-monospace,monospace;letter-spacing:0.1em;">${docLabel.toUpperCase()} ${payload.quoteNumber}</div>
              </div>
              <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 4px 4px;">
                <p style="margin:0 0 12px;">Your ${docLabel.toLowerCase()} has been generated. A copy is attached for your records.</p>
                <table style="width:100%;font-size:14px;border-collapse:collapse;">
                  <tr><td style="padding:4px 0;color:#6b7280;width:140px;">Client</td><td style="padding:4px 0;font-weight:600;">${payload.fullName}</td></tr>
                  <tr><td style="padding:4px 0;color:#6b7280;">Date</td><td style="padding:4px 0;">${dateLabel}</td></tr>
                  <tr><td style="padding:4px 0;color:#6b7280;">Language</td><td style="padding:4px 0;">${payload.language.toUpperCase()}</td></tr>
                  <tr><td style="padding:4px 0;color:#6b7280;">Service</td><td style="padding:4px 0;">${payload.service}</td></tr>
                </table>
                <p style="margin:16px 0 0;font-size:12px;color:#6b7280;">— Keter Quotes</p>
              </div>
            </div>`;
          const bodyText = `${docLabel} ${payload.quoteNumber}\nClient: ${payload.fullName}\nDate: ${dateLabel}\n\nYour ${docLabel.toLowerCase()} is attached.`;
          await sendPdfSelfCopy({
            subject,
            bodyHtml,
            bodyText,
            attachment: {
              filename,
              content: pdf,
              contentType: "application/pdf",
            },
          });
          emailSent = true;
        } catch (e: any) {
          emailError = e.message;
          console.warn("[pdf] emailSelfCopy failed (PDF still returned):", e.message);
        }
      }
    }

    return new NextResponse(pdf as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(pdf.length),
        "X-Email-Sent": emailSent ? "1" : "0",
        ...(emailError ? { "X-Email-Error": encodeURIComponent(emailError) } : {}),
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
