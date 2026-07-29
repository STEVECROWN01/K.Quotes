"use client";

import { useState } from "react";
import { X, FileText, Check, Banknote, Smartphone } from "lucide-react";
import { findCountry } from "@/lib/countries";
import type { Language } from "@/lib/services";
import type { QuoteRecord } from "@/lib/storage";

interface Props {
  open: boolean;
  language: Language;
  quote: QuoteRecord | null;
  onClose: () => void;
  onConfirm: (paymentMethod: string, paymentDate: string) => void;
}

export function GenerateInvoiceModal({ open, language, quote, onClose, onConfirm }: Props) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState(false);

  if (!open || !quote) return null;

  const country = findCountry(quote.country ?? "");
  const mobilePayments = country?.mobilePayments ?? [];

  const fr = false;

  const handleConfirm = async () => {
    if (!selectedMethod) return;
    setLoading(true);
    await onConfirm(selectedMethod, paymentDate);
    setLoading(false);
    setSelectedMethod("");
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#000028]/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E5E7EB] w-full max-w-md flex flex-col"
        style={{ borderRadius: "var(--radius)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FBF6E0] flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <div className="k-section-marker">{fr ? "Facturation" : "Invoicing"}</div>
              <h3 className="font-serif text-base font-semibold text-[#000028] mt-0.5">
                {fr ? "Générer la facture" : "Generate invoice"}
              </h3>
              <p className="text-xs text-[#6B7280] mt-1">
                {quote.quoteNumber} — {quote.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#000028] hover:bg-[#F3F4F6] transition-colors"
            style={{ borderRadius: "var(--radius)" }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-[#374151] mb-4">
            {fr
              ? "Comment le paiement a-t-il été effectué ? Sélectionnez le mode de paiement :"
              : "How was the payment made? Select the payment method:"}
          </p>

          {/* Bank transfer — always first */}
          <label
            className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors mb-2 ${
              selectedMethod === "Virement bancaire"
                ? "border-[#D4AF37] bg-[#FBF6E0]"
                : "border-[#E5E7EB] hover:border-[#D4AF37]"
            }`}
            style={{ borderRadius: "var(--radius)" }}
          >
            <input
              type="radio"
              name="paymentMethod"
              value="Virement bancaire"
              checked={selectedMethod === "Virement bancaire"}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-4 h-4 accent-[#D4AF37]"
            />
            <Banknote className="w-4 h-4 text-[#000028]" />
            <div>
              <div className="text-sm font-medium text-[#000028]">
                {fr ? "Virement bancaire" : "Bank transfer"}
              </div>
              <div className="text-xs text-[#6B7280]">
                {fr ? "Transfert bancaire classique" : "Classic bank transfer"}
              </div>
            </div>
          </label>

          {/* Mobile payment methods — country-specific */}
          {mobilePayments.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#6B7280] mt-4 mb-2">
                {country && (
                  <img
                    src={`https://flagcdn.com/16x12/${country.code.toLowerCase()}.png`}
                    width={14}
                    height={10}
                    alt={country.code}
                    style={{ display: "block", borderRadius: 1 }}
                  />
                )}
                {fr ? "Transactions mobiles" : "Mobile transactions"}
                {country && ` — ${country.name}`}
              </div>
              {mobilePayments.map((mp) => (
                <label
                  key={mp.id}
                  className={`flex items-center gap-3 p-3 border cursor-pointer transition-colors mb-2 ${
                    selectedMethod === mp.name
                      ? "border-[#D4AF37] bg-[#FBF6E0]"
                      : "border-[#E5E7EB] hover:border-[#D4AF37]"
                  }`}
                  style={{ borderRadius: "var(--radius)" }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={mp.name}
                    checked={selectedMethod === mp.name}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <Smartphone className="w-4 h-4 text-[#000028]" />
                  <span className="text-sm font-medium text-[#000028]">{mp.name}</span>
                </label>
              ))}
            </>
          )}

          {mobilePayments.length === 0 && !quote.country && (
            <p className="text-xs text-[#6B7280] italic mt-2">
              {fr
                ? "⚠️ Aucun pays sélectionné dans le devis. Sélectionnez un pays pour voir les méthodes de paiement mobile disponibles."
                : "⚠️ No country selected in the quote. Select a country to see available mobile payment methods."}
            </p>
          )}
          {mobilePayments.length === 0 && quote.country && (
            <p className="text-xs text-[#6B7280] italic mt-2">
              {fr
                ? "Aucune méthode de paiement mobile disponible pour ce pays."
                : "No mobile payment methods available for this country."}
            </p>
          )}
        </div>

        {/* Payment date */}
        <div className="mt-4">
          <label className="k-label" htmlFor="paymentDate">
            {fr ? "Date de règlement" : "Payment date"}
          </label>
          <input
            id="paymentDate"
            type="date"
            className="k-input"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E5E7EB] bg-[#FAFAF9]">
          <button onClick={onClose} className="k-btn-secondary !py-2 !px-4 text-xs">
            {fr ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedMethod || loading}
            className="k-btn-primary !py-2 !px-4 text-xs"
          >
            {loading ? (
              <>{fr ? "Génération..." : "Generating..."}</>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                {fr ? "Confirmer et générer" : "Confirm & generate"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
