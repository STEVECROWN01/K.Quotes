"use client";

import { useMemo } from "react";
import { renderDocumentHtml, type DocumentPayload } from "./document-html";

/**
 * LivePreview — renders the actual PDF document HTML inside a scaled iframe.
 * Updates in real time as the user fills the form.
 */
export function LivePreview({ payload }: { payload: DocumentPayload }) {
  const html = useMemo(() => renderDocumentHtml(payload), [payload]);

  return (
    <div className="k-card !p-0 overflow-hidden h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB] bg-[#FAFAF9]">
        <div>
          <div className="k-section-marker">Aperçu</div>
          <div className="font-serif text-sm font-semibold text-[#000028]">
            Live Preview
          </div>
        </div>
        <div className="text-[10px] font-mono text-[#6B7280] uppercase tracking-wider">
          A4 · 2 pages
        </div>
      </div>

      {/* Preview area — scaled A4 */}
      <div className="flex-1 overflow-auto bg-[#F3F4F6] p-4 md:p-6">
        <div
          style={{
            // A4 = 210mm × 297mm. Render at scale 0.75 on desktop for readability.
            // The container fits 2 pages stacked.
            transform: "scale(0.85)",
            transformOrigin: "top center",
            width: "210mm",
            height: "594mm", // 2 × 297mm
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,40,0.12)",
          }}
          className="bg-white"
        >
          <iframe
            title="Document preview"
            srcDoc={html}
            style={{
              width: "210mm",
              height: "594mm",
              border: "none",
              display: "block",
              background: "white",
            }}
          />
        </div>
      </div>

      {/* Footer hint */}
      <div className="px-4 py-2.5 border-t border-[#E5E7EB] bg-[#FAFAF9] text-[10px] text-[#6B7280] flex items-center justify-between">
        <span className="font-mono uppercase tracking-wider">
          {payload.docType === "devis" ? "Devis" : "Facture"}{" "}
          {payload.quoteNumber ?? ""}
        </span>
        <span>Mise à jour en temps réel</span>
      </div>
    </div>
  );
}
