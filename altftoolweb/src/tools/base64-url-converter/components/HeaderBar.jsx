"use client";

import { useState } from "react";
import { HelpCircle, Link, X } from "lucide-react";

function HowItWorksDialog({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="How Base64 URL conversion works"
        onClick={(event) => event.stopPropagation()}
        className="max-h-[85vh] w-full max-w-lg overflow-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">How it works</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg border border-slate-200 dark:border-slate-800 p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X aria-hidden="true" size={16} />
          </button>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
          <p>
            Standard Base64 uses <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:text-blue-400">+</code> and{" "}
            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-blue-600 dark:text-blue-400">/</code>, which break inside URLs,
            filenames, and query parameters. The URL-safe variant (RFC 4648 §5) replaces them with{" "}
            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">-</code> and{" "}
            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-emerald-600 dark:text-emerald-400">_</code>, and removes the{" "}
            <code className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-300">=</code> padding.
          </p>
          <div>
            <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">Encode to URL-safe</h3>
            <p>
              Paste standard Base64 on the left — every <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">+</code> becomes <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">-</code>,{" "}
              <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">/</code> becomes <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">_</code>, and padding is safely stripped.
            </p>
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-slate-900 dark:text-white">Decode from URL-safe</h3>
            <p>
              Reverses the process: characters are converted back and valid <code className="rounded bg-slate-100 dark:bg-slate-800 px-1 font-mono text-xs">=</code> padding is appended to restore standard Base64.
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
            🔒 Privacy First: All processing happens 100% locally in your browser. No data is sent to external servers.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function HeaderBar() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-2">
      <div className="flex items-center gap-3.5">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
          <Link aria-hidden="true" size={24} className="stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Base64 URL Converter
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Convert Base64 strings to URL-safe format and vice versa instantly.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setHelpOpen(true)}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        >
          <HelpCircle aria-hidden="true" size={15} className="text-slate-500" />
          <span>How it works</span>
        </button>
      </div>

      {helpOpen && <HowItWorksDialog onClose={() => setHelpOpen(false)} />}
    </header>
  );
}
