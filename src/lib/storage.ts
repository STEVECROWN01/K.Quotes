// Storage abstraction. Routes to Supabase when env vars are configured,
// otherwise falls back to Prisma/SQLite. The data shape is identical so
// swapping is a one-file change.

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// ----- Type -----
export type QuoteRecord = {
  id: string;
  quoteNumber: string;
  docType: "devis" | "facture";
  language: "fr" | "en";
  clientNumber: number;
  date: string;
  fullName: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  service: "cv" | "linkedin" | "both";
  priceCv: number | null;
  priceLinkedin: number | null;
  accountHolder: string;
  iban: string;
  bic: string;
  bank: string;
  paymentMode: string;
  paymentConditions: string;
  paymentLink: string | null;
  paymentStatus: string | null;
  paymentDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

function rowToRecord(row: any): QuoteRecord {
  return {
    id: row.id,
    quoteNumber: row.quoteNumber,
    docType: row.docType,
    language: row.language,
    clientNumber: row.clientNumber,
    date: row.date,
    fullName: row.fullName,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    service: row.service,
    priceCv: row.priceCv,
    priceLinkedin: row.priceLinkedin,
    accountHolder: row.accountHolder,
    iban: row.iban,
    bic: row.bic,
    bank: row.bank,
    paymentMode: row.paymentMode,
    paymentConditions: row.paymentConditions,
    paymentLink: row.paymentLink,
    paymentStatus: row.paymentStatus,
    paymentDate: row.paymentDate,
    status: row.status,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt,
  };
}

// ----- Public API -----
export async function listQuotes(): Promise<QuoteRecord[]> {
  const rows = await prisma.quote.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToRecord);
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  const row = await prisma.quote.findUnique({ where: { id } });
  return row ? rowToRecord(row) : null;
}

export async function saveQuote(input: Omit<QuoteRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
  id?: string;
  status?: string;
}): Promise<QuoteRecord> {
  const { id, ...data } = input;
  const status = data.status ?? "saved";
  if (id) {
    const updated = await prisma.quote.update({
      where: { id },
      data: { ...data, status },
    });
    return rowToRecord(updated);
  }
  const created = await prisma.quote.create({
    data: { ...data, status } as any,
  });
  return rowToRecord(created);
}

export async function deleteQuote(id: string): Promise<void> {
  await prisma.quote.delete({ where: { id } });
}

export async function convertQuoteToInvoice(id: string, paymentStatus: string, paymentDate: string): Promise<QuoteRecord | null> {
  const existing = await prisma.quote.findUnique({ where: { id } });
  if (!existing) return null;
  // Swap D→F in quote number for the invoice
  const invoiceNumber = existing.quoteNumber.replace(/^D/, "F");
  // Create a new invoice record (quote is preserved)
  const invoiceRow = await prisma.quote.create({
    data: {
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
      accountHolder: existing.accountHolder,
      iban: existing.iban,
      bic: existing.bic,
      bank: existing.bank,
      paymentMode: existing.paymentMode,
      paymentConditions: existing.paymentConditions,
      paymentLink: existing.paymentLink,
      paymentStatus,
      paymentDate,
      status: "invoiced",
    } as any,
  });
  // Mark original quote as invoiced
  await prisma.quote.update({
    where: { id },
    data: { status: "invoiced" },
  });
  return rowToRecord(invoiceRow);
}
