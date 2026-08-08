"use client";

import { useMemo, useState } from "react";
import { Check, Copy, IdCard, RotateCcw, X } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  LANDLORD_PAN_RENT_LIMIT,
  PAN_HOLDER_TYPES,
  SECTION_272B_PENALTY,
  decodePanList,
  decodePanWithName,
} from "../lib";

const COUNT = new Intl.NumberFormat("en-IN");
const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const DEFAULTS = {
  pan: "ABCPK1234M",
  name: "Kumar",
  bulk: "ABCPK1234M\nAAACZ9999C\nAAAHB1111H",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_ON =
  "min-h-11 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TOGGLE_OFF =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--muted-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [pan, setPan] = useState(DEFAULTS.pan);
  const [name, setName] = useState(DEFAULTS.name);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulk, setBulk] = useState(DEFAULTS.bulk);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const single = useMemo(() => decodePanWithName({ pan, name }), [pan, name]);
  const batch = useMemo(() => (bulkMode ? decodePanList(bulk) : null), [bulkMode, bulk]);

  const summary = useMemo(() => {
    if (bulkMode) {
      if (!batch || batch.error) return "";
      return [
        "PAN format check",
        `Checked: ${batch.total}`,
        `Valid structure: ${batch.validCount}`,
        `Invalid: ${batch.invalidCount}`,
        "",
        ...batch.results.map((result) =>
          result.valid
            ? `${result.normalized} — ${result.parts.holderType.label}`
            : `${result.normalized || "(empty)"} — ${result.errors[0]}`,
        ),
      ].join("\n");
    }
    if (!single.valid) return "";
    return [
      "PAN format check",
      `PAN: ${single.normalized}`,
      `Holder type (4th character "${single.parts.holderTypeCode}"): ${single.parts.holderType.label}`,
      `Name initial (5th character): ${single.parts.nameInitial}`,
      `Series: ${single.parts.series}`,
      `Sequence: ${single.parts.sequence}`,
      `Check character: ${single.parts.checkLetter}`,
      `Safe to share redaction: ${single.parts.redacted}`,
    ].join("\n");
  }, [bulkMode, batch, single]);

  const copyResult = () => {
    if (!summary) return;
    copy("result", summary, { label: "PAN decoding result" });
  };

  const reset = () => {
    if (
      !window.confirm(
        bulkMode
          ? "Reset the decoder? This clears the pasted PAN list and cannot be undone."
          : "Reset the decoder? This clears the PAN and name you entered.",
      )
    ) {
      return;
    }
    // Only clear the fields for the mode the confirm text warned about — switching modes
    // on Reset was never mentioned in that warning, so it must not switch modes either.
    if (bulkMode) {
      setBulk(DEFAULTS.bulk);
    } else {
      setPan(DEFAULTS.pan);
      setName(DEFAULTS.name);
    }
    resetCopyState();
  };

  const singleError = !single.valid;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <IdCard className="h-4 w-4" aria-hidden="true" />
          AAAAA9999A
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          PAN Format Validator and Type Decoder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The fourth character of a PAN is the status of the holder — P for an individual, C for a
          company, H for a HUF, F for a firm, T for a trust. This decodes it, checks the whole
          structure and never sends the number anywhere.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setBulkMode(false)}
            aria-pressed={!bulkMode}
            className={bulkMode ? TOGGLE_OFF : TOGGLE_ON}
          >
            Single PAN
          </button>
          <button
            type="button"
            onClick={() => setBulkMode(true)}
            aria-pressed={bulkMode}
            className={bulkMode ? TOGGLE_ON : TOGGLE_OFF}
          >
            Bulk list
          </button>
        </div>

        {bulkMode ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="pan-bulk">
              One PAN per line
            </label>
            <textarea
              id="pan-bulk"
              rows={6}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 font-mono text-sm uppercase tracking-wide text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              value={bulk}
              onChange={(event) => setBulk(event.target.value)}
              spellCheck={false}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL_CLASS} htmlFor="pan-single">
                PAN
              </label>
              <input
                id="pan-single"
                className={`mt-2 font-mono uppercase tracking-[0.2em] ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                spellCheck={false}
                maxLength={20}
                placeholder="AAAAA9999A"
                value={pan}
                onChange={(event) => setPan(event.target.value)}
              />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="pan-name">
                Surname or entity name (optional)
              </label>
              <input
                id="pan-name"
                className={`mt-2 ${INPUT_CLASS}`}
                type="text"
                autoComplete="off"
                placeholder="Surname only, e.g. Kumar"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {!bulkMode && singleError ? (
        <div
          role="alert"
          className="mt-6 space-y-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {single.errors.map((message) => (
            <p key={message}>{message}</p>
          ))}
          {single.suggestion ? <p>Did you mean {single.suggestion}?</p> : null}
        </div>
      ) : null}

      {!bulkMode && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div aria-live="polite" role="status">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                Holder type
              </p>
              <p
                className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                  singleError ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"
                }`}
              >
                {singleError ? "—" : single.parts.holderType.label}
              </p>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                {singleError
                  ? "Fix the structure to decode the holder type"
                  : single.parts.holderType.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyResult}
                aria-label={isCopied("result") ? "Copied the PAN decoding result to clipboard" : "Copy PAN decoding result"}
                className={GHOST_BTN}
                disabled={!summary}
              >
                {isCopied("result") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {isCopied("result") ? "Copied!" : "Copy result"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset the decoder" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
              <span className="sr-only" role="status" aria-live="polite">
                {announcement}
              </span>
            </div>
          </div>

          <dl
            className="mt-5 divide-y divide-[var(--border)] text-sm"
            aria-live="polite"
            aria-atomic="true"
          >
            {[
              ["Split into parts", singleError ? "—" : single.parts.grouped],
              ["Series (positions 1-3)", singleError ? "—" : single.parts.series],
              ["Status code (position 4)", singleError ? "—" : single.parts.holderTypeCode],
              [
                "Name initial (position 5)",
                singleError
                  ? "—"
                  : `${single.parts.nameInitial} — first letter of the ${single.parts.isIndividual ? "surname" : "entity name"}`,
              ],
              ["Sequence (positions 6-9)", singleError ? "—" : single.parts.sequence],
              ["Check character (position 10)", singleError ? "—" : single.parts.checkLetter],
              ["Safe to share redaction", singleError ? "—" : single.parts.redacted],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>

          {!singleError && single.nameCheck ? (
            <p
              role="status"
              aria-live="polite"
              className={`mt-4 flex items-start gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                single.nameCheck.matches
                  ? "bg-[var(--success)]/12 text-[var(--success-text)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger-text)]"
              }`}
            >
              {single.nameCheck.matches ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              {single.nameCheck.message}
            </p>
          ) : null}

          {!singleError && single.warnings.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {single.warnings.map((warning) => (
                <li
                  key={warning}
                  className="rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]"
                >
                  {warning}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      {bulkMode && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          {batch?.error ? (
            <p
              role="alert"
              className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
            >
              {batch.error}
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div aria-live="polite" role="status">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Valid structures
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                    {COUNT.format(batch.validCount)}
                    <span className="text-lg text-[var(--muted-foreground)]">
                      {" "}
                      / {COUNT.format(batch.total)}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={copyResult}
                    aria-label={
                      isCopied("result")
                        ? "Copied the bulk PAN decoding result to clipboard"
                        : "Copy bulk PAN decoding result"
                    }
                    className={GHOST_BTN}
                  >
                    {isCopied("result") ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {isCopied("result") ? "Copied!" : "Copy result"}
                  </button>
                  <button type="button" onClick={reset} aria-label="Reset the decoder" className={PRIMARY_BTN}>
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Reset
                  </button>
                  <span className="sr-only" role="status" aria-live="polite">
                    {announcement}
                  </span>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto" aria-live="polite" aria-atomic="true">
                <table className="w-full min-w-[320px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                      <th scope="col" className="py-2 pr-3 font-semibold">PAN</th>
                      <th scope="col" className="py-2 font-semibold">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batch.results.map((result, index) => (
                      <tr
                        key={`${result.normalized}-${index}`}
                        className="border-b border-[var(--border)] align-top last:border-0"
                      >
                        <td className="py-2 pr-3 font-mono font-semibold">{result.normalized || "—"}</td>
                        <td className="py-2">
                          <span
                            className={`font-semibold ${
                              result.valid ? "text-[var(--success-text)]" : "text-[var(--danger-text)]"
                            }`}
                          >
                            {result.valid ? result.parts.holderType.label : "Invalid"}
                          </span>
                          {!result.valid && (
                            <span className="block text-[var(--muted-foreground)]">{result.errors[0]}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the fourth character means</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Code</th>
                <th scope="col" className="py-2 font-semibold">Status of holder</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(PAN_HOLDER_TYPES).map(([code, type]) => (
                <tr key={code} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2 pr-3 font-mono font-semibold">{code}</td>
                  <td className="py-2">
                    <span className="font-semibold">{type.label}</span>
                    <span className="block text-[var(--muted-foreground)]">{type.description}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The tenth character is a check character whose algorithm the Income Tax Department has never
        published, so a correct structure does not prove the PAN exists — verify it on the e-filing
        portal. Quoting a false PAN attracts a penalty of {INR.format(SECTION_272B_PENALTY)} under
        section 272B, and a landlord&apos;s PAN must be reported to your employer once annual rent
        crosses {INR.format(LANDLORD_PAN_RENT_LIMIT)}.
      </p>
    </main>
  );
}
