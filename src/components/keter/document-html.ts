// Pure HTML renderer for the 2-page document (Devis/Facture).
// Used by:
//   - LivePreview (iframe srcDoc) — scaled down with CSS transform
//   - /api/pdf route (Puppeteer setContent → page.pdf)
//
// Layout matches the reference PDF (devis-reference.pdf) pixel-by-pixel
// per the §5.1 spec.

import {
  SERVICE_DESCRIPTIONS,
  THANK_YOU_NOTES,
  THANK_YOU_PREFIX,
  GENERAL_CONDITIONS,
  buildLineItems,
  type Language,
  type DocType,
  type ServiceType,
} from "@/lib/services";
import {
  UI,
  formatDate,
  formatCurrency,
  buildDocNumber,
} from "@/lib/i18n";
import { EMETTEUR, QUOTE_VALIDITY_DAYS } from "@/lib/defaults";
import type { QuoteRecord } from "@/lib/storage";

// A document payload that's easy to pass around (decoupled from QuoteRecord)
export type DocumentPayload = {
  docType: DocType;
  language: Language;
  clientNumber: number;
  date: string;
  fullName: string;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  service: ServiceType;
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
  quoteNumber?: string; // override (for invoice: F prefix)
};

export function payloadFromQuote(q: QuoteRecord): DocumentPayload {
  return {
    docType: q.docType,
    language: q.language,
    clientNumber: q.clientNumber,
    date: q.date,
    fullName: q.fullName,
    city: q.city,
    country: q.country,
    phone: q.phone,
    email: q.email,
    service: q.service,
    priceCv: q.priceCv,
    priceLinkedin: q.priceLinkedin,
    accountHolder: q.accountHolder,
    iban: q.iban,
    bic: q.bic,
    bank: q.bank,
    paymentMode: q.paymentMode,
    paymentConditions: q.paymentConditions,
    paymentLink: q.paymentLink,
    paymentStatus: q.paymentStatus,
    paymentDate: q.paymentDate,
    quoteNumber: q.quoteNumber,
  };
}

// ---- HTML rendering ----
// `logoSrc` defaults to '/keter-logo.png' (works in iframe srcDoc via parent origin).
// Server-side PDF route passes a base64 data URI so Puppeteer's setContent (no base URL) can render it.
export function renderDocumentHtml(p: DocumentPayload, logoSrc: string = "/keter-logo.png"): string {
  const lang = p.language;
  const t = UI[lang];
  const docNumber = p.quoteNumber ?? buildDocNumber(p.clientNumber, p.docType);
  const docTitleLabel = p.docType === "devis" ? t.titleDevis : t.titleFacture;

  const items = buildLineItems(
    p.service,
    p.priceCv ?? 0,
    p.priceLinkedin ?? 0,
    lang
  );
  const grandTotal = items.reduce((sum, it) => sum + it.total, 0);

  const dateLabel = formatDate(p.date, lang);
  const paymentDateLabel = p.paymentDate ? formatDate(p.paymentDate, lang) : "";
  const thankYou = THANK_YOU_NOTES[lang][p.service];
  const thankYouPrefix = THANK_YOU_PREFIX[lang];
  const conditions = GENERAL_CONDITIONS[lang];

  // Emetteur/Destinataire
  const emetteurRows = [
    [lang === "fr" ? "Nom" : "Name", EMETTEUR.name],
    ["", EMETTEUR.address],
    ["", EMETTEUR.registration],
    ["", EMETTEUR.country],
    ["", EMETTEUR.signatory],
  ];
  const destinataireRows = [
    [t.fullName, p.fullName || "—"],
    [t.city, p.city || "—"],
    [t.country, p.country || "—"],
    [t.phone, p.phone || "—"],
    [t.email, p.email || "—"],
  ];

  // Build invoice-only payment block (for facture)
  const invoicePaymentBlock =
    p.docType === "facture"
      ? `
      <div class="invoice-payment-block">
        <div class="ipb-row"><span class="ipb-label">${t.paymentStatus}</span><span class="ipb-value">${p.paymentStatus ?? t.paid}</span></div>
        <div class="ipb-row"><span class="ipb-label">${t.modePaiement}</span><span class="ipb-value">${p.paymentMode}</span></div>
        <div class="ipb-row"><span class="ipb-label">${t.paymentDate}</span><span class="ipb-value">${paymentDateLabel || dateLabel}</span></div>
      </div>`
      : "";

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="utf-8"/>
<title>${docTitleLabel} ${docNumber} — ${p.fullName}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
<style>
  /* ---- Page setup: A4, zero margin, two pages ---- */
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #000000;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .page {
    position: relative;
    width: 210mm;
    height: 297mm;
    padding: 14mm 16mm 12mm 16mm;
    background: #ffffff;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }

  /* ---- Watermark (large, centered, very low opacity) ---- */
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 70%;
    max-width: 180mm;
    opacity: 0.08;
    pointer-events: none;
    z-index: 0;
  }
  .watermark img { width: 100%; height: auto; display: block; }

  .page-content, .page2-content { position: relative; z-index: 1; }

  /* ---- Page 1: Header ---- */
  .doc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 3mm;
  }
  .doc-header-left { display: flex; flex-direction: column; }
  .doc-title {
    font-size: 26pt;
    font-weight: 700;
    color: #000000;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }
  .doc-title .doc-num { color: #000000; margin-left: 4px; }
  .doc-date {
    margin-top: 4px;
    font-size: 11pt;
    color: #6b7280;
    font-weight: 400;
  }
  .doc-header-right { display: flex; align-items: flex-start; }
  .doc-logo { width: 34mm; height: auto; }

  .hr { border: 0; border-top: 1px solid #d1d5db; margin: 3mm 0; }

  /* ---- Emetteur / Destinataire ---- */
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin: 2mm 0;
  }
  .party-block .party-label {
    font-size: 9pt;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 3px;
    font-weight: 500;
  }
  .party-block .party-row {
    display: flex;
    font-size: 10pt;
    line-height: 1.4;
    margin-bottom: 0;
  }
  .party-block .party-row .lbl {
    color: #6b7280;
    min-width: 24mm;
    font-weight: 400;
  }
  .party-block .party-row .val {
    color: #000000;
    font-weight: 600;
  }
  .party-block .party-row.val-only .val { font-weight: 500; }

  /* ---- Thank-you block ---- */
  .thank-you { margin: 1mm 0 3mm 0; }
  .thank-you-prefix {
    font-weight: 700;
    font-size: 11pt;
    color: #000000;
    margin-bottom: 3px;
  }
  .thank-you-body {
    font-size: 10pt;
    color: #1f2937;
    line-height: 1.45;
    max-width: 100%;
  }

  /* ---- Detail heading ---- */
  .detail-heading {
    font-size: 13pt;
    font-weight: 700;
    color: #000000;
    margin: 1mm 0 2mm 0;
  }

  /* ---- Services table ---- */
  .services-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
  }
  .services-table thead th {
    background: #000028;
    color: #ffffff;
    font-size: 10pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 8px 10px;
    text-align: left;
  }
  .services-table thead th.num { text-align: right; }
  .services-table thead th.center { text-align: center; }

  .services-table tbody td {
    padding: 5px 7px;
    vertical-align: top;
    border-bottom: 1px solid #e5e7eb;
    font-size: 9pt;
    line-height: 1.3;
    color: #1f2937;
  }
  .services-table tbody td.type-cell {
    font-weight: 600;
    color: #000000;
    font-size: 9pt;
    width: 9%;
  }
  .services-table tbody td.desc-cell { width: 56%; }
  .services-table tbody td.price-cell { width: 13%; text-align: right; font-variant-numeric: tabular-nums; }
  .services-table tbody td.qty-cell { width: 8%; text-align: center; }
  .services-table tbody td.total-cell { width: 14%; text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }

  .service-name {
    font-weight: 700;
    color: #000000;
    margin-bottom: 2px;
    font-size: 9.5pt;
  }
  .service-bullets { margin: 0 0 3px 0; padding: 0; list-style: none; }
  .service-bullets li {
    position: relative;
    padding-left: 12px;
    margin-bottom: 0;
    font-size: 8.5pt;
    color: #374151;
    line-height: 1.25;
  }
  .service-bullets li::before {
    content: "\\25A0";
    color: #000028;
    position: absolute;
    left: 0;
    top: 0;
    font-size: 8pt;
    line-height: 1.7;
  }
  .service-delivery {
    font-style: italic;
    color: #6b7280;
    font-size: 8.5pt;
    margin-top: 2px;
  }

  /* TOTAL row */
  .services-table tfoot td {
    background: #000028;
    color: #ffffff;
    padding: 8px 10px;
    font-weight: 700;
    font-size: 10.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .services-table tfoot td.total-amount {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .services-table tfoot td.total-spacer { background: #000028; }

  /* ---- Conditions / signature block ---- */
  .conditions-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin-top: 3mm;
  }
  .cb-left .cb-title, .cb-right .cb-title {
    font-size: 10.5pt;
    font-weight: 700;
    margin-bottom: 4px;
    color: #000000;
  }
  .cb-left .cb-row {
    font-size: 9pt;
    margin-bottom: 2px;
    line-height: 1.3;
    color: #1f2937;
  }
  .cb-left .cb-row .lbl { color: #6b7280; font-weight: 500; }
  .cb-left .cb-row .val { color: #000000; font-weight: 600; }
  .cb-right {
    padding-left: 4mm;
    border-left: 1px solid #e5e7eb;
  }
  .signature-line {
    margin-top: 6mm;
    border-top: 1px solid #000000;
    padding-top: 3px;
    font-size: 8.5pt;
    color: #6b7280;
  }
  .signature-line .sig-label { font-weight: 600; color: #000000; }
  .signature-line .sig-quality {
    margin-top: 2px;
    color: #6b7280;
    font-style: italic;
  }

  /* ---- Invoice payment block ---- */
  .invoice-payment-block {
    background: #fafafa;
    border: 1px solid #e5e7eb;
    padding: 6px 10px;
    margin-top: 4mm;
    border-radius: 2px;
  }
  .ipb-row {
    display: flex;
    justify-content: space-between;
    font-size: 10pt;
    padding: 2px 0;
  }
  .ipb-label { color: #6b7280; font-weight: 500; }
  .ipb-value { color: #000000; font-weight: 600; }

  /* ---- Footer ---- */
  .doc-footer {
    position: absolute;
    left: 16mm;
    right: 16mm;
    bottom: 6mm;
    z-index: 2;
  }
  .doc-footer .footer-hr {
    border: 0;
    border-top: 1px solid #e5e7eb;
    margin-bottom: 4px;
  }
  .doc-footer .footer-row {
    display: flex;
    justify-content: space-between;
    font-size: 8.5pt;
    color: #6b7280;
  }
  .doc-footer .footer-left .line-1 { font-weight: 600; color: #374151; }
  .doc-footer .footer-left .line-2 { color: #6b7280; }

  /* ---- Page 2: bank + conditions ---- */
  .section-heading {
    font-size: 14pt;
    font-weight: 700;
    color: #000000;
    margin: 0 0 4mm 0;
    padding-bottom: 4px;
    border-bottom: 1px solid #d1d5db;
  }
  .bank-block { margin-top: 4mm; }
  .bank-row {
    display: grid;
    grid-template-columns: 50mm 1fr;
    gap: 8mm;
    font-size: 10.5pt;
    padding: 5px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .bank-row .lbl { color: #6b7280; font-weight: 500; }
  .bank-row .val {
    color: #000000;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .payment-link-row {
    margin-top: 6px;
    padding: 8px 0;
    font-size: 10.5pt;
    border-top: 1px solid #e5e7eb;
    border-bottom: 1px solid #e5e7eb;
  }
  .payment-link-row .lbl {
    color: #6b7280;
    font-weight: 500;
    margin-right: 8px;
  }
  .payment-link-row .val {
    color: #000028;
    font-weight: 600;
    word-break: break-all;
  }

  .conditions-section { margin-top: 14mm; }
  .conditions-list { margin: 4mm 0 0 0; padding: 0; list-style: none; }
  .conditions-list li {
    position: relative;
    padding-left: 16px;
    margin-bottom: 6px;
    font-size: 10.5pt;
    color: #1f2937;
    line-height: 1.5;
  }
  .conditions-list li::before {
    content: "\\25A0";
    color: #000028;
    position: absolute;
    left: 0;
    top: 0;
    font-size: 8pt;
    line-height: 1.8;
  }
</style>
</head>
<body>

<!-- ============ PAGE 1 ============ -->
<div class="page">
  <div class="watermark"><img src="${logoSrc}" alt="Keter Marketing watermark" /></div>

  <div class="page-content">
    <div class="doc-header">
      <div class="doc-header-left">
        <div class="doc-title">${docTitleLabel} <span class="doc-num">${docNumber}</span></div>
        <div class="doc-date">${dateLabel}</div>
      </div>
      <div class="doc-header-right">
        <img class="doc-logo" src="${logoSrc}" alt="Keter Marketing" />
      </div>
    </div>

    <hr class="hr" />

    <div class="parties">
      <div class="party-block">
        <div class="party-label">${t.emetteur}</div>
        ${emetteurRows
          .map(
            (r) =>
              `<div class="party-row ${r[0] === "" ? "val-only" : ""}"><span class="lbl">${r[0]}</span><span class="val">${r[1]}</span></div>`
          )
          .join("")}
      </div>
      <div class="party-block">
        <div class="party-label">${t.destinataire}</div>
        ${destinataireRows
          .map(
            (r) =>
              `<div class="party-row"><span class="lbl">${r[0]}</span><span class="val">${r[1]}</span></div>`
          )
          .join("")}
      </div>
    </div>

    <hr class="hr" />

    <div class="thank-you">
      <div class="thank-you-prefix">${thankYouPrefix}</div>
      <div class="thank-you-body">${thankYou}</div>
    </div>

    <div class="detail-heading">${t.detailHeading}</div>

    <table class="services-table">
      <thead>
        <tr>
          <th style="width: 9%">${t.thType}</th>
          <th style="width: 56%">${t.thDescription}</th>
          <th class="num" style="width: 13%">${t.thUnitPrice}</th>
          <th class="center" style="width: 8%">${t.thQty}</th>
          <th class="num" style="width: 14%">${t.thTotal}</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (it) => `
          <tr>
            <td class="type-cell">Service</td>
            <td class="desc-cell">
              <div class="service-name">${it.name}</div>
              <ul class="service-bullets">
                ${it.bullets.map((b) => `<li>${b}</li>`).join("")}
              </ul>
              <div class="service-delivery">${it.deliveryNote}</div>
            </td>
            <td class="price-cell">${formatCurrency(it.unitPrice, lang)}</td>
            <td class="qty-cell">${it.quantity}</td>
            <td class="total-cell">${formatCurrency(it.total, lang)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" class="total-spacer">TOTAL</td>
          <td class="total-spacer"></td>
          <td class="total-spacer"></td>
          <td class="total-amount">${formatCurrency(grandTotal, lang)}</td>
        </tr>
      </tfoot>
    </table>

    ${invoicePaymentBlock}

    <div class="conditions-block">
      <div class="cb-left">
        <div class="cb-title">${t.conditionsBlock}</div>
        <div class="cb-row"><span class="lbl">${t.conditionsReglement} :</span> <span class="val">${p.paymentConditions}</span></div>
        <div class="cb-row"><span class="lbl">${t.modeReglement} :</span> <span class="val">${p.paymentMode}</span></div>
        <div class="cb-row"><span class="lbl">${t.validiteDevis} :</span> <span class="val">${QUOTE_VALIDITY_DAYS} ${lang === "fr" ? "jours" : "days"}</span></div>
        <div class="cb-row"><span class="lbl">${t.notes} :</span> <span class="val">${t.notesText}</span></div>
      </div>
      <div class="cb-right">
        <div class="cb-title">${t.bonPourAccord}</div>
        <div class="cb-row" style="font-size:9.5pt;color:#6b7280;">${lang === "fr" ? "À _________________________ , le ____ / ____ / ______" : "At _________________________ , on ____ / ____ / ______"}</div>
        <div class="signature-line">
          <div class="sig-label">${t.signatureCachet}</div>
          <div class="sig-quality">${t.qualiteSignataire}</div>
        </div>
      </div>
    </div>
  </div>

  <div class="doc-footer">
    <hr class="footer-hr" />
    <div class="footer-row">
      <div class="footer-left">
        <div class="line-1">${docTitleLabel} ${docNumber}</div>
        <div class="line-2">${t.documentConfidentiel}</div>
      </div>
      <div class="footer-right">${UI[lang].pageXSurY.replace("{x}", "1").replace("{y}", "2")}</div>
    </div>
  </div>
</div>

<!-- ============ PAGE 2 ============ -->
<div class="page">
  <div class="watermark"><img src="${logoSrc}" alt="Keter Marketing watermark" /></div>

  <div class="page2-content">
    <div class="section-heading">${t.bankHeading}</div>

    <div class="bank-block">
      <div class="bank-row"><span class="lbl">${t.titulaireCompte}</span><span class="val">${p.accountHolder}</span></div>
      <div class="bank-row"><span class="lbl">${t.iban}</span><span class="val">${p.iban}</span></div>
      <div class="bank-row"><span class="lbl">${t.bic}</span><span class="val">${p.bic}</span></div>
      <div class="bank-row"><span class="lbl">${t.bank}</span><span class="val">${p.bank}</span></div>
      <div class="bank-row"><span class="lbl">${t.modePaiement}</span><span class="val">${p.paymentMode}</span></div>
      <div class="bank-row"><span class="lbl">${t.paymentConditions}</span><span class="val">${p.paymentConditions}</span></div>
      ${
        p.paymentLink
          ? `<div class="payment-link-row"><span class="lbl">${t.paymentLinkLabel} :</span><span class="val">${p.paymentLink}</span></div>`
          : ""
      }
    </div>

    <div class="conditions-section">
      <div class="section-heading">${t.conditionsHeading}</div>
      <ul class="conditions-list">
        ${conditions.map((c) => `<li>${c}</li>`).join("")}
      </ul>
    </div>
  </div>

  <div class="doc-footer">
    <hr class="footer-hr" />
    <div class="footer-row">
      <div class="footer-left">
        <div class="line-1">${docTitleLabel} ${docNumber}</div>
        <div class="line-2">${t.documentConfidentiel}</div>
      </div>
      <div class="footer-right">${UI[lang].pageXSurY.replace("{x}", "2").replace("{y}", "2")}</div>
    </div>
  </div>
</div>

</body>
</html>`;
}
