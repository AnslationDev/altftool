"use client";

import { useMemo, useState } from "react";
import { Check, Copy, RotateCcw, ShieldAlert } from "lucide-react";

import {
  ACTIONS,
  AFTER_STEPS,
  CORE_RULE,
  CYBERCRIME_HELPLINE,
  CYBERCRIME_PORTAL,
  INTENTS,
  RED_FLAGS,
  SCRIPT_STAGES,
  evaluateAction,
  formatBriefing,
  liabilityNote,
  netEffect,
  scoreConversation,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const money = (value) => INR.format(Number.isFinite(value) ? value : 0);

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_CLASS = {
  danger: "bg-[var(--danger-soft)] text-[var(--danger)]",
  warning: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[var(--muted)] text-[var(--success)]",
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULTS = {
  intent: "receive",
  actionId: "approve-collect",
  promised: "4999",
  pinAmount: "4999",
  attempts: "1",
  flags: ["collect-request", "urgency"],
  enteredPin: false,
};

export default function ToolHome() {
  const [intent, setIntent] = useState(DEFAULTS.intent);
  const [actionId, setActionId] = useState(DEFAULTS.actionId);
  const [promised, setPromised] = useState(DEFAULTS.promised);
  const [pinAmount, setPinAmount] = useState(DEFAULTS.pinAmount);
  const [attempts, setAttempts] = useState(DEFAULTS.attempts);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [enteredPin, setEnteredPin] = useState(DEFAULTS.enteredPin);
  const [copied, setCopied] = useState(false);

  const evaluation = useMemo(() => evaluateAction({ intent, actionId }), [intent, actionId]);
  const effect = useMemo(
    () =>
      netEffect({
        promisedCredit: Number(promised),
        pinScreenAmount: Number(pinAmount),
        attempts: Number(attempts),
      }),
    [promised, pinAmount, attempts],
  );
  const risk = useMemo(() => scoreConversation(flags), [flags]);
  const liability = useMemo(() => liabilityNote(enteredPin), [enteredPin]);
  const briefing = useMemo(
    () => formatBriefing({ evaluation, effect, risk }),
    [evaluation, effect, risk],
  );

  const toggleFlag = (id) => {
    setFlags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setIntent(DEFAULTS.intent);
    setActionId(DEFAULTS.actionId);
    setPromised(DEFAULTS.promised);
    setPinAmount(DEFAULTS.pinAmount);
    setAttempts(DEFAULTS.attempts);
    setFlags(DEFAULTS.flags);
    setEnteredPin(DEFAULTS.enteredPin);
    setCopied(false);
  };

  const copyBriefing = async () => {
    try {
      await navigator.clipboard.writeText(briefing);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const dash = "—";

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">UPI Refund Scam Explainer</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          One rule ends this entire scam. Work through what you are being asked to do and see which
          direction the money actually moves.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-lg leading-7 font-semibold text-[var(--primary)]">{CORE_RULE}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Every step of a fake refund exists to get you past that fact — by relabelling a payment
          request as a refund, or by calling the PIN screen an identity check.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Check the request</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="upi-intent">
              What do you think is happening?
            </label>
            <select
              id="upi-intent"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intent}
              onChange={(event) => {
                setIntent(event.target.value);
                setCopied(false);
              }}
            >
              {INTENTS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upi-action">
              What are you being asked to do?
            </label>
            <select
              id="upi-action"
              className={`mt-2 ${INPUT_CLASS}`}
              value={actionId}
              onChange={(event) => {
                setActionId(event.target.value);
                setCopied(false);
              }}
            >
              {ACTIONS.map((action) => (
                <option key={action.id} value={action.id}>
                  {action.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {evaluation.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {evaluation.error}
          </p>
        ) : (
          <div className="mt-4 rounded-lg border border-[var(--border)] p-4">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[evaluation.verdict.tone]}`}
            >
              {evaluation.verdict.label}
            </span>
            <p className="mt-2 text-sm leading-6">{evaluation.reason}</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">
              Direction of money: {evaluation.action.direction.label}.
            </p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What the numbers really do</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="upi-promised">
              Refund promised (INR)
            </label>
            <input
              id="upi-promised"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={promised}
              onChange={(event) => {
                setPromised(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upi-pin-amount">
              Amount on the PIN screen (INR)
            </label>
            <input
              id="upi-pin-amount"
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={pinAmount}
              onChange={(event) => {
                setPinAmount(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="upi-attempts">
              Times you approved
            </label>
            <input
              id="upi-attempts"
              type="number"
              inputMode="numeric"
              min="1"
              max="50"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={attempts}
              onChange={(event) => {
                setAttempts(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        {effect.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {effect.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-5 ring-1 ring-[var(--border)]">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
                Net position after the &quot;refund&quot;
              </p>
              <p className="mt-1 text-4xl font-semibold text-[var(--danger)]">
                {effect.error ? dash : money(effect.net)}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copyBriefing}
                aria-label="Copy the scam briefing"
                className={GHOST_BTN}
              >
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy briefing"}
              </button>
              <button type="button" onClick={reset} aria-label="Reset the explainer" className={PRIMARY_BTN}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Reset
              </button>
            </div>
          </div>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["Refund you were promised", effect.error ? dash : money(effect.expected)],
              ["Actually credited", effect.error ? dash : money(effect.received)],
              [
                "Actually debited",
                effect.error ? dash : `${money(effect.debited)} over ${effect.attempts} approval(s)`,
              ],
              ["Gap between promise and reality", effect.error ? dash : money(effect.gap)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The call, line by line</h2>
        <ol className="mt-4 space-y-4">
          {SCRIPT_STAGES.map((stage, index) => (
            <li key={stage.id} className="rounded-lg border border-[var(--border)] p-4">
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">Stage {index + 1}</p>
              <p className="mt-2 text-sm leading-6 italic">&ldquo;{stage.said}&rdquo;</p>
              <p className="mt-2 text-sm leading-6">
                <span className="font-semibold">What it really is:</span> {stage.truth}
              </p>
              <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
                <span className="font-semibold text-[var(--foreground)]">Your move:</span> {stage.move}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Score the conversation</h2>
        <div className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => (
            <label
              key={flag.id}
              htmlFor={`flag-${flag.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
            >
              <input
                id={`flag-${flag.id}`}
                type="checkbox"
                className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                checked={flags.includes(flag.id)}
                onChange={() => toggleFlag(flag.id)}
              />
              {flag.label}
            </label>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-[var(--border)] p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[risk.band.tone]}`}
            >
              {risk.band.label}
            </span>
            <span className="text-sm font-semibold">
              {risk.score} of {risk.max}
            </span>
          </div>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
            role="img"
            aria-label={`Red-flag score ${risk.score} out of ${risk.max}`}
          >
            <span
              className="block h-full bg-[var(--danger)]"
              style={{ width: `${Math.max(0, Math.min(100, risk.percent))}%` }}
            />
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">{risk.band.advice}</p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">If money has already gone</h2>
        <label
          htmlFor="upi-entered-pin"
          className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
        >
          <input
            id="upi-entered-pin"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
            checked={enteredPin}
            onChange={(event) => setEnteredPin(event.target.checked)}
          />
          I entered the UPI PIN myself
        </label>
        <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {liability.note}
        </p>
        <ol className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {AFTER_STEPS.map((step, index) => (
            <li key={step}>
              <span className="font-semibold text-[var(--foreground)]">{index + 1}.</span> {step}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm font-semibold">
          Helpline {CYBERCRIME_HELPLINE} · {CYBERCRIME_PORTAL}
        </p>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and not legal advice. Whether a bank refunds a disputed transaction
        depends on its investigation and the applicable rules — speak to your bank in writing and, if
        needed, a lawyer or the banking ombudsman.
      </p>
    </main>
  );
}
