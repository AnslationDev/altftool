"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Clock3,
  Eraser,
  Eye,
  EyeOff,
  ShieldAlert,
  TimerReset,
  TriangleAlert,
} from "lucide-react";

import { safeCopyText } from "@/shared/utils/clipboard";
import {
  classifyClipboardText,
  formatCountdown,
  normalizeExpirySeconds,
} from "../lib/classifyClipboard.mjs";

const EXPIRY_OPTIONS = [
  [30, "30 seconds"],
  [60, "1 minute"],
  [120, "2 minutes"],
  [300, "5 minutes"],
  [600, "10 minutes"],
];

export default function ClipboardSecretExpiryGuard() {
  const secretRef = useRef("");
  const expiryHandledRef = useRef(false);
  const [text, setText] = useState("");
  const [expirySeconds, setExpirySeconds] = useState(60);
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(0);
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState({
    tone: "idle",
    message: "Nothing has been copied by this tool.",
  });

  const classification = useMemo(() => classifyClipboardText(text), [text]);
  const remainingSeconds = expiresAt ? Math.max(0, (expiresAt - now) / 1000) : 0;

  useEffect(() => {
    if (!expiresAt) return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  useEffect(() => {
    if (!expiresAt || remainingSeconds > 0 || expiryHandledRef.current) return;
    expiryHandledRef.current = true;
    const copiedSecret = secretRef.current;

    const expire = async () => {
      setText("");
      secretRef.current = "";
      setExpiresAt(0);

      if (!copiedSecret || !navigator.clipboard?.readText || !navigator.clipboard?.writeText) {
        setStatus({
          tone: "warning",
          message:
            "The timer expired and the in-tab copy was cleared, but this browser could not verify the system clipboard.",
        });
        return;
      }

      try {
        const currentClipboard = await navigator.clipboard.readText();
        if (currentClipboard !== copiedSecret) {
          setStatus({
            tone: "success",
            message:
              "The timer expired. A newer clipboard item was detected, so it was left untouched.",
          });
          return;
        }
        await navigator.clipboard.writeText("");
        setStatus({
          tone: "success",
          message: "The timer expired and the matching clipboard value was cleared.",
        });
      } catch {
        setStatus({
          tone: "warning",
          message:
            "The timer expired and the in-tab copy was cleared, but clipboard permission prevented verification or removal.",
        });
      }
    };

    void expire();
  }, [expiresAt, remainingSeconds]);

  const copyWithTimer = async () => {
    if (!text) return;
    const didCopy = await safeCopyText(text);
    if (!didCopy) {
      setStatus({
        tone: "danger",
        message: "The browser did not allow clipboard access. Nothing was copied.",
      });
      return;
    }

    const duration = normalizeExpirySeconds(expirySeconds);
    const deadline = Date.now() + duration * 1000;
    secretRef.current = text;
    expiryHandledRef.current = false;
    setNow(Date.now());
    setExpiresAt(deadline);
    setStatus({
      tone: "active",
      message: `Copied. Keep this tab open; a guarded clear will be attempted in ${duration} seconds.`,
    });
  };

  const clearNow = async () => {
    let clearedClipboard = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText("");
        clearedClipboard = true;
      }
    } catch {
      clearedClipboard = false;
    }

    setText("");
    secretRef.current = "";
    expiryHandledRef.current = true;
    setExpiresAt(0);
    setStatus({
      tone: clearedClipboard ? "success" : "warning",
      message: clearedClipboard
        ? "The clipboard and in-tab value were cleared."
        : "The in-tab value was cleared, but the browser did not allow clipboard removal.",
    });
  };

  const statusStyles = {
    idle: "border-[var(--border)] bg-[var(--background)]",
    active: "border-[var(--primary)] bg-[var(--primary-soft)]",
    success: "border-[var(--success)] bg-[var(--success-soft)]",
    warning: "border-[var(--warning)] bg-[var(--warning-soft)]",
    danger: "border-[var(--danger)] bg-[var(--danger-soft)]",
  };

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6">
      <header className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[var(--primary-soft)] px-3 py-1 text-xs font-bold text-[var(--primary)]">
              <TimerReset className="h-4 w-4" aria-hidden="true" />
              Best-effort clipboard expiry
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--foreground)] sm:text-4xl">
              Clipboard Secret Expiry Guard
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
              Copy an OTP, temporary credential, or private value with a local countdown. At expiry,
              the tool clears it only when the browser can confirm the same value is still copied.
            </p>
          </div>
          <div className="rounded-lg border border-[var(--warning)] bg-[var(--warning-soft)] p-4 lg:max-w-sm">
            <p className="flex items-center gap-2 font-bold text-[var(--foreground)]">
              <TriangleAlert className="h-5 w-5 text-[var(--warning)]" aria-hidden="true" />
              Keep the tab open
            </p>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              Browsers cannot guarantee background clipboard access. The countdown is an aid, not
              an operating-system security control.
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(19rem,0.48fr)]">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">Temporary clipboard value</h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Nothing is saved or sent by this tool.
              </p>
            </div>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-10 items-center gap-2 px-4"
              onClick={() => setVisible((current) => !current)}
              aria-pressed={visible}
            >
              {visible ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
              {visible ? "Hide value" : "Show value"}
            </button>
          </div>

          <label className="mt-5 block space-y-2 text-sm font-bold text-[var(--foreground)]">
            Value to copy
            <textarea
              className={`input-field min-h-40 w-full resize-y font-mono text-sm ${
                visible ? "" : "[-webkit-text-security:disc]"
              }`}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                if (expiresAt) {
                  secretRef.current = "";
                  expiryHandledRef.current = true;
                  setExpiresAt(0);
                  setStatus({
                    tone: "warning",
                    message:
                      "The value changed, so the previous expiry timer was cancelled. Copy again to start a new timer.",
                  });
                }
              }}
              placeholder="Paste a temporary secret"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
            />
          </label>

          <label className="mt-4 block space-y-2 text-sm font-bold text-[var(--foreground)]">
            Expiry
            <select
              className="input-field min-h-11 w-full"
              value={expirySeconds}
              onChange={(event) => setExpirySeconds(Number(event.target.value))}
            >
              {EXPIRY_OPTIONS.map(([seconds, label]) => (
                <option key={seconds} value={seconds}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              className="btn-primary inline-flex min-h-11 items-center gap-2 px-5"
              onClick={copyWithTimer}
              disabled={!text}
            >
              <Clipboard className="h-4 w-4" aria-hidden="true" />
              Copy and start timer
            </button>
            <button
              type="button"
              className="btn-secondary inline-flex min-h-11 items-center gap-2 px-5"
              onClick={clearNow}
              disabled={!text && !expiresAt}
            >
              <Eraser className="h-4 w-4" aria-hidden="true" />
              Clear now
            </button>
          </div>

          <div
            className={`mt-5 rounded-lg border p-4 ${statusStyles[status.tone]}`}
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              {expiresAt ? (
                <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" aria-hidden="true" />
              ) : status.tone === "success" ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" aria-hidden="true" />
              ) : (
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-[var(--muted-foreground)]" aria-hidden="true" />
              )}
              <div>
                {expiresAt ? (
                  <p className="font-mono text-2xl font-black text-[var(--foreground)]">
                    {formatCountdown(remainingSeconds)}
                  </p>
                ) : null}
                <p className="text-sm leading-6 text-[var(--foreground)]">{status.message}</p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--foreground)]">Local signal summary</h2>
            <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
              This is a reminder, not a complete secret detector. Matched values are never shown in
              the summary.
            </p>
            <dl className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <dt className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  Characters
                </dt>
                <dd className="mt-1 text-xl font-black text-[var(--foreground)]">
                  {classification.characterCount.toLocaleString()}
                </dd>
              </div>
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                <dt className="text-xs font-bold uppercase text-[var(--muted-foreground)]">
                  Signals
                </dt>
                <dd className="mt-1 text-xl font-black text-[var(--foreground)]">
                  {classification.signalCount}
                </dd>
              </div>
            </dl>
            <ul className="mt-4 space-y-2">
              {classification.signals.length ? (
                classification.signals.map((signal) => (
                  <li
                    key={signal.key}
                    className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                  >
                    <span className="text-[var(--foreground)]">{signal.label}</span>
                    <span className="font-bold text-[var(--primary)]">{signal.count}</span>
                  </li>
                ))
              ) : (
                <li className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm text-[var(--muted-foreground)]">
                  No configured pattern detected. Treat the value as sensitive if its context says
                  it is.
                </li>
              )}
            </ul>
          </section>

          <section className="rounded-lg border border-[var(--danger)] bg-[var(--danger-soft)] p-5">
            <h2 className="font-bold text-[var(--foreground)]">Do not use for long-lived secrets</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
              Prefer a password manager or dedicated secrets vault for passwords, recovery codes,
              private keys, and production credentials. Never paste a wallet seed phrase into a
              website.
            </p>
          </section>
        </aside>
      </div>
    </main>
  );
}
