"use client";

import { Check, Copy, Download } from "lucide-react";

export default function CodePanel({ css, copied, onCopy, onDownload }) {
  return (
    <section className="font-css-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-black text-[var(--foreground)]">Generated CSS</h2>
          <p className="text-xs text-[var(--muted-foreground)]">Ready to paste into your stylesheet.</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={onCopy} className="font-css-action">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={onDownload} className="font-css-action">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>
      <pre className="max-h-[360px] overflow-auto rounded-2xl bg-slate-950 p-4 text-sm leading-relaxed text-slate-100 whitespace-pre-wrap break-words">
        <code>{css}</code>
      </pre>
    </section>
  );
}
