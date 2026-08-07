"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileDown, RotateCcw, TriangleAlert } from "lucide-react";

import { DATA_CATEGORIES, FORMATS, LEGAL_BASES, REGIMES, buildPortabilityRequest } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm";
const DASH = "—";

const ORIGIN_LABEL = {
  provided: "you supplied it",
  observed: "observed from your use",
  inferred: "derived by them",
};

const DEFAULTS = {
  fullName: "A. Sharma",
  email: "a.sharma@example.com",
  accountRef: "user_2291",
  organisation: "Streamly BV",
  regime: "gdpr",
  legalBasis: "contract",
  categories: ["profile", "transactions", "activity"],
  format: "json",
  requestDate: "2026-07-28",
  directTransfer: false,
  recipient: "",
};

export default function ToolHome() {
  const [fullName, setFullName] = useState(DEFAULTS.fullName);
  const [email, setEmail] = useState(DEFAULTS.email);
  const [accountRef, setAccountRef] = useState(DEFAULTS.accountRef);
  const [organisation, setOrganisation] = useState(DEFAULTS.organisation);
  const [regime, setRegime] = useState(DEFAULTS.regime);
  const [legalBasis, setLegalBasis] = useState(DEFAULTS.legalBasis);
  const [categories, setCategories] = useState(DEFAULTS.categories);
  const [format, setFormat] = useState(DEFAULTS.format);
  const [requestDate, setRequestDate] = useState(DEFAULTS.requestDate);
  const [directTransfer, setDirectTransfer] = useState(DEFAULTS.directTransfer);
  const [recipient, setRecipient] = useState(DEFAULTS.recipient);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildPortabilityRequest({
        fullName,
        email,
        accountRef,
        organisation,
        regime,
        legalBasis,
        categories,
        format,
        requestDate,
        directTransfer,
        recipient,
      }),
    [
      fullName,
      email,
      accountRef,
      organisation,
      regime,
      legalBasis,
      categories,
      format,
      requestDate,
      directTransfer,
      recipient,
    ],
  );

  const hasError = Boolean(result.error);

  const toggleCategory = (id) => {
    setCategories((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (hasError) return;
    try {
      await navigator.clipboard.writeText(`${result.subject}\n\n${result.letter}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setFullName(DEFAULTS.fullName);
    setEmail(DEFAULTS.email);
    setAccountRef(DEFAULTS.accountRef);
    setOrganisation(DEFAULTS.organisation);
    setRegime(DEFAULTS.regime);
    setLegalBasis(DEFAULTS.legalBasis);
    setCategories(DEFAULTS.categories);
    setFormat(DEFAULTS.format);
    setRequestDate(DEFAULTS.requestDate);
    setDirectTransfer(DEFAULTS.directTransfer);
    setRecipient(DEFAULTS.recipient);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileDown className="h-4 w-4" aria-hidden="true" />
          Data rights
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Data Portability Request Generator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Ask for a machine-readable export of your data &mdash; and find out first whether Article
          20 actually applies, because it only covers automated processing based on consent or a
          contract.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="port-name">
              Your full name
            </label>
            <input
              id="port-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-org">
              Organisation holding your data
            </label>
            <input
              id="port-org"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={organisation}
              onChange={(event) => setOrganisation(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-email">
              Your email address
            </label>
            <input
              id="port-email"
              className={`mt-2 ${INPUT_CLASS}`}
              type="email"
              inputMode="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-ref">
              Username or account reference
            </label>
            <input
              id="port-ref"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={accountRef}
              onChange={(event) => setAccountRef(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-regime">
              Applicable law
            </label>
            <select
              id="port-regime"
              className={`mt-2 ${INPUT_CLASS}`}
              value={regime}
              onChange={(event) => setRegime(event.target.value)}
            >
              {REGIMES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-basis">
              Lawful basis they rely on
            </label>
            <select
              id="port-basis"
              className={`mt-2 ${INPUT_CLASS}`}
              value={legalBasis}
              onChange={(event) => setLegalBasis(event.target.value)}
            >
              {LEGAL_BASES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-format">
              Export format you want
            </label>
            <select
              id="port-format"
              className={`mt-2 ${INPUT_CLASS}`}
              value={format}
              onChange={(event) => setFormat(event.target.value)}
            >
              {FORMATS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="port-date">
              Date you send the request
            </label>
            <input
              id="port-date"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={requestDate}
              onChange={(event) => setRequestDate(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="port-recipient">
              Receiving organisation (for a direct transfer)
            </label>
            <input
              id="port-recipient"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={recipient}
              onChange={(event) => setRecipient(event.target.value)}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm" htmlFor="port-direct">
          <input
            id="port-direct"
            type="checkbox"
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
            checked={directTransfer}
            onChange={(event) => setDirectTransfer(event.target.checked)}
          />
          <span>Ask for a direct controller-to-controller transfer under Article 20(2)</span>
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Categories you want exported</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {DATA_CATEGORIES.map((item) => (
              <label key={item.id} className={CHECK_ROW} htmlFor={`cat-${item.id}`}>
                <input
                  id={`cat-${item.id}`}
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={categories.includes(item.id)}
                  onChange={() => toggleCategory(item.id)}
                />
                <span>
                  <span className="font-semibold">{item.label}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">
                    {ORIGIN_LABEL[item.origin]}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <div aria-live="polite" role="status">
      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              They must reply by
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : result.deadlineDate}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Complete the form to generate the request."
                : `${result.deadlineLabel} from the request date`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the data portability request letter"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy request"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Portability right applies",
              hasError ? DASH : result.portabilityApplies ? "Yes" : "No — sent as an access request",
            ],
            ["Right cited in the letter", hasError ? DASH : result.rightCited],
            ["Categories in scope", hasError ? DASH : String(result.stats.categoriesInScope)],
            ["Categories outside portability", hasError ? DASH : String(result.stats.categoriesOutOfScope)],
            ["Format is machine-readable", hasError ? DASH : result.stats.machineReadable ? "Yes" : "No"],
            ["Deadline with extension", hasError ? DASH : result.extensionDate || "No extension available"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Request letter</h2>
          <p className="mt-2 text-sm font-medium">Subject: {result.subject}</p>
          <div className="mt-3 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--foreground)]">
              {result.letter}
            </pre>
          </div>
        </section>
      ) : null}

      {!hasError && result.warnings.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            What to expect
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational template, not legal advice. Everything you type stays in your browser. If the
        deadline passes without a response you can complain to your supervisory authority.
      </p>
    </main>
  );
}
