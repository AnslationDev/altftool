"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Check, Copy, Eraser, RotateCcw } from "lucide-react";

import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { OPTION_KEYS, OPTION_LABELS, PLATFORMS, buildWipePlan, formatWipePlan } from "../lib";

const DASH = "—";

const DEFAULT_OPTIONS = {
  hasEsim: true,
  hasSdCard: false,
  hasWatch: false,
  hasWorkProfile: false,
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

export default function ToolHome() {
  const [platform, setPlatform] = useState("ios");
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [done, setDone] = useState([]);
  const { copy, isCopied, announcement, reset: resetCopyState } = useCopyToClipboard();

  const plan = useMemo(
    () => buildWipePlan({ platform, options, done }),
    [platform, options, done],
  );

  const hasError = Boolean(plan.error);
  const summary = useMemo(() => (hasError ? "" : formatWipePlan(plan)), [plan, hasError]);

  const toggleOption = (key) => (event) => {
    const next = event.target.checked;
    setOptions((current) => ({ ...current, [key]: next }));
  };

  const toggleStep = (id) => () => {
    setDone((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const copyResult = () => {
    if (!summary) return;
    copy("checklist", summary, { label: "wipe checklist" });
  };

  const reset = () => {
    if (
      !window.confirm(
        "Reset the checklist? This will clear the platform, the options you selected and every step you have ticked off, with no way to recover the progress.",
      )
    ) {
      return;
    }
    setPlatform("ios");
    setOptions(DEFAULT_OPTIONS);
    setDone([]);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Eraser className="h-4 w-4" aria-hidden="true" />
          Device hardening
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Old Phone Resale Wipe Checklist
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          The damage comes from the order, not the steps. Erase an iPhone the wrong way and
          Activation Lock stays on; reset an Android before removing the Google account and the
          buyer is locked out. Tick a step early here and it tells you what that would cost.
        </p>
      </header>

      <section className={CARD}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="drw-platform">
              Which phone?
            </label>
            <select
              id="drw-platform"
              className={`mt-2 ${INPUT_CLASS}`}
              value={platform}
              onChange={(event) => setPlatform(event.target.value)}
            >
              {PLATFORMS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-[var(--foreground)]">
            Which of these apply?
          </legend>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {OPTION_KEYS.map((key) => (
              <label
                key={key}
                htmlFor={`drw-${key}`}
                className="flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6"
              >
                <input
                  id={`drw-${key}`}
                  type="checkbox"
                  checked={options[key]}
                  onChange={toggleOption(key)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                />
                <span>{OPTION_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      {hasError ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {plan.error}
          </p>
          <section className={`mt-6 ${CARD}`}>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Ready to sell
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {["Steps done", "Critical steps outstanding", "Next step"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-semibold">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className={`mt-6 ${CARD}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div aria-live="polite" role="status">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Ready to sell
                </p>
                <p
                  className="mt-1 text-4xl font-semibold"
                  style={{
                    color: `var(--${plan.safeToSell ? "success" : plan.violations.length > 0 ? "danger" : "primary"})`,
                  }}
                >
                  {plan.percentDone}%
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  {plan.doneCount} of {plan.total} steps on this {plan.platform.label}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyResult}
                  aria-label={isCopied("checklist") ? "Copied the wipe checklist to clipboard" : "Copy the wipe checklist"}
                  className={GHOST_BTN}
                >
                  {isCopied("checklist") ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {isCopied("checklist") ? "Copied!" : "Copy checklist"}
                </button>
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Reset the checklist"
                  className={PRIMARY_BTN}
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
                <span className="sr-only" role="status" aria-live="polite">
                  {announcement}
                </span>
              </div>
            </div>

            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
              <span
                className="block h-full"
                style={{
                  width: `${plan.percentDone}%`,
                  backgroundColor: `var(--${plan.safeToSell ? "success" : "primary"})`,
                }}
              />
            </div>

            <dl
              className="mt-5 divide-y divide-[var(--border)] text-sm"
              aria-live="polite"
              aria-atomic="true"
            >
              {[
                ["Critical steps outstanding", `${plan.criticalOutstanding}`],
                ["Out-of-order steps", `${plan.violations.length}`],
                ["Next step", plan.nextStep ? plan.nextStep.title : "Nothing left to do"],
                [
                  "Verdict",
                  plan.safeToSell
                    ? "Every step done and nothing out of order. Safe to hand over."
                    : plan.erased
                      ? "The phone has been erased. Confirm it boots to a clean setup screen before it leaves your hands."
                      : "Work down the list in order — the erase step is the point of no return.",
                ],
              ].map(([label, value]) => (
                <div key={label} className="grid gap-1 py-2.5 sm:grid-cols-[12rem_1fr] sm:gap-4">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="font-medium leading-6">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {plan.violations.length > 0 && (
            <section className="mt-6 rounded-xl bg-[var(--danger-soft)] p-5" role="alert">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-[var(--danger)]">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Done out of order
              </h2>
              <ul className="mt-3 grid gap-3 text-sm leading-6 text-[var(--foreground)]">
                {plan.violations.map((item) => (
                  <li key={item.id}>
                    <span className="font-semibold">{item.title}</span>
                    <span className="mt-1 block">
                      Should have come after: {item.missing.join("; ")}.
                    </span>
                    <span className="mt-1 block text-[var(--muted-foreground)]">
                      {item.consequence}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {plan.groups.map((group) => (
            <section key={group.id} className={`mt-6 ${CARD}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold" style={{ color: `var(--${group.tone})` }}>
                  {group.title}
                </h2>
                <span className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {group.doneCount}/{group.items.length} done
                </span>
              </div>
              <ul className="mt-3 grid gap-3">
                {group.items.map((step) => (
                  <li
                    key={step.id}
                    className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                  >
                    <label
                      htmlFor={`drw-step-${step.id}`}
                      className="flex min-h-11 cursor-pointer items-start gap-3"
                    >
                      <input
                        id={`drw-step-${step.id}`}
                        type="checkbox"
                        checked={step.done}
                        onChange={toggleStep(step.id)}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--primary)]"
                      />
                      <span>
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{step.title}</span>
                          {step.critical && (
                            <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--danger)]">
                              Critical
                            </span>
                          )}
                          {step.blocked && !step.done && (
                            <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                              Not yet
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-sm leading-6">{step.how}</span>
                        <span className="mt-1 block text-sm leading-6 text-[var(--muted-foreground)]">
                          {step.why}
                        </span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only. Menu paths change between OS releases, and financing, insurance and
        carrier terms are yours to confirm before you sell anything.
      </p>
    </main>
  );
}
