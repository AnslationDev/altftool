"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PhoneCall, Plus, RotateCcw, Trash2 } from "lucide-react";
import {
  NUMBER_KINDS,
  REFERENCE_NUMBERS,
  SOURCES,
  buildCallbackCard,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_OWNER = "";
const DEFAULT_ENTRIES = [
  { id: 1, org: "My bank (number from the back of my card)", number: "1800 123 4567", source: "cardBack" },
  { id: 2, org: "Cyber fraud helpline", number: "1930", source: "officialSite" },
  { id: 3, org: "Courier customer care", number: "9876543210", source: "searchResult" },
];

const DASH = "—";
const MAX_ENTRIES = 50;

export default function ToolHome() {
  const [owner, setOwner] = useState(DEFAULT_OWNER);
  const [entries, setEntries] = useState(DEFAULT_ENTRIES);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => buildCallbackCard({ entries: entries.map(({ org, number, source }) => ({ org, number, source })), owner }),
    [entries, owner],
  );
  const failed = Boolean(result.error);

  const update = (id, field, value) => {
    setEntries((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, [field]: value } : entry)),
    );
    setCopied(false);
  };

  const addRow = () => {
    setEntries((current) => {
      if (current.length >= MAX_ENTRIES) return current;
      const nextId = current.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
      return [...current, { id: nextId, org: "", number: "", source: "cardBack" }];
    });
    setCopied(false);
  };

  const removeRow = (id) => {
    setEntries((current) => current.filter((entry) => entry.id !== id));
    setCopied(false);
  };

  const copyResult = async () => {
    if (failed) return;
    try {
      await navigator.clipboard.writeText(result.card);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setOwner(DEFAULT_OWNER);
    setEntries(DEFAULT_ENTRIES);
    setCopied(false);
  };

  const rowById = new Map((result.rows || []).map((row, index) => [index, row]));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Verify before you talk
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Callback Verification Number Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The rule that defeats most phone fraud: hang up and dial a number you found yourself. Build
          that list here — each entry is format-checked against India&apos;s numbering plan and rated
          on where you got it from.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="cb-owner">
          Whose card is this? (optional)
        </label>
        <input
          id="cb-owner"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          value={owner}
          placeholder="e.g. Amma's phone"
          onChange={(event) => {
            setOwner(event.target.value);
            setCopied(false);
          }}
        />

        <ul className="mt-5 grid gap-4">
          {entries.map((entry, index) => {
            const row = rowById.get(index);
            const check = row ? row.check : null;
            return (
              <li key={entry.id} className="rounded-md border border-[var(--border)] p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`org-${entry.id}`}>
                      Organisation
                    </label>
                    <input
                      id={`org-${entry.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      value={entry.org}
                      placeholder="e.g. SBI credit card helpline"
                      onChange={(event) => update(entry.id, "org", event.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`num-${entry.id}`}>
                      Number
                    </label>
                    <input
                      id={`num-${entry.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="tel"
                      inputMode="tel"
                      value={entry.number}
                      placeholder="1800 ... or 10 digits"
                      onChange={(event) => update(entry.id, "number", event.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={LABEL_CLASS} htmlFor={`src-${entry.id}`}>
                      Where did you get this number?
                    </label>
                    <select
                      id={`src-${entry.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      value={entry.source}
                      onChange={(event) => update(entry.id, "source", event.target.value)}
                    >
                      {SOURCES.map((source) => (
                        <option key={source.id} value={source.id}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm leading-6">
                    {check && check.ok ? (
                      <span className="text-[var(--muted-foreground)]">
                        {NUMBER_KINDS[check.kind]} · dials as {check.dial}
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)]">Number not validated yet</span>
                    )}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeRow(entry.id)}
                    className={GHOST_BTN}
                    aria-label={`Remove ${entry.org || "this entry"}`}
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>

                {row && row.issues.length > 0 && (
                  <ul className="mt-2 grid gap-1" aria-live="polite">
                    {row.issues.map((issue) => (
                      <li
                        key={issue}
                        className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
                      >
                        {issue}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={addRow}
            className={GHOST_BTN}
            disabled={entries.length >= MAX_ENTRIES}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add another organisation
          </button>
          {entries.length >= MAX_ENTRIES && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Card limit reached — 50 entries max. Remove one to add another.
            </p>
          )}
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
          <div aria-live="polite">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Numbers safe to call back on
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {failed ? DASH : `${result.verified.length}/${result.totalEntries}`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed ? DASH : `Source trust score ${result.score}/100`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the callback card"
              className={GHOST_BTN}
              disabled={failed}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy card"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the card" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Entries added", failed ? DASH : String(result.totalEntries)],
            ["Verified for the card", failed ? DASH : String(result.verified.length)],
            ["Needs work", failed ? DASH : String(result.rejected.length)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && result.verified.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <caption className="sr-only">Verified callback numbers</caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Organisation</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Number</th>
                  <th scope="col" className="py-2 text-right font-semibold">Type</th>
                </tr>
              </thead>
              <tbody>
                {result.verified.map((row) => (
                  <tr key={`${row.org}-${row.check.national}`} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3">{row.org}</td>
                    <td className="py-2 pr-3 font-semibold whitespace-nowrap">{row.check.display}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">{NUMBER_KINDS[row.check.kind]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!failed && result.verified.length === 0 && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            No entry qualifies yet. An entry needs a named organisation, a valid Indian number, and a
            source you obtained yourself.
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">National numbers worth knowing</h2>
        <dl className="mt-3 grid gap-2 text-sm leading-6 sm:grid-cols-2">
          {REFERENCE_NUMBERS.map(([number, label]) => (
            <div key={number} className="flex gap-3">
              <dt className="font-semibold">{number}</dt>
              <dd className="text-[var(--muted-foreground)]">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. A format check confirms a number is dialable, not that it belongs to the
        organisation you named — that comes from the source. Numbers change, so re-check them from
        your statement or the official app periodically, and never share an OTP with anyone on a call,
        including a number from this card.
      </p>
    </main>
  );
}
