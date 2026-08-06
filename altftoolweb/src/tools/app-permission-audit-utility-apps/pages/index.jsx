"use client";

import { useMemo, useState } from "react";
import { Wrench, Check, Copy, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

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

/** A plausible starting point: what a mainstream app of this kind asks for. */
const TYPICAL_GRANTED = [
  "torch-control",
  "foreground-service",
  "all-files",
  "query-all-packages",
  "usage-access",
  "draw-over-apps",
  "camera",
  "contacts",
  "phone-state",
  "ad-id",
  "boot-completed",
  "battery-exemption"
];

const NECESSITY_STYLE = {
  core: "text-[var(--success-text)]",
  optional: "text-[var(--muted-foreground)]",
  unnecessary: "text-[var(--danger-text)]",
};

const NECESSITY_TEXT = {
  core: "Required for core features",
  optional: "Optional feature only",
  unnecessary: "Not needed by a utility app",
};

const EM_DASH = "—";

export default function ToolHome() {
  const [appName, setAppName] = useState("My cleaner app");
  const [mode, setMode] = useState("checklist");
  const [granted, setGranted] = useState(TYPICAL_GRANTED);
  const [pasted, setPasted] = useState("");
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

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

  const copyResult = () => {
    if (!summary) return;
    copyToClipboard("result", summary, { label: "the permission audit result" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the audit? This clears the app name and the pasted permission list and cannot be undone.",
      )
    ) {
      return;
    }
    setAppName("My cleaner app");
    setMode("checklist");
    setGranted(TYPICAL_GRANTED);
    setPasted("");
    resetCopyState();
  };

  const hasResult = !result.error;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Wrench className="h-4 w-4" aria-hidden="true" />
          Permission audit
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Utility App Permission Audit</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Flashlight, cleaner and battery-saver apps are the classic over-permission trap: a two-button utility that asks for storage, contacts and the ability to draw over your banking app. Tick what yours holds to see how far past its job it reaches.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="util-app-name">
              App name (for the report)
            </label>
            <input
              id="util-app-name"
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
            <label className={LABEL_CLASS} htmlFor="util-paste">
              Paste the permission list
            </label>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Copy it from the Play Store listing (About this app &gt; App permissions &gt; See more)
              or Settings &gt; Apps &gt; Permissions. One permission per line.
            </p>
            <textarea
              id="util-paste"
              rows={7}
              value={pasted}
              onChange={(event) => setPasted(event.target.value)}
              placeholder={"Camera\nAll files access\nContacts\nPhone\nDisplay over other apps"}
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            />
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className={CHIP_BTN} onClick={() => setGranted(TYPICAL_GRANTED)}>
                Typical cleaner
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
                Permissions and settings this app currently holds
              </legend>
              <ul className="mt-3 space-y-2">
                {PERMISSIONS.map((permission) => (
                  <li key={permission.id}>
                    <label
                      htmlFor={`util-perm-${permission.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        id={`util-perm-${permission.id}`}
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
                          {NECESSITY_TEXT[permission.necessity]}
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
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger-text)]"
        >
          {result.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div role="status" aria-live="polite">
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
              aria-label={
                isCopied("result")
                  ? "Copied the permission audit result to clipboard"
                  : "Copy the permission audit result"
              }
              className={GHOST_BTN}
              disabled={!hasResult}
            >
              {isCopied("result") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("result") ? "Copied!" : "Copy result"}
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
          <span className="sr-only" role="status" aria-live="polite">
            {announcement}
          </span>
        </div>

        <div className="mt-5">
          <div
            className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={
              hasResult ? `Privacy score ${result.score} out of 100` : "Privacy score unavailable"
            }
          >
            <span
              className="block h-full bg-[var(--primary)]"
              style={{ width: `${hasResult ? result.score : 0}%` }}
            />
          </div>
        </div>

        <dl
          className="mt-5 divide-y divide-[var(--border)] text-sm"
          role="status"
          aria-live="polite"
        >
          {[
            ["Verdict", hasResult ? result.bandLabel : EM_DASH],
            [
              "Permissions granted",
              hasResult ? `${result.grantedCount} of ${result.totalCount}` : EM_DASH,
            ],
            ["Revoke now", hasResult ? String(result.revokeCount) : EM_DASH],
            ["Worth reviewing", hasResult ? String(result.reviewCount) : EM_DASH],
            ["Justified by a core feature", hasResult ? String(result.keepCount) : EM_DASH],
            [
              "Restricted / special access granted",
              hasResult ? String(result.restrictedCount) : EM_DASH,
            ],
            ["Exposure points", hasResult ? `${result.exposure} of ${result.maxExposure}` : EM_DASH],
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
          <h2 className="text-base font-semibold text-[var(--danger-text)]">Revoke these first</h2>
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

      {hasResult && result.keep.length > 0 ? (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Justified — but know what they see</h2>
          <ul className="mt-3 space-y-3">
            {result.keep.map((row) => (
              <li key={row.id} className="text-sm">
                <p className="font-semibold">{row.label}</p>
                <p className="mt-0.5 text-[var(--muted-foreground)]">{row.risk}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Every item, with its manifest name</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Permission
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Android / iOS
                </th>
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Sensitivity
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Verdict
                </th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((permission) => (
                <tr
                  key={permission.id}
                  className="border-b border-[var(--border)] align-top last:border-0"
                >
                  <td className="py-2 pr-3 font-semibold">{permission.label}</td>
                  <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                    {permission.android}
                    <br />
                    {permission.ios}
                  </td>
                  <td className="py-2 pr-3 text-xs text-[var(--muted-foreground)]">
                    {permission.tier}
                  </td>
                  <td
                    className={`py-2 text-xs font-semibold ${NECESSITY_STYLE[permission.necessity]}`}
                  >
                    {permission.necessity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Android's own torch API (CameraManager.setTorchMode) needs no permission, and since Android 8 the system already manages background battery use — treat any utility app demanding special access as a candidate for uninstalling.
      </p>
    </main>
  );
}
