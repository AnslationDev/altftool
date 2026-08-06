"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Gamepad2, RotateCcw, ShieldAlert, TriangleAlert } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import {
  FEATURE_FLAGS,
  KIDS_GAME_PERMISSIONS,
  auditKidsGamePermissions,
  formatAuditSummary,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULT_AGE = "8";
const DEFAULT_GRANTED = ["precise-location", "contacts", "advertising-id", "notifications"];

const BAND_STYLE = {
  clean: { text: "text-[var(--success)]", bar: "bg-[var(--success)]" },
  low: { text: "text-[var(--success)]", bar: "bg-[var(--success)]" },
  moderate: { text: "text-[var(--warning-text)]", bar: "bg-[var(--warning)]" },
  high: { text: "text-[var(--danger)]", bar: "bg-[var(--danger)]" },
  critical: { text: "text-[var(--danger)]", bar: "bg-[var(--danger)]" },
};

const DASH = "—";

export default function ToolHome() {
  const [age, setAge] = useState(DEFAULT_AGE);
  const [granted, setGranted] = useState(DEFAULT_GRANTED);
  const [features, setFeatures] = useState({});
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () => auditKidsGamePermissions({ granted, childAge: age, features }),
    [granted, age, features],
  );

  const summary = useMemo(() => formatAuditSummary(result), [result]);
  const hasError = Boolean(result.error);
  const bandStyle = BAND_STYLE[result.band] || BAND_STYLE.clean;

  const togglePermission = (id) => {
    setGranted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    resetCopyState();
  };

  const toggleFeature = (id) => {
    setFeatures((current) => ({ ...current, [id]: !current[id] }));
    resetCopyState();
  };

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "permission audit result" });
  };

  const reset = () => {
    setAge(DEFAULT_AGE);
    setGranted(DEFAULT_GRANTED);
    setFeatures({});
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Gamepad2 className="h-4 w-4" aria-hidden="true" />
          Permission audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Kids Game App Permission Audit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick everything the game currently has access to on your child&apos;s phone. You get an
          exposure score, the permissions to revoke first, and exactly what each one breaks if you
          turn it off.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="kga-age">
              Player&apos;s age (years)
            </label>
            <input
              id="kga-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="17"
              step="1"
              value={age}
              onChange={(event) => {
                setAge(event.target.value);
                resetCopyState();
              }}
            />
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Age decides which rules apply — under 13 pulls in COPPA, under 18 pulls in India&apos;s
              DPDP Act.
            </p>
          </div>
          <fieldset>
            <legend className={LABEL_CLASS}>What the game honestly does</legend>
            <div className="mt-2 space-y-1">
              {FEATURE_FLAGS.map((flag) => (
                <label
                  key={flag.id}
                  htmlFor={`kga-feat-${flag.id}`}
                  className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm leading-5 hover:bg-[var(--muted)]"
                >
                  <input
                    id={`kga-feat-${flag.id}`}
                    type="checkbox"
                    checked={Boolean(features[flag.id])}
                    onChange={() => toggleFeature(flag.id)}
                    className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                  />
                  <span className="text-[var(--muted-foreground)]">{flag.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Permissions the game currently has</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Android: Settings &rarr; Apps &rarr; the game &rarr; Permissions. iOS: Settings &rarr;
          scroll to the game.
        </p>
        <div className="mt-3 grid gap-1 sm:grid-cols-2">
          {KIDS_GAME_PERMISSIONS.map((permission) => (
            <label
              key={permission.id}
              htmlFor={`kga-${permission.id}`}
              className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md px-2 py-2 text-sm hover:bg-[var(--muted)]"
            >
              <input
                id={`kga-${permission.id}`}
                type="checkbox"
                checked={granted.includes(permission.id)}
                onChange={() => togglePermission(permission.id)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
              />
              <span>
                <span className="font-medium">{permission.label}</span>
                <span className="mt-0.5 block break-words text-xs text-[var(--muted-foreground)]">
                  {permission.platform}
                </span>
              </span>
            </label>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setGranted(KIDS_GAME_PERMISSIONS.map((item) => item.id));
              resetCopyState();
            }}
            className={GHOST_BTN}
          >
            Select all
          </button>
          <button
            type="button"
            onClick={() => {
              setGranted([]);
              resetCopyState();
            }}
            className={GHOST_BTN}
          >
            Clear all
          </button>
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
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Exposure score
            </p>
            <p className={`mt-1 text-4xl font-semibold ${hasError ? "text-[var(--muted-foreground)]" : bandStyle.text}`}>
              {hasError ? DASH : `${result.exposure}/100`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError ? "Fix the input above to see the audit." : result.bandLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label={
                isCopied("result") ? "Copied permission audit result" : "Copy permission audit result"
              }
              className={GHOST_BTN}
              disabled={hasError}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset the audit" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!hasError && (
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
            <span
              className={`block h-full ${bandStyle.bar}`}
              style={{ width: `${result.exposure}%` }}
            />
          </div>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Permissions granted", hasError ? DASH : `${result.grantedCount} of ${result.totalCount}`],
            ["Red flags (high-harm and unjustified)", hasError ? DASH : String(result.redFlagCount)],
            ["Revoke now", hasError ? DASH : String(result.revokeNow.length)],
            ["Keep only while the feature is used", hasError ? DASH : String(result.reviewCarefully.length)],
            ["Risk points", hasError ? DASH : `${result.score} of ${result.maxScore}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && result.revokeNow.length > 0 && (
        <section
          aria-live="polite"
          role="status"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
            Revoke these now
          </h2>
          <ol className="mt-3 space-y-4">
            {result.revokeNow.map((item) => (
              <li key={item.id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.why}</p>
                <p className="mt-2 text-sm leading-6">
                  <span className="font-semibold">What breaks: </span>
                  <span className="text-[var(--muted-foreground)]">{item.breaks}</span>
                </p>
                <p className="mt-1 text-sm leading-6">
                  <span className="font-semibold">How: </span>
                  <span className="text-[var(--muted-foreground)]">{item.how}</span>
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {!hasError && result.reviewCarefully.length > 0 && (
        <section
          aria-live="polite"
          role="status"
          className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        >
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <TriangleAlert className="h-4 w-4 text-[var(--warning-text)]" aria-hidden="true" />
            Justified, but still worth limiting
          </h2>
          <ul className="mt-3 space-y-4">
            {result.reviewCarefully.map((item) => (
              <li key={item.id} className="border-b border-[var(--border)] pb-4 last:border-0 last:pb-0">
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.why}</p>
                <p className="mt-2 text-sm leading-6">
                  <span className="font-semibold">Tighten it: </span>
                  <span className="text-[var(--muted-foreground)]">{item.how}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.notGranted.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Check className="h-4 w-4 text-[var(--success)]" aria-hidden="true" />
            Already correctly withheld
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            The game does not have these permissions right now. Keep it that way — don&apos;t grant
            them unless a feature you actually use genuinely needs one.
          </p>
          <ul className="mt-3 grid gap-1 sm:grid-cols-2">
            {result.notGranted.map((item) => (
              <li key={item.id} className="text-sm text-[var(--muted-foreground)]">
                {item.label}
              </li>
            ))}
          </ul>
        </section>
      )}

      {!hasError && result.regimes.length > 0 && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Rules that apply at age {result.age}</h2>
          <dl className="mt-3 space-y-3 text-sm">
            {result.regimes.map((regime) => (
              <div key={regime.name}>
                <dt className="font-semibold">{regime.name}</dt>
                <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">{regime.note}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice. Menu paths differ between Android skins and iOS
        versions. If a game asks for an accessibility service or SMS access, treat it as a reason to
        uninstall and report it to the store rather than to adjust a toggle.
      </p>
    </main>
  );
}
