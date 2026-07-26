-- Keter Quotes — Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New Query)
-- after creating your project. Safe to re-run (idempotent).

-- ============ quotes table ============
create table if not exists public.quotes (
  id                  uuid primary key default gen_random_uuid(),
  quote_number        text not null unique,
  doc_type            text not null check (doc_type in ('devis', 'facture')),
  language            text not null check (language in ('fr', 'en')),
  client_number       integer not null,
  date                date not null,
  full_name           text not null,
  city                text,
  country             text,
  phone               text,
  email               text,
  service             text not null check (service in ('cv', 'linkedin', 'both')),
  price_cv            numeric(10, 2),
  price_linkedin      numeric(10, 2),
  cv_quantity         integer default 1,
  currency            text default 'EUR',
  account_holder      text not null,
  iban                text not null,
  bic                 text not null,
  bank                text not null,
  payment_mode        text not null,
  payment_conditions  text not null,
  payment_link        text,
  payment_status      text,
  payment_date        date,
  status              text not null default 'saved',
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Indexes for common queries
create index if not exists quotes_created_at_idx     on public.quotes (created_at desc);
create index if not exists quotes_client_number_idx  on public.quotes (client_number);
create index if not exists quotes_status_idx         on public.quotes (status);
create index if not exists quotes_doc_type_idx       on public.quotes (doc_type);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ============ Row Level Security ============
-- The app uses the service-role key server-side (bypasses RLS).
-- For browser-side access (if ever needed), enable RLS + add policies below.

alter table public.quotes enable row level security;

-- Example policy: allow anonymous inserts/reads (adjust to your auth model).
-- If you don't want public access, drop these and add authenticated policies.
drop policy if exists "Quotes are readable by everyone" on public.quotes;
create policy "Quotes are readable by everyone"
  on public.quotes for select
  using (true);

drop policy if exists "Anyone can insert quotes" on public.quotes;
create policy "Anyone can insert quotes"
  on public.quotes for insert
  with check (true);

drop policy if exists "Anyone can update quotes" on public.quotes;
create policy "Anyone can update quotes"
  on public.quotes for update
  using (true);

drop policy if exists "Anyone can delete quotes" on public.quotes;
create policy "Anyone can delete quotes"
  on public.quotes for delete
  using (true);

-- ============ Helpful view: quote totals ============
-- Convenience view that pre-computes the total per quote (service-aware).
-- CV total = price_cv * cv_quantity (if cv or both), LinkedIn total = price_linkedin (if linkedin or both).
create or replace view public.quote_totals as
select
  id,
  quote_number,
  doc_type,
  full_name,
  date,
  language,
  service,
  status,
  (case when service in ('cv', 'both')     then coalesce(price_cv, 0) * coalesce(cv_quantity, 1) else 0 end
 + case when service in ('linkedin', 'both') then coalesce(price_linkedin, 0) else 0 end) as total,
  created_at
from public.quotes
order by created_at desc;

-- ============ Sample data (optional — comment out if not needed) ============
-- insert into public.quotes (
--   quote_number, doc_type, language, client_number, date, full_name,
--   city, country, phone, email, service, price_cv, price_linkedin, cv_quantity,
--   account_holder, iban, bic, bank, payment_mode, payment_conditions,
--   payment_link, status
-- ) values (
--   'D2600004', 'devis', 'fr', 2600004, '2026-05-04', 'Eric De Lavarene',
--   'Agia Paraskevi', 'Gréce', '+33626488904', 'eric2lavarene@gmail.com',
--   'cv', 120, null,
--   'TCHOGNON STEVENS AKPOVI', 'MT33CFTE28904000000000006119777', 'CFTEMTM1XXX',
--   'Moneco', 'Virement bancaire', 'À réception',
--   'https://shefapro.mymaketou.store/products/cv-premium-optimisation-linkedin-profil-qui-attire-les-recruteurs/checkout',
--   'saved'
-- );
