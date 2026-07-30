"use client";

import { useMemo, useState } from "react";
import { Check, Copy, MailWarning, RotateCcw } from "lucide-react";

import {
  BLUFF_HALLMARKS,
  DO_NOT,
  HELP_ROUTES,
  SEXTORTION_ANATOMY,
  assessBluff,
  estimateReuseExposure,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warn: "text-[var(--warning)]",
  ok: "text-[var(--success)]",
};

const DEFAULT_ANSWERS = {
  oldPassword: true,
  breachedSite: true,
  noEvidence: true,
  noPersonalDetail: true,
  cryptoDemand: true,
  shortDeadline: true,
  fromYourself: true,
  identicalText: false,
  noCameraAccess: false,
  malwareClaim: true,
};

export default function ToolHome() {
  const [answers, setAnswers] = useState(DEFAULT_ANSWERS);
  const [showedRealMaterial, setShowedRealMaterial] = useState(false);
  const [accounts, setAccounts] = useState("8");
  const [with2fa, setWith2fa] = useState("2");
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () => assessBluff({ answers, showedRealMaterial }),
    [answers, showedRealMaterial],
  );

  const exposure = useMemo(
    () =>
      estimateReuseExposure({
        accountsSharingPassword: accounts.trim() === "" ? NaN : Number(accounts),
        accountsWith2fa: with2fa.trim() === "" ? NaN : Number(with2fa),
      }),
    [accounts, with2fa],
  );

  const summary = useMemo(
    () =>
      [
        "Extortion email assessment",
        `Bluff hallmarks present: ${result.presentCount} of ${result.total} (${result.score}%)`,
        `Assessment: ${result.band}`,
        "",
        result.guidance,
        "",
        "Hallmarks present:",
        ...(result.present.length ? result.present.map((h) => `• ${h.question.replace(/\?$/, "")}`) : ["• none"]),
        "",
        "Do not:",
        ...DO_NOT.map((d) => `• ${d}`),
      ].join("\n"),
    [result],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  const reset = () => {
    setAnswers(DEFAULT_ANSWERS);
    setShowedRealMaterial(false);
    setAccounts("8");
    setWith2fa("2");
    setCopied(false);
  };

  const toggle = (id) => setAnswers((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 text-[var(--foreground)]">
      <header className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--muted)] text-[var(--primary)]">
          <MailWarning className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">Sextortion Email Anatomy Explainer</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            An email quotes a password you recognise and threatens to release a recording unless you
            pay. In the overwhelming majority of cases the password came from a leaked credential
            list and nothing else in the message is true. Work through the hallmarks below to see
            how closely yours matches the mass-mailed version, and what to do next.
          </p>
        </div>
      </header>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Check the message against the pattern</h2>
        <ul className="mt-3 grid gap-2">
          {BLUFF_HALLMARKS.map((hallmark) => (
            <li key={hallmark.id}>
              <label
                htmlFor={`sx-${hallmark.id}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm"
              >
                <input
                  id={`sx-${hallmark.id}`}
                  type="checkbox"
                  checked={Boolean(answers[hallmark.id])}
                  onChange={() => toggle(hallmark.id)}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--primary)]"
                />
                <span>
                  <span className="font-medium">{hallmark.question}</span>
                  <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">{hallmark.detail}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>

        <label
          htmlFor="sx-real"
          className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--danger)] bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]"
        >
          <input
            id="sx-real"
            type="checkbox"
            checked={showedRealMaterial}
            onChange={(e) => setShowedRealMaterial(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--danger)]"
          />
          <span className="font-medium">
            The sender actually showed genuine intimate images or video of me
          </span>
        </label>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[var(--muted-foreground)]">Bluff hallmarks present</p>
            <p className={`text-4xl font-extrabold tabular-nums ${TONE_TEXT[result.tone]}`}>
              {result.presentCount}/{result.total}
            </p>
            <p className="mt-1 text-sm font-semibold">{result.band}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copy} aria-label="Copy the assessment to the clipboard" className={GHOST_BTN}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset every answer" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Share of the pattern matched</dt>
            <dd className="text-right font-semibold">{result.score}%</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Claims still unexplained</dt>
            <dd className="text-right font-semibold">{result.total - result.presentCount}</dd>
          </div>
        </dl>

        <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-3 text-sm leading-6">{result.guidance}</p>

        {result.absent.length > 0 && !result.realMaterial && (
          <div className="mt-4">
            <h3 className="text-sm font-semibold">Not yet accounted for</h3>
            <ul className="mt-2 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
              {result.absent.map((h) => (
                <li key={h.id} className="flex gap-2.5">
                  <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]" />
                  <span>{h.question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What the leaked password really costs you</h2>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          The genuine risk is credential stuffing: the same address and password tried automatically
          against hundreds of sites. Accounts with a second factor are not immediately openable with
          the password alone, but they still need changing.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sx-accounts">Accounts using that password</label>
            <input
              id="sx-accounts"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={accounts}
              onChange={(e) => setAccounts(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="sx-2fa">Of those, with two-factor authentication</label>
            <input
              id="sx-2fa"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={with2fa}
              onChange={(e) => setWith2fa(e.target.value)}
              className={`${INPUT_CLASS} mt-1.5`}
            />
          </div>
        </div>

        {exposure.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {exposure.error}
          </p>
        ) : null}

        <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Openable with the password alone</dt>
            <dd className={`text-right text-base font-bold ${exposure.error ? "text-[var(--muted-foreground)]" : "text-[var(--danger)]"}`}>
              {exposure.error ? "—" : exposure.atRisk}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Held back by a second factor</dt>
            <dd className="text-right font-semibold">{exposure.error ? "—" : exposure.protected}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[var(--muted-foreground)]">Rough time to change them all</dt>
            <dd className="text-right font-semibold">{exposure.error ? "—" : `about ${exposure.minutes} minutes`}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Anatomy of the email</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">Part</th>
                <th scope="col" className="py-2 pr-3 font-semibold">What it says</th>
                <th scope="col" className="py-2 font-semibold">What is actually true</th>
              </tr>
            </thead>
            <tbody>
              {SEXTORTION_ANATOMY.map((row) => (
                <tr key={row.part} className="border-b border-[var(--border)] align-top last:border-0">
                  <td className="py-2.5 pr-3 font-semibold">{row.part}</td>
                  <td className="py-2.5 pr-3 font-mono text-xs break-all text-[var(--muted-foreground)]">{row.lure}</td>
                  <td className="py-2.5 leading-6 text-[var(--muted-foreground)]">{row.tell}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">What not to do</h2>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {DO_NOT.map((item) => (
            <li key={item} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--danger)]" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Where to get help</h2>
        <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
          {HELP_ROUTES.map((route) => (
            <div key={route.where} className="py-3">
              <dt className="font-semibold">{route.where}</dt>
              <dd className="mt-1 leading-6 text-[var(--muted-foreground)]">{route.what}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and no substitute for advice from the police or a lawyer. Receiving one
        of these emails is not evidence that you did anything wrong or that anyone has access to
        your devices. If the message is affecting you badly, tell someone you trust — the isolation
        it demands is the only leverage it has.
      </p>
    </main>
  );
}
