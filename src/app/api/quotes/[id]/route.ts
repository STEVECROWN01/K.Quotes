import { NextRequest, NextResponse } from "next/server";
import { getQuote, deleteQuote, listQuotes, saveQuote } from "@/lib/storage";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const quote = await getQuote(id);
  if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ quote });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  try {
    // 1. Fetch the quote being deleted
    const quote = await getQuote(id);
    if (!quote) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // 2. If it's an invoice (facture), find the original quote (devis) with the
    //    same digits and revert its status from 'invoiced' to 'saved'
    if (quote.docType === "facture") {
      const invoiceNumber = quote.quoteNumber; // e.g. F2600004
      const quoteNumber = invoiceNumber.replace(/^F/, "D"); // e.g. D2600004

      const allQuotes = await listQuotes();
      const originalQuote = allQuotes.find(
        (q) => q.docType === "devis" && q.quoteNumber === quoteNumber
      );

      if (originalQuote && originalQuote.status === "invoiced") {
        // Revert the original quote's status to 'saved'
        await saveQuote({ ...originalQuote, status: "saved" });
      }
    }

    // 3. Delete the invoice/quote
    await deleteQuote(id);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
