"use client";

import { useMemo, useState } from "react";
import { Activity, Check, Copy, RotateCcw } from "lucide-react";

import {
  PERMISSIONS,
  auditPermissions,
  parsePermissionText,
  resultToText,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

/** A plausible starting point: what a mainstream tracker asks for on day one. */
const TYPICAL_GRANTED = [
  "activity-recognition",
  "body-sensors",
  "health-read",
  "health-write",
  "location-fine",
  "location-background",
  "nearby-devices",
  "contacts",
  "notifications",
  "ad-id",
];

const NECESSITY_STYLE = {
  core: "text-[var(--success)]",
  optional: "text-[var(--muted-foreground)]",
  unnecessary: "text-[var(--danger)]",
};

const EM_DASH = "—";

export default function ToolHome() {
  const [appName, setAppName] = useState("My fitness app");
  const [mode, setMode] = useState("checklist");
  const [granted, setGranted] = useState(TYPICAL_GRANTED);
  const [pasted, setPasted] = useState("");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (mode === "paste") {
      const parsed = parsePermissionText(pasted);
      if (parsed.error) return parsed;
      return { ...auditPermissions({ granted: parsed.granted }), unrecognised: parsed.unrecognised };
    }
    return auditPermissions({ granted });
  }, [mode, granted, pasted]);

  const summary = useMemo(
    () => (result.error ? "" : resultToText(result, appName)),
    [result, appName],
  );

  const toggle = (id) => {
    setGranted((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
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
    setAppName("My fitness app");
    setMode("checklist");
    setGranted(TYPICAL_GRANTED);
    setPasted("");
    setCopied(false);
  };

  const hasResult = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Activity className="h-4 w-4" aria-hidden="true" />
          Permission audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Fitness App Permission Audit
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Tick what your tracker currently holds. Each permission is weighted by how sensitive the
          data is and whether any core fitness feature genuinely needs it, then scored against the
          data-minimisation rule.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fit-app-name">
              App name (for the report)
            </label>
            <input
              id="fit-app-name"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={appName}
              onChange={(event) => setAppName(event.target.value)}
            />
          </div>
          <div>
            <span className={LABEL_CLASS}>How do you want to enter permissions?</span>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setMode("checklist")}
                aria-pressed={mode === "checklist"}
                className={
                  mode === "checklist"
                    ? `${CHIP_BTN} border-[var(--primary)] text-[var(--foreground)]`
                    : CHIP_BTN
                }
              >
                Checklist
              </button>
              <button
                type="button"
                onClick={() => setMode("paste")}
                aria-pressed={mode === "paste"}
                className={
                  mode === "paste"
                    ? `${CHIP_BTN} border-[var(--primary)] text-[var(--foreground)]`
                    : CHIP_BTN
                }
              >
                Paste list
              </button>
            </div>
          </div>
        </div>

        {mode === "paste" ? (
          <div className="mt-4">
            <label className={LABEL_CLASS} htmlFor="fit-paste">
              Paste the permission list
            </label>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Copy it from the Play Store listing (About this app &gt; App permissions &gt; See more)
              or Settings &gt; Apps &gt; Permissions. One permission per line.
            </p>
            <textarea
              id="fit-paste"
              rows={7}
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
              placeholder={"Physical activity\nBody sensors\nLocation\nContacts\nCamera"}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={CHIP_BTN} onClick={() => setGranted(TYPICAL_GRANTED)}>
                Typical tracker
              </button>
              <button
                type="button"
                className={CHIP_BTN}
                onClick={() => setGranted(PERMISSIONS.map((permission) => permission.id))}
              >
                Everything granted
              </button>
              <button type="button" className={CHIP_BTN} onClick={() => setGranted([])}>
                Clear all
              </button>
            </div>

            <fieldset className="mt-4">
              <legend className="text-sm font-semibold">
                Permissions this app currently holds
              </legend>
              <ul className="mt-3 space-y-2">
                {PERMISSIONS.map((permission) => (
                  <li key={permission.id}>
                    <label
                      htmlFor={`fit-perm-${permission.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`fit-perm-${permission.id}`}
                        type="checkbox"
                        checked={granted.includes(permission.id)}
                        onChange={() => toggle(permission.id)}
                        className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      />
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">{permission.label}</span>
                        <span className="mt-0.5 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {permission.why}
                        </span>
                        <span
                          className={`mt-1 block text-xs font-semibold ${NECESSITY_STYLE[permission.necessity]}`}
                        >
                          {permission.necessity === "core"
                            ? "Required for core features"
                            : permission.necessity === "optional"
                              ? "Optional feature only"
                              : "Not needed by a fitness app"}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
          </>
        )}
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Privacy score
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasResult ? `${result.score}/100` : EM_DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasResult
                ? `${result.bandLabel} · ${result.grantedCount} of ${result.totalCount} permissions granted`
                : "Fix the input above to see a score"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the permission audit result"
              className={GHOST_BTN}
              disabled={!hasResult}
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
              aria-label="Reset the audit"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              hasResult
                ? `Privacy score ${result.score} out of 100`
                : "Privacy score unavailable"
            }
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${hasResult ? result.score : 0}%` }}
            />
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Verdict", hasResult ? result.bandLabel : EM_DASH],
            ["Permissions granted", hasResult ? `${result.grantedCount} of ${result.totalCount}` : EM_DASH],
            ["Revoke now", hasResult ? String(result.revokeCount) : EM_DASH],
            ["Worth reviewing", hasResult ? String(result.reviewCount) : EM_DASH],
            ["Justified by a core feature", hasResult ? String(result.keepCount) : EM_DASH],
            [
              "Restricted / special access granted",
              hasResult ? String(result.restrictedCount) : EM_DASH,
            ],
            [
              "Exposure points",
              hasResult ? `${result.exposure} of ${result.maxExposure}` : EM_DASH,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {hasResult && result.unrecognised && result.unrecognised.length > 0 ? (
        <p className="mt-4 rounded-md border border-[var(--border)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
          Not matched to a checklist item: {result.unrecognised.join(", ")}
        </p>
      ) : null}

      {hasResult && result.revoke.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold text-[var(--danger)]">Revoke these first</h2>
          <ul className="mt-3 space-y-3">
            {result.revoke.map((row) => (
              <li key={row.id} className="text-sm">
                <p className="font-semibold">{row.label}</p>
                <p className="mt-0.5 text-[var(--muted-foreground)]">{row.risk}</p>
                <p className="mt-0.5 text-[var(--muted-foreground)]">{row.recommend}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasResult && result.review.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Worth reviewing</h2>
          <ul className="mt-3 space-y-3">
            {result.review.map((row) => (
              <li key={row.id} className="text-sm">
                <p className="font-semibold">{row.label}</p>
                <p className="mt-0.5 text-[var(--muted-foreground)]">{row.recommend}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every permission, with its manifest name</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Permission</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Android / iOS</th>
                <th scope="col" className="py-2 pr-3 font-semibold">Sensitivity</th>
                <th scope="col" className="py-2 font-semibold">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((permission) => (
                <tr key={permission.id} className="border-b border-[var(--border)] last:border-0 align-top">
                  <td className="py-2 pr-3 font-semibold">{permission.label}</td>
                  <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                    {permission.android}
                    <br />
                    {permission.ios}
                  </td>
                  <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                    {permission.tier}
                  </td>
                  <td className={`py-2 text-xs font-semibold ${NECESSITY_STYLE[permission.necessity]}`}>
                    {permission.necessity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Permission names differ between Android versions, iOS and manufacturer
        skins, and an app can still collect data you typed in without holding any permission at all.
        Read the Play Store Data safety section or the App Store privacy label alongside this audit.
      </p>
    </main>
  );
}
