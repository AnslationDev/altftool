"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, Vault, X } from "lucide-react";
import {
  MEDIA_TYPES,
  MIN_COPIES,
  MIN_MEDIA_TYPES,
  planRecoveryStorage,
  REVIEW_INTERVAL_MONTHS,
  STORAGE_LOCATIONS,
} from "../lib";

const DEFAULT_SELECTED = ["password-manager", "phone-screenshot"];
const DEFAULT_ACCOUNTS = "12";
const DASH = "—";

const NUM = new Intl.NumberFormat("en-US");

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const MEDIA_ORDER = ["physical", "local-digital", "cloud-digital"];

export default function ToolHome() {
  const [selected, setSelected] = useState(DEFAULT_SELECTED);
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [protectsManager, setProtectsManager] = useState(true);
  const [protectsEmail, setProtectsEmail] = useState(true);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      planRecoveryStorage({
        selectedIds: selected,
        accountCount: accounts.trim() === "" ? Number.NaN : Number(accounts),
        protectsPasswordManager: protectsManager,
        protectsEmail,
      }),
    [selected, accounts, protectsManager, protectsEmail],
  );

  const hasError = Boolean(result.error);

  const toggle = (id) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "2FA recovery code storage plan",
      `Resilience: ${result.scorePercent}% — ${result.verdictLabel}. ${result.verdictAdvice}`,
      `Copies: ${result.copies} across ${result.mediaCount} media type(s); ${result.offsiteCount} off-site.`,
      `Code sets to keep in sync: ${NUM.format(result.codeSetsToMaintain)}`,
      "",
      "Locations:",
      ...result.chosen.map((location) => `- ${location.label}`),
      "",
      "Rule checks:",
      ...result.checks.map((check) => `${check.ok ? "PASS" : "FAIL"} ${check.label} — ${check.detail}`),
    ];
    if (result.suggestions.length > 0) {
      lines.push("", "Add next:");
      result.suggestions.forEach((location) => lines.push(`- ${location.label}: ${location.note}`));
    }
    lines.push("", `Review and re-generate codes every ${REVIEW_INTERVAL_MONTHS} months.`);
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
    setSelected(DEFAULT_SELECTED);
    setAccounts(DEFAULT_ACCOUNTS);
    setProtectsManager(true);
    setProtectsEmail(true);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Vault className="h-4 w-4" aria-hidden="true" />
          Two-factor backup
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Recovery Code Storage Planner
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Pick where your 2FA backup codes will live. The plan is graded against the 3-2-1 backup
          rule plus the two failures specific to authentication: a copy on the same phone as your
          authenticator, and a copy locked behind the very account it is meant to recover.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where will the codes live?</h2>
        <div className="mt-4 space-y-6">
          {MEDIA_ORDER.map((media) => (
            <fieldset key={media} className="border-0 p-0">
              <legend className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                {MEDIA_TYPES[media]}
              </legend>
              <div className="mt-2 space-y-2">
                {STORAGE_LOCATIONS.filter((location) => location.media === media).map((location) => (
                  <label
                    key={location.id}
                    htmlFor={`rc-${location.id}`}
                    className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                  >
                    <input
                      id={`rc-${location.id}`}
                      type="checkbox"
                      checked={selected.includes(location.id)}
                      onChange={() => toggle(location.id)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                    />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{location.label}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {location.note}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                        Watch out: {location.watch}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rc-accounts">
              Accounts you hold recovery codes for
            </label>
            <input
              id="rc-accounts"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={accounts}
              onChange={(event) => {
                setAccounts(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="rc-manager"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            >
              <input
                id="rc-manager"
                type="checkbox"
                checked={protectsManager}
                onChange={(event) => setProtectsManager(event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              One of them is my password manager
            </label>
            <label
              htmlFor="rc-email"
              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-medium"
            >
              <input
                id="rc-email"
                type="checkbox"
                checked={protectsEmail}
                onChange={(event) => setProtectsEmail(event.target.checked)}
                className="h-5 w-5 accent-[var(--primary)]"
              />
              One of them is my primary email
            </label>
          </div>
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

      <section
        aria-live="polite"
        role="status"
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Plan resilience
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${result.scorePercent}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? DASH : `${result.verdictLabel} — ${result.verdictAdvice}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the storage plan and rule checks"
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
            ["Copies planned", hasError ? DASH : `${result.copies} (target ${MIN_COPIES})`],
            [
              "Media types",
              hasError
                ? DASH
                : `${result.mediaCount} of ${MIN_MEDIA_TYPES} needed${
                    result.mediaLabels.length > 0 ? ` — ${result.mediaLabels.join(", ")}` : ""
                  }`,
            ],
            ["Off-site copies", hasError ? DASH : String(result.offsiteCount)],
            ["Encrypted copies", hasError ? DASH : String(result.encryptedCount)],
            ["Rules failed", hasError ? DASH : `${result.failedCount} of ${result.checks.length}`],
            [
              "Code sets to keep in sync",
              hasError ? DASH : NUM.format(result.codeSetsToMaintain),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Rule checks</h2>
          <ul className="mt-3 space-y-2">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <span
                  className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    check.ok
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                  aria-hidden="true"
                >
                  {check.ok ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">
                    {check.ok ? "Pass" : "Fail"}: {check.label}
                  </span>
                  <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                    {check.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.suggestions.length > 0 && (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Add these next</h2>
          <ol className="mt-3 space-y-3">
            {result.suggestions.map((location) => (
              <li
                key={location.id}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] p-3"
              >
                <p className="text-sm font-semibold">{location.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                  {location.note}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Re-check this plan every {REVIEW_INTERVAL_MONTHS} months. Most services invalidate the whole
        old set when you generate new codes, so any copy you forget to replace becomes dead paper.
        Informational only, not security advice for a specific organisation.
      </p>
    </main>
  );
}
