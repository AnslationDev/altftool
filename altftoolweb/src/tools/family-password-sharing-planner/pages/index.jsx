"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Users } from "lucide-react";
import {
  buildSharingPlan,
  CREDENTIAL_GROUPS,
  CREDENTIALS,
  MAX_ADULTS,
  MAX_TEENS,
  MODES,
} from "../lib";

const DASH = "—";

const DEFAULT_CHOICES = CREDENTIALS.reduce((map, credential) => {
  map[credential.id] = credential.recommended;
  return map;
}, {});
// A realistic starting point: the two mistakes almost every household makes.
DEFAULT_CHOICES["personal-email"] = "vault-share";
DEFAULT_CHOICES["wifi-password"] = "plaintext";
DEFAULT_CHOICES["camera-app"] = "individual";

const DEFAULT_ADULTS = "2";
const DEFAULT_TEENS = "1";

const MODE_OPTIONS = Object.values(MODES);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const LEVEL_TONE = {
  critical: "bg-[var(--danger-soft)] text-[var(--danger)]",
  moderate: "bg-[var(--muted)] text-[var(--foreground)]",
  minor: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

export default function ToolHome() {
  const [choices, setChoices] = useState(DEFAULT_CHOICES);
  const [adults, setAdults] = useState(DEFAULT_ADULTS);
  const [teens, setTeens] = useState(DEFAULT_TEENS);
  const [hasManager, setHasManager] = useState(true);
  const [emergencySet, setEmergencySet] = useState(false);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      buildSharingPlan({
        choices,
        adults: adults.trim() === "" ? Number.NaN : Number(adults),
        teens: teens.trim() === "" ? Number.NaN : Number(teens),
        hasPasswordManager: hasManager,
        emergencyAccessSet: emergencySet,
      }),
    [choices, adults, teens, hasManager, emergencySet],
  );

  const hasError = Boolean(result.error);

  const setChoice = (id, mode) => {
    setChoices((current) => ({ ...current, [id]: mode }));
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Household password sharing plan",
      `Alignment: ${result.score}% — ${result.verdictLabel}. ${result.verdictAdvice}`,
      `${result.consideredCount} credentials considered, ${result.sharedCount} shared, ${result.plaintextCount} left as plaintext copies.`,
      `${result.emergencyNeededCount} would be needed if one of you were unavailable.`,
      "",
      "Recommended handling:",
    ];
    result.byMode.forEach((mode) => {
      lines.push(`${mode.label}: ${mode.items.map((item) => item.label).join(", ")}`);
    });
    if (result.fixes.length > 0) {
      lines.push("", "Changes to make:");
      result.fixes.forEach((fix, index) => {
        lines.push(
          `${index + 1}. ${fix.label} — currently ${fix.currentLabel}, should be ${fix.recommendedLabel}. ${fix.action}`,
        );
      });
    }
    result.caps.forEach((cap) => lines.push("", `Note: ${cap.text}`));
    return lines.join("\n");
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
    setChoices(DEFAULT_CHOICES);
    setAdults(DEFAULT_ADULTS);
    setTeens(DEFAULT_TEENS);
    setHasManager(true);
    setEmergencySet(false);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Household security
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Shared Family Password Plan Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Mark how your household handles each login today. The builder compares it with what that
          credential should use — a joint account, a shared vault collection, or an individual
          login with emergency access — and lists the changes worth making. No password is ever
          entered.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">About your household</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-adults">
              Adults (1–{MAX_ADULTS})
            </label>
            <input
              id="fp-adults"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ADULTS}
              step="1"
              value={adults}
              onChange={(event) => {
                setAdults(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fp-teens">
              Teenagers with their own logins (0–{MAX_TEENS})
            </label>
            <input
              id="fp-teens"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max={MAX_TEENS}
              step="1"
              value={teens}
              onChange={(event) => {
                setTeens(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label
            htmlFor="fp-manager"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
          >
            <input
              id="fp-manager"
              type="checkbox"
              checked={hasManager}
              onChange={(event) => {
                setHasManager(event.target.checked);
                setCopied(false);
              }}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            We use a password manager with shared collections
          </label>
          <label
            htmlFor="fp-emergency"
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
          >
            <input
              id="fp-emergency"
              type="checkbox"
              checked={emergencySet}
              onChange={(event) => {
                setEmergencySet(event.target.checked);
                setCopied(false);
              }}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Emergency access or a legacy contact is already nominated
          </label>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">How you handle each login today</h2>
        <div className="mt-4 space-y-6">
          {CREDENTIAL_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {group.label}
              </p>
              <div className="mt-2 space-y-3">
                {CREDENTIALS.filter((credential) => credential.group === group.id).map(
                  (credential) => (
                    <div
                      key={credential.id}
                      className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                    >
                      <label className={LABEL_CLASS} htmlFor={`fp-${credential.id}`}>
                        {credential.label}
                      </label>
                      <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                        {credential.why}
                      </p>
                      <select
                        id={`fp-${credential.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        value={choices[credential.id] ?? "na"}
                        onChange={(event) => setChoice(credential.id, event.target.value)}
                      >
                        {MODE_OPTIONS.map((mode) => (
                          <option key={mode.id} value={mode.id}>
                            {mode.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Plan alignment
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.score}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.verdictLabel} — ${result.verdictAdvice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the household sharing plan"
              className={GHOST_BTN}
              disabled={hasError}
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
              aria-label="Reset the planner to its defaults"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Credentials considered", hasError ? DASH : String(result.consideredCount)],
            ["Currently shared", hasError ? DASH : String(result.sharedCount)],
            ["Left as a plaintext copy", hasError ? DASH : String(result.plaintextCount)],
            [
              "Shared but should not be",
              hasError ? DASH : String(result.overSharedCount),
            ],
            [
              "Needed if someone is unavailable",
              hasError ? DASH : String(result.emergencyNeededCount),
            ],
            [
              "Access grants to revoke if someone leaves",
              hasError ? DASH : String(result.revocationLoad),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError &&
          result.caps.map((cap) => (
            <p
              key={cap.id}
              role="status"
              className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
            >
              {cap.text}
            </p>
          ))}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Changes to make</h2>
          {result.fixes.length === 0 ? (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--muted-foreground)]">
              Every credential you marked is already handled the recommended way.
            </p>
          ) : (
            <ol className="mt-3 space-y-3">
              {result.fixes.map((fix) => (
                <li
                  key={fix.id}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
                >
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${LEVEL_TONE[fix.levelId]}`}
                  >
                    {fix.levelLabel}
                  </span>
                  <p className="mt-1.5 text-sm font-semibold">{fix.label}</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Now: {fix.currentLabel} · Should be: {fix.recommendedLabel}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                    {fix.action}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">The recommended split</h2>
          <div className="mt-3 space-y-4">
            {result.byMode.map((mode) => (
              <div key={mode.id}>
                <p className="text-sm font-semibold">{mode.label}</p>
                <p className="mt-0.5 text-xs leading-5 text-[var(--muted-foreground)]">
                  {mode.detail}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {mode.items.map((item) => item.label).join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal or financial advice. Bank, insurer and health-service terms
        vary — check your own provider&apos;s rules on disclosure and third-party access, and speak
        to a solicitor about power of attorney if someone may need to act on your behalf.
      </p>
    </main>
  );
}
