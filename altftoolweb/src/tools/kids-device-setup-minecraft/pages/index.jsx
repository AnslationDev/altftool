"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Copy, Pickaxe, RotateCcw } from "lucide-react";

import { BANDS, EDITIONS, PLAY_MODES, buildPlan } from "../lib";

const DEFAULTS = { childAge: "10", edition: "bedrock", playMode: "realm" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TIER_LABEL = { essential: "Essential", recommended: "Recommended", optional: "Optional" };
const TONE_TEXT = {
  success: "text-[var(--success)]",
  warning: "text-[var(--warning)]",
  danger: "text-[var(--danger)]",
};
const TONE_BAR = {
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
};
const DASH = "—";

export default function ToolHome() {
  const [childAge, setChildAge] = useState(DEFAULTS.childAge);
  const [edition, setEdition] = useState(DEFAULTS.edition);
  const [playMode, setPlayMode] = useState(DEFAULTS.playMode);
  const [completed, setCompleted] = useState([]);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const copyTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const plan = useMemo(
    () => buildPlan({ childAge, edition, playMode, completed }),
    [childAge, edition, playMode, completed],
  );

  const grouped = useMemo(() => {
    if (plan.error) return [];
    return ["essential", "recommended", "optional"]
      .map((tier) => [tier, plan.steps.filter((step) => step.tier === tier)])
      .filter(([, list]) => list.length > 0);
  }, [plan]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    const editionLabel = EDITIONS.find((item) => item.id === edition)?.label ?? edition;
    const modeLabel = PLAY_MODES.find((item) => item.id === playMode)?.label ?? playMode;
    const lines = [
      "Minecraft multiplayer safety plan",
      `Player age: ${childAge} · ${editionLabel} · ${modeLabel}`,
      `Coverage: ${plan.score}% (${plan.band}) — ${plan.doneSteps} of ${plan.totalSteps} steps done`,
      `Essential steps left: ${plan.essentialsMissing} of ${plan.essentialsTotal}`,
      "",
      "Still to do:",
    ];
    if (plan.remaining.length === 0) lines.push("- nothing, the checklist is complete");
    plan.remaining.forEach((step) => {
      lines.push(`- [${TIER_LABEL[step.tier]}] ${step.title}`);
      lines.push(`    ${step.where}`);
    });
    return lines.join("\n");
  }, [plan, childAge, edition, playMode]);

  const toggleStep = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = async () => {
    if (!summary) return;
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setCopyError(false);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
      setCopyError(true);
    }
  };

  const reset = () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    setChildAge(DEFAULTS.childAge);
    setEdition(DEFAULTS.edition);
    setPlayMode(DEFAULTS.playMode);
    setCompleted([]);
    setCopied(false);
    setCopyError(false);
  };

  const toneText = plan.error ? TONE_TEXT.danger : TONE_TEXT[plan.tone] ?? TONE_TEXT.warning;
  const toneBar = plan.error ? TONE_BAR.danger : TONE_BAR[plan.tone] ?? TONE_BAR.warning;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Pickaxe className="h-4 w-4" aria-hidden="true" />
          Kids device safety
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Minecraft Multiplayer Safety Setup
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Answer three questions and get the exact Xbox privacy, Realm, chat and spending settings
          that apply to how your child actually plays — with the menu path for each one.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-age">
              Player&apos;s age (years)
            </label>
            <input
              id="mc-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="3"
              max="17"
              step="1"
              value={childAge}
              onChange={(event) => setChildAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="mc-edition">
              Which edition do they play?
            </label>
            <select
              id="mc-edition"
              className={`mt-2 ${INPUT_CLASS}`}
              value={edition}
              onChange={(event) => setEdition(event.target.value)}
            >
              {EDITIONS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="mc-mode">
              How do they play with other people?
            </label>
            <select
              id="mc-mode"
              className={`mt-2 ${INPUT_CLASS}`}
              value={playMode}
              onChange={(event) => setPlayMode(event.target.value)}
            >
              {PLAY_MODES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {plan.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {plan.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Setup coverage
            </p>
            <p className={`mt-1 text-4xl font-semibold ${toneText}`}>
              {plan.error ? DASH : `${plan.score}%`}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the inputs above to see the plan."
                : `${plan.band} · ${plan.doneSteps} of ${plan.totalSteps} steps done`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the Minecraft safety plan"
              className={copyError ? `${GHOST_BTN} border-[var(--danger)] text-[var(--danger)]` : GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copyError ? "Copy failed — try again" : copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the checklist" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${toneBar}`}
            style={{ width: plan.error ? "0%" : `${plan.score}%` }}
          />
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Essential steps still open", plan.error ? DASH : `${plan.essentialsMissing} of ${plan.essentialsTotal}`],
            ["Steps that apply to this setup", plan.error ? DASH : String(plan.totalSteps)],
            [
              "Account type needed",
              plan.error
                ? DASH
                : plan.needsFamilyGroup
                  ? "Microsoft child account inside a family group"
                  : "Teen account, parent still in the family group",
            ],
            [
              "Rating band",
              plan.error ? DASH : `${plan.band} (bands: ${BANDS.map((band) => band.label).join(", ")})`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!plan.error &&
        grouped.map(([tier, list]) => (
          <section key={tier} className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              {TIER_LABEL[tier]}{" "}
              <span className="font-normal text-[var(--muted-foreground)]">({list.length})</span>
            </h2>
            <ul className="mt-3 space-y-3">
              {list.map((step) => (
                <li key={step.id} className="rounded-lg border border-[var(--border)] p-3">
                  <label
                    className="flex min-h-11 cursor-pointer items-start gap-3"
                    htmlFor={`mc-step-${step.id}`}
                  >
                    <input
                      id={`mc-step-${step.id}`}
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 accent-[var(--primary)]"
                      checked={step.done}
                      onChange={() => toggleStep(step.id)}
                    />
                    <span>
                      <span className="block text-sm font-semibold leading-6">{step.title}</span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--primary)]">
                        {step.where}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--muted-foreground)]">
                        {step.why}
                      </span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
        ))}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational guidance only. Menu names move between Minecraft and Xbox app updates — if a
        path does not match, search the setting name inside the app rather than assuming it is gone.
      </p>
    </main>
  );
}
