"use client";

import { useMemo, useState } from "react";
import { Check, Copy, PhoneCall, RotateCcw } from "lucide-react";

import {
  AFTER_STEPS,
  CORE_RULE,
  CYBERCRIME_HELPLINE,
  CYBERCRIME_PORTAL,
  NUMBER_SOURCES,
  REQUESTS,
  RIGHT_WAY,
  assessCall,
  formatBriefing,
  overpaymentTrap,
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
  sourceId: "search-result",
  requests: ["remote-app", "hurry"],
  intended: "5000",
  claimed: "50000",
  actual: "0",
};

export default function ToolHome() {
  const [sourceId, setSourceId] = useState(DEFAULTS.sourceId);
  const [requests, setRequests] = useState(DEFAULTS.requests);
  const [intended, setIntended] = useState(DEFAULTS.intended);
  const [claimed, setClaimed] = useState(DEFAULTS.claimed);
  const [actual, setActual] = useState(DEFAULTS.actual);
  const [copied, setCopied] = useState(false);

  const call = useMemo(() => assessCall({ sourceId, requestIds: requests }), [sourceId, requests]);
  const trap = useMemo(
    () =>
      overpaymentTrap({
        intendedRefund: Number(intended),
        claimedCredit: Number(claimed),
        actualCredit: Number(actual),
      }),
    [intended, claimed, actual],
  );
  const briefing = useMemo(() => formatBriefing({ call, trap }), [call, trap]);

  const toggleRequest = (id) => {
    setRequests((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setSourceId(DEFAULTS.sourceId);
    setRequests(DEFAULTS.requests);
    setIntended(DEFAULTS.intended);
    setClaimed(DEFAULTS.claimed);
    setActual(DEFAULTS.actual);
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
          <PhoneCall className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Fake Customer Care Number Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Searching for a helpline is how most of these calls start. Check where your number came
          from, what the caller is asking for, and what the &quot;excess refund&quot; really costs.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-lg leading-7 font-semibold text-[var(--primary)]">{CORE_RULE}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Search rankings, sponsored slots, map listings and social replies are all surfaces someone
          else can write to. The app you sign in to and the card in your wallet are not.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Where did the number come from?</h2>
        <label className={`mt-4 ${LABEL_CLASS}`} htmlFor="cc-source">
          Source of the helpline number
        </label>
        <select
          id="cc-source"
          className={`mt-2 ${INPUT_CLASS}`}
          value={sourceId}
          onChange={(event) => {
            setSourceId(event.target.value);
            setCopied(false);
          }}
        >
          {NUMBER_SOURCES.map((source) => (
            <option key={source.id} value={source.id}>
              {source.label}
            </option>
          ))}
        </select>

        {call.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {call.error}
          </p>
        ) : (
          <div className="mt-4 rounded-lg border border-[var(--border)] p-4">
            <span
              className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONE_CLASS[call.source.trust.tone]}`}
            >
              {call.source.trust.label}
            </span>
            <p className="mt-2 text-sm leading-6">{call.source.why}</p>
            <p className="mt-2 text-sm leading-6 font-semibold">{call.sourceAction}</p>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">What is the caller asking for?</h2>
        <div className="mt-4 space-y-3">
          {REQUESTS.map((item) => (
            <div key={item.id}>
              <label
                htmlFor={`req-${item.id}`}
                className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
              >
                <input
                  id={`req-${item.id}`}
                  type="checkbox"
                  className="h-5 w-5 shrink-0 rounded border-[var(--border)] accent-[var(--primary)]"
                  checked={requests.includes(item.id)}
                  onChange={() => toggleRequest(item.id)}
                />
                <span>
                  {item.label}
                  {item.stopper && (
                    <span className="ml-2 rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--danger)]">
                      never legitimate
                    </span>
                  )}
                </span>
              </label>
              {requests.includes(item.id) && (
                <p className="mt-1 pl-8 text-sm leading-6 text-[var(--muted-foreground)]">{item.why}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Verdict on this call
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {call.error ? dash : call.verdict.label}
            </p>
            {!call.error && (
              <p className="mt-2 text-sm text-[var(--muted-foreground)]">
                {call.stoppers.length} request(s) that no genuine support line makes · score{" "}
                {call.score} of {call.max}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBriefing}
              aria-label="Copy the call assessment"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy assessment"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checker" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {!call.error && (
          <>
            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
              role="img"
              aria-label={`Request score ${call.score} out of ${call.max}`}
            >
              <span
                className="block h-full bg-[var(--danger)]"
                style={{ width: `${Math.max(0, Math.min(100, call.percent))}%` }}
              />
            </div>
            <p
              className={`mt-4 rounded-md px-3 py-2 text-sm leading-6 ${TONE_CLASS[call.verdict.tone]}`}
              {...(call.verdict.tone === "danger" ? { role: "alert" } : {})}
            >
              {call.verdict.advice}
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The &quot;we credited too much&quot; trick</h2>
        <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">
          You are shown a screenshot of a large credit and asked to return the excess. The screenshot
          is fabricated or the credit is reversible; the transfer you make is neither.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-intended">
              Refund actually due (INR)
            </label>
            <input
              id="cc-intended"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              className={`mt-2 ${INPUT_CLASS}`}
              value={intended}
              onChange={(event) => {
                setIntended(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-claimed">
              Credit they claim (INR)
            </label>
            <input
              id="cc-claimed"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              className={`mt-2 ${INPUT_CLASS}`}
              value={claimed}
              onChange={(event) => {
                setClaimed(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cc-actual">
              Credit really in your passbook (INR)
            </label>
            <input
              id="cc-actual"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              className={`mt-2 ${INPUT_CLASS}`}
              value={actual}
              onChange={(event) => {
                setActual(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>

        {trap.error ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {trap.error}
          </p>
        ) : null}

        <div className="mt-5 rounded-xl bg-[var(--background)] p-5 ring-1 ring-[var(--border)]">
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            What returning the excess costs you
          </p>
          <p className="mt-1 text-4xl font-semibold text-[var(--danger)]">
            {trap.error ? dash : money(trap.netLoss)}
          </p>
          <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
            {[
              ["They ask you to send back", trap.error ? dash : money(trap.askedToReturn)],
              ["Money that genuinely arrived", trap.error ? dash : money(trap.actual)],
              [
                "Credit claimed vs refund due",
                trap.error
                  ? dash
                  : trap.inflation === null
                    ? "No refund was due at all"
                    : `${trap.inflation.toFixed(1)}x inflated`,
              ],
              [
                "Evidence you are being shown",
                trap.error ? dash : trap.screenshotOnly ? "A screenshot only — nothing landed" : "A partial credit",
              ],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{label}</dt>
                <dd className="text-right font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Check your own passbook or statement, not the caller&apos;s screenshot. If a bank really
            over-credits an account, it reverses the entry itself and writes to you — it does not ask
            a customer to transfer money to a stranger.
          </p>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Reaching real support</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {RIGHT_WAY.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold">If you already followed instructions</h3>
        <ol className="mt-2 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
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
        Informational only, not legal or financial advice. Nothing you type here leaves your browser.
      </p>
    </main>
  );
}
