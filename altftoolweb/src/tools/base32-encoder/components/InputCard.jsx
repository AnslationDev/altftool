"use client";

import { Check, Lock, Settings2, Trash2 } from "lucide-react";

const MAX_LENGTH = 10000;

export default function InputCard({
  input,
  onInputChange,
  alphabetCase,
  onAlphabetCaseChange,
  paddingMode,
  onPaddingModeChange,
  lineLength,
  onLineLengthChange,
  onEncode,
  encoded,
}) {
  const selectClass =
    "min-h-10 w-full rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30";

  return (
    <section aria-label="Input" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            1
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Input</h2>
            <p className="text-xs text-muted-foreground">Enter text or data to encode in Base32</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onInputChange("")}
          disabled={!input}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-danger/40 hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 aria-hidden="true" size={13} /> Clear
        </button>
      </div>

      <label htmlFor="base32-input" className="sr-only">
        Text to encode
      </label>
      <textarea
        id="base32-input"
        value={input}
        maxLength={MAX_LENGTH}
        onChange={(event) => onInputChange(event.target.value)}
        rows={5}
        placeholder="Type or paste your text here…"
        className="w-full resize-y rounded-xl border border-border bg-background p-4 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30"
      />
      <p className="mt-1 text-right text-[11px] tabular-nums text-muted-foreground">
        {input.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}
      </p>

      <h3 className="mt-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <Settings2 aria-hidden="true" size={15} className="text-primary" /> Encoding Options
      </h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="alphabet-case" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Alphabet Case
          </label>
          <select
            id="alphabet-case"
            value={alphabetCase}
            onChange={(event) => onAlphabetCaseChange(event.target.value)}
            className={selectClass}
          >
            <option value="upper">Uppercase (A–Z)</option>
            <option value="lower">Lowercase (a–z)</option>
          </select>
        </div>
        <div>
          <label htmlFor="padding-mode" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Padding
          </label>
          <select
            id="padding-mode"
            value={paddingMode}
            onChange={(event) => onPaddingModeChange(event.target.value)}
            className={selectClass}
          >
            <option value="with">With Padding</option>
            <option value="without">Without Padding</option>
          </select>
        </div>
        <div>
          <label htmlFor="line-length" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Line Length (Optional)
          </label>
          <input
            id="line-length"
            type="number"
            min={0}
            max={512}
            value={lineLength}
            onChange={(event) => onLineLengthChange(event.target.value)}
            placeholder="e.g. 64"
            className={selectClass}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">0 for no wrap</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onEncode}
        className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-secondary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        {encoded ? <Check aria-hidden="true" size={16} /> : <Lock aria-hidden="true" size={15} />}
        {encoded ? "Encoded!" : "Encode to Base32"}
      </button>
    </section>
  );
}
