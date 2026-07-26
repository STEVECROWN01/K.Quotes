"use client";

import { useMemo } from "react";
import { renderDocumentHtml, type DocumentPayload } from "./document-html";

/**
 * LivePreview — renders the actual PDF document HTML inside a scaled iframe.
 * Updates in real time as the user fills the form.
 *
 * Uses a SINGLE iframe with the full HTML (both pages) to ensure CSS works
 * on both pages. The iframe has scrolling disabled and overflow hidden —
 * only the outer container scrolls. A visual gap between pages is created
 * via CSS margin on the second .page div (injected into the iframe HTML).
 */
export function LivePreview({ payload }: { payload: DocumentPayload }) {
  const html = useMemo(() => {
    const full = renderDocumentHtml(payload);
    // Inject CSS to add a VISUAL GAP between the two pages in the iframe
    // and hide the iframe's own scrollbar
    const extraCss = `
      <style>
        /* Add visible gap between page 1 and page 2 for preview display */
        .page:first-child {
          margin-bottom: 15mm !important;
          border-bottom: none;
        }
        /* Add a subtle shadow/gap visual */
        .page:last-child {
          margin-top: 0 !important;
        }
        /* Hide scrollbar inside iframe */
        ::-webkit-scrollbar { display: none; }
        body { -ms-overflow-style: none; scrollbar-width: none; }
      </style>
    `;
    return full.replace("</head>", extraCss + "</head>");
  }, [payload]);

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

      {/* Preview area — only this scrolls. Single iframe, no inner scrollbar. */}
      <div className="flex-1 overflow-auto bg-[#F3F4F6] p-4 md:p-6">
        <div
          style={{
            transform: "scale(0.80)",
            transformOrigin: "top center",
            width: "210mm",
            // 2 pages + gap: 297mm + 15mm + 297mm = 609mm
            height: "609mm",
            margin: "0 auto",
            boxShadow: "0 4px 24px rgba(0,0,40,0.12)",
          }}
          className="bg-white"
        >
          <iframe
            title="Document preview"
            srcDoc={html}
            scrolling="no"
            style={{
              width: "210mm",
              height: "609mm",
              border: "none",
              display: "block",
              background: "white",
              overflow: "hidden",
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
