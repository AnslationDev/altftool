"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert, SmartphoneNfc } from "lucide-react";

import { DIMENSIONS, compareConnectivity } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const GB = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const TOGGLE_ROW =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm transition focus-within:border-[var(--primary)] focus-within:ring-[3px] focus-within:ring-[var(--primary)]/25";
const CHECKBOX = "mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus:outline-none";

const IMPORTANCE_LABELS = ["Not important", "Nice to have", "Important", "Critical"];

const DEFAULTS = {
  tripDays: "14",
  dataGb: "14",
  countries: "2",
  mustKeepHomeNumber: true,
  hasEsim: true,
  dualSim: true,
  unlocked: true,
  importance: {
    otpAccess: 3,
    identityMinimisation: 2,
    costControl: 2,
    coverage: 3,
    simplicity: 1,
  },
};

const toNumber = (raw) => {
  const trimmed = String(raw).trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

export default function ToolHome() {
  const [tripDays, setTripDays] = useState(DEFAULTS.tripDays);
  const [dataGb, setDataGb] = useState(DEFAULTS.dataGb);
  const [countries, setCountries] = useState(DEFAULTS.countries);
  const [mustKeepHomeNumber, setMustKeepHomeNumber] = useState(DEFAULTS.mustKeepHomeNumber);
  const [hasEsim, setHasEsim] = useState(DEFAULTS.hasEsim);
  const [dualSim, setDualSim] = useState(DEFAULTS.dualSim);
  const [unlocked, setUnlocked] = useState(DEFAULTS.unlocked);
  const [importance, setImportance] = useState(DEFAULTS.importance);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      compareConnectivity({
        tripDays: toNumber(tripDays),
        dataGb: toNumber(dataGb),
        countries: toNumber(countries),
        mustKeepHomeNumber,
        hasEsim,
        dualSim,
        unlocked,
        importance,
      }),
    [tripDays, dataGb, countries, mustKeepHomeNumber, hasEsim, dualSim, unlocked, importance],
  );
  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "International roaming privacy comparison",
      `Trip: ${tripDays} days, ${countries} country/countries, about ${GB.format(result.dailyGb)} GB per day`,
      result.best ? `Best fit: ${result.best.label} (${result.best.fitPercent}%)` : "No option is available with this handset.",
      "",
      "Ranking:",
      ...result.ordered.map((option) => `${option.fitPercent}% — ${option.label}`),
      result.blocked.length
        ? `\nRuled out: ${result.blocked.map((option) => `${option.label} (${option.blockers.join(" ")})`).join(" | ")}`
        : "",
      `\n${result.verdict}`,
      "",
      "True whichever you pick:",
      ...result.residual.map((line) => `- ${line}`),
    ]
      .filter(Boolean)
      .join("\n");
  }, [countries, hasError, result, tripDays]);

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
    setTripDays(DEFAULTS.tripDays);
    setDataGb(DEFAULTS.dataGb);
    setCountries(DEFAULTS.countries);
    setMustKeepHomeNumber(DEFAULTS.mustKeepHomeNumber);
    setHasEsim(DEFAULTS.hasEsim);
    setDualSim(DEFAULTS.dualSim);
    setUnlocked(DEFAULTS.unlocked);
    setImportance(DEFAULTS.importance);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Best fit", DASH],
        ["Runner-up", DASH],
        ["Options ruled out", DASH],
        ["Data per day", DASH],
      ]
    : [
        ["Best fit", result.best ? `${result.best.label} (${NUM.format(result.best.fitPercent)}%)` : "None available"],
        [
          "Runner-up",
          result.runnerUp ? `${result.runnerUp.label} (${NUM.format(result.runnerUp.fitPercent)}%)` : "None",
        ],
        ["Options ruled out", NUM.format(result.blocked.length)],
        ["Data per day", `${GB.format(result.dailyGb)} GB`],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <SmartphoneNfc className="h-4 w-4" aria-hidden="true" />
          Travel security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          International Roaming Privacy Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Home roaming, a travel eSIM, a local SIM and Wi-Fi only trade different things away.
          Describe the trip and the handset, say what matters to you, and see which one fits — plus
          what stays visible to the network no matter what you choose.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">1. The trip</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="trip-days">
              Days away
            </label>
            <input
              id="trip-days"
              className={`mt-2 ${FIELD}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="365"
              value={tripDays}
              onChange={(event) => setTripDays(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL} htmlFor="trip-countries">
              Countries on the itinerary
            </label>
            <input
              id="trip-countries"
              className={`mt-2 ${FIELD}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              value={countries}
              onChange={(event) => setCountries(event.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="trip-data">
              Data you expect to use in total (GB)
            </label>
            <input
              id="trip-data"
              className={`mt-2 ${FIELD}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="2000"
              step="1"
              value={dataGb}
              onChange={(event) => setDataGb(event.target.value)}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Maps, messaging and a little browsing is roughly 0.3–0.5 GB a day. Video calls and
              streaming push it past 2 GB.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">2. Your handset and your OTPs</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className={TOGGLE_ROW} htmlFor="need-otp">
            <input
              id="need-otp"
              type="checkbox"
              className={CHECKBOX}
              checked={mustKeepHomeNumber}
              onChange={(event) => setMustKeepHomeNumber(event.target.checked)}
            />
            <span className="leading-6">I need OTPs on my home number</span>
          </label>
          <label className={TOGGLE_ROW} htmlFor="has-esim">
            <input
              id="has-esim"
              type="checkbox"
              className={CHECKBOX}
              checked={hasEsim}
              onChange={(event) => setHasEsim(event.target.checked)}
            />
            <span className="leading-6">Handset supports eSIM</span>
          </label>
          <label className={TOGGLE_ROW} htmlFor="dual-sim">
            <input
              id="dual-sim"
              type="checkbox"
              className={CHECKBOX}
              checked={dualSim}
              onChange={(event) => setDualSim(event.target.checked)}
            />
            <span className="leading-6">Handset can run two lines at once</span>
          </label>
          <label className={TOGGLE_ROW} htmlFor="unlocked">
            <input
              id="unlocked"
              type="checkbox"
              className={CHECKBOX}
              checked={unlocked}
              onChange={(event) => setUnlocked(event.target.checked)}
            />
            <span className="leading-6">Handset is carrier-unlocked</span>
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">3. What matters to you</h2>
        <div className="mt-3 grid gap-4">
          {DIMENSIONS.map((dimension) => (
            <div key={dimension.id}>
              <label className={LABEL} htmlFor={`imp-${dimension.id}`}>
                {dimension.label}
              </label>
              <select
                id={`imp-${dimension.id}`}
                className={`mt-2 ${FIELD}`}
                value={importance[dimension.id]}
                onChange={(event) =>
                  setImportance((current) => ({
                    ...current,
                    [dimension.id]: Number(event.target.value),
                  }))
                }
              >
                {IMPORTANCE_LABELS.map((label, value) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{dimension.hint}</p>
            </div>
          ))}
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Best fit for your priorities
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${hasError || !result.best ? "text-[var(--muted-foreground)]" : "text-[var(--primary)]"}`}
            >
              {hasError || !result.best ? DASH : `${NUM.format(result.best.fitPercent)}%`}
            </p>
            <p className="mt-1 max-w-md text-sm font-semibold">
              {hasError ? DASH : result.best ? result.best.label : "No option available"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the roaming comparison"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the comparison to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
          {hasError ? "Fix the input above to see a comparison." : result.verdict}
        </p>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.notes.length ? (
          <ul className="mt-5 grid gap-2 text-sm leading-6">
            {result.notes.map((note) => (
              <li key={note} className="flex gap-2 rounded-md bg-[var(--muted)] px-3 py-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  &bull;
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {!hasError && result.ordered.length ? (
        <section className="mt-6 grid gap-4">
          {result.ordered.map((option) => (
            <article
              key={option.id}
              className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-base font-semibold">{option.label}</h2>
                <span className="text-sm font-semibold text-[var(--primary)]">
                  {NUM.format(option.fitPercent)}% fit
                </span>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--success)]">
                    In its favour
                  </h3>
                  <ul className="mt-2 grid gap-1.5 text-sm leading-6">
                    {option.pros.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xs font-semibold tracking-wide uppercase text-[var(--danger)]">
                    What you give up
                  </h3>
                  <ul className="mt-2 grid gap-1.5 text-sm leading-6">
                    {option.cons.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      {!hasError && result.blocked.length ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Ruled out for this trip
          </h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.blocked.map((option) => (
              <li key={option.id}>
                <span className="font-semibold">{option.label}</span>
                <span className="block text-[var(--muted-foreground)]">
                  {option.blockers.join(" ")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">True whichever option you pick</h2>
          <ul className="mt-3 grid gap-1.5 text-sm leading-6">
            {result.residual.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden="true" className="text-[var(--primary)]">
                  &bull;
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. SIM registration rules, roaming charges and eSIM support vary by
        country, operator and handset — confirm with your own operator and the destination's rules
        before you travel. Nothing you enter here leaves your browser.
      </p>
    </main>
  );
}
