"use client";

/**
 * Footer.jsx
 * Privacy disclaimer and attribution.
 */

export function Footer() {
  return (
    <footer className="border-t border-[(--border)] mt-5 py-8">
      <div className="section-container">
        <div className="text-center space-y-2">
          {/* Disclaimer */}
          <div className="
            inline-flex items-center gap-2 px-4 py-2.5
            bg-emerald-500/5 border border-emerald-500/20
            rounded-2xl text-xs text-emerald-600
            dark:text-emerald-400
          ">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            This tool runs entirely in your browser. No fingerprint data is stored or transmitted.
          </div>

          <p className="text-xs text-[(--muted-foreground)] font-secondary">
            Built for privacy education · All processing is local · No tracking, no storage
          </p>
        </div>
      </div>
    </footer>
  );
}