"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function PlacementPreviewModal({
  placementKey,
  placement,
  onClose,
}) {
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="placement-preview-title"
    >
      <div className="bg-[var(--surface)] w-[720px] max-h-[90vh] overflow-y-auto rounded-xl p-8 space-y-6 shadow-lg">

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h2 id="placement-preview-title" className="text-xl font-semibold">
              Placement Preview
            </h2>
            <p className="text-sm text-[var(--muted)]">
              How ads appear for <b>{placement.label}</b>
            </p>
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close"
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          <Meta label="Placement Key" value={placementKey} />
          <Meta label="Layout" value={placement.layout} />
          {placement.recommended && (
            <Meta
              label="Recommended Size"
              value={`${placement.recommended.width} × ${placement.recommended.height}px`}
            />
          )}
        </div>

        {/* Description */}
        {placement.description && (
          <div className="text-sm text-[var(--muted)]">
            {placement.description}
          </div>
        )}

        {/* Preview */}
        <div className="space-y-3">
          <div className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Visual Preview (Approximate)
          </div>

          <div className="flex justify-center">
            <div
              className="relative bg-[var(--surface-soft)] border rounded-lg flex items-center justify-center text-xs text-[var(--muted)]"
              style={{
                width: placement.recommended?.width
                  ? Math.min(placement.recommended.width, 600)
                  : 600,
                height: placement.recommended?.height
                  ? Math.min(placement.recommended.height, 200)
                  : 200,
              }}
            >
            </div>
          </div>

          <p className="text-xs text-[var(--muted-soft)] text-center">
            Actual appearance may vary slightly based on screen size.
          </p>
        </div>

        {/* Notes */}
        <div className="rounded-lg border bg-[var(--surface-soft)] p-4 text-sm space-y-1">
          <div className="font-medium text-[var(--foreground)]">
            Guidelines
          </div>
          <ul className="list-disc list-inside text-[var(--muted)]">
            <li>Keep important text centered</li>
            <li>Avoid small fonts near edges</li>
            <li>Use high contrast for better visibility</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}

/* ============================
   Meta Item
============================ */
function Meta({ label, value }) {
  return (
    <div className="space-y-1">
      <div className="text-xs uppercase tracking-wide text-[var(--muted-soft)]">
        {label}
      </div>
      <div className="font-medium text-[var(--foreground)]">
        {value}
      </div>
    </div>
  );
}