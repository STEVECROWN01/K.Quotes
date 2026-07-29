"use client";

import { useEffect, useState, useMemo } from "react";
import { Download, FileText, Trash2, X, Loader2, Plus, Search } from "lucide-react";
import { UI } from "@/lib/i18n";
import type { Language } from "@/lib/services";
import type { QuoteRecord } from "@/lib/storage";
import { formatCurrency } from "@/lib/i18n";

interface Props {
  open: boolean;
  language: Language;
  onClose: () => void;
  onNewQuote: () => void;
  onLoadQuote: (q: QuoteRecord) => void;
  onGenerateInvoice: (q: QuoteRecord) => void;
  onDownload: (q: QuoteRecord) => void;
  onDelete: (q: QuoteRecord) => void;
}

export function MyQuotesDialog({
  open,
  language,
  onClose,
  onNewQuote,
  onLoadQuote,
  onGenerateInvoice,
  onDownload,
  onDelete,
}: Props) {
  const t = UI[language];
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search — match by quoteNumber OR fullName (case-insensitive)
  const filteredQuotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return quotes;
    return quotes.filter(
      (quote) =>
        quote.quoteNumber.toLowerCase().includes(q) ||
        quote.fullName.toLowerCase().includes(q) ||
        (quote.email ?? "").toLowerCase().includes(q)
    );
  }, [quotes, searchQuery]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`/api/quotes?t=${Date.now()}`, {
          headers: { "Cache-Control": "no-cache" },
        });
        const d = await r.json();
        if (!cancelled) {
          if (!r.ok) {
            setError(d.error || "Failed to load quotes");
            setQuotes([]);
          } else {
            setQuotes(d.quotes || []);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000028]/40 backdrop-blur-sm">
      <div className="bg-white border border-[#E5E7EB] w-full max-w-5xl max-h-[85vh] flex flex-col" style={{ borderRadius: "var(--radius)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <div className="k-section-marker">{t.myQuotes}</div>
            <h2 className="font-serif text-xl font-semibold text-[#000028] mt-0.5">
              {t.myQuotes}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNewQuote} className="k-btn-secondary !py-2 !px-3 text-xs">
              <Plus className="w-3.5 h-3.5" />
              {t.newQuote}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#6B7280] hover:text-[#000028] hover:bg-[#F3F4F6] transition-colors"
              style={{ borderRadius: "var(--radius)" }}
              aria-label={t.cancel}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search bar — only shown when there are quotes and no error */}
        {!loading && !error && quotes.length > 0 && (
          <div className="px-5 py-3 border-b border-[#E5E7EB] bg-[#FAFAF9]">
            <div className="relative">
              <Search className="w-4 h-4 text-[#6B7280] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === "fr"
                    ? "Rechercher par numéro, nom ou email…"
                    : "Search by number, name or email…"
                }
                className="w-full pl-9 pr-3 py-2 text-sm text-[#000028] bg-white border border-[#E5E7EB] focus:border-[#D4AF37] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-colors"
                style={{ borderRadius: "var(--radius)" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[#6B7280] hover:text-[#000028] transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {searchQuery && (
              <div className="mt-2 text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                {filteredQuotes.length} {language === "fr" ? "résultat(s)" : "match(es)"} · {quotes.length} {language === "fr" ? "total" : "total"}
              </div>
            )}
          </div>
        )}

        {/* Body — table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#6B7280]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">
                {language === "fr" ? "Chargement..." : "Loading..."}
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#FEF2F2] flex items-center justify-center">
                <X className="w-6 h-6 text-[#B91C1C]" />
              </div>
              <div>
                <p className="font-serif text-base font-semibold text-[#000028] mb-1">
                  {language === "fr" ? "Configuration requise" : "Configuration required"}
                </p>
                <p className="text-xs text-[#6B7280] max-w-md">{error}</p>
              </div>
            </div>
          ) : quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-4 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <FileText className="w-7 h-7 text-[#6B7280]" />
              </div>
              <div>
                <p className="font-serif text-lg text-[#000028] font-medium">
                  {t.emptyState}
                </p>
                <button
                  onClick={onNewQuote}
                  className="k-btn-primary mt-4"
                >
                  <Plus className="w-4 h-4" />
                  {t.emptyStateCta}
                </button>
              </div>
            </div>
          ) : filteredQuotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <Search className="w-6 h-6 text-[#6B7280]" />
              </div>
              <p className="font-serif text-base text-[#000028] font-medium">
                {language === "fr"
                  ? "Aucun résultat pour cette recherche"
                  : "No matches for this search"}
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="k-btn-secondary !py-2 !px-4 text-xs"
              >
                {language === "fr" ? "Effacer la recherche" : "Clear search"}
              </button>
            </div>
          ) : (
            <table className="k-table">
              <thead>
                <tr>
                  <th>{language === "fr" ? "N°" : "#"}</th>
                  <th>{t.fullName}</th>
                  <th>{t.date}</th>
                  <th className="text-right">{t.total}</th>
                  <th>{language === "fr" ? "Type" : "Type"}</th>
                  <th>{language === "fr" ? "Statut" : "Status"}</th>
                  <th className="text-right">{language === "fr" ? "Actions" : "Actions"}</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((q) => {
                  // Service-aware total: only sum prices for selected services.
                  const total =
                    (q.service === "cv" || q.service === "both" ? (q.priceCv || 0) * (q.cvQuantity || 1) : 0) +
                    (q.service === "linkedin" || q.service === "both" ? q.priceLinkedin || 0 : 0);
                  return (
                    <tr
                      key={q.id}
                      className="cursor-pointer hover:bg-[#FAFAF9]"
                      onClick={() => onLoadQuote(q)}
                    >
                      <td className="font-mono text-xs text-[#D4AF37] font-semibold">
                        {q.quoteNumber}
                      </td>
                      <td className="font-medium">{q.fullName}</td>
                      <td className="text-[#6B7280] text-xs">{q.date}</td>
                      <td className="text-right font-mono">
                        {formatCurrency(total, q.language, q.currency ?? "EUR")}
                      </td>
                      <td>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-[#F3F4F6] text-[#000028]" style={{ borderRadius: 2 }}>
                          {q.docType}
                        </span>
                      </td>
                      <td>
                        <span
                          className={
                            "inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider " +
                            (q.status === "invoiced"
                              ? "bg-[#E6F4EC] text-[#4B8A6B]"
                              : q.status === "saved"
                              ? "bg-[#FBF6E0] text-[#B8960F]"
                              : "bg-[#F3F4F6] text-[#6B7280]")
                          }
                          style={{ borderRadius: 2 }}
                        >
                          {q.status}
                        </span>
                      </td>
                      <td className="text-right">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onDownload(q)}
                            disabled={busyId === q.id}
                            className="p-1.5 text-[#000028] hover:bg-[#000028] hover:text-white transition-colors"
                            style={{ borderRadius: 2 }}
                            title={t.download}
                          >
                            {busyId === q.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Download className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {q.docType === "devis" && (
                            <button
                              onClick={() => onGenerateInvoice(q)}
                              className="p-1.5 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#000028] transition-colors"
                              style={{ borderRadius: 2 }}
                              title={t.generateInvoice}
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onDelete(q)}
                            className="p-1.5 text-[#B91C1C] hover:bg-[#B91C1C] hover:text-white transition-colors"
                            style={{ borderRadius: 2 }}
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#FAFAF9] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
            {(searchQuery ? filteredQuotes.length : quotes.length)} {language === "fr" ? "devis enregistré(s)" : "saved quote(s)"}
          </span>
          <button onClick={onClose} className="k-btn-secondary !py-2 !px-4 text-xs">
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function setBusy(id: string | null) {
  // Helper exported for parent — but parent manages its own busy state.
  return id;
}
