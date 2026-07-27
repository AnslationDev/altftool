"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Search } from "lucide-react";
import { PLATE_COLOURS, RTO_OFFICES, STATE_CODES, decodeRegistration } from "../lib";

const NUM = new Intl.NumberFormat("en-IN");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PLATE = "MH 12 AB 1234";
const EXAMPLES = ["MH 12 AB 1234", "KA 01 AA 0001", "DL 8C AF 5010", "22 BH 1234 AA", "13 CD 1234"];

export default function ToolHome() {
  const [plate, setPlate] = useState(DEFAULT_PLATE);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => decodeRegistration(plate), [plate]);
  const failed = Boolean(result.error);

  const summary = useMemo(() => {
    if (failed) return "";
    return [
      "Vehicle Registration Decoder",
      `Number: ${result.canonical}`,
      `Format: ${result.kindLabel}`,
      ...result.fields.map(([label, value]) => `${label}: ${value}`),
      "",
      result.story,
    ].join("\n");
  }, [failed, result]);

  const copyResult = async () => {
    if (!summary) return;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setPlate(DEFAULT_PLATE);
    setCopied(false);
  };

  const stateEntries = Object.entries(STATE_CODES);
  const officeEntries = Object.entries(RTO_OFFICES);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Search className="h-4 w-4" aria-hidden="true" />
          Vehicle compliance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Vehicle Registration Decoder India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Break an Indian number plate into its parts — the state code, the registering RTO office, the
          letter series and the serial — and see what a BH-series or diplomatic plate means. Nothing is
          looked up online; this explains the format.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="plate">
          Registration number
        </label>
        <input
          id="plate"
          className={`mt-2 font-mono uppercase ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          spellCheck="false"
          placeholder="MH 12 AB 1234"
          value={plate}
          onChange={(event) => setPlate(event.target.value)}
        />
        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setPlate(example)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 font-mono text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Decoded number
            </p>
            <p
              className={`mt-1 font-mono text-3xl font-semibold sm:text-4xl ${
                failed ? "text-[var(--danger)]" : "text-[var(--primary)]"
              }`}
            >
              {failed ? "—" : result.canonical}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? "Check the number and try again." : result.kindLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the decoded registration"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the input" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {(failed
            ? [["Components", "—"]]
            : [
                ...result.fields,
                ...(result.kind === "standard"
                  ? [
                      [
                        "Position of the series",
                        result.series
                          ? `${NUM.format(result.seriesPosition)} in the A, B … Z, AA sequence`
                          : "no series",
                      ],
                      [
                        "Roughly this many numbers issued before it",
                        result.approxIssuedBefore === null
                          ? "—"
                          : NUM.format(result.approxIssuedBefore),
                      ],
                    ]
                  : []),
              ]
          ).map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.story}
          </p>
        )}

        {!failed && result.notes.length > 0 && (
          <ul className="mt-3 grid gap-2 text-xs leading-5 text-[var(--muted-foreground)]">
            {result.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the plate colour tells you</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[440px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Plate</th>
                <th scope="col" className="py-2 font-semibold">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {PLATE_COLOURS.map((row) => (
                <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{row.label}</td>
                  <td className="py-2.5 text-[var(--muted-foreground)]">{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">State and union territory codes</h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {stateEntries.map(([code, name]) => (
            <li key={code} className="flex items-baseline gap-2">
              <span className="font-mono font-semibold">{code}</span>
              <span className="text-[var(--muted-foreground)]">{name}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">
          Common RTO office codes ({officeEntries.length})
        </h2>
        <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {officeEntries.map(([code, name]) => (
            <li key={code} className="flex items-baseline gap-2">
              <span className="font-mono font-semibold">{code}</span>
              <span className="text-[var(--muted-foreground)]">{name}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          A shortlist of frequently seen codes. Each state transport department publishes the full
          register, and codes are added as new offices open.
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This explains the structure of a number, nothing more. It does not identify an owner, and
        looking up personal details behind a registration is restricted — vehicle particulars are
        available only through the official Parivahan and mParivahan services, which do not disclose
        owner contact information.
      </p>
    </main>
  );
}
