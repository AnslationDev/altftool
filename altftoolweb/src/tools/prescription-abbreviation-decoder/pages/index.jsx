"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Pill, RotateCcw, Search } from "lucide-react";

import { CATEGORIES, decodeSig, searchAbbreviations } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[88px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
const DASH = "—";

const DEFAULT_SIG = "T. Amoxicillin 500mg 1 tab PO TDS 5/7 PC";

const EXAMPLES = [
  "T. Amoxicillin 500mg 1 tab PO TDS 5/7 PC",
  "Cap Omeprazole 20mg 1 cap PO OD AC 1/12",
  "Salbutamol MDI 2 puffs INH q6h PRN",
  "Inj Enoxaparin 40 mg SC ON 3/7",
];

export default function ToolHome() {
  const [sig, setSig] = useState(DEFAULT_SIG);
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => decodeSig(sig), [sig]);
  const tableRows = useMemo(() => searchAbbreviations(query), [query]);
  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Sig: ${result.input}`,
      "",
      ...result.decoded.map((entry) => `${entry.raw} = ${entry.meaning}${entry.latin !== "—" ? ` (${entry.latin})` : ""}`),
      "",
      result.dosesPerDay !== null ? `Doses per day: ${result.dosesPerDay}` : "Doses per day: not recognised",
      result.durationDays !== null ? `Course length: ${result.durationDays} days` : "Course length: not recognised",
      result.totalUnits !== null ? `Total to dispense: ${result.totalUnits} ${result.doseUnit}` : "Total to dispense: cannot be worked out",
    ].join("\n");
  }, [ok, result]);

  const copyDecode = async () => {
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
    setSig(DEFAULT_SIG);
    setQuery("");
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pill className="h-4 w-4" aria-hidden="true" />
          Health admin
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Prescription Abbreviation Decoder</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Paste the directions from a prescription and see what each abbreviation means, how many
          doses a day it comes to, how long the course runs and how many tablets that adds up to.
          Error-prone shorthand is flagged.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="pad-sig">
          Directions from the prescription
        </label>
        <textarea
          id="pad-sig"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={sig}
          onChange={(event) => setSig(event.target.value)}
          placeholder="1 tab PO BD 5/7 PC"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => setSig(example)}
              className="min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
            >
              {example}
            </button>
          ))}
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total to dispense
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok && result.totalUnits !== null ? `${NUM.format(result.totalUnits)} ${result.doseUnit}` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok && result.dosesPerDay !== null && result.durationDays !== null
                ? `${NUM.format(result.dosesPerDay)} doses a day for ${NUM.format(result.durationDays)} days`
                : ok
                  ? "Add a frequency and a course length to get a total."
                  : "Fix the error above to decode the sig."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyDecode}
              disabled={!ok}
              aria-label="Copy the decoded prescription"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy decode"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the decoder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Frequency", ok && result.frequency ? result.frequency.meaning : DASH],
            ["Timing", ok && result.timing ? result.timing.meaning : DASH],
            ["Route", ok && result.route ? result.route.meaning : DASH],
            ["Form", ok && result.form ? result.form.meaning : DASH],
            ["Doses per day", ok && result.dosesPerDay !== null ? NUM.format(result.dosesPerDay) : DASH],
            [
              "Gap between doses",
              ok && result.hoursBetweenDoses !== null ? `${NUM.format(result.hoursBetweenDoses)} hours` : DASH,
            ],
            ["Course length", ok && result.durationDays !== null ? `${NUM.format(result.durationDays)} days` : DASH],
            [
              "Amount per dose",
              ok && result.unitsPerDose !== null ? `${NUM.format(result.unitsPerDose)} ${result.doseUnit}` : DASH,
            ],
            ["Doses in the course", ok && result.totalDoses !== null ? NUM.format(result.totalDoses) : DASH],
            ["Abbreviations decoded", ok ? result.matchedCount : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok && result.safetyFlags.length > 0 && (
        <section className="mt-4">
          <ul className="space-y-2">
            {result.safetyFlags.map((flag) => (
              <li
                key={flag.abbr}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]"
              >
                <span className="font-bold">{flag.abbr}</span> — {flag.risk}
              </li>
            ))}
          </ul>
        </section>
      )}

      {ok && result.notes.length > 0 && (
        <ul className="mt-4 space-y-1 text-sm text-[var(--muted-foreground)]">
          {result.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      )}

      {ok && result.decoded.length > 0 && (
        <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">What each abbreviation means</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">In the sig</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Latin</th>
                  <th scope="col" className="py-2 font-semibold">Means</th>
                </tr>
              </thead>
              <tbody>
                {result.decoded.map((entry) => (
                  <tr key={entry.abbr} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-mono font-semibold">{entry.raw}</td>
                    <td className="py-2 pr-3 italic text-[var(--muted-foreground)]">{entry.latin}</td>
                    <td className="py-2">{entry.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.unknownTokens.length > 0 && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">
              Not recognised as shorthand (probably the drug name or strength):{" "}
              {result.unknownTokens.join(", ")}
            </p>
          )}
        </section>
      )}

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Full abbreviation reference</h2>
        <div className="mt-3">
          <label className={LABEL_CLASS} htmlFor="pad-search">
            Search the list
          </label>
          <div className="relative mt-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]"
              aria-hidden="true"
            />
            <input
              id="pad-search"
              className={`${INPUT_CLASS} pl-9`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="bedtime, per os, four times…"
            />
          </div>
        </div>

        {CATEGORIES.map((category) => {
          const rows = tableRows.filter((row) => row.category === category);
          if (rows.length === 0) return null;
          return (
            <div key={category} className="mt-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                {category}
              </h3>
              <div className="mt-2 overflow-x-auto">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.abbr} className="border-b border-[var(--border)] last:border-0 align-top">
                        <th scope="row" className="w-20 py-2 pr-3 text-left font-mono font-semibold">
                          {row.abbr}
                        </th>
                        <td className="py-2 pr-3 italic text-[var(--muted-foreground)]">{row.latin}</td>
                        <td className="py-2">
                          {row.meaning}
                          {row.risk && (
                            <span className="mt-1 block text-xs text-[var(--danger)]">{row.risk}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        {tableRows.length === 0 && (
          <p className="mt-4 text-sm text-[var(--muted-foreground)]">
            Nothing matches “{query}”. Try the Latin term or the plain meaning.
          </p>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. This decodes standard shorthand; it does not tell anyone what to take.
        Abbreviations differ between countries and hospitals, and handwriting is easy to misread — if
        anything on a prescription is unclear, ask the pharmacist or the prescriber before taking a
        dose. The dispensing label always overrides anything shown here.
      </p>
    </main>
  );
}
