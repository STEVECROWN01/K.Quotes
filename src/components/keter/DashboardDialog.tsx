"use client";

import { useEffect, useState, useMemo } from "react";
import { X, Loader2, TrendingUp, FileText, FileCheck, Euro, BarChart3 } from "lucide-react";
import { UI, formatCurrency } from "@/lib/i18n";
import type { Language } from "@/lib/services";
import type { QuoteRecord } from "@/lib/storage";

interface Props {
  open: boolean;
  language: Language;
  onClose: () => void;
}

type Stats = {
  totalQuotes: number;
  totalInvoices: number;
  totalRevenue: number; // sum of all factures with paymentStatus === "Payé"
  quotesRevenue: number; // sum of all devis (potential revenue)
  conversionRate: number; // invoices / quotes
  monthly: { month: string; count: number; revenue: number }[]; // last 6 months
  topClients: { name: string; count: number; total: number }[];
};

export function DashboardDialog({ open, language, onClose }: Props) {
  const t = UI[language];
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch("/api/quotes");
        const d = await r.json();
        if (!cancelled) {
          if (!r.ok) {
            setError(d.error || "Failed to load");
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

  const stats: Stats = useMemo(() => {
    const devis = quotes.filter((q) => q.docType === "devis");
    const factures = quotes.filter((q) => q.docType === "facture");
    const paidInvoices = factures.filter((q) => q.paymentStatus === "Payé");

    const computeTotal = (q: QuoteRecord) =>
      (q.service === "cv" || q.service === "both" ? (q.priceCv || 0) * (q.cvQuantity || 1) : 0) +
      (q.service === "linkedin" || q.service === "both" ? q.priceLinkedin || 0 : 0);

    const totalRevenue = paidInvoices.reduce((sum, q) => sum + computeTotal(q), 0);
    const quotesRevenue = devis.reduce((sum, q) => sum + computeTotal(q), 0);
    const conversionRate = devis.length > 0 ? (factures.length / devis.length) * 100 : 0;

    // Last 6 months — group by YYYY-MM
    const now = new Date();
    const monthlyMap = new Map<string, { count: number; revenue: number }>();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlyMap.set(key, { count: 0, revenue: 0 });
    }
    quotes.forEach((q) => {
      const key = q.date.slice(0, 7); // YYYY-MM
      if (monthlyMap.has(key)) {
        const entry = monthlyMap.get(key)!;
        entry.count += 1;
        // Only count revenue from paid invoices
        if (q.docType === "facture" && q.paymentStatus === "Payé") {
          entry.revenue += computeTotal(q);
        }
      }
    });

    const monthLabels: Record<Language, string[]> = {
      fr: ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"],
      en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    };
    const monthly = Array.from(monthlyMap.entries()).map(([key, val]) => {
      const [yr, mo] = key.split("-");
      const monthIdx = parseInt(mo, 10) - 1;
      return {
        month: `${monthLabels[language][monthIdx]} ${yr.slice(2)}`,
        count: val.count,
        revenue: val.revenue,
      };
    });

    // Top clients by total quotes/invoices
    const clientMap = new Map<string, { count: number; total: number }>();
    quotes.forEach((q) => {
      const name = q.fullName;
      if (!clientMap.has(name)) clientMap.set(name, { count: 0, total: 0 });
      const entry = clientMap.get(name)!;
      entry.count += 1;
      entry.total += computeTotal(q);
    });
    const topClients = Array.from(clientMap.entries())
      .map(([name, v]) => ({ name, count: v.count, total: v.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalQuotes: devis.length,
      totalInvoices: factures.length,
      totalRevenue,
      quotesRevenue,
      conversionRate,
      monthly,
      topClients,
    };
  }, [quotes, language]);

  if (!open) return null;

  const maxMonthlyCount = Math.max(1, ...stats.monthly.map((m) => m.count));
  const maxRevenue = Math.max(1, ...stats.monthly.map((m) => m.revenue));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000028]/40 backdrop-blur-sm">
      <div className="bg-white border border-[#E5E7EB] w-full max-w-5xl max-h-[85vh] flex flex-col" style={{ borderRadius: "var(--radius)" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div>
            <div className="k-section-marker">{language === "fr" ? "Tableau de bord" : "Dashboard"}</div>
            <h2 className="font-serif text-xl font-semibold text-[#000028] mt-0.5">
              {language === "fr" ? "Tableau de bord" : "Dashboard"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7280] hover:text-[#000028] hover:bg-[#F3F4F6] transition-colors"
            style={{ borderRadius: "var(--radius)" }}
            aria-label={t.cancel}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-5 md:p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-[#6B7280]">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-sm">
                {language === "fr" ? "Chargement…" : "Loading…"}
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
            <div className="flex flex-col items-center justify-center h-64 gap-3 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-[#F3F4F6] flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-[#6B7280]" />
              </div>
              <p className="font-serif text-base text-[#000028] font-medium">
                {language === "fr"
                  ? "Pas encore de données — créez votre premier devis"
                  : "No data yet — create your first quote"}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <KpiCard
                  icon={<FileText className="w-4 h-4" />}
                  label={language === "fr" ? "Devis émis" : "Quotes issued"}
                  value={String(stats.totalQuotes)}
                  accent="ink"
                />
                <KpiCard
                  icon={<FileCheck className="w-4 h-4" />}
                  label={language === "fr" ? "Factures émises" : "Invoices issued"}
                  value={String(stats.totalInvoices)}
                  accent="gold"
                />
                <KpiCard
                  icon={<Euro className="w-4 h-4" />}
                  label={language === "fr" ? "Revenu encaissé" : "Revenue collected"}
                  value={formatCurrency(stats.totalRevenue, language)}
                  accent="green"
                />
                <KpiCard
                  icon={<TrendingUp className="w-4 h-4" />}
                  label={language === "fr" ? "Taux de conversion" : "Conversion rate"}
                  value={`${stats.conversionRate.toFixed(0)}%`}
                  accent="ink"
                  hint={`${stats.totalInvoices}/${stats.totalQuotes}`}
                />
              </div>

              {/* Monthly chart — quotes count */}
              <div className="k-card">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="font-serif text-base font-semibold text-[#000028]">
                    {language === "fr" ? "Devis par mois" : "Quotes per month"}
                  </h3>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                    6 {language === "fr" ? "derniers mois" : "months"}
                  </span>
                </div>
                <div className="flex items-end justify-between gap-2 md:gap-4 h-32">
                  {stats.monthly.map((m, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-[10px] font-mono text-[#000028] font-semibold">
                        {m.count > 0 ? m.count : ""}
                      </div>
                      <div className="w-full bg-[#F3F4F6] relative" style={{ height: "100%", borderRadius: 2 }}>
                        <div
                          className="absolute bottom-0 left-0 right-0 bg-[#000028] transition-all duration-500"
                          style={{
                            height: `${(m.count / maxMonthlyCount) * 100}%`,
                            borderRadius: 2,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider">
                        {m.month}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue chart + Top clients */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Revenue per month */}
                <div className="k-card">
                  <h3 className="font-serif text-base font-semibold text-[#000028] mb-4">
                    {language === "fr" ? "Revenu encaissé / mois" : "Revenue / month"}
                  </h3>
                  <div className="flex items-end justify-between gap-2 md:gap-4 h-32">
                    {stats.monthly.map((m, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="text-[10px] font-mono text-[#D4AF37] font-semibold">
                          {m.revenue > 0 ? formatCurrency(m.revenue, language).replace(/\.\d+/, "").replace("€", "€") : ""}
                        </div>
                        <div className="w-full bg-[#F3F4F6] relative" style={{ height: "100%", borderRadius: 2 }}>
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-[#D4AF37] transition-all duration-500"
                            style={{
                              height: `${(m.revenue / maxRevenue) * 100}%`,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-[#6B7280] font-mono uppercase tracking-wider">
                          {m.month}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex items-baseline justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                      {language === "fr" ? "Revenu potentiel (devis)" : "Potential revenue (quotes)"}
                    </span>
                    <span className="font-mono font-semibold text-[#000028]">
                      {formatCurrency(stats.quotesRevenue, language)}
                    </span>
                  </div>
                </div>

                {/* Top clients */}
                <div className="k-card">
                  <h3 className="font-serif text-base font-semibold text-[#000028] mb-4">
                    {language === "fr" ? "Top clients" : "Top clients"}
                  </h3>
                  {stats.topClients.length === 0 ? (
                    <p className="text-sm text-[#6B7280] italic">
                      {language === "fr" ? "Aucun client" : "No clients"}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {stats.topClients.map((c, i) => (
                        <li key={i} className="flex items-center justify-between py-2 border-b border-[#F3F4F6] last:border-0">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="w-5 h-5 flex items-center justify-center bg-[#000028] text-white text-[10px] font-mono font-semibold flex-shrink-0" style={{ borderRadius: 2 }}>
                              {i + 1}
                            </span>
                            <span className="text-sm text-[#000028] font-medium truncate">
                              {c.name}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0 ml-3">
                            <div className="font-mono text-sm font-semibold text-[#000028]">
                              {formatCurrency(c.total, language)}
                            </div>
                            <div className="text-[10px] text-[#6B7280]">
                              {c.count} {language === "fr" ? "doc(s)" : "doc(s)"}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#E5E7EB] bg-[#FAFAF9] flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
            {quotes.length} {language === "fr" ? "document(s) au total" : "document(s) total"}
          </span>
          <button onClick={onClose} className="k-btn-secondary !py-2 !px-4 text-xs">
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent: "ink" | "gold" | "green";
}) {
  const accentColor =
    accent === "gold" ? "#D4AF37" : accent === "green" ? "#4B8A6B" : "#000028";
  return (
    <div className="k-card !p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span
          className="w-7 h-7 flex items-center justify-center"
          style={{ backgroundColor: accentColor, borderRadius: 2, color: "white" }}
        >
          {icon}
        </span>
      </div>
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280] mb-1">
          {label}
        </div>
        <div className="font-serif text-xl font-semibold text-[#000028] leading-tight">
          {value}
        </div>
        {hint && (
          <div className="text-[10px] text-[#6B7280] font-mono mt-0.5">{hint}</div>
        )}
      </div>
    </div>
  );
}
