"use client";

import { Check, CheckCircle2, Clock, Copy, Download, Info } from "lucide-react";

function StatTile({ label, value, sub }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-background p-3.5">
      <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-xl font-bold tabular-nums text-foreground">{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

export default function OutputCard({ input, result, timeMs, alphabetCase, onCopy, copied, onDownload }) {
  const hasOutput = !!result.output;
  const ratio = result.ratioPercent;

  return (
    <section aria-label="Output" className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            2
          </span>
          <div>
            <h2 className="text-base font-bold text-foreground">Output</h2>
            <p className="text-xs text-muted-foreground">Your Base32 encoded result</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!hasOutput}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? (
              <Check aria-hidden="true" size={13} className="text-success" />
            ) : (
              <Copy aria-hidden="true" size={13} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onDownload}
            disabled={!hasOutput}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download aria-hidden="true" size={13} /> Download
          </button>
        </div>
      </div>

      {/* Result box */}
      <div
        className={`flex items-start justify-between gap-3 rounded-xl border p-4 ${
          hasOutput ? "border-success/30 bg-success-soft" : "border-border bg-background"
        }`}
      >
        {hasOutput ? (
          <>
            <output
              htmlFor="base32-input"
              className="min-w-0 break-all font-mono text-sm font-bold leading-6 text-success"
            >
              {result.output.split("\n").map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </output>
            <CheckCircle2 aria-hidden="true" size={20} className="shrink-0 text-success" />
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Your encoded output appears here — start typing in the input.
          </p>
        )}
      </div>

      {/* Status row */}
      {hasOutput && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background px-4 py-2.5" aria-live="polite">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
            <CheckCircle2 aria-hidden="true" size={14} /> Encoded successfully!
          </p>
          <p className="flex items-center gap-1.5 text-xs tabular-nums text-muted-foreground">
            Processed in {timeMs.toFixed(2)}ms <Clock aria-hidden="true" size={13} />
          </p>
        </div>
      )}

      {/* Output information */}
      <h3 className="mt-5 flex items-center gap-2 text-sm font-bold text-foreground">
        <Info aria-hidden="true" size={15} className="text-primary" /> Output Information
      </h3>
      <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatTile
          label="Encoded Length"
          value={hasOutput ? result.encodedLength.toLocaleString() : "—"}
          sub="characters"
        />
        <StatTile
          label="Size Change"
          value={hasOutput && input.length ? `${ratio >= 0 ? "+" : ""}${ratio.toFixed(2)}%` : "—"}
          sub="vs input"
        />
        <StatTile
          label="Alphabet Used"
          value={alphabetCase === "lower" ? "a-z 2-7" : "A-Z 2-7"}
          sub="32 characters"
        />
        <StatTile
          label="Padding"
          value={hasOutput ? result.paddingCount : "—"}
          sub={result.paddingCount === 1 ? "character" : "characters"}
        />
      </div>
    </section>
  );
}
