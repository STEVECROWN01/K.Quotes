import { NextRequest, NextResponse } from "next/server";
import { getQuote, saveQuote, type QuoteRecord } from "@/lib/storage";
import { buildDocNumber } from "@/lib/i18n";

// POST /api/quotes/[id]/invoice
// Body: { paymentStatus: string, paymentDate: string (ISO), paymentMethod: string }
// Creates a new invoice record (F-prefixed number) from the saved quote.
// The paymentMethod from the modal replaces the default payment mode in the invoice.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const paymentStatus = body.paymentStatus || "Payé";
  const paymentDate = body.paymentDate || new Date().toISOString().slice(0, 10);
  const paymentMethod = body.paymentMethod || "Virement bancaire";
  try {
    // 1. Fetch the original quote
    const existing = await getQuote(id);
    if (!existing) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

    // 2. Create a new invoice record (F prefix, same digits)
    const invoiceNumber = existing.quoteNumber.replace(/^D/, "F");
    
    const invoiceData: Omit<QuoteRecord, "id" | "createdAt" | "updatedAt"> = {
      quoteNumber: invoiceNumber,
      docType: "facture",
      language: existing.language,
      clientNumber: existing.clientNumber,
      date: existing.date,
      fullName: existing.fullName,
      city: existing.city,
      country: existing.country,
      phone: existing.phone,
      email: existing.email,
      service: existing.service,
      priceCv: existing.priceCv,
      priceLinkedin: existing.priceLinkedin,
      cvQuantity: existing.cvQuantity,
      currency: existing.currency,
      accountHolder: existing.accountHolder,
      iban: existing.iban,
      bic: existing.bic,
      bank: existing.bank,
      // Use the payment method selected in the modal
      paymentMode: paymentMethod,
      paymentConditions: existing.paymentConditions,
      paymentLink: existing.paymentLink,
      paymentStatus,
      paymentDate,
      status: "invoiced",
    };

    const invoice = await saveQuote({ ...invoiceData, status: "invoiced" });

    // 3. Mark original quote as invoiced
    await saveQuote({ ...existing, status: "invoiced" });

    return NextResponse.json({ invoice });
  } catch (e: any) {
    console.error("[invoice POST] error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
