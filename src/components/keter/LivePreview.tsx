"use client";

import { useMemo } from "react";
import { renderDocumentHtml, type DocumentPayload } from "./document-html";

/**
 * LivePreview — renders the actual PDF document as TWO SEPARATE page containers.
 *
 * Each page is its own white "sheet" with its own shadow, stacked vertically
 * with a visible gray gap between them. This makes it clear they are two
 * separate pages, not one continuous page.
 *
 * Implementation: render the full HTML once in a hidden iframe to extract
 * the page 1 and page 2 DOM separately, OR split the HTML string at the
 * page boundary and render each in its own iframe.
 */
export function LivePreview({ payload }: { payload: DocumentPayload }) {
  const { page1Html, page2Html } = useMemo(() => {
    const full = renderDocumentHtml(payload);

    // Split at the "PAGE 2" comment marker
    const splitMarker = "<!-- ============ PAGE 2 ============ -->";
    const parts = full.split(splitMarker);

    // Page 1: everything before the PAGE 2 marker, close the html tags
    const page1Html =
      parts[0]
        .replace(/<div class="page">[\s\S]*$/, "") // remove the page-2 div start if any
        .replace(/<\/body>[\s\S]*<\/html>\s*$/, "") + // remove closing tags if present
      "</body></html>";

    // Page 2: build a complete HTML doc with the same <head> (styles) + only page 2 content
    const headMatch = full.match(/<head>[\s\S]*?<\/head>/);
    const head = headMatch ? headMatch[0] : "";
    const page2Html = `<!DOCTYPE html><html lang="${payload.language}">${head}<body>${splitMarker}${parts[1] || ""}</body></html>`;

    return { page1Html, page2Html };
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

      {/* Preview area — TWO SEPARATE page containers with visible gray gap between them */}
      <div className="flex-1 overflow-auto bg-[#F3F4F6] p-4 md:p-6">
        <div className="flex flex-col items-center gap-2">
          {/* PAGE 1 — its own white sheet with shadow */}
          <div
            style={{
              transform: "scale(0.80)",
              transformOrigin: "top center",
              width: "210mm",
              height: "297mm",
              flexShrink: 0,
            }}
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
                boxShadow: "0 4px 24px rgba(0,0,40,0.18)",
              }}
            />
          </div>

          {/* PAGE 2 — its own white sheet with shadow, clearly separated */}
          <div
            style={{
              transform: "scale(0.80)",
              transformOrigin: "top center",
              width: "210mm",
              height: "297mm",
              flexShrink: 0,
            }}
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
                boxShadow: "0 4px 24px rgba(0,0,40,0.18)",
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
