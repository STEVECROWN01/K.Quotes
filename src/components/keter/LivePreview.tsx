"use client";

import { useMemo } from "react";
import { renderDocumentHtml, type DocumentPayload } from "./document-html";

/**
 * LivePreview — renders the actual PDF document HTML inside a scaled iframe.
 * Updates in real time as the user fills the form.
 *
 * Layout:
 *   - Outer container: k-card, fills the right column
 *   - Inner scroll area: only ONE scrollbar (the outer one)
 *   - Two separate page iframes stacked with a gap between them
 *   - No inner scrollbars on the iframes themselves
 */
export function LivePreview({ payload }: { payload: DocumentPayload }) {
  const html = useMemo(() => renderDocumentHtml(payload), [payload]);

  // Split the HTML into two pages at the page break.
  // Each iframe renders ONE page (height = 297mm), so no inner scrollbar.
  // The outer container provides the only scroll.
  const page1Html = html.replace(
    /<!-- ============ PAGE 2 ============ -->[\s\S]*$/,
    "</body></html>"
  );
  const page2Html = html.replace(
    /^[\s\S]*<!-- ============ PAGE 2 ============ -->/,
    `<!DOCTYPE html><html lang="${payload.language}"><head><meta charset="utf-8"/><style>body{margin:0;padding:0;}</style></head><body><!-- ============ PAGE 2 ============ -->`
  );

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

      {/* Preview area — only this scrolls. Two separate pages with a gap. */}
      <div className="flex-1 overflow-auto bg-[#F3F4F6] p-4 md:p-6">
        <div className="flex flex-col items-center gap-4">
          {/* Page 1 */}
          <div
            style={{
              transform: "scale(0.80)",
              transformOrigin: "top center",
              width: "210mm",
              height: "297mm",
              marginBottom: "-50mm", // compensate for scale to reduce visual gap
              boxShadow: "0 4px 24px rgba(0,0,40,0.12)",
            }}
            className="bg-white flex-shrink-0"
          >
            <iframe
              title="Document preview — Page 1"
              srcDoc={page1Html}
              scrolling="no"
              style={{
                width: "210mm",
                height: "297mm",
                border: "none",
                display: "block",
                background: "white",
                overflow: "hidden",
              }}
            />
          </div>

          {/* Page 2 */}
          <div
            style={{
              transform: "scale(0.80)",
              transformOrigin: "top center",
              width: "210mm",
              height: "297mm",
              boxShadow: "0 4px 24px rgba(0,0,40,0.12)",
            }}
            className="bg-white flex-shrink-0"
          >
            <iframe
              title="Document preview — Page 2"
              srcDoc={page2Html}
              scrolling="no"
              style={{
                width: "210mm",
                height: "297mm",
                border: "none",
                display: "block",
                background: "white",
                overflow: "hidden",
              }}
            />
          </div>
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
