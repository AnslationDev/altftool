"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ScrollText } from "lucide-react";

import {
  LICENCE_FAMILIES,
  LICENCE_IDS,
  USE_CASES,
  evaluateFontLicence,
  summariseEvaluation,
} from "../lib";

const INT = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

const DEFAULT_USES = ["desktop-design", "print-output", "webfont-selfhost"];

const DEFAULTS = {
  licenceId: "commercial-retail",
  uses: DEFAULT_USES,
  workstations: "3",
  monthlyPageviews: "100000",
  titles: "1",
  servers: "1",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const VERDICT_STYLE = {
  permitted: "bg-[var(--success-soft)] text-[var(--success)]",
  conditional: "bg-[var(--info-soft)] text-[var(--info)]",
  separate: "bg-[var(--warning-soft)] text-[var(--warning)]",
  prohibited: "bg-[var(--danger-soft)] text-[var(--danger)]",
  unclear: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const STATUS_STYLE = {
  clear: "text-[var(--success)]",
  conditional: "text-[var(--info)]",
  "add-on": "text-[var(--warning)]",
  review: "text-[var(--muted-foreground)]",
  blocked: "text-[var(--danger)]",
  unknown: "text-[var(--muted-foreground)]",
};

const DASH = "—";

const toCount = (raw) => {
  const text = String(raw).trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [licenceId, setLicenceId] = useState(DEFAULTS.licenceId);
  const [uses, setUses] = useState(DEFAULTS.uses);
  const [workstations, setWorkstations] = useState(DEFAULTS.workstations);
  const [monthlyPageviews, setMonthlyPageviews] = useState(DEFAULTS.monthlyPageviews);
  const [titles, setTitles] = useState(DEFAULTS.titles);
  const [servers, setServers] = useState(DEFAULTS.servers);
  const [copied, setCopied] = useState(false);

  const evaluation = useMemo(
    () =>
      evaluateFontLicence({
        licenceId,
        uses,
        workstations: toCount(workstations),
        monthlyPageviews: toCount(monthlyPageviews),
        titles: toCount(titles),
        servers: toCount(servers),
      }),
    [licenceId, uses, workstations, monthlyPageviews, titles, servers],
  );

  const summary = evaluation.error ? "" : summariseEvaluation(evaluation);

  const toggleUse = (id) => {
    setUses((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const copySummary = async () => {
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
    setLicenceId(DEFAULTS.licenceId);
    setUses(DEFAULTS.uses);
    setWorkstations(DEFAULTS.workstations);
    setMonthlyPageviews(DEFAULTS.monthlyPageviews);
    setTitles(DEFAULTS.titles);
    setServers(DEFAULTS.servers);
    setCopied(false);
  };

  const activeLicence = LICENCE_FAMILIES[licenceId];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ScrollText className="h-4 w-4" aria-hidden="true" />
          Font licensing
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">Font Licence Checker Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type is licensed per use category, not per company. Tick what your project actually does,
          pick the licence you hold, and see which categories are covered, which need an add-on and
          which are off-limits.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div>
          <label className={LABEL_CLASS} htmlFor="fl-licence">
            Licence you hold
          </label>
          <select
            id="fl-licence"
            className={`mt-2 ${INPUT_CLASS}`}
            value={licenceId}
            onChange={(event) => setLicenceId(event.target.value)}
          >
            {LICENCE_IDS.map((id) => (
              <option key={id} value={id}>
                {LICENCE_FAMILIES[id].name}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            {activeLicence?.summary}
          </p>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            How will the font be used?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {USE_CASES.map((useCase) => (
              <label
                key={useCase.id}
                htmlFor={`fl-use-${useCase.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm transition hover:border-[var(--primary)]"
              >
                <input
                  id={`fl-use-${useCase.id}`}
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                  checked={uses.includes(useCase.id)}
                  onChange={() => toggleUse(useCase.id)}
                />
                <span>{useCase.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-seats">
              Workstations with the font installed
            </label>
            <input
              id="fl-seats"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={workstations}
              onChange={(event) => setWorkstations(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-pageviews">
              Monthly pageviews (all domains)
            </label>
            <input
              id="fl-pageviews"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1000"
              value={monthlyPageviews}
              onChange={(event) => setMonthlyPageviews(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-titles">
              App or ebook titles
            </label>
            <input
              id="fl-titles"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={titles}
              onChange={(event) => setTitles(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fl-servers">
              Servers rendering text on demand
            </label>
            <input
              id="fl-servers"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={servers}
              onChange={(event) => setServers(event.target.value)}
            />
          </div>
        </div>
      </section>

      {evaluation.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {evaluation.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Licence coverage
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${
                evaluation.error ? "text-[var(--muted-foreground)]" : STATUS_STYLE[evaluation.status.level]
              }`}
            >
              {evaluation.error ? DASH : evaluation.status.headline}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {evaluation.error
                ? DASH
                : `${evaluation.results.length} use categories checked against ${evaluation.licence.name}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copySummary}
              aria-label="Copy the licence coverage summary"
              className={GHOST_BTN}
              disabled={Boolean(evaluation.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy summary"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Covered outright", evaluation.error ? DASH : INT.format(evaluation.counts.permitted)],
            ["Covered with conditions", evaluation.error ? DASH : INT.format(evaluation.counts.conditional)],
            ["Need a separate licence", evaluation.error ? DASH : INT.format(evaluation.counts.separate)],
            ["Not permitted", evaluation.error ? DASH : INT.format(evaluation.counts.prohibited)],
            ["Must read your own EULA", evaluation.error ? DASH : INT.format(evaluation.counts.unclear)],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!evaluation.error ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Category by category</h2>
          <ul className="mt-3 space-y-3">
            {evaluation.results.map((row) => (
              <li key={row.id} className="rounded-lg border border-[var(--border)] p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold">{row.label}</span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-semibold ${VERDICT_STYLE[row.verdict]}`}
                  >
                    {row.verdictLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{row.note}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!evaluation.error && evaluation.requirements.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Numbers to declare when you buy</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {evaluation.requirements.map((req) => (
              <div key={req.label} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <dt className="text-[var(--muted-foreground)]">{req.label}</dt>
                  <dd className="font-semibold tabular-nums">{req.value}</dd>
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">{req.note}</p>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. These are the standard shapes of font licences — your
        own EULA or negotiated agreement is the authority, and a lawyer should review anything
        commercially significant.
      </p>
    </main>
  );
}
