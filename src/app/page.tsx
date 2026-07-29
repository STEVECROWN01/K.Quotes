"use client";

import { useState, useCallback, useEffect } from "react";
import { FileText, List, Sparkles, Loader2, Eye, X, BarChart3 } from "lucide-react";
import { QuoteForm, initialFormState, formStateToPayload, quoteRecordToFormState, type FormState } from "@/components/keter/QuoteForm";
import { LivePreview } from "@/components/keter/LivePreview";
import { MyQuotesDialog } from "@/components/keter/MyQuotesDialog";
import { DashboardDialog } from "@/components/keter/DashboardDialog";
import { ConfirmDialog } from "@/components/keter/ConfirmDialog";
import { GenerateInvoiceModal } from "@/components/keter/GenerateInvoiceModal";
import { UI, buildDocNumber } from "@/lib/i18n";
import type { QuoteRecord } from "@/lib/storage";
import { toast } from "sonner";

export default function Home() {
  // Load saved form state from localStorage on initial render
  const [formState, setFormState] = useState<FormState>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("keter_form_state");
        if (saved) return { ...initialFormState, ...JSON.parse(saved) };
      } catch {}
    }
    return initialFormState;
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [originalState, setOriginalState] = useState<FormState | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [myQuotesOpen, setMyQuotesOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<QuoteRecord | null>(null);
  const [saveChangesConfirm, setSaveChangesConfirm] = useState(false);
  const [revertChangesConfirm, setRevertChangesConfirm] = useState(false);
  const [invoiceModalQuote, setInvoiceModalQuote] = useState<QuoteRecord | null>(null);

  // UI is always in English; document language is separate (defaults to French)
  const t = UI["en"];

  const payload = formStateToPayload(formState);

  // Persist form state to localStorage (debounced to avoid excessive writes)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem("keter_form_state", JSON.stringify(formState));
      } catch {}
    }, 500);
    return () => clearTimeout(timer);
  }, [formState]);

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

  // Save changes to an existing quote (edit mode) — opens confirmation modal
  const handleSaveChanges = useCallback(() => {
    if (!editingId) return;
    setSaveChangesConfirm(true);
  }, [editingId]);

  // Actually perform the save after confirmation
  const performSaveChanges = useCallback(async () => {
    if (!editingId) return;
    setSaveChangesConfirm(false);
    setSaving(true);
    try {
      const body = {
        id: editingId,
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
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save changes");
      }
      
      // If email self-copy is checked, generate PDF and send email
      let emailSent = false;
      if (formState.emailSelfCopy) {
        try {
          const pdfRes = await fetch("/api/pdf", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, emailSelfCopy: true, saveToDb: false }),
          });
          if (pdfRes.ok) {
            emailSent = pdfRes.headers.get("X-Email-Sent") === "1";
          }
        } catch (e) {
          console.warn("Email send failed:", e);
        }
      }
      
      // Update originalState so form is no longer dirty
      const newFs = { ...formState };
      setOriginalState(newFs);
      
      // Show appropriate toast
      if (formState.emailSelfCopy && emailSent) {
        toast.success(
          formState.language === "fr"
            ? "Modifications enregistrées + copie envoyée par email"
            : "Changes saved + copy emailed"
        );
      } else if (formState.emailSelfCopy) {
        toast.success(
          formState.language === "fr"
            ? "Modifications enregistrées (email non envoyé)"
            : "Changes saved (email not sent)"
        );
      } else {
        toast.success(
          formState.language === "fr"
            ? "Modifications enregistrées"
            : "Changes saved"
        );
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }, [editingId, payload, formState]);

  // Revert changes — opens confirmation modal
  const handleRevertChanges = useCallback(() => {
    setRevertChangesConfirm(true);
  }, []);

  // Actually perform the revert after confirmation
  const performRevertChanges = useCallback(() => {
    setRevertChangesConfirm(false);
    if (originalState) {
      setFormState(originalState);
      toast.success(formState.language === "fr" ? "Modifications annulées" : "Changes reverted");
    }
  }, [originalState, formState.language]);

  // Check if form is dirty (has unsaved changes) when in edit mode
  const isDirty = editingId !== null && originalState !== null && JSON.stringify(formState) !== JSON.stringify(originalState);

  const handleLoadQuote = useCallback(
    (q: QuoteRecord) => {
      const fs = quoteRecordToFormState(q);
      setFormState(fs);
      setOriginalState(fs);
      setEditingId(q.id);
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
    (q: QuoteRecord) => {
      setInvoiceModalQuote(q);
    },
    []
  );

  const confirmGenerateInvoice = useCallback(
    async (paymentMethod: string, paymentDate: string) => {
      if (!invoiceModalQuote) return;
      try {
        const res = await fetch(`/api/quotes/${invoiceModalQuote.id}/invoice`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentStatus: "Payé",
            paymentDate,
            paymentMethod,
          }),
        });
        if (!res.ok) throw new Error("Failed to generate invoice");
        const d = await res.json();
        const invoice = d.invoice as QuoteRecord;
        setFormState(quoteRecordToFormState(invoice));
        setInvoiceModalQuote(null);
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
    [invoiceModalQuote, formState.language]
  );

  const handleDelete = useCallback(
    (q: QuoteRecord) => {
      setDeleteTarget(q);
    },
    []
  );

  const confirmDelete = useCallback(
    async () => {
      if (!deleteTarget) return;
      try {
        await fetch(`/api/quotes/${deleteTarget.id}`, { method: "DELETE" });
        setDeleteTarget(null);
        setMyQuotesOpen(false);
        setTimeout(() => setMyQuotesOpen(true), 50); // refresh
        toast.success(
          formState.language === "fr" ? "Supprimé" : "Deleted"
        );
      } catch (e: any) {
        toast.error(e.message);
      }
    },
    [deleteTarget, formState.language]
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
                setEditingId(null);
                setOriginalState(null);
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
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-6 lg:gap-8">
          {/* Left — form */}
          <div className="space-y-5">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="k-section-marker">
                  {formState.docType === "devis" ? t.devis : t.facture}
                </div>
                <h1 className="font-serif text-2xl md:text-3xl font-semibold text-[#000028] mt-0.5">
                  {editingId
                    ? (formState.language === "fr"
                        ? `Modifier le ${formState.docType === "devis" ? "Devis" : "Facture"}`
                        : `Edit ${formState.docType === "devis" ? "Quote" : "Invoice"}`)
                    : (formState.language === "fr"
                        ? `Créer un ${formState.docType === "devis" ? "Devis" : "Facture"}`
                        : `Create ${formState.docType === "devis" ? "a Quote" : "an Invoice"}`)}
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
              onSaveChanges={handleSaveChanges}
              onRevertChanges={handleRevertChanges}
              editingId={editingId}
              isDirty={isDirty}
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

      {/* ===== Mobile preview drawer — full-width bottom sheet ===== */}
      {mobilePreviewOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-[#000028]/50 backdrop-blur-sm flex items-end"
          onClick={() => setMobilePreviewOpen(false)}
        >
          <div
            className="w-full h-[90vh] bg-[#F3F4F6] flex flex-col rounded-t-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5E7EB] rounded-t-xl">
              <div className="flex items-center gap-2">
                <span className="font-serif text-sm font-semibold text-[#000028]">
                  {t.livePreview}
                </span>
              </div>
              <button
                onClick={() => setMobilePreviewOpen(false)}
                className="p-2 text-[#6B7280] hover:text-[#000028] hover:bg-[#F3F4F6] transition-colors"
                style={{ borderRadius: "var(--radius)" }}
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

      {/* ===== Custom confirm dialog (replaces browser confirm()) ===== */}
      <ConfirmDialog
        open={!!deleteTarget}
        title={
          formState.language === "fr"
            ? "Supprimer ce document ?"
            : "Delete this document?"
        }
        message={
          deleteTarget
            ? formState.language === "fr"
              ? `Êtes-vous sûr de vouloir supprimer "${deleteTarget.quoteNumber} — ${deleteTarget.fullName}" ?${
                  deleteTarget.docType === "facture"
                    ? " Le devis original repassera au statut « saved »."
                    : ""
                }`
              : `Are you sure you want to delete "${deleteTarget.quoteNumber} — ${deleteTarget.fullName}"?${
                  deleteTarget.docType === "facture"
                    ? " The original quote will revert to \"saved\" status."
                    : ""
                }`
            : ""
        }
        confirmLabel={formState.language === "fr" ? "Supprimer" : "Delete"}
        cancelLabel={formState.language === "fr" ? "Annuler" : "Cancel"}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ===== Save Changes confirmation modal ===== */}
      <ConfirmDialog
        open={saveChangesConfirm}
        title={
          formState.language === "fr"
            ? "Enregistrer les modifications ?"
            : "Save changes?"
        }
        message={
          formState.language === "fr"
            ? `Voulez-vous enregistrer les modifications apportées à ce document ?${
                formState.emailSelfCopy
                  ? " Une copie du PDF sera envoyée par email."
                  : ""
              }`
            : `Do you want to save the changes made to this document?${
                formState.emailSelfCopy
                  ? " A copy of the PDF will be sent by email."
                  : ""
              }`
        }
        confirmLabel={formState.language === "fr" ? "Enregistrer" : "Save"}
        cancelLabel={formState.language === "fr" ? "Annuler" : "Cancel"}
        variant="default"
        onConfirm={performSaveChanges}
        onCancel={() => setSaveChangesConfirm(false)}
      />

      {/* ===== Revert Changes confirmation modal ===== */}
      <ConfirmDialog
        open={revertChangesConfirm}
        title={
          formState.language === "fr"
            ? "Annuler les modifications ?"
            : "Revert changes?"
        }
        message={
          formState.language === "fr"
            ? "Voulez-vous annuler toutes les modifications non enregistrées et revenir à la version précédente ?"
            : "Do you want to discard all unsaved changes and revert to the previous version?"
        }
        confirmLabel={formState.language === "fr" ? "Annuler les modifications" : "Revert changes"}
        cancelLabel={formState.language === "fr" ? "Garder les modifications" : "Keep changes"}
        variant="danger"
        onConfirm={performRevertChanges}
        onCancel={() => setRevertChangesConfirm(false)}
      />

      {/* ===== Generate Invoice modal with payment method selection ===== */}
      <GenerateInvoiceModal
        open={!!invoiceModalQuote}
        language={formState.language}
        quote={invoiceModalQuote}
        onClose={() => setInvoiceModalQuote(null)}
        onConfirm={confirmGenerateInvoice}
      />
    </div>
  );
}
