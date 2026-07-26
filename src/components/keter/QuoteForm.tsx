"use client";

import { useState, useCallback } from "react";
import { RotateCcw, FileText, Save, Loader2, Eye, Mail } from "lucide-react";
import {
  DEFAULT_BANK_DETAILS,
  DEFAULT_PAYMENT_LINK,
} from "@/lib/defaults";
import { UI, buildDocNumber, quoteToInvoiceNumber, CURRENCY_OPTIONS } from "@/lib/i18n";
import type { Language, DocType, ServiceType } from "@/lib/services";
import type { DocumentPayload } from "./document-html";

export type FormState = {
  docType: DocType;
  language: Language;
  clientNumber: string; // string for input control; parsed on save
  date: string;
  fullName: string;
  city: string;
  country: string;
  phone: string;
  email: string;
  service: ServiceType;
  priceCv: string;
  priceLinkedin: string;
  cvQuantity: string; // number of CVs (1, 2, 3, 4+ for different domains)
  currency: string; // currency code: EUR, USD, XOF, CAD, etc.
  accountHolder: string;
  iban: string;
  bic: string;
  bank: string;
  paymentMode: string;
  paymentConditions: string;
  paymentLink: string;
  paymentStatus: "Payé" | "Pending";
  paymentDate: string;
  // Optional side-effects on PDF generation
  emailSelfCopy: boolean; // send a copy to SELF_BCC_EMAIL via Resend
  saveOnGenerate: boolean; // also persist to Supabase when downloading PDF
};

export const initialFormState: FormState = {
  docType: "devis",
  language: "fr",
  clientNumber: "",
  date: new Date().toISOString().slice(0, 10),
  fullName: "",
  city: "",
  country: "",
  phone: "",
  email: "",
  service: "cv",
  priceCv: "120",
  priceLinkedin: "120",
  cvQuantity: "1",
  currency: "EUR",
  accountHolder: DEFAULT_BANK_DETAILS.accountHolder,
  iban: DEFAULT_BANK_DETAILS.iban,
  bic: DEFAULT_BANK_DETAILS.bic,
  bank: DEFAULT_BANK_DETAILS.bank,
  paymentMode: DEFAULT_BANK_DETAILS.paymentMode,
  paymentConditions: DEFAULT_BANK_DETAILS.paymentConditions,
  paymentLink: DEFAULT_PAYMENT_LINK,
  paymentStatus: "Payé",
  paymentDate: new Date().toISOString().slice(0, 10),
  emailSelfCopy: true,
  saveOnGenerate: true,
};

export function formStateToPayload(f: FormState): DocumentPayload {
  const clientNum = parseInt(f.clientNumber, 10) || 0;
  return {
    docType: f.docType,
    language: f.language,
    clientNumber: clientNum,
    date: f.date,
    fullName: f.fullName,
    city: f.city || null,
    country: f.country || null,
    phone: f.phone || null,
    email: f.email || null,
    service: f.service,
    priceCv: f.priceCv ? parseFloat(f.priceCv) : null,
    priceLinkedin: f.priceLinkedin ? parseFloat(f.priceLinkedin) : null,
    cvQuantity: parseInt(f.cvQuantity, 10) || 1,
    currency: f.currency,
    accountHolder: f.accountHolder,
    iban: f.iban,
    bic: f.bic,
    bank: f.bank,
    paymentMode: f.paymentMode,
    paymentConditions: f.paymentConditions,
    paymentLink: f.paymentLink || null,
    paymentStatus: f.paymentStatus,
    paymentDate: f.paymentDate || null,
    quoteNumber: buildDocNumber(clientNum, f.docType),
  };
}

export function quoteRecordToFormState(q: any): FormState {
  return {
    docType: q.docType,
    language: q.language,
    clientNumber: String(q.clientNumber),
    date: q.date,
    fullName: q.fullName,
    city: q.city ?? "",
    country: q.country ?? "",
    phone: q.phone ?? "",
    email: q.email ?? "",
    service: q.service,
    priceCv: q.priceCv != null ? String(q.priceCv) : "",
    priceLinkedin: q.priceLinkedin != null ? String(q.priceLinkedin) : "",
    cvQuantity: q.cvQuantity != null ? String(q.cvQuantity) : "1",
    currency: q.currency ?? "EUR",
    accountHolder: q.accountHolder,
    iban: q.iban,
    bic: q.bic,
    bank: q.bank,
    paymentMode: q.paymentMode,
    paymentConditions: q.paymentConditions,
    paymentLink: q.paymentLink ?? "",
    paymentStatus: q.paymentStatus ?? "Payé",
    paymentDate: q.paymentDate ?? new Date().toISOString().slice(0, 10),
    emailSelfCopy: true,
    saveOnGenerate: true,
  };
}

interface Props {
  state: FormState;
  setState: (s: FormState) => void;
  onGeneratePdf: () => void;
  onSave: () => void;
  generating?: boolean;
  saving?: boolean;
}

export function QuoteForm({
  state,
  setState,
  onGeneratePdf,
  onSave,
  generating,
  saving,
}: Props) {
  const t = UI[state.language];

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setState({ ...state, [key]: value });
    },
    [state, setState]
  );

  const resetBank = () => {
    setState({
      ...state,
      accountHolder: DEFAULT_BANK_DETAILS.accountHolder,
      iban: DEFAULT_BANK_DETAILS.iban,
      bic: DEFAULT_BANK_DETAILS.bic,
      bank: DEFAULT_BANK_DETAILS.bank,
      paymentMode: DEFAULT_BANK_DETAILS.paymentMode,
      paymentConditions: DEFAULT_BANK_DETAILS.paymentConditions,
      paymentLink: DEFAULT_PAYMENT_LINK,
    });
  };

  const clientNum = parseInt(state.clientNumber, 10) || 0;
  const year2 = new Date().getFullYear().toString().slice(-2);
  const docNumber = clientNum > 0
    ? buildDocNumber(clientNum, state.docType)
    : `${state.docType === "devis" ? "D" : "F"}${year2}XXXXX`;
  const isInvoice = state.docType === "facture";

  return (
    <div className="space-y-5">
      {/* Quote-number stamp — the signature visual moment */}
      <div className="k-card flex items-center justify-between !py-4">
        <div>
          <div className="k-section-marker">
            {isInvoice ? t.invoiceNumber : t.quoteNumber}
          </div>
          <div
            className="k-stamp text-2xl md:text-3xl mt-1"
            aria-live="polite"
          >
            {docNumber}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
            {state.language === "fr" ? "Aperçu" : "Preview"}
          </div>
          <div className="text-sm font-medium text-[#000028] mt-0.5">
            {isInvoice ? t.titleFacture : t.titleDevis}
          </div>
        </div>
      </div>

      {/* SECTION A — Doc type & language */}
      <section className="k-card">
        <header className="mb-4">
          <div className="k-section-marker">A</div>
          <h2 className="k-section-title">{t.sectionA}</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="k-label">{t.docTypeLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.docType === "devis"}
                onClick={() => update("docType", "devis")}
              >
                {t.devis}
              </button>
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.docType === "facture"}
                onClick={() => update("docType", "facture")}
              >
                {t.facture}
              </button>
            </div>
          </div>
          <div>
            <label className="k-label">{t.languageLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.language === "fr"}
                onClick={() => update("language", "fr")}
              >
                {t.francais}
              </button>
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.language === "en"}
                onClick={() => update("language", "en")}
              >
                {t.english}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION B — Client info */}
      <section className="k-card">
        <header className="mb-4">
          <div className="k-section-marker">B</div>
          <h2 className="k-section-title">{t.sectionB}</h2>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="k-label" htmlFor="clientNumber">
              {t.clientNumber} *
            </label>
            <input
              id="clientNumber"
              type="number"
              min={0}
              className="k-input"
              value={state.clientNumber}
              onChange={(e) => update("clientNumber", e.target.value)}
              placeholder={state.language === "fr" ? "Ex: 1, 26, 104…" : "e.g. 1, 26, 104…"}
            />
            <p className="text-[10px] text-[#6B7280] mt-1 font-mono">
              {clientNum > 0 ? (
                <>
                  → {isInvoice ? t.invoiceNumber : t.quoteNumber}:{" "}
                  <span className="text-[#D4AF37] font-semibold">
                    {isInvoice
                      ? quoteToInvoiceNumber(docNumber)
                      : docNumber}
                  </span>
                </>
              ) : (
                <span className="italic">
                  {state.language === "fr"
                    ? `Entrez le n° client → ${state.docType === "devis" ? "D" : "F"}${year2}XXXXX`
                    : `Enter client # → ${state.docType === "devis" ? "D" : "F"}${year2}XXXXX`}
                </span>
              )}
            </p>
          </div>
          <div>
            <label className="k-label" htmlFor="date">
              {t.date}
            </label>
            <input
              id="date"
              type="date"
              className="k-input"
              value={state.date}
              onChange={(e) => update("date", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="fullName">
              {t.fullName} *
            </label>
            <input
              id="fullName"
              type="text"
              className="k-input"
              value={state.fullName}
              onChange={(e) => update("fullName", e.target.value)}
              placeholder={state.language === "fr" ? "Jean Dupont" : "John Doe"}
            />
          </div>
          <div>
            <label className="k-label" htmlFor="city">
              {t.city}
            </label>
            <input
              id="city"
              type="text"
              className="k-input"
              value={state.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="Paris"
            />
          </div>
          <div>
            <label className="k-label" htmlFor="country">
              {t.country}
            </label>
            <input
              id="country"
              type="text"
              className="k-input"
              value={state.country}
              onChange={(e) => update("country", e.target.value)}
              placeholder="France"
            />
          </div>
          <div>
            <label className="k-label" htmlFor="phone">
              {t.phone}
            </label>
            <input
              id="phone"
              type="tel"
              className="k-input"
              value={state.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="+33 1 23 45 67 89"
            />
          </div>
          <div>
            <label className="k-label" htmlFor="email">
              {t.email}
            </label>
            <input
              id="email"
              type="email"
              className="k-input"
              value={state.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="jean.dupont@email.com"
            />
          </div>
        </div>
      </section>

      {/* SECTION C — Service */}
      <section className="k-card">
        <header className="mb-4">
          <div className="k-section-marker">C</div>
          <h2 className="k-section-title">{t.sectionC}</h2>
        </header>
        <div className="space-y-4">
          <div>
            <label className="k-label">{t.serviceType}</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.service === "cv"}
                onClick={() => update("service", "cv")}
              >
                {t.cvOnly}
              </button>
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.service === "linkedin"}
                onClick={() => update("service", "linkedin")}
              >
                {t.linkedinOnly}
              </button>
              <button
                type="button"
                className="k-radio-card text-center font-medium"
                data-selected={state.service === "both"}
                onClick={() => update("service", "both")}
              >
                {t.both}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="k-label" htmlFor="currency">
                {state.language === "fr" ? "Devise" : "Currency"}
              </label>
              <select
                id="currency"
                className="k-input"
                value={state.currency}
                onChange={(e) => update("currency", e.target.value)}
              >
                {CURRENCY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div
            className={
              state.service === "both"
                ? "grid grid-cols-1 md:grid-cols-3 gap-4"
                : "grid grid-cols-1 md:grid-cols-2 gap-4"
            }
          >
            {(state.service === "cv" || state.service === "both") && (
              <div>
                <label className="k-label" htmlFor="priceCv">
                  {t.priceCv}
                </label>
                <input
                  id="priceCv"
                  type="number"
                  min={0}
                  step="0.01"
                  className="k-input"
                  value={state.priceCv}
                  onChange={(e) => update("priceCv", e.target.value)}
                  placeholder="120.00"
                />
              </div>
            )}
            {(state.service === "linkedin" ||
              state.service === "both") && (
              <div>
                <label className="k-label" htmlFor="priceLinkedin">
                  {t.priceLinkedin}
                </label>
                <input
                  id="priceLinkedin"
                  type="number"
                  min={0}
                  step="0.01"
                  className="k-input"
                  value={state.priceLinkedin}
                  onChange={(e) => update("priceLinkedin", e.target.value)}
                  placeholder="120.00"
                />
              </div>
            )}
            {(state.service === "cv" || state.service === "both") && (
              <div>
                <label className="k-label" htmlFor="cvQuantity">
                  {state.language === "fr" ? "Nombre de CV" : "Number of CVs"}
                </label>
                <input
                  id="cvQuantity"
                  type="number"
                  min={1}
                  max={20}
                  step={1}
                  className="k-input"
                  value={state.cvQuantity}
                  onChange={(e) => update("cvQuantity", e.target.value)}
                  placeholder="1"
                />
                <p className="text-[10px] text-[#6B7280] mt-1 italic">
                  {state.language === "fr"
                    ? "Pour plusieurs CV (domaines différents)"
                    : "For multiple CVs (different domains)"}
                </p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-[#6B7280] italic">
            {state.language === "fr"
              ? state.service === "both"
                ? "Combo : 2 lignes distinctes, quantité 1 chacune."
                : "Prestation unique : 1 ligne, quantité 1."
              : state.service === "both"
              ? "Combo: 2 separate line items, qty 1 each."
              : "Single service: 1 line item, qty 1."}
          </p>
        </div>
      </section>

      {/* SECTION D — Bank details */}
      <section className="k-card">
        <header className="mb-4 flex items-start justify-between">
          <div>
            <div className="k-section-marker">D</div>
            <h2 className="k-section-title">{t.sectionD}</h2>
          </div>
          <button
            type="button"
            onClick={resetBank}
            className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#6B7280] hover:text-[#000028] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            {t.resetToDefault}
          </button>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="accountHolder">
              {t.accountHolder}
            </label>
            <input
              id="accountHolder"
              type="text"
              className="k-input"
              value={state.accountHolder}
              onChange={(e) => update("accountHolder", e.target.value)}
            />
          </div>
          <div>
            <label className="k-label" htmlFor="iban">
              {t.iban}
            </label>
            <input
              id="iban"
              type="text"
              className="k-input font-mono text-xs"
              value={state.iban}
              onChange={(e) => update("iban", e.target.value)}
            />
          </div>
          <div>
            <label className="k-label" htmlFor="bic">
              {t.bic}
            </label>
            <input
              id="bic"
              type="text"
              className="k-input font-mono text-xs"
              value={state.bic}
              onChange={(e) => update("bic", e.target.value)}
            />
          </div>
          <div>
            <label className="k-label" htmlFor="bank">
              {t.bank}
            </label>
            <input
              id="bank"
              type="text"
              className="k-input"
              value={state.bank}
              onChange={(e) => update("bank", e.target.value)}
            />
          </div>
          <div>
            <label className="k-label" htmlFor="paymentMode">
              {t.paymentMode}
            </label>
            <input
              id="paymentMode"
              type="text"
              className="k-input"
              value={state.paymentMode}
              onChange={(e) => update("paymentMode", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="paymentConditions">
              {t.paymentConditions}
            </label>
            <input
              id="paymentConditions"
              type="text"
              className="k-input"
              value={state.paymentConditions}
              onChange={(e) => update("paymentConditions", e.target.value)}
            />
          </div>
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="paymentLink">
              {t.paymentLink}
            </label>
            <input
              id="paymentLink"
              type="url"
              className="k-input text-xs"
              value={state.paymentLink}
              onChange={(e) => update("paymentLink", e.target.value)}
              placeholder="https://..."
            />
            <p className="text-[10px] text-[#6B7280] mt-1 italic">
              {t.paymentLinkHint}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION E — Invoice-only fields */}
      {isInvoice && (
        <section className="k-card border-[#D4AF37]/40 bg-[#FBF6E0]/30">
          <header className="mb-4">
            <div className="k-section-marker">E</div>
            <h2 className="k-section-title">{t.sectionE}</h2>
          </header>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="k-label">{t.paymentStatus}</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="k-radio-card text-center font-medium"
                  data-selected={state.paymentStatus === "Payé"}
                  onClick={() => update("paymentStatus", "Payé")}
                >
                  {t.paid}
                </button>
                <button
                  type="button"
                  className="k-radio-card text-center font-medium"
                  data-selected={state.paymentStatus === "Pending"}
                  onClick={() => update("paymentStatus", "Pending")}
                >
                  {t.pending}
                </button>
              </div>
            </div>
            <div>
              <label className="k-label" htmlFor="paymentDate">
                {t.paymentDate}
              </label>
              <input
                id="paymentDate"
                type="date"
                className="k-input"
                value={state.paymentDate}
                onChange={(e) => update("paymentDate", e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {/* Generation options — email self-BCC + auto-save */}
      <div className="k-card !py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.emailSelfCopy}
            onChange={(e) => update("emailSelfCopy", e.target.checked)}
            className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
          />
          <Mail className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#000028] font-medium">
            {state.language === "fr" ? "M'envoyer une copie par email" : "Email me a copy"}
          </span>
        </label>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={state.saveOnGenerate}
            onChange={(e) => update("saveOnGenerate", e.target.checked)}
            className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
          />
          <Save className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="text-xs text-[#000028] font-medium">
            {state.language === "fr" ? "Sauvegarder dans Mes devis" : "Save to My Quotes"}
          </span>
        </label>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onGeneratePdf}
          disabled={generating || !state.fullName || !state.clientNumber}
          className="k-btn-primary flex-1"
        >
          {generating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {state.language === "fr" ? "Génération..." : "Generating..."}
            </>
          ) : (
            <>
              <FileText className="w-4 h-4" />
              {t.generatePdf}
            </>
          )}
        </button>
        {!isInvoice && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !state.fullName || !state.clientNumber}
            className="k-btn-secondary flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {state.language === "fr" ? "Enregistrement..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {t.saveAndGenerateLater}
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
