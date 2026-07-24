import { NextRequest, NextResponse } from "next/server";
import { convertQuoteToInvoice } from "@/lib/storage";

// POST /api/quotes/[id]/invoice
// Body: { paymentStatus: string, paymentDate: string (ISO) }
// Creates a new invoice record (F-prefixed number) from the saved quote.
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = await req.json();
  const paymentStatus = body.paymentStatus || "Payé";
  const paymentDate = body.paymentDate || new Date().toISOString().slice(0, 10);
  try {
    const invoice = await convertQuoteToInvoice(id, paymentStatus, paymentDate);
    if (!invoice) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    return NextResponse.json({ invoice });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
