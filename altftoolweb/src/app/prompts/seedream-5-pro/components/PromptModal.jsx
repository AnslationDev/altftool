"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import CopyButton from "./CopyButton";

/**
 * Accessible modal that displays the full prompt text with a copy action.
 * Closes on Escape, backdrop click, or the close button. Locks body scroll
 * and restores focus to the trigger on close.
 */
export default function PromptModal({ prompt, onClose, triggerRef }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const lastFocused = useRef(null);

  useEffect(() => {
    if (!prompt) return undefined;

    lastFocused.current = document.activeElement;
    // Snapshot the trigger now (it's set before the modal opens); reading a ref
    // in cleanup is discouraged and the value is stable for the modal's lifetime.
    const returnTarget = triggerRef?.current || null;
    const { body } = document;
    const prevOverflow = body.style.overflow;
    body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap: keep Tab / Shift+Tab cycling within the dialog panel.
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    // Move focus into the dialog for keyboard + screen-reader users.
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 0);

    return () => {
      document.removeEventListener("keydown", onKey);
      clearTimeout(focusTimer);
      body.style.overflow = prevOverflow;
      // Prefer the explicit trigger element (mouse clicks don't focus buttons
      // in Safari/Firefox, so document.activeElement would be <body>).
      const returnEl = returnTarget || lastFocused.current;
      if (returnEl instanceof HTMLElement && returnEl !== document.body) {
        returnEl.focus();
      }
    };
  }, [prompt, onClose, triggerRef]);

  if (!prompt) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sd-modal-title"
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/55 backdrop-blur-[2px] animate-[sd-fade-in_150ms_ease-out]"
      />
      <div
        ref={panelRef}
        className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-card) shadow-2xl animate-[sd-pop-in_180ms_cubic-bezier(0.16,1,0.3,1)]"
      >
        <style>{`
          @keyframes sd-fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes sd-pop-in {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div className="flex items-center justify-between border-b border-(--color-border) px-5 py-4 sm:px-6">
          <h2
            id="sd-modal-title"
            className="text-lg font-bold text-(--color-card-foreground)"
          >
            {prompt.title || "Prompt"}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-muted-foreground) transition-colors hover:bg-(--color-muted) hover:text-(--color-foreground) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--color-primary)"
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {prompt.description ? (
            <p className="mb-3 text-sm text-(--color-muted-foreground)">
              {prompt.description}
            </p>
          ) : null}
          {prompt.model ? (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-(--color-muted) px-2.5 py-1 text-xs font-medium text-(--color-muted-foreground)">
              Model:{" "}
              <span className="font-semibold text-(--color-foreground)">
                {prompt.model}
              </span>
            </div>
          ) : null}
          <div className="rounded-xl border border-(--color-border) bg-(--color-muted)/40 p-4">
            <p className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-(--color-foreground)">
              {prompt.prompt}
            </p>
          </div>

          {Array.isArray(prompt.tags) && prompt.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-(--color-muted) px-2.5 py-1 text-[11px] font-medium text-(--color-muted-foreground)"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="border-t border-(--color-border) px-5 py-4 sm:px-6">
          <CopyButton text={prompt.prompt} size="lg" />
        </div>
      </div>
    </div>
  );
}
