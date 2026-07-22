import React from 'react';
import { AlignLeft, ClipboardPaste, Code2, FileCode2, Minimize2, Quote, Trash2 } from 'lucide-react';

const modes = [
  { key: 'format', label: 'Beautify', icon: <AlignLeft size={16} /> },
  { key: 'compress', label: 'Compress', icon: <Minimize2 size={16} /> },
  { key: 'escape', label: 'Escape', icon: <Quote size={16} /> },
];

export default function SqlEditor({ value, mode, indentSize, uppercaseKeywords, inputMetrics, onChange, onModeChange, onIndentChange, onUppercaseChange, onSample, onClear }) {
  return (
    <section className="min-w-0 rounded-2xl border border-[var(--card-border)] bg-[var(--card)]/70 p-5 shadow-lg backdrop-blur-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-[var(--primary)]">
            <Code2 size={16} />
            SQL Input
          </h2>
          <p className="mt-1 text-xs text-[var(--secondary-foreground)]">
            Paste a query string, log statement, migration, or report SQL.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={onSample} className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm">
            <ClipboardPaste size={16} />
            Sample
          </button>
          <button type="button" onClick={onClear} className="btn-secondary inline-flex items-center gap-2 px-3 py-2 text-sm">
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-1.5">
        {modes.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onModeChange(item.key)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${
              mode === item.key
                ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                : 'text-[var(--secondary-foreground)] hover:bg-[var(--secondary-hover)]'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--input-border)] bg-[var(--background)] px-4 py-2">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[var(--secondary-foreground)]">
            <FileCode2 size={14} />
            source.sql
          </span>
          <span className="font-mono text-xs text-[var(--primary)]">
            {inputMetrics.lines} lines · {inputMetrics.characters} chars
          </span>
        </div>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-h-[520px] w-full resize-y bg-[var(--input-bg)] p-4 font-mono text-sm leading-6 text-[var(--foreground)] outline-none"
          placeholder="Paste or type SQL here..."
          spellCheck={false}
        />
      </div>

      <div className="mt-4 rounded-xl border border-[var(--card-border)] bg-[var(--background)] p-4">
        <label className="block">
          <span className="mb-3 flex w-full items-center justify-between gap-4 text-xs font-bold uppercase tracking-wide text-[var(--secondary-foreground)]">
            <span>Indent</span>
            <span className="whitespace-nowrap rounded-lg border border-[var(--card-border)] px-2 py-1 font-mono text-[var(--primary)]">
              {indentSize} spaces
            </span>
          </span>
          <input
            type="range"
            min={2}
            max={8}
            step={2}
            value={indentSize}
            onChange={(event) => onIndentChange(Number(event.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full border border-[var(--input-border)] bg-[var(--input-bg)] accent-[var(--primary)]"
          />
        </label>

        <label className="mt-4 flex w-full items-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)]/70 px-4 py-3">
          <input
            type="checkbox"
            checked={uppercaseKeywords}
            onChange={(event) => onUppercaseChange(event.target.checked)}
            className="h-4 w-4 accent-[var(--primary)]"
          />
          <span className="min-w-0 text-sm font-semibold text-[var(--foreground)]">Uppercase SQL keywords</span>
        </label>
      </div>
    </section>
  );
}
