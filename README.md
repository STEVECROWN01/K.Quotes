# Keter Quotes — Quote & Invoice Generator

A standalone web app that generates pixel-perfect, branded PDF quotes ("Devis") and invoices ("Factures") for Keter Marketing's CV/LinkedIn optimization services. Deterministic form → template → PDF engine — no AI model in the critical path.

## Features

- **Single-page form** with sections A–E: doc type & language, client info, service, bank/payment details, invoice-only fields
- **Live PDF preview** next to the form, updating in real time as you type
- **Quote numbering**: `D` + client number zero-padded to 5 digits (e.g. `D2600004`)
- **Invoice numbering**: same digits with `F` prefix (e.g. `F2600004`)
- **Service modes**: CV only, LinkedIn only, or CV + LinkedIn combo (2 separate line items, qty 1 each)
- **FR/EN language toggle** for all static text — UI labels, service descriptions, thank-you notes, conditions
- **Bank & payment details** pre-filled with defaults, editable per quote, with "Reset to default" button
- **Payment link rendering**: when provided, appears in the bank details section alongside bank info
- **Save & generate invoice later**: quotes are persisted to Supabase, then converted to invoices via one click (D→F swap + payment block)
- **My Quotes list view** with download / generate-invoice / delete actions
- **Brand-true PDF template** matching the reference layout (ink-black `#000028` table headers, gold `#D4AF37` accents, watermark, two-page A4)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui |
| PDF Generation | Puppeteer (headless Chrome → PDF) — server-side API route |
| Persistence | **Supabase** (Postgres + RLS) — only |
| Brand Fonts | Inter (body), Fraunces (display/headers), JetBrains Mono (quote numbers) |

## Getting Started

### Prerequisites

- Node.js 20+ / Bun
- A Supabase project (free tier works)
- (Production) A running Chromium/Chrome for Puppeteer

### 1. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Open **Dashboard → SQL Editor → New Query**
3. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql) and run it
4. Copy your project URL and keys from **Project Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side, bypasses RLS)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (browser-side, respects RLS)

### 2. Configure env vars

```bash
cp .env.example .env.local
# Edit .env.local and paste your Supabase values
```

### 3. Install & run

```bash
bun install
bun run dev         # Start dev server at http://localhost:3000
```

## Architecture

```
src/
├── app/
│   ├── page.tsx                       # Main form + live preview page (single route)
│   ├── layout.tsx                     # Root layout (Inter, Fraunces, JetBrains Mono)
│   ├── globals.css                    # Keter brand tokens (gold/ink/paper)
│   └── api/
│       ├── quotes/route.ts            # GET list / POST save
│       ├── quotes/[id]/route.ts       # GET / DELETE
│       ├── quotes/[id]/invoice/route.ts # POST — convert quote → invoice
│       └── pdf/route.ts               # POST — Puppeteer PDF generation
├── components/
│   └── keter/
│       ├── QuoteForm.tsx              # Sections A–E form
│       ├── LivePreview.tsx            # Scaled iframe rendering of document
│       ├── MyQuotesDialog.tsx         # Saved quotes list & invoice conversion
│       └── document-html.ts           # Pure HTML renderer (shared by preview + Puppeteer)
├── lib/
│   ├── defaults.ts                    # Default bank details, payment link, emetteur
│   ├── services.ts                    # Service descriptions (FR/EN), line-item builder
│   ├── i18n.ts                        # All UI strings + date/currency/number formatters
│   ├── supabase.ts                    # Supabase client factory
│   ├── storage.ts                     # Quote CRUD (Supabase-only)
│   └── pdf.ts                         # Puppeteer launcher + PDF generation
├── supabase/
│   └── schema.sql                     # Table definition + RLS policies + indexes
└── public/keter-logo.png              # Transparent logo (also used as watermark)
```

## Deployment

### Vercel (frontend + API routes)

1. Push this repo to GitHub
2. Import into Vercel
3. Add env vars: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. For PDF generation on Vercel serverless, install `@sparticuz/chromium` and update `src/lib/pdf.ts`:
   ```ts
   import chromium from "@sparticuz/chromium";
   const browser = await puppeteer.launch({
     args: chromium.args,
     executablePath: await chromium.executablePath(),
     headless: chromium.headless,
   });
   ```

### Railway (recommended for PDF backend per the brief)

Railway can run a full Node server with Chrome pre-installed, avoiding the Vercel serverless Chromium dance.

1. Push this repo to GitHub
2. Create a new Railway project from the GitHub repo
3. Add env vars (same as above)
4. Railway auto-detects Next.js — set the start command to `bun run start` (or `npm start`)
5. For Puppeteer on Railway, the bundled Chromium works out of the box (no extra config needed)

## Filename Convention

PDFs are named: `{Type}_{QuoteNumber}_{ClientFirstName}_{ClientLastName}.pdf`

Examples:
- `Devis_D2600004_Eric_De_Lavarene.pdf`
- `Facture_F2600005_Jane_Smith.pdf`

## Brand Tokens

| Token | Hex | Use |
|-------|-----|-----|
| Ink black | `#000028` | Primary text, table headers, TOTAL row |
| Paper | `#FFFFFF` | Page background |
| Warm gold | `#D4AF37` | Accent — buttons, focus rings, quote-number stamp |
| Pale gold | `#F4E5B2` | Subtle highlight fills (selected radio card) |
| Slate gray | `#6B7280` | Secondary text, field labels |
| Signal green | `#4B8A6B` | Success states only |
| Hairline | `#E5E7EB` | 1px borders between cards |

## License

Proprietary — © Keter Marketing (Stevens AKPOVI)
