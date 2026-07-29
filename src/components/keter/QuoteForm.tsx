"use client";

import { useState, useCallback } from "react";
import { RotateCcw, FileText, Save, Loader2, Eye, Mail } from "lucide-react";
import {
  DEFAULT_BANK_DETAILS,
  DEFAULT_PAYMENT_LINK,
} from "@/lib/defaults";
import { UI, buildDocNumber, quoteToInvoiceNumber, CURRENCY_OPTIONS, getCurrencySymbol } from "@/lib/i18n";
import { COUNTRIES, findCountry, formatCountryLabel } from "@/lib/countries";
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
  language: "fr", // Document language defaults to French
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
  // Prepend country code to phone for the document
  const country = f.country ? findCountry(f.country) : null;
  const phoneWithCode = f.phone
    ? (country ? `${country.phoneCode} ${f.phone}` : f.phone)
    : null;
  return {
    docType: f.docType,
    language: f.language,
    clientNumber: clientNum,
    date: f.date,
    fullName: f.fullName,
    city: f.city || null,
    country: f.country || null,
    phone: phoneWithCode,
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
  // Strip country code from phone when loading (the prefix box shows it separately)
  const country = q.country ? findCountry(q.country) : null;
  let phoneLocal = q.phone ?? "";
  if (country && phoneLocal && phoneLocal.startsWith(country.phoneCode)) {
    phoneLocal = phoneLocal.substring(country.phoneCode.length).trim();
  }
  return {
    docType: q.docType,
    language: q.language,
    clientNumber: String(q.clientNumber),
    date: q.date,
    fullName: q.fullName,
    city: q.city ?? "",
    country: q.country ?? "",
    phone: phoneLocal,
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
  onSaveChanges?: () => void;
  onRevertChanges?: () => void;
  editingId?: string | null;
  isDirty?: boolean;
  generating?: boolean;
  saving?: boolean;
}

export function QuoteForm({
  state,
  setState,
  onGeneratePdf,
  onSave,
  onSaveChanges,
  onRevertChanges,
  editingId,
  isDirty,
  generating,
  saving,
}: Props) {
  // UI is always in English; document language is separate
  const t = UI["en"];

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
            Preview
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
                data-selected={state.docType === "devis"}
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
            </label>            <input
              id="clientNumber"
              type="number"
              min={0}
              className="k-input"
              value={state.clientNumber}
              onChange={(e) => update("clientNumber", e.target.value)}
              placeholder="e.g. 1, 26, 104…"
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
                  {`Enter client # → ${state.docType === "devis" ? "D" : "F"}${year2}XXXXX`}
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
              placeholder="John Doe"
            />
          </div>
          {/* Country dropdown — full width, shows flag + name */}
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="country">
              {t.country}
            </label>
            <select
              id="country"
              className="k-input"
              value={state.country}
              onChange={(e) => {
                const countryName = e.target.value;
                const country = findCountry(countryName);
                // Batch all updates in one setState call
                const newState: FormState = {
                  ...state,
                  country: countryName,
                  city: "", // reset city when country changes
                };
                if (country) {
                  newState.currency = country.currency;
                  // Phone: store ONLY the local number (no country code)
                  // The country code is shown in the prefix box and added to the doc
                  newState.phone = "";
                }
                setState(newState);
              }}
            >
              <option value="">Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
          {/* Town dropdown — full width */}
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="city">
              {t.city}
            </label>
            <select
              id="city"
              className="k-input"
              value={state.city}
              onChange={(e) => update("city", e.target.value)}
            >
              {state.country ? (
                <>
                  <option value="">Select a city</option>
                  {(findCountry(state.country)?.cities ?? []).map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </>
              ) : (
                <option value="">Select a country first</option>
              )}
            </select>
          </div>
          {/* Phone with country code prefix + flag — full width
              The prefix box always shows (empty when no country selected).
              The input only contains the LOCAL phone number (no country code).
              The country code is prepended automatically in the document. */}
          <div className="md:col-span-2">
            <label className="k-label" htmlFor="phone">
              {t.phone}
            </label>
            <div className="flex">
              {(() => {
                const c = state.country ? findCountry(state.country) : null;
                return (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F3F4F6] border border-[#E5E7EB] border-r-0 text-sm text-[#000028] whitespace-nowrap"
                    style={{ borderRadius: "var(--radius) 0 0 var(--radius)" }}
                  >
                    {c ? (
                      <>
                        <img
                          src={`https://flagcdn.com/16x12/${c.code.toLowerCase()}.png`}
                          width={16}
                          height={12}
                          alt={c.code}
                          style={{ display: "block", borderRadius: 1 }}
                        />
                        <span className="font-mono text-xs">{c.phoneCode}</span>
                      </>
                    ) : (
                      <span className="font-mono text-xs text-[#9CA3AF]">+—</span>
                    )}
                  </span>
                );
              })()}
              <input
                id="phone"
                type="tel"
                className="k-input"
                style={{ borderRadius: "0 var(--radius) var(--radius) 0" }}
                value={state.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="Phone number (without country code)"
              />
            </div>
          </div>
          {/* Email — full width */}
          <div className="md:col-span-2">
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
          {/* Currency + CV quantity on the same line */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="k-label" htmlFor="currency">
                Currency
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
            {(state.service === "cv" || state.service === "both") && (
              <div>
                <label className="k-label" htmlFor="cvQuantity">
                  Number of CVs
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
              </div>
            )}
          </div>
          {/* Price fields — label shows the selected currency symbol */}
          <div
            className={
              state.service === "both"
                ? "grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
                : "grid grid-cols-1 gap-4 mt-4"
            }
          >
            {(state.service === "cv" || state.service === "both") && (
              <div>
                <label className="k-label" htmlFor="priceCv">
                  CV price ({getCurrencySymbol(state.currency)})
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
                  LinkedIn price ({getCurrencySymbol(state.currency)})
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
          </div>
          <p className="text-[11px] text-[#6B7280] italic">
            {state.service === "both"
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
            <select
              id="paymentMode"
              className="k-input"
              value={state.paymentMode}
              onChange={(e) => update("paymentMode", e.target.value)}
            >
              <option value="Virement bancaire">Bank transfer</option>
              {(() => {
                const country = state.country ? findCountry(state.country) : null;
                const methods = country?.mobilePayments ?? [];
                return methods.map((mp) => (
                  <option key={mp.id} value={mp.name}>{mp.name}</option>
                ));
              })()}
              {!state.country && (
                <>
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Moov Money">Moov Money</option>
                  <option value="Orange Money">Orange Money</option>
                  <option value="Wave">Wave</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="PayPal">PayPal</option>
                </>
              )}
            </select>
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
            Email me a copy
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
            Save to My Quotes
          </span>
        </label>
      </div>

      {/* Action buttons — different in edit mode vs new mode */}
      {editingId ? (
        // Edit mode: Save Changes + Revert Changes (disabled until dirty)
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onSaveChanges}
            disabled={!isDirty || saving || !state.fullName || !state.clientNumber}
            className="k-btn-primary flex-1"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save changes
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onRevertChanges}
            disabled={!isDirty}
            className="k-btn-secondary flex-1"
          >
            <RotateCcw className="w-4 h-4" />
            Revert changes
          </button>
        </div>
      ) : (
        // New mode: Generate PDF + Save
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
                Generating...
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
                  Saving...
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
      )}
    </div>
  );
}
