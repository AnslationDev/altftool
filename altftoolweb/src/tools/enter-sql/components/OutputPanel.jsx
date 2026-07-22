import React, { useState } from 'react';
import { Check, Copy, Download, FileCheck2, Sparkles } from 'lucide-react';

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
    link.download = mode === 'compress' ? 'compressed.sql' : 'formatted.sql';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <section className="min-w-0 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
            <Sparkles size={16} />
            Output
          </h2>
          <p className="mt-1 text-xs text-[var(--secondary-foreground)]">
            {outputLabel(mode)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={copyOutput} className="btn-primary inline-flex items-center gap-2 px-3 py-2 text-sm">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button type="button" onClick={downloadOutput} className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm">
            <Download size={16} />
            Download
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--input-border)] bg-[var(--background)] px-4 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--secondary-foreground)]">
            <FileCheck2 size={14} />
            {fileName(mode)}
          </span>
          <span className="font-mono text-xs text-[var(--primary)]">
            {metrics.lines} lines · {metrics.characters} chars
          </span>
        </div>
        <textarea
          readOnly
          value={output || 'Formatted SQL will appear here.'}
          className="min-h-[520px] w-full resize-y bg-[var(--input-bg)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none"
          spellCheck={false}
        />
      </div>
    </section>
  );
}

function outputLabel(mode) {
  if (mode === 'compress') return 'Whitespace-minified SQL ready for compact storage.';
  if (mode === 'escape') return 'Compressed SQL escaped for code strings and form fields.';
  return 'Readable SQL with clauses split into reviewable lines.';
}

function fileName(mode) {
  if (mode === 'compress') return 'compressed.sql';
  if (mode === 'escape') return 'escaped-string.sql';
  return 'formatted.sql';
}
