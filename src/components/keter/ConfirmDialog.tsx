"use client";

import { X, AlertTriangle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Custom confirmation modal — replaces browser's native confirm() dialog.
 * Matches the Keter brand styling (ink black, gold accent, hairline borders).
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-[#000028]/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <div
        className="bg-white border border-[#E5E7EB] w-full max-w-md flex flex-col"
        style={{ borderRadius: "var(--radius)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4 border-b border-[#E5E7EB]">
          <div className="flex items-start gap-3">
            {variant === "danger" && (
              <div className="w-9 h-9 rounded-full bg-[#FEF2F2] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
              </div>
            )}
            <div>
              <div className="k-section-marker">
                {variant === "danger" ? "Danger zone" : "Confirmation"}
              </div>
              <h3 className="font-serif text-base font-semibold text-[#000028] mt-0.5">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-[#6B7280] hover:text-[#000028] hover:bg-[#F3F4F6] transition-colors"
            style={{ borderRadius: "var(--radius)" }}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-sm text-[#374151] leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[#E5E7EB] bg-[#FAFAF9]">
          <button
            onClick={onCancel}
            className="k-btn-secondary !py-2 !px-4 text-xs"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={
              variant === "danger"
                ? "inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#B91C1C] text-white text-xs font-medium hover:bg-[#991B1B] transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-[#D4AF37] focus-visible:outline-offset-2"
                : "k-btn-primary !py-2 !px-4 text-xs"
            }
            style={{ borderRadius: "var(--radius)" }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
