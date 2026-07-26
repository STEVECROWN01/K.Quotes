// Storage layer — Supabase only.
// All quote CRUD goes through the `quotes` table in Supabase.
// See `supabase/schema.sql` for the table definition.

import { getSupabase, isSupabaseConfigured } from "./supabase";

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
  cvQuantity: number | null;
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

// Database row shape (snake_case → camelCase mapping happens in rowToRecord)
type DbRow = {
  id: string;
  quote_number: string;
  doc_type: string;
  language: string;
  client_number: number;
  date: string;
  full_name: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  service: string;
  price_cv: number | null;
  price_linkedin: number | null;
  cv_quantity: number | null;
  account_holder: string;
  iban: string;
  bic: string;
  bank: string;
  payment_mode: string;
  payment_conditions: string;
  payment_link: string | null;
  payment_status: string | null;
  payment_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

function rowToRecord(row: DbRow): QuoteRecord {
  return {
    id: row.id,
    quoteNumber: row.quote_number,
    docType: row.doc_type as QuoteRecord["docType"],
    language: row.language as QuoteRecord["language"],
    clientNumber: row.client_number,
    date: row.date,
    fullName: row.full_name,
    city: row.city,
    country: row.country,
    phone: row.phone,
    email: row.email,
    service: row.service as QuoteRecord["service"],
    priceCv: row.price_cv,
    priceLinkedin: row.price_linkedin,
    cvQuantity: row.cv_quantity,
    accountHolder: row.account_holder,
    iban: row.iban,
    bic: row.bic,
    bank: row.bank,
    paymentMode: row.payment_mode,
    paymentConditions: row.payment_conditions,
    paymentLink: row.payment_link,
    paymentStatus: row.payment_status,
    paymentDate: row.payment_date,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function recordToRow(r: Partial<QuoteRecord>): Partial<DbRow> {
  const row: Partial<DbRow> = {};
  if (r.quoteNumber !== undefined) row.quote_number = r.quoteNumber;
  if (r.docType !== undefined) row.doc_type = r.docType;
  if (r.language !== undefined) row.language = r.language;
  if (r.clientNumber !== undefined) row.client_number = r.clientNumber;
  if (r.date !== undefined) row.date = r.date;
  if (r.fullName !== undefined) row.full_name = r.fullName;
  if (r.city !== undefined) row.city = r.city;
  if (r.country !== undefined) row.country = r.country;
  if (r.phone !== undefined) row.phone = r.phone;
  if (r.email !== undefined) row.email = r.email;
  if (r.service !== undefined) row.service = r.service;
  if (r.priceCv !== undefined) row.price_cv = r.priceCv;
  if (r.priceLinkedin !== undefined) row.price_linkedin = r.priceLinkedin;
  if (r.cvQuantity !== undefined) row.cv_quantity = r.cvQuantity;
  if (r.accountHolder !== undefined) row.account_holder = r.accountHolder;
  if (r.iban !== undefined) row.iban = r.iban;
  if (r.bic !== undefined) row.bic = r.bic;
  if (r.bank !== undefined) row.bank = r.bank;
  if (r.paymentMode !== undefined) row.payment_mode = r.paymentMode;
  if (r.paymentConditions !== undefined) row.payment_conditions = r.paymentConditions;
  if (r.paymentLink !== undefined) row.payment_link = r.paymentLink;
  if (r.paymentStatus !== undefined) row.payment_status = r.paymentStatus;
  if (r.paymentDate !== undefined) row.payment_date = r.paymentDate;
  if (r.status !== undefined) row.status = r.status;
  return row;
}

function ensureConfigured() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "SUPABASE_SERVICE_ROLE_KEY in .env.local. See README.md."
    );
  }
}

// ----- Public API -----

export async function listQuotes(): Promise<QuoteRecord[]> {
  ensureConfigured();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as DbRow[]).map(rowToRecord);
}

export async function getQuote(id: string): Promise<QuoteRecord | null> {
  ensureConfigured();
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return rowToRecord(data as DbRow);
}

export async function saveQuote(
  input: Omit<QuoteRecord, "id" | "createdAt" | "updatedAt" | "status"> & {
    id?: string;
    status?: string;
  }
): Promise<QuoteRecord> {
  ensureConfigured();
  const supabase = getSupabase();
  const status = input.status ?? "saved";
  const row = recordToRow({ ...input, status });

  if (input.id) {
    const { data, error } = await supabase
      .from("quotes")
      .update(row)
      .eq("id", input.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return rowToRecord(data as DbRow);
  }

  const { data, error } = await supabase
    .from("quotes")
    .insert(row)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return rowToRecord(data as DbRow);
}

export async function deleteQuote(id: string): Promise<void> {
  ensureConfigured();
  const supabase = getSupabase();
  const { error } = await supabase.from("quotes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function convertQuoteToInvoice(
  id: string,
  paymentStatus: string,
  paymentDate: string
): Promise<QuoteRecord | null> {
  ensureConfigured();
  const supabase = getSupabase();

  // 1. Fetch the original quote
  const { data: existing, error: fetchErr } = await supabase
    .from("quotes")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (fetchErr) throw new Error(fetchErr.message);
  if (!existing) return null;

  // 2. Create a new invoice record (F prefix, same digits)
  const existing_ = existing as DbRow;
  const invoiceNumber = existing_.quote_number.replace(/^D/, "F");
  const invoiceRow: Omit<DbRow, "id" | "created_at" | "updated_at"> = {
    quote_number: invoiceNumber,
    doc_type: "facture",
    language: existing_.language,
    client_number: existing_.client_number,
    date: existing_.date,
    full_name: existing_.full_name,
    city: existing_.city,
    country: existing_.country,
    phone: existing_.phone,
    email: existing_.email,
    service: existing_.service,
    price_cv: existing_.price_cv,
    price_linkedin: existing_.price_linkedin,
    cv_quantity: existing_.cv_quantity,
    account_holder: existing_.account_holder,
    iban: existing_.iban,
    bic: existing_.bic,
    bank: existing_.bank,
    payment_mode: existing_.payment_mode,
    payment_conditions: existing_.payment_conditions,
    payment_link: existing_.payment_link,
    payment_status: paymentStatus,
    payment_date: paymentDate,
    status: "invoiced",
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("quotes")
    .insert(invoiceRow)
    .select()
    .single();
  if (insertErr) throw new Error(insertErr.message);

  // 3. Mark original quote as invoiced
  await supabase.from("quotes").update({ status: "invoiced" }).eq("id", id);

  return rowToRecord(inserted as DbRow);
}
