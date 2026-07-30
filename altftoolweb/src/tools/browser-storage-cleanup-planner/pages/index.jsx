"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Database, RotateCcw, Trash2 } from "lucide-react";

import {
  BROWSERS,
  GOALS,
  KEEP_LABELS,
  formatPlan,
  planStorageCleanup,
} from "../lib";

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DASH = "—";

const DEFAULTS = {
  goal: "tracking",
  browser: "chrome",
  keepLogins: true,
  keepSitePrefs: false,
  keepOfflineApps: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

function Meter({ label, value, tone }) {
  const width = Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
          {label}
        </span>
        <span className="text-sm font-semibold">{PCT.format(width)}%</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]">
        <span
          className="block h-full"
          style={{ width: `${width}%`, backgroundColor: `var(--${tone})` }}
        />
      </div>
    </div>
  );
}

export default function ToolHome() {
  const [goal, setGoal] = useState(DEFAULTS.goal);
  const [browser, setBrowser] = useState(DEFAULTS.browser);
  const [keepLogins, setKeepLogins] = useState(DEFAULTS.keepLogins);
  const [keepSitePrefs, setKeepSitePrefs] = useState(DEFAULTS.keepSitePrefs);
  const [keepOfflineApps, setKeepOfflineApps] = useState(DEFAULTS.keepOfflineApps);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () => planStorageCleanup({ goal, browser, keepLogins, keepSitePrefs, keepOfflineApps }),
    [goal, browser, keepLogins, keepSitePrefs, keepOfflineApps],
  );

  const hasError = Boolean(plan.error);
  const summary = useMemo(() => (hasError ? "" : formatPlan(plan)), [plan, hasError]);

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
    setGoal(DEFAULTS.goal);
    setBrowser(DEFAULTS.browser);
    setKeepLogins(DEFAULTS.keepLogins);
    setKeepSitePrefs(DEFAULTS.keepSitePrefs);
    setKeepOfflineApps(DEFAULTS.keepOfflineApps);
    setCopied(false);
  };

  const keepToggles = [
    ["keepLogins", keepLogins, setKeepLogins],
    ["keepSitePrefs", keepSitePrefs, setKeepSitePrefs],
    ["keepOfflineApps", keepOfflineApps, setKeepOfflineApps],
  ];

  const activeGoal = GOALS.find((item) => item.id === goal);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Database className="h-4 w-4" aria-hidden="true" />
          Tracking literacy
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Browser Storage Cleanup Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          A browser keeps your data in about a dozen separate stores, and the Clear browsing data
          dialog does not reach all of them. Pick a goal and this works out what to clear, what to
          leave alone, and exactly what breaks either way.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bsc-goal">
              What are you trying to achieve?
            </label>
            <select
              id="bsc-goal"
              className={`mt-2 ${INPUT_CLASS}`}
              value={goal}
              onChange={(event) => setGoal(event.target.value)}
            >
              {GOALS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            {activeGoal ? (
              <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                {activeGoal.blurb}
              </p>
            ) : null}
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bsc-browser">
              Browser
            </label>
            <select
              id="bsc-browser"
              className={`mt-2 ${INPUT_CLASS}`}
              value={browser}
              onChange={(event) => setBrowser(event.target.value)}
            >
              {BROWSERS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Things you would rather not lose
          </legend>
          <div className="mt-3 grid gap-2">
            {keepToggles.map(([key, value, setter]) => (
              <label
                key={key}
                htmlFor={`bsc-${key}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <input
                  id={`bsc-${key}`}
                  type="checkbox"
                  checked={value}
                  onChange={(event) => setter(event.target.checked)}
                  className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>{KEEP_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
          <section className={`mt-6 ${CARD}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Stores to clear
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Privacy gain", "Space reclaimed", "Breakage risk"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Stores to clear
                </p>
                <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
                  {plan.clearCount}
                  <span className="text-xl font-normal text-[var(--muted-foreground)]">
                    {" "}
                    of {plan.clearCount + plan.keepCount}
                  </span>
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {plan.goalLabel} in {plan.browser.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label="Copy the cleanup plan"
                  className={GHOST_BTN}
                >
                  {copied ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied ? "Copied!" : "Copy plan"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the planner"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Meter label="Privacy gain" value={plan.privacyGain} tone="primary" />
              <Meter label="Space reclaimed" value={plan.spaceGain} tone="success" />
              <Meter label="Breakage risk" value={plan.breakageRisk} tone="danger" />
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Goal", plan.goalLabel],
                ["Where to do it", plan.browser.path],
                ["Per-site view", plan.browser.perSite],
                ["This browser's blind spot", plan.browser.gap],
                ["How often", plan.cadenceText],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[10rem_1fr] sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {plan.warnings.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--warning-soft)] p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--warning)]">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Before you start
              </h2>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-[var(--foreground)]">
                {plan.warnings.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </section>
          )}

          <section className={`mt-6 ${CARD}`}>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Trash2 className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
              Clear these ({plan.clearCount})
            </h2>
            <ul className="mt-3 grid gap-3">
              {plan.clear.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{item.label}</h3>
                    {item.destructive && (
                      <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                        Irreversible
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-sm leading-6 text-[var(--muted-foreground)]">
                    {item.what}
                  </p>
                  <p className="mt-1.5 text-sm leading-6">
                    <span className="font-semibold">What breaks:</span> {item.breaks}
                  </p>
                  {item.note && (
                    <p className="mt-1.5 text-xs leading-5 text-[var(--muted-foreground)]">
                      {item.note}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className={`mt-6 ${CARD}`}>
            <h2 className="text-base font-semibold">Leave these alone ({plan.keepCount})</h2>
            <ul className="mt-3 divide-y divide-[var(--border)] text-sm">
              {plan.keep.map((item) => (
                <li key={item.id} className="grid gap-1 py-2.5 sm:grid-cols-[14rem_1fr] sm:gap-4">
                  <span className="font-semibold">{item.label}</span>
                  <span className="leading-6 text-[var(--muted-foreground)]">{item.reason}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Menu paths shift between browser releases, and clearing saved passwords,
        passkeys or autofill data cannot be undone from the browser — export anything you still need
        first.
      </p>
    </main>
  );
}
