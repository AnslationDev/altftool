"use client";



import { useState } from "react";

export  function FingerprintID({ fingerprintId, loading }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!fingerprintId) return;
    try {
      await navigator.clipboard.writeText(fingerprintId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const el = document.createElement("textarea");
      el.value = fingerprintId;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="
      relative overflow-hidden
      bg-[(--card)] border border-[(--border)]
      rounded-2xl p-6 md:p-8
      shadow-sm
    ">
      {/* Subtle background glow */}
      <div className="
        pointer-events-none absolute -top-20 -right-20
        w-64 h-64 rounded-full
        bg-[(--primary)]/5
        blur-3xl animate-pulse-soft
      " />

      {/* Label */}
      <p className="
        text-xs uppercase tracking-widest
        text-[(--muted-foreground)] font-secondary mb-3
      ">
        Your Browser Fingerprint ID
      </p>

      {loading ? (
        /* Loading state */
        <div className="space-y-2 animate-pulse">
          <div className="h-6 bg-[(--muted)] rounded-full w-full" />
          <div className="h-6 bg-[(--muted)] rounded-full w-3/4" />
        </div>
      ) : (
        <>
          {/* Hash display */}
          <div className="
            font-mono text-sm sm:text-base md:text-lg
            break-all leading-relaxed
            text-gradient-hero font-bold
            mb-4 select-all
          ">
            {fingerprintId || "Generating..."}
          </div>

          {/* Bottom row: hash info + copy button */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              {/* Lock icon */}
              <svg className="w-3.5 h-3.5 text-[(--muted-foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs text-[var(--muted-foreground)] font-secondary">
                SHA-256 · 256-bit · Locally generated
              </span>
            </div>

            {/* Copy button */}
            <button
              onClick={handleCopy}
              className={`
                flex items-center gap-2 px-4 py-2
                text-xs font-semibold rounded-xl
                border transition-all duration-200 cursor-pointer
                ${copied
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-[(--muted)] border-[(--border)] text-[(--foreground)] hover:bg-[(--primary)]/10 hover:border-[(--primary)]/30 hover:text-[(--primary)]"
                }
              `}
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Hash
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}