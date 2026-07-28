"use client";

import { useMemo, useState } from "react";
import { Building2, Check, Copy, RotateCcw, X } from "lucide-react";

import {
  MAX_COMPOUND_IN_TABLE,
  analyseBusinessName,
  compareBusinessNames,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const TEXTAREA_CLASS =
  "min-h-[120px] w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const ERROR_CLASS =
  "rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]";

const DEFAULTS = {
  name: "Tata Steel",
  list: "Tata Steel\nZoho\nNorthbridge Labs\nVeda Organics",
};
const DASH = "—";

export default function ToolHome() {
  const [name, setName] = useState(DEFAULTS.name);
  const [list, setList] = useState(DEFAULTS.list);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => analyseBusinessName(name), [name]);
  const shortlist = useMemo(() => compareBusinessNames(list.split(/\r?\n/)), [list]);

  const summary = useMemo(() => {
    if (result.error) return "";
    return [
      `Business name check — ${result.name}`,
      `Chaldean compound ${result.chaldeanTotal} → root ${result.chaldeanRoot}`,
      `Pythagorean total ${result.pythagoreanTotal} → ${result.pythagoreanRoot}`,
      `Domain label: ${result.slug} (${result.slugLength} characters)`,
      `Practical checks passed: ${result.checksPassed} of ${result.checksTotal}`,
      ...result.checks.filter((check) => !check.pass).map((check) => `Watch: ${check.detail}`),
    ].join("\n");
  }, [result]);

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
    setName(DEFAULTS.name);
    setList(DEFAULTS.list);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Building2 className="h-4 w-4" aria-hidden="true" />
          Naming shortlist
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Business Name Numerology Checker</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Puts each shortlisted name through two things at once: the Chaldean and Pythagorean number
          values people often ask for, and the hard practical limits that decide whether the name
          works as a domain and a social handle.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="biz-name">
          Name to check in detail
        </label>
        <input
          id="biz-name"
          className={`mt-2 ${INPUT_CLASS}`}
          type="text"
          autoComplete="off"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        {result.error ? (
          <p role="alert" className={ERROR_CLASS}>
            {result.error}
          </p>
        ) : null}

        <div className="mt-1 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Chaldean compound number
            </p>
            <p className="mt-1 text-5xl font-semibold leading-none text-[var(--primary)]">
              {ok ? result.chaldeanTotal : DASH}
            </p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `reduces to root ${result.chaldeanRoot} · Pythagorean ${result.pythagoreanRoot}${result.pythagoreanIsMaster ? " (master)" : ""}`
                : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the business name check"
              className={GHOST_BTN}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Letters scored", ok ? String(result.letterCount) : DASH],
            ["Words / syllables (estimate)", ok ? `${result.wordCount} / ${result.syllables}` : DASH],
            ["Chaldean total → root", ok ? `${result.chaldeanTotal} → ${result.chaldeanRoot}` : DASH],
            [
              "Pythagorean total → number",
              ok ? `${result.pythagoreanTotal} → ${result.pythagoreanRoot}` : DASH,
            ],
            ["Domain label", ok ? `${result.slug} (${result.slugLength} chars)` : DASH],
            ["Handle form", ok ? `@${result.handle} (${result.handle.length} chars)` : DASH],
            ["Practical checks passed", ok ? `${result.checksPassed} of ${result.checksTotal}` : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="break-all text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {ok ? (
          <div className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm">
            {result.compoundInTable ? (
              <p>
                <span className="font-semibold">Compound {result.chaldeanTotal}:</span>{" "}
                {result.compoundReading}
              </p>
            ) : (
              <p className="text-[var(--muted-foreground)]">
                The classical compound table runs to {MAX_COMPOUND_IN_TABLE}. A total of{" "}
                {result.chaldeanTotal} sits beyond it, so only the root {result.chaldeanRoot} is read.
              </p>
            )}
          </div>
        ) : null}

        {ok ? (
          <ul className="mt-5 space-y-2">
            {result.checks.map((check) => (
              <li
                key={check.key}
                className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <span
                  className={`mt-0.5 shrink-0 ${check.pass ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                  aria-hidden="true"
                >
                  {check.pass ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span>
                  <span className="font-semibold">{check.label}</span>
                  <span className="sr-only">{check.pass ? " — passes" : " — needs attention"}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{check.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Compare the shortlist</h2>
        <label className={`mt-3 ${LABEL_CLASS}`} htmlFor="biz-list">
          Candidate names, one per line
        </label>
        <textarea
          id="biz-list"
          className={`mt-2 ${TEXTAREA_CLASS}`}
          value={list}
          onChange={(event) => setList(event.target.value)}
        />
        {shortlist.error ? (
          <p role="alert" className={`mt-3 ${ERROR_CLASS}`}>
            {shortlist.error}
          </p>
        ) : (
          <>
            {shortlist.skipped > 0 ? (
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                {shortlist.skipped} line{shortlist.skipped === 1 ? "" : "s"} skipped for having no
                A–Z letters.
              </p>
            ) : null}
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">Shortlisted business names compared</caption>
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Name</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Chaldean</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Root</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Pythagorean</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Domain len</th>
                    <th scope="col" className="py-2 text-right font-semibold">Checks</th>
                  </tr>
                </thead>
                <tbody>
                  {shortlist.rows.map((row) => (
                    <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3">
                        <button
                          type="button"
                          onClick={() => setName(row.name)}
                          className="min-h-11 text-left font-semibold text-[var(--primary)] transition hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                          aria-label={`Show the full check for ${row.name}`}
                        >
                          {row.name}
                        </button>
                        <span className="block text-xs text-[var(--muted-foreground)]">{row.slug}</span>
                      </td>
                      <td className="py-2 pr-3 text-right">{row.chaldeanTotal}</td>
                      <td className="py-2 pr-3 text-right font-semibold">{row.chaldeanRoot}</td>
                      <td className="py-2 pr-3 text-right">{row.pythagoreanRoot}</td>
                      <td className="py-2 pr-3 text-right">{row.slugLength}</td>
                      <td className="py-2 text-right font-semibold">
                        {row.checksPassed}/{row.checksTotal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The character limits are real and checkable; the numerology is a cultural tradition with no
        evidence behind it and is included because clients often ask for it. Neither tells you
        whether a name is available — always search the trade marks register and the domain WHOIS,
        and take professional advice before registering a company name.
      </p>
    </main>
  );
}
