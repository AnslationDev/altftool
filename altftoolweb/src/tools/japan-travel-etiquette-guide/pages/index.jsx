"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, Languages, RotateCcw, ShieldCheck } from "lucide-react";

import {
  CONTEXTS,
  COUNTRY,
  DEFAULT_ITEMS,
  MAX_ITEMS,
  MIN_ITEMS,
  SEVERITIES,
  TRIP_PURPOSES,
  buildEtiquetteBriefing,
} from "../lib";

const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const CARD_CLASS = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";
const CHECK_ROW =
  "flex min-h-11 items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_CONTEXTS = ["temples", "restaurants", "trains", "shops", "streets"];
const DEFAULT_PURPOSE = "first";

const severityClass = (id) => {
  if (id === "critical") return "bg-[var(--danger-soft)] text-[var(--danger)]";
  if (id === "important") return "bg-[var(--muted)] text-[var(--primary)]";
  return "bg-[var(--muted)] text-[var(--muted-foreground)]";
};

export default function ToolHome() {
  const [contextIds, setContextIds] = useState(DEFAULT_CONTEXTS);
  const [purposeId, setPurposeId] = useState(DEFAULT_PURPOSE);
  const [maxItems, setMaxItems] = useState(String(DEFAULT_ITEMS));
  const [knownRuleIds, setKnownRuleIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const toggleContext = (id) =>
    setContextIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const toggleKnown = (id) =>
    setKnownRuleIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );

  const result = useMemo(
    () =>
      buildEtiquetteBriefing({
        contextIds,
        purposeId,
        knownRuleIds,
        maxItems: maxItems === "" ? Number.NaN : Number(maxItems),
      }),
    [contextIds, purposeId, knownRuleIds, maxItems],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `${COUNTRY.name} etiquette briefing — ${result.purpose.label}`,
      `Places: ${result.contexts.map((entry) => entry.label).join(", ")}`,
      `Readiness: ${result.readinessPct}% (${result.knownCount} of ${result.ruleCount} rules ticked)`,
      "",
      "Top things to fix:",
      ...result.topMistakes.map((rule, index) => `${index + 1}. ${rule.title} — ${rule.action}`),
      "",
      "Full list:",
      ...result.rules.map((rule) => `[${rule.severity}] ${rule.title}: ${rule.action} (${rule.why})`),
    ].join("\n");
  }, [hasError, result]);

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
    setContextIds(DEFAULT_CONTEXTS);
    setPurposeId(DEFAULT_PURPOSE);
    setMaxItems(String(DEFAULT_ITEMS));
    setKnownRuleIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide text-[var(--primary)] uppercase">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          {COUNTRY.name}
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          {COUNTRY.name} Travel Etiquette Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{COUNTRY.headline}</p>
      </header>

      <section className={CARD_CLASS}>
        <h2 className="text-base font-semibold">Where will you actually be?</h2>
        <p className={HINT_CLASS}>
          Rules are filtered to these places. Anything carrying a legal penalty is shown whatever you
          tick.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CONTEXTS.map((context) => (
            <label className={CHECK_ROW} key={context.id} htmlFor={`ctx-${context.id}`}>
              <input
                id={`ctx-${context.id}`}
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={contextIds.includes(context.id)}
                onChange={() => toggleContext(context.id)}
              />
              <span>
                <span className="block font-medium">{context.label}</span>
                <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                  {context.note}
                </span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="in-purpose">
              What kind of trip
            </label>
            <select
              id="in-purpose"
              className={`mt-2 ${INPUT_CLASS}`}
              value={purposeId}
              onChange={(event) => setPurposeId(event.target.value)}
            >
              {TRIP_PURPOSES.map((purpose) => (
                <option key={purpose.id} value={purpose.id}>
                  {purpose.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>Shifts which categories are ranked highest.</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="in-max">
              How many rules to show
            </label>
            <input
              id="in-max"
              type="number"
              inputMode="numeric"
              min={MIN_ITEMS}
              max={MAX_ITEMS}
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={maxItems}
              onChange={(event) => setMaxItems(event.target.value)}
            />
            <p className={HINT_CLASS}>Highest priority first.</p>
          </div>
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

      <section className={`mt-6 ${CARD_CLASS}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide text-[var(--muted-foreground)] uppercase">
              Etiquette readiness
            </p>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)] tabular-nums">
              {hasError ? DASH : `${result.readinessPct}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Tick a place above to build the briefing." : result.readinessLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={`Copy the ${COUNTRY.name} etiquette briefing`}
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy briefing"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the briefing"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Rules that apply to your trip",
              hasError ? DASH : `${result.ruleCount} — ${result.knownCount} already ticked`,
            ],
            [
              "Weighted score",
              hasError ? DASH : `${result.knownWeight} of ${result.totalWeight} priority points`,
            ],
            ...(hasError
              ? []
              : result.bySeverity.map((entry) => [
                  entry.label,
                  `${entry.knownCount} of ${entry.count} ticked`,
                ])),
            [
              "Rules not shown",
              hasError ? DASH : result.hiddenCount === 0 ? "None" : `${result.hiddenCount} below the cut`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.topMistakes.length > 0 && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">Fix these first</h2>
          <ol className="mt-3 grid gap-3 text-sm">
            {result.topMistakes.map((rule, index) => (
              <li key={rule.id} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-bold text-[var(--primary-foreground)]">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-semibold">{rule.title}</span>
                  <span className="mt-0.5 block text-[var(--muted-foreground)]">{rule.action}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">The briefing</h2>
          <p className={HINT_CLASS}>
            Tick a rule once you know it and the readiness score above updates.
          </p>
          <ul className="mt-4 grid gap-3">
            {result.rules.map((rule) => (
              <li
                key={rule.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <label className="flex items-start gap-3" htmlFor={`rule-${rule.id}`}>
                  <input
                    id={`rule-${rule.id}`}
                    type="checkbox"
                    className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                    checked={rule.known}
                    onChange={() => toggleKnown(rule.id)}
                  />
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{rule.title}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${severityClass(rule.severity)}`}
                      >
                        {rule.severity}
                      </span>
                      <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-medium text-[var(--muted-foreground)]">
                        {rule.category}
                      </span>
                    </span>
                    <span className="mt-2 block text-sm">{rule.action}</span>
                    <span className="mt-1 block text-sm text-[var(--danger)]">{rule.avoid}</span>
                    <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {rule.why}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.legalRisks.length > 0 && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Where the consequence is legal, not social
          </h2>
          <ul className="mt-3 grid gap-2 text-sm">
            {result.legalRisks.map((rule) => (
              <li key={rule.id}>
                <span className="font-semibold">{rule.title}</span>{" "}
                <span className="text-[var(--muted-foreground)]">{rule.why}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Languages className="h-4 w-4 text-[var(--primary)]" aria-hidden="true" />
            Phrases worth having ready
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide text-[var(--muted-foreground)] uppercase">
                  <th className="py-2 pr-3 font-semibold">Say</th>
                  <th className="py-2 pr-3 font-semibold">Script</th>
                  <th className="py-2 pr-3 font-semibold">Means</th>
                  <th className="py-2 font-semibold">When</th>
                </tr>
              </thead>
              <tbody>
                {result.phrases.map((phrase) => (
                  <tr key={phrase.roman} className="border-b border-[var(--border)] align-top">
                    <td className="py-2.5 pr-3 font-semibold">{phrase.roman}</td>
                    <td className="py-2.5 pr-3">{phrase.script}</td>
                    <td className="py-2.5 pr-3">{phrase.english}</td>
                    <td className="py-2.5 text-[var(--muted-foreground)]">{phrase.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {!hasError && (
        <section className={`mt-6 ${CARD_CLASS}`}>
          <h2 className="text-base font-semibold">How the ranking works</h2>
          <ul className="mt-3 grid gap-2 text-sm text-[var(--muted-foreground)]">
            {SEVERITIES.map((severity) => (
              <li key={severity.id}>
                <span className="font-semibold text-[var(--foreground)]">{severity.label}</span> —{" "}
                {severity.note} Weight {severity.weight}.
              </li>
            ))}
            <li>
              A {result.purpose.label.toLowerCase()} lifts the weight on{" "}
              {Object.keys(result.purpose.emphasis).join(", ").toLowerCase()}.
            </li>
          </ul>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Customs vary by region, generation and setting, and rules with legal
        consequences can change — check current guidance from official sources before you travel.{" "}
        {COUNTRY.currencyNote}
      </p>
    </main>
  );
}
