"use client";

import { useState, useCallback, useEffect } from "react";
import { FileText, List, Sparkles, Loader2, Eye, X, BarChart3 } from "lucide-react";
import { QuoteForm, initialFormState, formStateToPayload, quoteRecordToFormState, type FormState } from "@/components/keter/QuoteForm";
import { LivePreview } from "@/components/keter/LivePreview";
import { MyQuotesDialog } from "@/components/keter/MyQuotesDialog";
import { DashboardDialog } from "@/components/keter/DashboardDialog";
import { UI, buildDocNumber } from "@/lib/i18n";
import type { QuoteRecord } from "@/lib/storage";
import { toast } from "sonner";

export default function Home() {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myQuotesOpen, setMyQuotesOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const t = UI[formState.language];

  const payload = formStateToPayload(formState);

  // Live-update quote number when client number or doc type changes
  useEffect(() => {
    // already handled in formStateToPayload — no side effect needed
  }, [formState.clientNumber, formState.docType]);

  const handleGeneratePdf = useCallback(async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          emailSelfCopy: formState.emailSelfCopy,
          saveToDb: formState.saveOnGenerate,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        throw new Error(err.error || "Failed to generate PDF");
      }
      const blob = await res.blob();
      // Filename: Devis_D2600004_First_Last.pdf
      const docTypeLabel = payload.docType === "devis" ? "Devis" : "Facture";
      const firstLast = payload.fullName.trim().split(/\s+/);
      const first = firstLast[0] || "Client";
      const last = firstLast.slice(1).join("_") || "";
      const safeName = `${first}${last ? "_" + last : ""}`.replace(/[^a-zA-Z0-9_]/g, "");
      const filename = `${docTypeLabel}_${payload.quoteNumber}_${safeName}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Surface email self-BCC result via toast (read from response headers)
      const emailSent = res.headers.get("X-Email-Sent") === "1";
      const emailError = res.headers.get("X-Email-Error");
      if (formState.emailSelfCopy) {
        if (emailSent) {
          toast.success(
            formState.language === "fr"
              ? `PDF généré + copie envoyée par email`
              : `PDF generated + copy emailed`
          );
        } else if (emailError) {
          toast.message(
            formState.language === "fr"
              ? `PDF généré — email ignoré (${decodeURIComponent(emailError)})`
              : `PDF generated — email skipped (${decodeURIComponent(emailError)})`
          );
        } else {
          toast.success(
            formState.language === "fr"
              ? `PDF généré : ${filename}`
              : `PDF generated: ${filename}`
          );
        }
      } else {
        toast.success(
          formState.language === "fr"
            ? `PDF généré : ${filename}`
            : `PDF generated: ${filename}`
        );
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to generate PDF");
    } finally {
      setGenerating(false);
    }
  }, [payload, formState.language, formState.emailSelfCopy, formState.saveOnGenerate]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const body = {
        quoteNumber: payload.quoteNumber,
        docType: payload.docType,
        language: payload.language,
        clientNumber: payload.clientNumber,
        date: payload.date,
        fullName: payload.fullName,
        city: payload.city,
        country: payload.country,
        phone: payload.phone,
        email: payload.email,
        service: payload.service,
        priceCv: payload.priceCv,
        priceLinkedin: payload.priceLinkedin,
        cvQuantity: payload.cvQuantity,
        currency: payload.currency,
        accountHolder: payload.accountHolder,
        iban: payload.iban,
        bic: payload.bic,
        bank: payload.bank,
        paymentMode: payload.paymentMode,
        paymentConditions: payload.paymentConditions,
        paymentLink: payload.paymentLink,
        paymentStatus: payload.paymentStatus,
        paymentDate: payload.paymentDate,
        status: "saved",
      };
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown" }));
        throw new Error(err.error || "Failed to save quote");
      }
      toast.success(t.saved);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }, [payload, t.saved]);

  const handleLoadQuote = useCallback(
    (q: QuoteRecord) => {
      setFormState(quoteRecordToFormState(q));
      setMyQuotesOpen(false);
      toast.success(
        formState.language === "fr"
          ? `Devis ${q.quoteNumber} chargé`
          : `Quote ${q.quoteNumber} loaded`
      );
    },
    [formState.language]
  );

  const handleDownload = useCallback(async (q: QuoteRecord) => {
    try {
      const res = await fetch(`/api/pdf?id=${q.id}`, { method: "GET" });
      if (!res.ok) throw new Error("Failed to download");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const docTypeLabel = q.docType === "devis" ? "Devis" : "Facture";
      const firstLast = q.fullName.trim().split(/\s+/);
      const first = firstLast[0] || "Client";
      const last = firstLast.slice(1).join("_") || "";
      const safeName = `${first}${last ? "_" + last : ""}`.replace(/[^a-zA-Z0-9_]/g, "");
      a.download = `${docTypeLabel}_${q.quoteNumber}_${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message);
    }
  }, []);

  const handleGenerateInvoice = useCallback(
    async (q: QuoteRecord) => {
      try {
        const paymentDate = new Date().toISOString().slice(0, 10);
        const res = await fetch(`/api/quotes/${q.id}/invoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: "Payé",
            paymentDate,
          }),
        });
        if (!res.ok) throw new Error("Failed to generate invoice");
        const d = await res.json();
        const invoice = d.invoice as QuoteRecord;
        // Load invoice into form
        setFormState(quoteRecordToFormState(invoice));
        setMyQuotesOpen(false);
        toast.success(
          formState.language === "fr"
            ? `Facture ${invoice.quoteNumber} créée`
            : `Invoice ${invoice.quoteNumber} created`
        );
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [formState.language]
  );

  const handleDelete = useCallback(
    async (q: QuoteRecord) => {
      if (!confirm(`Delete ${q.quoteNumber}?`)) return;
      try {
        await fetch(`/api/quotes/${q.id}`, { method: "DELETE" });
        setMyQuotesOpen(false);
        setTimeout(() => setMyQuotesOpen(true), 50); // refresh
        toast.success(
          formState.language === "fr" ? "Supprimé" : "Deleted"
        );
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [formState.language]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      {/* ===== Top nav ===== */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/keter-logo.png"
              alt="Keter Marketing"
              className="h-9 w-auto"
            />
            <div className="hidden sm:block">
              <div className="font-serif text-base font-semibold text-[#000028] leading-tight">
                {t.appName}
              </div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#6B7280]">
                {t.appTagline}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDashboardOpen(true)}
              className="k-btn-secondary !py-2 !px-3 text-xs"
              title={formState.language === "fr" ? "Tableau de bord" : "Dashboard"}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{formState.language === "fr" ? "Tableau de bord" : "Dashboard"}</span>
            </button>
            <button
              onClick={() => setMyQuotesOpen(true)}
              className="k-btn-secondary !py-2 !px-3 text-xs"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.myQuotes}</span>
            </button>
            <button
              onClick={() => {
                setFormState(initialFormState);
              }}
              className="k-btn-primary !py-2 !px-3 text-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.newQuote}</span>
            </button>
          </div>
        </div>
      </header>

      {/* ===== Main 2-column layout ===== */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6 lg:gap-8">
          {/* Left — form */}
          <div className="space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="k-section-marker">
                  {formState.docType === "devis" ? t.devis : t.facture}
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#000028] mt-0.5">
                  {formState.docType === "devis" ? t.titleDevis : t.titleFacture}
                </h1>
              </div>
              {/* Mobile preview toggle */}
              <button
                onClick={() => setMobilePreviewOpen(true)}
                className="lg:hidden k-btn-secondary !py-2 !px-3 text-xs"
              >
                <Eye className="w-3.5 h-3.5" />
                {t.livePreview}
              </button>
            </div>

            <QuoteForm
              state={formState}
              setState={setFormState}
              onGeneratePdf={handleGeneratePdf}
              onSave={handleSave}
              generating={generating}
              saving={saving}
            />
          </div>

          {/* Right — live preview (desktop only) */}
          <aside className="hidden lg:block sticky top-[88px] h-[calc(100vh-120px)]">
            <LivePreview payload={payload} />
          </aside>
        </div>
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-[#000028] text-white mt-auto">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/keter-logo.png"
              alt="Keter Marketing"
              className="h-8 w-auto brightness-0 invert"
            />
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/60">
              {t.documentConfidentiel}
            </div>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-white/40">
            © {new Date().getFullYear()} Keter Marketing
          </div>
        </div>
      </footer>

      {/* ===== Mobile preview drawer ===== */}
      {mobilePreviewOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[#000028]/50 backdrop-blur-sm"
          onClick={() => setMobilePreviewOpen(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#F3F4F6] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB]">
              <span className="font-serif text-sm font-semibold">
                {t.livePreview}
              </span>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="p-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <LivePreview payload={payload} />
            </div>
          </div>
        </div>
      )}

      {/* ===== My Quotes dialog ===== */}
      <MyQuotesDialog
        open={myQuotesOpen}
        language={formState.language}
        onClose={() => setMyQuotesOpen(false)}
        onNewQuote={() => {
          setFormState(initialFormState);
          setMyQuotesOpen(false);
        }}
        onLoadQuote={handleLoadQuote}
        onGenerateInvoice={handleGenerateInvoice}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />

      {/* ===== Dashboard dialog ===== */}
      <DashboardDialog
        open={dashboardOpen}
        language={formState.language}
        onClose={() => setDashboardOpen(false)}
      />
    </div>
  );
}
