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
  cvQuantity?: number; // number of CVs (1, 2, 3, 4+ for multiple domains)
  currency?: string; // currency code: EUR, USD, XOF, CAD, GBP, CHF
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
    lang,
    p.cvQuantity ?? 1
  );
  const grandTotal = items.reduce((sum, it) => sum + it.total, 0);
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0);

  const dateLabel = formatDate(p.date, lang);
  const paymentDateLabel = p.paymentDate ? formatDate(p.paymentDate, lang) : "";
  const thankYou = THANK_YOU_NOTES[lang][p.service];
  const thankYouPrefix = THANK_YOU_PREFIX[lang];
  const conditions = GENERAL_CONDITIONS[lang];

  // Emetteur/Destinataire — label-value pairs matching the reference PDF
  const emetteurRows = lang === "fr"
    ? [
        ["Société :", EMETTEUR.societe],
        ["IFU :", EMETTEUR.ifu],
        ["RCCM :", EMETTEUR.rccm],
        ["Votre contact :", EMETTEUR.contact],
        ["Adresse :", EMETTEUR.adresse],
        ["Pays :", EMETTEUR.pays],
      ]
    : [
        ["Company :", EMETTEUR.societe],
        ["TIN :", EMETTEUR.ifu],
        ["RCCM :", EMETTEUR.rccm],
        ["Your contact :", EMETTEUR.contact],
        ["Address :", EMETTEUR.adresse],
        ["Country :", EMETTEUR.pays],
      ];
  const emetteurSubText = EMETTEUR.subText;

  const destinataireRows = lang === "fr"
    ? [
        ["Nom :", p.fullName || "—"],
        ["Ville :", p.city || "—"],
        ["Pays :", p.country || "—"],
        ["Téléphone :", p.phone || "—"],
        ["Email :", p.email || "—"],
      ]
    : [
        ["Name :", p.fullName || "—"],
        ["City :", p.city || "—"],
        ["Country :", p.country || "—"],
        ["Phone :", p.phone || "—"],
        ["Email :", p.email || "—"],
      ];

  // Build invoice-only payment block (for facture) — replaces Conditions/Bon pour accord
  const paidClass = (p.paymentStatus === "Payé" || p.paymentStatus === "Paid") ? " paid" : "";
  const invoicePaymentBlock =
    p.docType === "facture"
      ? `
      <div class="invoice-payment-block ${items.length > 1 ? 'conditions-block-multi' : ''}">
        <div class="ipb-title">${lang === "fr" ? "Paiement" : "Payment"}</div>
        <div class="ipb-row"><span class="ipb-label">${t.paymentStatus}</span><span class="ipb-value${paidClass}">${p.paymentStatus ?? t.paid}</span></div>
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
    padding: 16mm 16mm 10mm 16mm;
    background: #ffffff;
    page-break-after: always;
    overflow: hidden;
  }
  .page:last-child { page-break-after: auto; }

  /* ---- Watermark (barely visible) ---- */
  .watermark {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    max-width: 150mm;
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
    align-items: center;
    margin-bottom: 2mm;
  }
  .doc-header-left { display: flex; flex-direction: column; }
  .doc-title {
    font-size: 26pt;
    font-weight: 800;
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
  .doc-logo { width: 14mm; height: auto; }
  .doc-logo-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5mm;
  }
  .doc-logo-wordmark {
    font-family: 'Inter', sans-serif;
    font-size: 7pt;
    font-weight: 700;
    letter-spacing: 0.2px;
    text-align: center;
    line-height: 1;
    white-space: nowrap;
  }
  .doc-logo-wordmark .wm-keter { color: #D4AF37; }
  .doc-logo-wordmark .wm-marketing { color: #000000; }

  .hr { border: 0; border-top: 1px solid #d1d5db; margin: 2mm 0; }

  /* ---- Emetteur / Destinataire ---- */
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin: 5mm 0;
  }
  .party-block .party-label {
    font-size: 9pt;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 2px;
    font-weight: 600;
  }
  .party-block .party-row {
    display: flex;
    font-size: 10pt;
    line-height: 1.6;
    margin-bottom: 0;
  }
  .party-block .party-row .lbl {
    color: #000000;
    min-width: 30mm;
    font-weight: 600;
  }
  .party-block .party-row .val {
    color: #000000;
    font-weight: 400;
  }
  .party-block .party-row.val-only .val { font-weight: 500; }
  .party-subtext {
    font-size: 9pt;
    color: #9ca3af;
    font-style: italic;
    margin: 0 0 1px 0;
    padding-left: 30mm;
    line-height: 1.4;
  }

  /* ---- Thank-you block ---- */
  .thank-you { margin: 4mm 0 6mm 0; }
  .thank-you-prefix {
    font-weight: 700;
    font-size: 11pt;
    color: #000000;
    margin-bottom: 2px;
  }
  .thank-you-body {
    font-size: 10pt;
    color: #1f2937;
    line-height: 1.4;
    max-width: 100%;
  }

  /* ---- Detail heading ---- */
  .detail-heading {
    font-size: 13pt;
    font-weight: 700;
    color: #000000;
    margin: 6mm 0 3mm 0;
  }

  /* ---- Services table ---- */
  .services-table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    border: 1px solid #000000;
  }
  .services-table thead th {
    background: #000000;
    color: #ffffff;
    font-size: 9.5pt;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 6px 8px;
    text-align: left;
    border-right: 1px solid #333333;
  }
  .services-table thead th:last-child { border-right: none; }
  .services-table thead th.num { text-align: right; }
  .services-table thead th.center { text-align: center; }
  .services-table thead th:first-child { text-align: center; }

  .services-table tbody td {
    padding: 6px 8px;
    vertical-align: top;
    border-bottom: 1px solid #000000;
    border-right: 1px solid #000000;
    font-size: 9pt;
    line-height: 1.35;
    color: #1f2937;
  }
  .services-table tbody td:last-child { border-right: 1px solid #000000; }
  .services-table tbody td.type-cell {
    font-weight: 600;
    color: #000000;
    font-size: 9pt;
    width: 10%;
    text-align: center;
  }
  .services-table tbody td.desc-cell { width: 49%; }
  .services-table tbody td.price-cell { width: 18%; text-align: right; font-variant-numeric: tabular-nums; }
  .services-table tbody td.qty-cell { width: 7%; text-align: center; }
  .services-table tbody td.total-cell { width: 16%; text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }

  .service-name {
    font-weight: 700;
    color: #000000;
    margin-bottom: 2px;
    font-size: 10pt;
  }
  .service-bullets { margin: 0 0 3px 0; padding: 0; list-style: none; }
  .service-bullets li {
    position: relative;
    padding-left: 10px;
    margin-bottom: 0;
    font-size: 9pt;
    color: #374151;
    line-height: 1.5;
  }
  .service-bullets li::before {
    content: "■";
    color: #000000;
    position: absolute;
    left: 0;
    top: 0;
    font-size: 8pt;
    line-height: 1.7;
  }
  .service-delivery {
    font-style: italic;
    color: #6b7280;
    font-size: 9pt;
    margin-top: 3px;
    line-height: 1.4;
  }

  /* TOTAL row — single undivided bar, TOTAL on left, price on right */
  .services-table tfoot td {
    background: #000000;
    color: #ffffff;
    padding: 8px 10px;
    font-weight: 700;
    font-size: 10.5pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border: none;
  }
  .services-table tfoot td.total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .services-table tfoot td.total-row .total-label {
    text-align: left;
  }
  .services-table tfoot td.total-row .total-amount {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  /* ---- Conditions / signature block ---- */
  .conditions-block {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8mm;
    margin-top: 12mm;
  }
  /* When 2+ services, reduce the gap below the table to fit on one page */
  .conditions-block.conditions-block-multi {
    margin-top: 6mm;
  }
  .cb-left .cb-title, .cb-right .cb-title {
    font-size: 10.5pt;
    font-weight: 700;
    margin-bottom: 4px;
    color: #000000;
  }
  .cb-left .cb-row {
    font-size: 9pt;
    margin-bottom: 1px;
    line-height: 1.5;
    color: #1f2937;
  }
  .cb-left .cb-row .lbl { color: #000000; font-weight: 600; }
  .cb-left .cb-row .val { color: #000000; font-weight: 400; }
  .cb-right {
    padding-left: 4mm;
    border-left: 1px solid #e5e7eb;
  }
  .cb-right .cb-title {
    margin-bottom: 8mm;
  }
  .cb-right .cb-date-line {
    font-size: 9pt;
    color: #6b7280;
    margin-bottom: 10mm;
  }
  .signature-line {
    margin-top: 18mm;
    border-top: 1px solid #000000;
    padding-top: 3px;
    font-size: 8.5pt;
    color: #6b7280;
  }
  .signature-line .sig-label { font-weight: 600; color: #000000; }
  .signature-line .sig-separator { color: #6b7280; margin: 0 4px; font-weight: 400; }
  .signature-line .sig-quality-inline { color: #6b7280; font-weight: 400; font-style: italic; }

  /* ---- Invoice payment block ---- */
  .invoice-payment-block {
    background: rgba(75, 138, 107, 0.08);
    border: 1px solid rgba(75, 138, 107, 0.3);
    padding: 8px 12px;
    margin-top: 12mm;
    border-radius: 2px;
  }
  .invoice-payment-block.conditions-block-multi {
    margin-top: 6mm;
  }
  .ipb-title {
    font-size: 11pt;
    font-weight: 700;
    color: #000000;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .ipb-row {
    display: flex;
    justify-content: space-between;
    font-size: 10pt;
    padding: 3px 0;
  }
  .ipb-label { color: #6b7280; font-weight: 500; }
  .ipb-value { color: #000000; font-weight: 600; }
  .ipb-value.paid { color: #2E7D32; font-weight: 700; }

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
  .doc-footer .footer-left .line-1 { font-weight: 400; color: #9ca3af; }
  .doc-footer .footer-left .line-2 { color: #bcbcbc; }

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
    display: flex;
    font-size: 10.5pt;
    padding: 3px 0;
    line-height: 1.5;
  }
  .bank-row .lbl {
    color: #000000;
    font-weight: 600;
    min-width: 50mm;
  }
  .bank-row .val {
    color: #000000;
    font-weight: 400;
    font-variant-numeric: tabular-nums;
  }
  .payment-link-row {
    display: flex;
    margin-top: 3px;
    padding: 3px 0;
    font-size: 10.5pt;
    line-height: 1.5;
  }
  .payment-link-row .lbl {
    color: #000000;
    font-weight: 600;
    min-width: 50mm;
  }
  .payment-link-row .val {
    color: #000000;
    font-weight: 400;
    word-break: break-all;
  }

  .payment-link-section {
    margin-top: 12mm;
  }
  .payment-link-block {
    margin-top: 3mm;
    padding: 4mm 0;
  }
  .payment-link-url {
    color: #2563eb;
    font-weight: 500;
    text-decoration: underline;
    word-break: break-all;
    font-size: 10.5pt;
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
    content: "■";
    color: #000000;
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
        <div class="doc-logo-container">
          <img class="doc-logo" src="${logoSrc}" alt="Keter Marketing" />
          <div class="doc-logo-wordmark"><span class="wm-keter">Keter</span> <span class="wm-marketing">Marketing</span></div>
        </div>
      </div>
    </div>

    <hr class="hr" />

    <div class="parties">
      <div class="party-block">
        <div class="party-label">${t.emetteur}</div>
        ${emetteurRows
          .map((r, i) => {
            // After "Société" row, add the sub-text "(Pôle d'activité de YEHI OR TECH)"
            const subText = i === 0 ? `<div class="party-subtext">${emetteurSubText}</div>` : "";
            return `<div class="party-row"><span class="lbl">${r[0]}</span><span class="val">${r[1]}</span></div>${subText}`;
          })
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
          <th style="width: 10%">${t.thType}</th>
          <th style="width: 49%">${t.thDescription}</th>
          <th class="num" style="width: 18%">${t.thUnitPrice}</th>
          <th class="center" style="width: 7%">${t.thQty}</th>
          <th class="num" style="width: 16%">${t.thTotal}</th>
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
            <td class="price-cell">${formatCurrency(it.unitPrice, lang, p.currency)}</td>
            <td class="qty-cell">${it.quantity}</td>
            <td class="total-cell">${formatCurrency(it.total, lang, p.currency)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="5" class="total-row">
            <span class="total-label">TOTAL</span>
            <span class="total-amount">${formatCurrency(grandTotal, lang, p.currency)}</span>
          </td>
        </tr>
      </tfoot>
    </table>

    ${invoicePaymentBlock}

    ${p.docType === "devis" ? `
    <div class="conditions-block ${items.length > 1 ? 'conditions-block-multi' : ''}">
      <div class="cb-left">
        <div class="cb-title">${t.conditionsBlock}</div>
        <div class="cb-row"><span class="lbl">${t.conditionsReglement} :</span> <span class="val">${p.paymentConditions}</span></div>
        <div class="cb-row"><span class="lbl">${t.modeReglement} :</span> <span class="val">${p.paymentMode}</span></div>
        <div class="cb-row"><span class="lbl">${t.validiteDevis} :</span> <span class="val">${QUOTE_VALIDITY_DAYS} ${lang === "fr" ? "jours" : "days"}</span></div>
        <div class="cb-row"><span class="lbl">${t.notes} :</span> <span class="val">${t.notesText}</span></div>
      </div>
      <div class="cb-right">
        <div class="cb-title">${t.bonPourAccord}</div>
        <div class="cb-date-line">${lang === "fr" ? "À _________________________ , le ____ / ____ / ______" : "At _________________________ , on ____ / ____ / ______"}</div>
        <div class="signature-line">
          <div class="sig-label">${t.signatureCachet} <span class="sig-separator">|</span> <span class="sig-quality-inline">${t.qualiteSignataire}</span></div>
        </div>
      </div>
    </div>
    ` : ""}
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
    ${
      p.docType === "devis"
        ? `
    <div class="section-heading">${t.bankHeading}</div>

    <div class="bank-block">
      <div class="bank-row"><span class="lbl">${t.titulaireCompte} :</span> <span class="val">${p.accountHolder}</span></div>
      <div class="bank-row"><span class="lbl">${t.iban} :</span> <span class="val">${p.iban}</span></div>
      <div class="bank-row"><span class="lbl">${t.bic} :</span> <span class="val">${p.bic}</span></div>
      <div class="bank-row"><span class="lbl">${t.bank} :</span> <span class="val">${p.bank}</span></div>
      <div class="bank-row"><span class="lbl">${t.modePaiement} :</span> <span class="val">${p.paymentMode}</span></div>
      <div class="bank-row"><span class="lbl">${t.paymentConditions} :</span> <span class="val">${p.paymentConditions}</span></div>
    </div>

    ${
      p.paymentLink
        ? `<div class="payment-link-section">
             <div class="section-heading">${lang === "fr" ? "Lien de paiement en ligne" : "Online payment link"}</div>
             <div class="payment-link-block">
               <a class="payment-link-url" href="${p.paymentLink}" target="_blank" rel="noopener noreferrer">${p.paymentLink}</a>
             </div>
           </div>`
        : ""
    }
    `
        : ""
    }

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
