"use client";

import { useMemo, useState, useEffect } from "react";
import { renderDocumentHtml, type DocumentPayload } from "./document-html";

/**
 * LivePreview — renders the actual PDF document as TWO SEPARATE page containers.
 *
 * Each page is its own white "sheet" with its own shadow, stacked vertically
 * with a small gray gap between them. Scale is responsive:
 *   - Mobile (< 640px):  0.40
 *   - Tablet (< 1024px): 0.55
 *   - Desktop (≥ 1024px): 0.80
 */
export function LivePreview({ payload }: { payload: DocumentPayload }) {
  const { page1Html, page2Html } = useMemo(() => {
    const full = renderDocumentHtml(payload);

    // Extract the <head> (styles) to reuse in both pages
    const headMatch = full.match(/<head>[\s\S]*?<\/head>/);
    const head = headMatch ? headMatch[0] : "";

    // Split at the "PAGE 2" comment marker
    const splitMarker = "<!-- ============ PAGE 2 ============ -->";
    const parts = full.split(splitMarker);

    // Page 1: extract body content from parts[0]
    const body1Match = parts[0].match(/<body>([\s\S]*)$/);
    const body1Content = body1Match ? body1Match[1] : parts[0];
    const page1Html = `<!DOCTYPE html><html lang="${payload.language}">${head}<body>${body1Content}</body></html>`;

    // Page 2: use parts[1], clean closing tags
    const body2Content = parts[1] || "";
    const body2Clean = body2Content.replace(/<\/body>\s*<\/html>\s*$/, "");
    const page2Html = `<!DOCTYPE html><html lang="${payload.language}">${head}<body>${body2Clean}</body></html>`;

    return { page1Html, page2Html };
  }, [payload]);

  // Responsive scale
  const [scale, setScale] = useState(0.80);

  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      if (w < 640) setScale(0.40);
      else if (w < 1024) setScale(0.55);
      else setScale(0.80);
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  // Negative margin compensates for the unscaled portion so pages sit close
  const marginBottom = `-${297 * (1 - scale)}mm`;

  const pageWrapperStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: "top center",
    width: "210mm",
    height: "297mm",
    marginBottom,
    flexShrink: 0,
  };

  const iframeStyle: React.CSSProperties = {
    width: "210mm",
    height: "297mm",
    border: "none",
    display: "block",
    background: "white",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,40,0.18)",
  };

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

      {/* Preview area — TWO SEPARATE page containers with small gray gap */}
      <div className="flex-1 overflow-auto bg-[#F3F4F6] p-3 md:p-6">
        <div className="flex flex-col items-center gap-2">
          {/* PAGE 1 */}
          <div style={pageWrapperStyle}>
            <iframe
              title="Document preview — Page 1"
              srcDoc={page1Html}
              scrolling="no"
              style={iframeStyle}
            />
          </div>
          {/* PAGE 2 */}
          <div style={pageWrapperStyle}>
            <iframe
              title="Document preview — Page 2"
              srcDoc={page2Html}
              scrolling="no"
              style={iframeStyle}
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
