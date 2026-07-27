"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw } from "lucide-react";

import { IFSC_LENGTH, MICR_LENGTH, validateBatch, validateIfsc } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CODE = "HDFC0000123";
const DEFAULT_BATCH = "HDFC0000123\nSBIN0011513\nHDFCO000123\nUTIB000123";

const STRUCTURE = [
  ["1 – 4", "Bank code", "Four letters, e.g. HDFC or SBIN"],
  ["5", "Reserved", "Always the digit 0"],
  ["6 – 11", "Branch code", "Six letters or digits"],
];

export default function ToolHome() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [batchText, setBatchText] = useState(DEFAULT_BATCH);
  const [showBatch, setShowBatch] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => validateIfsc(code), [code]);
  const batch = useMemo(() => (showBatch ? validateBatch(batchText) : null), [showBatch, batchText]);

  const ok = !result.error;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      "IFSC Format Check",
      `Entered: ${result.input}`,
      `Normalised: ${result.normalised}`,
      `Structurally valid: ${result.valid ? "yes" : "no"}`,
      `Bank code: ${result.bankCode || "—"}${result.bankName ? ` (${result.bankName})` : ""}`,
      `Reserved character: ${result.reserved || "—"}`,
      `Branch code: ${result.branchCode || "—"}`,
      ...(result.valid ? [] : result.errors.map((item) => `- ${item}`)),
      ...(result.suggestion ? [`Did you mean: ${result.suggestion}`] : []),
    ].join("\n");
  }, [ok, result]);

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
    setCode(DEFAULT_CODE);
    setBatchText(DEFAULT_BATCH);
    setShowBatch(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Offline structure check
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">IFSC Code Format Validator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Four letters for the bank, the digit zero, then six characters for the branch. This checks
          that structure character by character in your browser, catches the classic letter-O typo
          and suggests the corrected code.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <label className={LABEL_CLASS} htmlFor="ifsc-code">
          IFSC code
        </label>
        <input
          id="ifsc-code"
          className={`mt-2 ${INPUT_CLASS} font-mono text-lg tracking-widest uppercase`}
          type="text"
          autoComplete="off"
          spellCheck="false"
          maxLength={20}
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <p className="mt-2 text-xs text-[var(--muted-foreground)]">
          Spaces and hyphens are ignored; lowercase is upper-cased before checking.
        </p>
      </section>

      {result.error && (
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
              Structure
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${ok && result.valid ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
            >
              {ok ? (result.valid ? "Valid format" : "Invalid format") : "—"}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? result.valid
                  ? `${result.normalised}${result.bankName ? ` · ${result.bankName}` : ""}`
                  : "The code does not match the RBI structure"
                : "Enter a code above"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the IFSC validation result"
              className={`${GHOST_BTN} disabled:opacity-40`}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the validator" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Normalised code", ok ? result.normalised || "—" : "—"],
            ["Length", ok ? `${result.normalised.length} of ${IFSC_LENGTH}` : "—"],
            [
              "Bank code",
              ok && result.bankCode ? `${result.bankCode}${result.bankName ? ` — ${result.bankName}` : ""}` : "—",
            ],
            ["Reserved character", ok && result.reserved ? result.reserved : "—"],
            ["Branch code", ok && result.branchCode ? result.branchCode : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold break-all">{value}</dd>
            </div>
          ))}
        </dl>

        {ok && !result.valid && (
          <ul className="mt-4 grid gap-2 text-sm leading-6">
            {result.errors.map((item) => (
              <li
                key={item}
                role="alert"
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 font-medium text-[var(--danger)]"
              >
                {item}
              </li>
            ))}
            {result.suggestion && (
              <li className="rounded-md bg-[var(--muted)] px-3 py-2">
                Did you mean{" "}
                <button
                  type="button"
                  onClick={() => setCode(result.suggestion)}
                  className="font-mono font-semibold text-[var(--primary)] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  {result.suggestion}
                </button>
                ?
              </li>
            )}
          </ul>
        )}

        {ok && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[360px] text-left text-sm">
              <caption className="pb-2 text-left text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                Character by character
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">#</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Character</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Expected</th>
                  <th scope="col" className="py-2 text-right font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {result.characters.map((row) => (
                  <tr key={row.position} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.position}</td>
                    <td className="py-2 pr-3 font-mono font-semibold">{row.character || "·"}</td>
                    <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.expected}</td>
                    <td
                      className={`py-2 text-right font-semibold ${row.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                    >
                      {row.ok ? "OK" : "Wrong"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Check a list of codes</h2>
          <button
            type="button"
            onClick={() => setShowBatch((value) => !value)}
            aria-expanded={showBatch}
            className={GHOST_BTN}
          >
            {showBatch ? "Hide" : "Show"}
          </button>
        </div>
        {showBatch && (
          <>
            <label className="sr-only" htmlFor="ifsc-batch">
              IFSC codes, one per line
            </label>
            <textarea
              id="ifsc-batch"
              rows={5}
              className="mt-3 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={batchText}
              onChange={(event) => setBatchText(event.target.value)}
            />
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              {batch ? `${batch.validCount} valid, ${batch.invalidCount} invalid of ${batch.total}` : "—"}
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[380px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Code</th>
                    <th scope="col" className="py-2 pr-3 font-semibold">Result</th>
                    <th scope="col" className="py-2 font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {batch && batch.rows.length > 0 ? (
                    batch.rows.map((row, index) => (
                      <tr key={`${row.input}-${index}`} className="border-b border-[var(--border)] last:border-0">
                        <td className="py-2 pr-3 font-mono">{row.normalised || row.input}</td>
                        <td
                          className={`py-2 pr-3 font-semibold ${row.valid ? "text-[var(--success)]" : "text-[var(--danger)]"}`}
                        >
                          {row.valid ? "Valid" : "Invalid"}
                        </td>
                        <td className="py-2 text-[var(--muted-foreground)]">
                          {row.valid
                            ? (row.bankName ?? "Format is correct")
                            : (row.suggestion ? `Try ${row.suggestion}` : row.reason)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                        —
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What each position means</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Position</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Part</th>
                <th scope="col" className="py-2 font-semibold">Rule</th>
              </tr>
            </thead>
            <tbody>
              {STRUCTURE.map(([position, part, rule]) => (
                <tr key={position} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-mono font-semibold">{position}</td>
                  <td className="py-2 pr-3 font-semibold">{part}</td>
                  <td className="py-2 text-[var(--muted-foreground)]">{rule}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        This checks structure only — a well-formed code can still belong to no branch. Confirm the
        code against the RBI IFSC directory or your bank before transferring money. IFSC is not the
        MICR code, which is the {MICR_LENGTH}-digit number printed at the foot of a cheque.
      </p>
    </main>
  );
}
