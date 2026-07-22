"use client";

import React from 'react';
import { FileCode2, Trash2, ClipboardPaste } from 'lucide-react';

export default function TextInput({ value, onChange, onClear, onSample, metrics }) {
  return (
    <section className="w-full min-w-0 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
            <FileCode2 size={16} />
            Input Text
          </h2>
          <p className="mt-1 text-xs text-[var(--secondary-foreground)]">
            Paste any text to compress or decompress gzip data.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSample}
            className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            <ClipboardPaste size={16} />
            Sample
          </button>
          <button
            type="button"
            onClick={onClear}
            className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--input-border)] bg-[var(--background)] px-4 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--secondary-foreground)]">
            <FileCode2 size={14} />
            input.txt
          </span>
          <span className="font-mono text-xs text-[var(--primary)]">
            {metrics.characters} chars · {metrics.lines} lines
          </span>
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-[400px] w-full resize-none overflow-auto bg-[var(--input-bg)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none"
          placeholder="Paste text here..."
          spellCheck={false}
        />
      </div>
    </section>
  );
}
