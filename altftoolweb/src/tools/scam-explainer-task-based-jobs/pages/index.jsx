"use client";

import { useMemo, useState } from "react";
import { Briefcase, Check, Copy, RotateCcw } from "lucide-react";

import {
  AFTER_STEPS,
  CORE_RULE,
  CYBERCRIME_HELPLINE,
  CYBERCRIME_PORTAL,
  MULE_WARNING,
  RED_FLAGS,
  SCRIPT_STAGES,
  WHY_WITHDRAWAL_FAILS,
  formatBriefing,
  scoreOffer,
  seedCostShare,
  simulateTaskScam,
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
  muted: "bg-[var(--muted)] text-[var(--muted-foreground)]",
};

const DEFAULTS = {
  seedPayout: "150",
  seedTasks: "3",
  firstDeposit: "1000",
  multiplier: "2",
  rounds: "5",
  commission: "30",
  flags: ["pay-to-earn", "unsolicited", "fake-earnings"],
};

export default function ToolHome() {
  const [seedPayout, setSeedPayout] = useState(DEFAULTS.seedPayout);
  const [seedTasks, setSeedTasks] = useState(DEFAULTS.seedTasks);
  const [firstDeposit, setFirstDeposit] = useState(DEFAULTS.firstDeposit);
  const [multiplier, setMultiplier] = useState(DEFAULTS.multiplier);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [commission, setCommission] = useState(DEFAULTS.commission);
  const [flags, setFlags] = useState(DEFAULTS.flags);
  const [copied, setCopied] = useState(false);

  const simulation = useMemo(
    () =>
      simulateTaskScam({
        seedPayout: Number(seedPayout),
        seedTaskCount: Number(seedTasks),
        firstDeposit: Number(firstDeposit),
        depositMultiplier: Number(multiplier),
        depositRounds: Number(rounds),
        commissionRate: Number(commission) / 100,
      }),
    [seedPayout, seedTasks, firstDeposit, multiplier, rounds, commission],
  );

  const share = useMemo(
    () =>
      simulation.error
        ? { error: simulation.error }
        : seedCostShare({ received: simulation.received, deposited: simulation.deposited }),
    [simulation],
  );

  const risk = useMemo(() => scoreOffer(flags), [flags]);
  const briefing = useMemo(() => formatBriefing({ simulation, risk }), [simulation, risk]);

  const toggleFlag = (id) => {
    setFlags((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
    setCopied(false);
  };

  const reset = () => {
    setSeedPayout(DEFAULTS.seedPayout);
    setSeedTasks(DEFAULTS.seedTasks);
    setFirstDeposit(DEFAULTS.firstDeposit);
    setMultiplier(DEFAULTS.multiplier);
    setRounds(DEFAULTS.rounds);
    setCommission(DEFAULTS.commission);
    setFlags(DEFAULTS.flags);
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
  const failed = Boolean(simulation.error);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Briefcase className="h-4 w-4" aria-hidden="true" />
          Scam literacy
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Work From Home Task Scam Explainer
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Like a few videos, get paid, withdraw it — then the tasks start needing your own money.
          This models what the app screen says against what your bank account is actually doing.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <p className="text-lg leading-7 font-semibold text-[var(--primary)]">{CORE_RULE}</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The early payouts are real, and they are cheap. They exist to make the first deposit feel
          like a formality.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Model the ladder</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="task-seed-payout">
              Paid per starter task (INR)
            </label>
            <input
              id="task-seed-payout"
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seedPayout}
              onChange={(event) => {
                setSeedPayout(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-seed-count">
              Starter tasks that really paid
            </label>
            <input
              id="task-seed-count"
              type="number"
              inputMode="numeric"
              min="0"
              max="500"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={seedTasks}
              onChange={(event) => {
                setSeedTasks(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-first-deposit">
              First deposit asked for (INR)
            </label>
            <input
              id="task-first-deposit"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              className={`mt-2 ${INPUT_CLASS}`}
              value={firstDeposit}
              onChange={(event) => {
                setFirstDeposit(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-multiplier">
              Each deposit is this many times the last
            </label>
            <input
              id="task-multiplier"
              type="number"
              inputMode="decimal"
              min="1"
              max="10"
              step="0.5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={multiplier}
              onChange={(event) => {
                setMultiplier(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-rounds">
              Deposit rounds
            </label>
            <input
              id="task-rounds"
              type="number"
              inputMode="numeric"
              min="1"
              max="20"
              step="1"
              className={`mt-2 ${INPUT_CLASS}`}
              value={rounds}
              onChange={(event) => {
                setRounds(event.target.value);
                setCopied(false);
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="task-commission">
              Commission promised on each deposit (%)
            </label>
            <input
              id="task-commission"
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="5"
              className={`mt-2 ${INPUT_CLASS}`}
              value={commission}
              onChange={(event) => {
                setCommission(event.target.value);
                setCopied(false);
              }}
            />
          </div>
        </div>
      </section>

      {failed ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {simulation.error}
        </p>
      ) : null}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              What your bank account actually did
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--danger)]">
              {failed ? dash : money(simulation.cashPosition)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {failed
                ? "Fix the inputs above."
                : `While the app screen shows ${money(simulation.walletShown)}`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyBriefing}
              aria-label="Copy the task scam briefing"
              className={GHOST_BTN}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy briefing"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the model" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Starter payouts you really received", failed ? dash : money(simulation.received)],
            ["Your own money deposited", failed ? dash : money(simulation.deposited)],
            ["Commission promised on screen", failed ? dash : money(simulation.promised)],
            ["Balance the app displays", failed ? dash : money(simulation.walletShown)],
            [
              "Gap between the screen and reality",
              failed ? dash : money(simulation.gap),
            ],
            [
              "Seed payouts as a share of what you put in",
              failed || share.error ? dash : `${share.percent.toFixed(2)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Round
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Deposit
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    App balance
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Real position
                  </th>
                </tr>
              </thead>
              <tbody>
                {simulation.steps.map((step) => (
                  <tr key={step.round} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{step.round}</td>
                    <td className="py-2 pr-3 text-right">{money(step.deposit)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {money(step.walletShown)}
                    </td>
                    <td className="py-2 text-right font-semibold text-[var(--danger)]">
                      {money(step.cashPosition)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The script, stage by stage</h2>
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
        <h2 className="text-base font-semibold">What has happened to you?</h2>
        <div className="mt-4 space-y-2">
          {RED_FLAGS.map((flag) => (
            <label
              key={flag.id}
              htmlFor={`tflag-${flag.id}`}
              className="flex min-h-11 cursor-pointer items-center gap-3 text-sm leading-6"
            >
              <input
                id={`tflag-${flag.id}`}
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
          {risk.muleRisk && (
            <p
              role="alert"
              className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm leading-6 text-[var(--danger)]"
            >
              {MULE_WARNING}
            </p>
          )}
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Why the withdrawal never completes</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--muted-foreground)]">
          {WHY_WITHDRAWAL_FAILS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3 className="mt-5 text-sm font-semibold">What to do now</h3>
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
        Informational only, and not legal advice — if your account has been used to move someone
        else&apos;s money, speak to a lawyer as well as reporting it. Nothing you enter here leaves
        your browser.
      </p>
    </main>
  );
}
