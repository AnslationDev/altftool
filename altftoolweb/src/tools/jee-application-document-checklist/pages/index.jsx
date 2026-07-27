"use client";

import { useMemo, useState } from "react";
import { Check, ClipboardList, Copy, RotateCcw } from "lucide-react";

import {
  CATEGORIES,
  GENDERS,
  applicableSections,
  computeProgress,
  feeForProfile,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_PROFILE = { category: "general", gender: "male", pwd: false };
const DASH = "—";

export default function ToolHome() {
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [checkedIds, setCheckedIds] = useState([]);
  const [copied, setCopied] = useState(false);

  const sections = useMemo(() => applicableSections(profile), [profile]);
  const progress = useMemo(
    () => computeProgress({ profile, checkedIds }),
    [profile, checkedIds],
  );
  const fee = useMemo(() => feeForProfile(profile), [profile]);
  const hasError = Boolean(progress.error || fee.error);
  const errorText = progress.error || fee.error;

  const toggleItem = (id) => {
    setCopied(false);
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const setProfileField = (field, value) => {
    setCopied(false);
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "JEE (Main) application checklist",
      `Prepared: ${progress.done} of ${progress.total} items (${progress.percent}%)`,
      `Fee per paper (India centres): ${INR.format(fee.fee)} — ${fee.band}`,
      progress.remainingRequired.length > 0
        ? `Still needed:\n${progress.remainingRequired.map((label) => `- ${label}`).join("\n")}`
        : "All required items are ready.",
    ].join("\n");
  }, [hasError, progress, fee]);

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
    setProfile(DEFAULT_PROFILE);
    setCheckedIds([]);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <ClipboardList className="h-4 w-4" aria-hidden="true" />
          Application Help
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          JEE Application Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Prepare every NTA JEE (Main) form field, scan and certificate before the portal opens.
          Choose your category and gender so the fee and certificate list match your own
          application.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-category">
              Candidate category
            </label>
            <select
              id="jee-category"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile.category}
              onChange={(event) => setProfileField("category", event.target.value)}
            >
              {CATEGORIES.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="jee-gender">
              Gender (fee slab)
            </label>
            <select
              id="jee-gender"
              className={`mt-2 ${INPUT_CLASS}`}
              value={profile.gender}
              onChange={(event) => setProfileField("gender", event.target.value)}
            >
              {GENDERS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <label
            className="flex min-h-11 cursor-pointer items-center gap-3 text-sm sm:col-span-2"
            htmlFor="jee-flag-pwd"
          >
            <input
              id="jee-flag-pwd"
              type="checkbox"
              className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
              checked={Boolean(profile.pwd)}
              onChange={(event) => setProfileField("pwd", event.target.checked)}
            />
            Person with disability (PwD) claim
          </label>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {errorText}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Checklist progress
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${progress.percent}%`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see progress."
                : progress.ready
                  ? "Every required item is ready — you can start the application."
                  : `${NUM.format(progress.remainingRequired.length)} required item${progress.remainingRequired.length === 1 ? "" : "s"} still to prepare.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the checklist status"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy status"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the checklist and profile"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="progressbar"
          aria-valuenow={hasError ? 0 : progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Checklist completion"
        >
          <div
            className="h-full rounded-full bg-[var(--primary)] transition-all motion-reduce:transition-none"
            style={{ width: `${hasError ? 0 : progress.percent}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Items prepared", hasError ? DASH : `${progress.done} of ${progress.total}`],
            [
              "Required items done",
              hasError ? DASH : `${progress.requiredDone} of ${progress.requiredTotal}`,
            ],
            [
              "Fee per paper (India centres)",
              hasError ? DASH : `${INR.format(fee.fee)} — ${fee.band}`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {sections.map((section) => (
        <section
          key={section.id}
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="text-base font-semibold">{section.title}</h2>
          <ul className="mt-3 space-y-1">
            {section.items.map((item) => (
              <li key={item.id}>
                <label
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 transition hover:bg-[var(--muted)]"
                  htmlFor={`jee-item-${item.id}`}
                >
                  <input
                    id={`jee-item-${item.id}`}
                    type="checkbox"
                    className="mt-0.5 h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
                    checked={checkedIds.includes(item.id)}
                    onChange={() => toggleItem(item.id)}
                  />
                  <span>
                    <span
                      className={`block text-sm font-semibold ${checkedIds.includes(item.id) ? "text-[var(--muted-foreground)] line-through" : ""}`}
                    >
                      {item.label}
                      {item.required ? null : (
                        <span className="ml-2 text-xs font-medium text-[var(--muted-foreground)]">
                          (recommended)
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                      {item.detail}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational aid only. Fee amounts, file-size bands and the upload list are fixed by each
        JEE (Main) information bulletin and can change between sessions — verify against the
        current bulletin on jeemain.nta.nic.in before applying.
      </p>
    </main>
  );
}
