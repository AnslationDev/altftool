"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Landmark, RotateCcw, ShieldAlert } from "lucide-react";

import {
  PERMISSIONS,
  VERDICT_LABEL,
  auditBankingPermissions,
  groupedPermissions,
} from "../lib";

const DEFAULT_GRANTED = [
  "notifications",
  "biometric-unlock",
  "camera",
  "location-foreground",
  "contacts",
  "sms",
  "installed-apps-query",
];

const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--primary)]/25";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35 motion-reduce:transform-none";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const VERDICT_TONE = {
  core: "text-[var(--success)]",
  optional: "text-[var(--muted-foreground)]",
  unjustified: "text-[var(--danger)]",
};

export default function ToolHome() {
  const [appName, setAppName] = useState("My banking app");
  const [granted, setGranted] = useState(DEFAULT_GRANTED);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => auditBankingPermissions({ grantedIds: granted }),
    [granted],
  );
  const groups = useMemo(() => groupedPermissions(), []);

  const toggle = (id) => {
    setGranted((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
    setCopied(false);
  };

  const selectCore = () => {
    setGranted(
      PERMISSIONS.filter((permission) => permission.verdict === "core").map(
        (permission) => permission.id,
      ),
    );
    setCopied(false);
  };

  const reset = () => {
    setAppName("My banking app");
    setGranted(DEFAULT_GRANTED);
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (result.error) return "";
    const lines = [
      "Banking App Permission Audit",
      `App: ${appName || "Banking app"}`,
      `Risk score: ${result.score}/100 - ${result.band.label}`,
      `Granted: ${result.grantedCount} permissions`,
      `Red flags: ${result.redFlagCount}`,
      "",
      result.band.advice,
    ];

    if (result.revokeNow.length) {
      lines.push("", "Revoke now:");
      result.revokeNow.forEach((item) => {
        lines.push(`- ${item.label}: ${item.alternative}`);
      });
    }

    if (result.reviewNext.length) {
      lines.push("", "Review next:");
      result.reviewNext.forEach((item) => {
        lines.push(`- ${item.label}: ${item.alternative}`);
      });
    }

    return lines.join("\n");
  }, [appName, result]);

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

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Landmark className="h-4 w-4" aria-hidden="true" />
          Banking privacy
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Banking App Permission Audit
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted-foreground)] sm:text-base">
          Tick the permissions your bank or wallet app currently holds. The tool separates core
          security alerts from optional KYC features and red-flag grants such as SMS, call logs,
          accessibility and overlays.
        </p>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div className={CARD}>
          <label className={LABEL_CLASS} htmlFor="bank-app-name">
            App name
          </label>
          <input
            id="bank-app-name"
            className={`${INPUT_CLASS} mt-2`}
            value={appName}
            onChange={(event) => setAppName(event.target.value)}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className={GHOST_BTN} onClick={selectCore}>
              Keep only core permissions
            </button>
            <button type="button" className={GHOST_BTN} onClick={reset}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <div className="mt-5 space-y-5">
            {groups.map((group) => (
              <fieldset key={group.verdict} className="rounded-lg border border-[var(--border)] p-4">
                <legend className="px-1 text-sm font-semibold text-[var(--foreground)]">
                  {group.name}
                </legend>
                <div className="mt-3 grid gap-3">
                  {group.items.map((permission) => (
                    <label
                      key={permission.id}
                      className="flex cursor-pointer gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 transition hover:border-[var(--primary)]"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 accent-[var(--primary)]"
                        checked={granted.includes(permission.id)}
                        onChange={() => toggle(permission.id)}
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[var(--foreground)]">
                          {permission.label}
                        </span>
                        <span className={`mt-1 block text-xs font-semibold ${VERDICT_TONE[permission.verdict]}`}>
                          {VERDICT_LABEL[permission.verdict]} · {permission.platform}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                          {permission.why}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <aside className={`${CARD} self-start`} data-testid="tool-output">
          {result.error ? (
            <div className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
              {result.error}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                    Risk score
                  </p>
                  <p className="mt-1 text-4xl font-bold text-[var(--foreground)]">
                    {result.score}
                    <span className="text-lg text-[var(--muted-foreground)]">/100</span>
                  </p>
                </div>
                <div className="rounded-full bg-[var(--muted)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">
                  {result.band.label}
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.band.advice}
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Granted</p>
                  <p className="text-xl font-bold">{result.grantedCount}</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Red flags</p>
                  <p className="text-xl font-bold text-[var(--danger)]">{result.redFlagCount}</p>
                </div>
                <div className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                  <p className="text-xs text-[var(--muted-foreground)]">Optional</p>
                  <p className="text-xl font-bold">{result.optionalCount}</p>
                </div>
              </div>

              <div className="mt-5">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <ShieldAlert className="h-4 w-4 text-[var(--danger)]" aria-hidden="true" />
                  Revoke first
                </h2>
                {result.revokeNow.length ? (
                  <ul className="mt-3 space-y-3">
                    {result.revokeNow.slice(0, 5).map((item) => (
                      <li key={item.id} className="rounded-lg bg-[var(--background)] p-3 ring-1 ring-[var(--border)]">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-[var(--muted-foreground)]">
                          {item.alternative}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 rounded-lg bg-[var(--success-soft)] p-3 text-sm text-[var(--success)]">
                    No red-flag permission is selected.
                  </p>
                )}
              </div>

              <button type="button" className={`${PRIMARY_BTN} mt-5 w-full`} onClick={copyResult}>
                {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied ? "Copied" : "Copy audit"}
              </button>
            </>
          )}
        </aside>
      </section>
    </main>
  );
}
