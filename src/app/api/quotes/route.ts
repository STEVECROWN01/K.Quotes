import { NextRequest, NextResponse } from "next/server";
import { listQuotes, saveQuote, type QuoteRecord } from "@/lib/storage";

export async function GET() {
  try {
    const quotes = await listQuotes();
    return NextResponse.json({ quotes });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Basic shape check
    const required = [
      "quoteNumber", "docType", "language", "clientNumber", "date",
      "fullName", "service", "accountHolder", "iban", "bic", "bank",
      "paymentMode", "paymentConditions",
    ];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === "") {
        return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
      }
    }
    const saved = await saveQuote(body as Omit<QuoteRecord, "id" | "createdAt" | "updatedAt" | "status"> & { id?: string; status?: string });
    return NextResponse.json({ quote: saved });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
