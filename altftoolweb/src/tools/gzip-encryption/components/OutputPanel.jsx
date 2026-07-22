"use client";

import React, { useState } from 'react';
import { Check, Copy, Download, Sparkles } from 'lucide-react';

export default function OutputPanel({ output, mode, metrics }) {
  const [copied, setCopied] = useState(false);

  const copyOutput = async () => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = mode === 'compress' ? 'compressed.txt' : 'decompressed.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="w-full min-w-0 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
            <Sparkles size={16} />
            Output
          </h2>
          <p className="mt-1 text-xs text-[var(--secondary-foreground)]">
            {mode === 'compress' ? 'Compressed gzip data (Base64 encoded)' : 'Decompressed text content'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={copyOutput}
            className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={downloadOutput}
            className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--input-border)] bg-[var(--background)] px-4 py-2">
          <span className="text-xs font-bold text-[var(--secondary-foreground)]">
            {mode === 'compress' ? 'compressed.txt' : 'decompressed.txt'}
          </span>
          <span className="font-mono text-xs text-[var(--primary)]">
            {metrics.characters} chars · {metrics.lines} lines
          </span>
        </div>
        <textarea
          readOnly
          value={output || 'Output will appear here.'}
          className="h-[400px] w-full resize-none overflow-auto bg-[var(--input-bg)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none"
          spellCheck={false}
        />
      </div>
    </section>
  );
}
