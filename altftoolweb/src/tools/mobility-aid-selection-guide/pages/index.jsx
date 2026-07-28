"use client";

import { useMemo, useState } from "react";
import { Accessibility, Check, Copy, RotateCcw } from "lucide-react";
import {
  BALANCE_LEVELS,
  ENDURANCE_LEVELS,
  ENVIRONMENTS,
  GRIP_LEVELS,
  SUPPORT_NEEDS,
  recommendMobilityAid,
} from "../lib";

const DEC = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });
const DASH = "—";

const DEFAULTS = {
  support: "moderate",
  balance: "poor",
  endurance: "low",
  grip: "fair",
  environment: "outdoor",
  height: "165",
  freeHand: false,
  carry: true,
  stairs: false,
  memory: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHECK_LABEL =
  "flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm";

export default function ToolHome() {
  const [support, setSupport] = useState(DEFAULTS.support);
  const [balance, setBalance] = useState(DEFAULTS.balance);
  const [endurance, setEndurance] = useState(DEFAULTS.endurance);
  const [grip, setGrip] = useState(DEFAULTS.grip);
  const [environment, setEnvironment] = useState(DEFAULTS.environment);
  const [height, setHeight] = useState(DEFAULTS.height);
  const [freeHand, setFreeHand] = useState(DEFAULTS.freeHand);
  const [carry, setCarry] = useState(DEFAULTS.carry);
  const [stairs, setStairs] = useState(DEFAULTS.stairs);
  const [memory, setMemory] = useState(DEFAULTS.memory);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      recommendMobilityAid({
        supportKey: support,
        balanceKey: balance,
        enduranceKey: endurance,
        gripKey: grip,
        environmentKey: environment,
        needsFreeHand: freeHand,
        carriesItems: carry,
        usesStairs: stairs,
        memoryConcern: memory,
        heightCm: height === "" ? null : height,
      }),
    [support, balance, endurance, grip, environment, freeHand, carry, stairs, memory, height],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Mobility Aid Selection Guide",
      `Support needed: ${result.support.label}`,
      `Balance: ${result.balance.label}`,
      `Walking distance: ${result.endurance.label}`,
      `Hands: ${result.grip.label}`,
      `Used: ${result.environment.label}`,
      [
        result.needsFreeHand ? "needs a free hand" : null,
        result.carriesItems ? "carries things" : null,
        result.usesStairs ? "uses stairs" : null,
        result.memoryConcern ? "memory concerns" : null,
      ]
        .filter(Boolean)
        .join(", ") || "No extra requirements",
      "",
      `Best match: ${result.best.label}`,
      result.best.summary,
      `Runner-up: ${result.runnerUp.label}`,
      "",
      "Full ranking:",
      ...result.ranked.map((aid, index) => `${index + 1}. ${aid.label} (${aid.fitPercent}% match)`),
      ...(result.fitting
        ? [
            "",
            `Fitting: at ${DEC.format(result.fitting.heightCm)} cm tall, the handgrip should sit about ${DEC.format(result.fitting.gripMinCm)}-${DEC.format(result.fitting.gripMaxCm)} cm from the floor — level with the wrist crease when standing with arms relaxed, giving ${result.fitting.elbowFlexion.min}-${result.fitting.elbowFlexion.max} degrees of elbow bend in use.`,
          ]
        : []),
      "",
      "Informational comparison only — a physiotherapist or occupational therapist should confirm the choice and the fit.",
    ].join("\n");
  }, [hasError, result]);

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
    setSupport(DEFAULTS.support);
    setBalance(DEFAULTS.balance);
    setEndurance(DEFAULTS.endurance);
    setGrip(DEFAULTS.grip);
    setEnvironment(DEFAULTS.environment);
    setHeight(DEFAULTS.height);
    setFreeHand(DEFAULTS.freeHand);
    setCarry(DEFAULTS.carry);
    setStairs(DEFAULTS.stairs);
    setMemory(DEFAULTS.memory);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Accessibility className="h-4 w-4" aria-hidden="true" />
          Senior health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Mobility Aid Selection Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Support, stability, portability and manoeuvrability pull against each other. Describe how
          much help is needed, where it will be used and what the hands can manage, and every option
          from a walking stick to a wheelchair is ranked with its trade-offs spelled out.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mag-support">
              How much support is needed?
            </label>
            <select id="mag-support" className={`mt-2 ${INPUT_CLASS}`} value={support} onChange={(event) => setSupport(event.target.value)}>
              {SUPPORT_NEEDS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mag-balance">
              How steady is walking?
            </label>
            <select id="mag-balance" className={`mt-2 ${INPUT_CLASS}`} value={balance} onChange={(event) => setBalance(event.target.value)}>
              {BALANCE_LEVELS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mag-endurance">
              How far before needing a rest?
            </label>
            <select id="mag-endurance" className={`mt-2 ${INPUT_CLASS}`} value={endurance} onChange={(event) => setEndurance(event.target.value)}>
              {ENDURANCE_LEVELS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mag-grip">
              Hand and arm strength
            </label>
            <select id="mag-grip" className={`mt-2 ${INPUT_CLASS}`} value={grip} onChange={(event) => setGrip(event.target.value)}>
              {GRIP_LEVELS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mag-env">
              Where will it mostly be used?
            </label>
            <select id="mag-env" className={`mt-2 ${INPUT_CLASS}`} value={environment} onChange={(event) => setEnvironment(event.target.value)}>
              {ENVIRONMENTS.map((row) => (
                <option key={row.key} value={row.key}>
                  {row.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mag-height">
              Standing height (cm, for the fitting range)
            </label>
            <input
              id="mag-height"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="100"
              max="230"
              step="1"
              placeholder="Optional"
              value={height}
              onChange={(event) => setHeight(event.target.value)}
            />
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className={LABEL_CLASS}>Anything else that matters</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <label className={CHECK_LABEL} htmlFor="mag-freehand">
              <input
                id="mag-freehand"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={freeHand}
                onChange={(event) => setFreeHand(event.target.checked)}
              />
              Needs one hand free while walking
            </label>
            <label className={CHECK_LABEL} htmlFor="mag-carry">
              <input
                id="mag-carry"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={carry}
                onChange={(event) => setCarry(event.target.checked)}
              />
              Needs to carry shopping or a bag
            </label>
            <label className={CHECK_LABEL} htmlFor="mag-stairs">
              <input
                id="mag-stairs"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={stairs}
                onChange={(event) => setStairs(event.target.checked)}
              />
              Uses stairs most days
            </label>
            <label className={CHECK_LABEL} htmlFor="mag-memory">
              <input
                id="mag-memory"
                type="checkbox"
                className="h-5 w-5 shrink-0 accent-[var(--primary)]"
                checked={memory}
                onChange={(event) => setMemory(event.target.checked)}
              />
              Memory or judgement difficulties
            </label>
          </div>
        </fieldset>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Closest match
            </p>
            <p className="mt-1 text-3xl font-semibold text-[var(--primary)] sm:text-4xl">
              {hasError ? DASH : result.best.label}
            </p>
            <p className="mt-2 max-w-prose text-sm leading-6 text-[var(--muted-foreground)]">
              {hasError ? DASH : result.best.summary}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the mobility aid comparison"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy comparison"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Runner-up", hasError ? DASH : result.runnerUp.label],
            ["How to use the best match", hasError ? DASH : result.best.tip],
            [
              "Handgrip height",
              hasError || !result.fitting
                ? "Enter a standing height"
                : `${DEC.format(result.fitting.gripMinCm)}–${DEC.format(result.fitting.gripMaxCm)} cm from the floor`,
            ],
            [
              "Elbow bend when in use",
              hasError || !result.fitting
                ? DASH
                : `${result.fitting.elbowFlexion.min}–${result.fitting.elbowFlexion.max} degrees`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && result.fitting && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">
            Check the fit rather than trusting the number: stand upright in normal shoes with arms
            hanging loose, and the handgrip should sit level with the crease of the wrist. Too high
            and the shoulder tires; too low and you stoop, which is exactly the posture that causes
            falls.
          </p>
        )}
      </section>

      {!hasError && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Every option, ranked</h2>
          <ol className="mt-3 space-y-3">
            {result.ranked.map((aid, index) => (
              <li
                key={aid.key}
                className={`rounded-lg border p-3 ${index === 0 ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {index + 1}. {aid.label}
                  </p>
                  <p className="text-xs text-[var(--muted-foreground)]">{aid.fitPercent}% match</p>
                </div>
                <div
                  className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
                  role="img"
                  aria-label={`${aid.label} scores ${aid.fitPercent} percent against your needs`}
                >
                  <span className="block h-full bg-[var(--primary)]" style={{ width: `${aid.fitPercent}%` }} />
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">{aid.summary}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--success)]">Good for you</p>
                    <ul className="mt-1 space-y-1 text-sm text-[var(--muted-foreground)]">
                      {(aid.reasons.length > 0 ? aid.reasons : aid.pros.slice(0, 1)).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--danger)]">Watch out</p>
                    <ul className="mt-1 space-y-1 text-sm text-[var(--muted-foreground)]">
                      {(aid.warnings.length > 0 ? aid.warnings : aid.cons.slice(0, 1)).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-[var(--muted-foreground)]">
                  <span className="font-semibold">Using it: </span>
                  {aid.tip}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational comparison, not a clinical prescription. A physiotherapist or occupational
        therapist should watch the person walk before an aid is chosen and should set the height —
        the wrong aid, or the right aid at the wrong height, increases fall risk rather than reducing
        it. In many countries an assessment and the equipment itself are available through the health
        service or social care at no cost.
      </p>
    </main>
  );
}
