"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import {
  CONSUMER_TYPES,
  DEFAULT_INPUT,
  ROTATION_MODES,
  SENSITIVITY_LEVELS,
  evaluateAuthChoice,
  formatDecision,
} from "../lib";

const FIELD =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TOGGLES = [
  ["actsOnBehalfOfUsers", "Caller acts on behalf of an end user"],
  ["canStoreSecret", "Client can keep a secret (server-side, not shipped to users)"],
  ["interactiveBrowser", "A browser is available on the client device"],
  ["needScopes", "Access must be narrowed per permission (scopes)"],
  ["needPerUserRevocation", "Access must be revocable for one user alone"],
];

const DASH = "—";

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULT_INPUT);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => evaluateAuthChoice(form), [form]);
  const summary = useMemo(() => (result.error ? "" : formatDecision(result)), [result]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied(false);
  };

  const applyConsumer = (id) => {
    const type = CONSUMER_TYPES.find((entry) => entry.id === id);
    setForm((prev) => ({ ...prev, consumer: id, ...(type ? type.preset : {}) }));
    setCopied(false);
  };

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
    setForm(DEFAULT_INPUT);
    setCopied(false);
  };

  const ok = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          API authentication
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          API Key vs OAuth Decision Helper
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Describe one API consumer and see how static keys, the OAuth 2.1 grants and mutual TLS
          score against it — with the mechanisms that structurally cannot work ruled out first.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL} htmlFor="auth-consumer">
              Who is calling the API?
            </label>
            <select
              id="auth-consumer"
              className={`mt-2 ${FIELD}`}
              value={form.consumer}
              onChange={(event) => applyConsumer(event.target.value)}
            >
              {CONSUMER_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Picking a consumer sets the three structural answers below; override any of them.
            </p>
          </div>
          <div>
            <label className={LABEL} htmlFor="auth-sensitivity">
              Data sensitivity
            </label>
            <select
              id="auth-sensitivity"
              className={`mt-2 ${FIELD}`}
              value={form.dataSensitivity}
              onChange={(event) => setField("dataSensitivity", event.target.value)}
            >
              {SENSITIVITY_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL} htmlFor="auth-rotation">
              Credential rotation plan
            </label>
            <select
              id="auth-rotation"
              className={`mt-2 ${FIELD}`}
              value={form.rotation}
              onChange={(event) => setField("rotation", event.target.value)}
            >
              {ROTATION_MODES.map((mode) => (
                <option key={mode.id} value={mode.id}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Requirements</legend>
          <div className="mt-2 grid gap-2">
            {TOGGLES.map(([key, label]) => (
              <label
                key={key}
                htmlFor={`auth-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`auth-${key}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                  checked={form[key]}
                  onChange={(event) => setField(key, event.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {result.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Recommended mechanism
            </p>
            <p className="mt-1 text-2xl font-semibold leading-tight text-[var(--primary)] sm:text-3xl">
              {ok ? result.recommendation.name : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${result.recommendation.spec} · ${result.recommendation.percent}% fit` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the authentication recommendation"
              className={GHOST_BTN}
              disabled={!ok}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all answers" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok ? (
          <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
            {result.recommendation.summary}
          </p>
        ) : null}

        {ok && result.warning ? (
          <p className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm font-medium text-[var(--warning)]">
            {result.warning}
          </p>
        ) : null}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Runner-up</dt>
            <dd className="text-right font-semibold">
              {ok && result.runnerUp ? `${result.runnerUp.name} (${result.runnerUp.percent}%)` : DASH}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Mechanisms still viable</dt>
            <dd className="text-right font-semibold">{ok ? `${result.viableCount} of 5` : DASH}</dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Weighted score</dt>
            <dd className="text-right font-semibold">
              {ok ? `${result.recommendation.score} / ${result.maxScore}` : DASH}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Wire format</dt>
            <dd className="max-w-[60%] break-words text-right font-mono text-xs font-semibold">
              {ok ? result.recommendation.header : DASH}
            </dd>
          </div>
        </dl>
      </section>

      {ok ? (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">How every mechanism scored</h2>
            <div className="mt-4 grid gap-3">
              {result.ranked.map((option) => (
                <div
                  key={option.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold">
                      {option.name}
                      <span className="ml-2 font-normal text-[var(--muted-foreground)]">{option.spec}</span>
                    </p>
                    <p
                      className={`text-sm font-semibold ${
                        option.viable ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"
                      }`}
                    >
                      {option.percent}%
                    </p>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
                    <span
                      className={`block h-full ${option.viable ? "bg-[var(--primary)]" : "bg-[var(--muted-foreground)]"}`}
                      style={{ width: `${Math.max(0, Math.min(100, option.percent))}%` }}
                    />
                  </div>
                  {option.viable ? (
                    <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">{option.summary}</p>
                  ) : (
                    <p className="mt-2 rounded-md bg-[var(--danger-soft)] px-2 py-1.5 text-xs leading-5 text-[var(--danger)]">
                      Ruled out: {option.ruledOutReason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Criteria and weights applied</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Criterion</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Weight</th>
                    <th scope="col" className="py-2 text-right font-semibold">Winner scores</th>
                  </tr>
                </thead>
                <tbody>
                  {result.criteria.map((criterion) => (
                    <tr key={criterion.id} className="border-b border-[var(--border)] last:border-0 align-top">
                      <td className="py-2 pr-3">
                        <span className="font-semibold">{criterion.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {criterion.note}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-right font-semibold">{criterion.weight}</td>
                      <td className="py-2 text-right font-semibold">
                        {criterion.scores[result.recommendation.id]} / 3
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">If you go with {result.recommendation.name}</h2>
            <ul className="mt-3 grid gap-2 text-sm leading-6">
              {result.recommendation.implementation.map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        A design aid, not a security review. Regulated APIs — payments, health records, government
        identity — carry scheme-specific requirements that sit on top of the mechanism you pick.
      </p>
    </main>
  );
}
