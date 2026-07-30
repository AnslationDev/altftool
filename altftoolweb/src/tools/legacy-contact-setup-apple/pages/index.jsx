"use client";

import { useMemo, useState } from "react";
import { Check, Copy, KeyRound, RotateCcw } from "lucide-react";

import { MAX_LEGACY_CONTACTS, PLATFORMS, buildPlan } from "../lib";

const DEFAULTS = {
  ownerAge: "45",
  contactAge: "24",
  twoFactor: true,
  platform: "ios",
  osVersion: "18.2",
  contactUsesApple: true,
  contactCount: "2",
  approvalDate: "2026-08-01",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const CHECK_CLASS =
  "flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] px-3 text-sm font-semibold";
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
  const [ownerAge, setOwnerAge] = useState(DEFAULTS.ownerAge);
  const [contactAge, setContactAge] = useState(DEFAULTS.contactAge);
  const [twoFactor, setTwoFactor] = useState(DEFAULTS.twoFactor);
  const [platform, setPlatform] = useState(DEFAULTS.platform);
  const [osVersion, setOsVersion] = useState(DEFAULTS.osVersion);
  const [contactUsesApple, setContactUsesApple] = useState(DEFAULTS.contactUsesApple);
  const [contactCount, setContactCount] = useState(DEFAULTS.contactCount);
  const [approvalDate, setApprovalDate] = useState(DEFAULTS.approvalDate);
  const [completed, setCompleted] = useState([]);
  const [copied, setCopied] = useState(false);

  const plan = useMemo(
    () =>
      buildPlan({
        ownerAge,
        contactAge,
        twoFactor,
        platform,
        osVersion,
        contactUsesApple,
        contactCount: Number(contactCount),
        approvalDate,
        completed,
      }),
    [
      ownerAge,
      contactAge,
      twoFactor,
      platform,
      osVersion,
      contactUsesApple,
      contactCount,
      approvalDate,
      completed,
    ],
  );

  const grouped = useMemo(() => {
    if (plan.error) return [];
    return ["essential", "recommended", "optional"]
      .map((tier) => [tier, plan.steps.filter((step) => step.tier === tier)])
      .filter(([, list]) => list.length > 0);
  }, [plan]);

  const summary = useMemo(() => {
    if (plan.error) return "";
    const lines = [
      "Apple legacy contact plan",
      `Eligible today: ${plan.eligibility.eligible ? "yes" : "no"}`,
      ...plan.eligibility.blockers.map((blocker) => `  Blocker: ${blocker}`),
      `Legacy contacts planned: ${plan.contactCount} of ${MAX_LEGACY_CONTACTS} allowed`,
      `If access is approved on ${plan.window.approvalDate}, it ends on ${plan.window.endDate} (${plan.window.days} days).`,
      `Setup progress: ${plan.score}% (${plan.band}) — ${plan.doneSteps} of ${plan.totalSteps} steps`,
      "",
      "Still to do:",
    ];
    if (plan.remaining.length === 0) lines.push("- nothing, the plan is complete");
    plan.remaining.forEach((step) => {
      lines.push(`- [${TIER_LABEL[step.tier]}] ${step.title}`);
      lines.push(`    ${step.where}`);
    });
    return lines.join("\n");
  }, [plan]);

  const toggleStep = (id) => {
    setCompleted((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

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
    setOwnerAge(DEFAULTS.ownerAge);
    setContactAge(DEFAULTS.contactAge);
    setTwoFactor(DEFAULTS.twoFactor);
    setPlatform(DEFAULTS.platform);
    setOsVersion(DEFAULTS.osVersion);
    setContactUsesApple(DEFAULTS.contactUsesApple);
    setContactCount(DEFAULTS.contactCount);
    setApprovalDate(DEFAULTS.approvalDate);
    setCompleted([]);
    setCopied(false);
  };

  const toneText = plan.error ? TONE_TEXT.danger : TONE_TEXT[plan.tone] ?? TONE_TEXT.warning;
  const toneBar = plan.error ? TONE_BAR.danger : TONE_BAR[plan.tone] ?? TONE_BAR.warning;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          Digital inheritance
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Apple Legacy Contact Setup Guide
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Check whether your account can use Legacy Contact today, plan how the access key reaches
          the person you choose, and see what the three-year access window does and does not cover.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="lc-owner-age">
              Your age (years)
            </label>
            <input
              id="lc-owner-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={ownerAge}
              onChange={(event) => setOwnerAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lc-contact-age">
              Legacy contact&apos;s age (years)
            </label>
            <input
              id="lc-contact-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="120"
              step="1"
              value={contactAge}
              onChange={(event) => setContactAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lc-platform">
              Setting it up on
            </label>
            <select
              id="lc-platform"
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
          <div>
            <label className={LABEL_CLASS} htmlFor="lc-os">
              Operating system version
            </label>
            <input
              id="lc-os"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              inputMode="decimal"
              value={osVersion}
              onChange={(event) => setOsVersion(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lc-count">
              Legacy contacts you plan to name (1 to {MAX_LEGACY_CONTACTS})
            </label>
            <input
              id="lc-count"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_LEGACY_CONTACTS}
              step="1"
              value={contactCount}
              onChange={(event) => setContactCount(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="lc-approval">
              If access were approved on
            </label>
            <input
              id="lc-approval"
              className={`mt-2 ${INPUT_CLASS}`}
              type="date"
              value={approvalDate}
              onChange={(event) => setApprovalDate(event.target.value)}
            />
          </div>
          <div className="flex items-end">
            <label htmlFor="lc-2fa" className={CHECK_CLASS}>
              <input
                id="lc-2fa"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={twoFactor}
                onChange={(event) => setTwoFactor(event.target.checked)}
              />
              Two-factor authentication is on
            </label>
          </div>
          <div className="flex items-end">
            <label htmlFor="lc-apple" className={CHECK_CLASS}>
              <input
                id="lc-apple"
                type="checkbox"
                className="h-5 w-5 accent-[var(--primary)]"
                checked={contactUsesApple}
                onChange={(event) => setContactUsesApple(event.target.checked)}
              />
              The contact uses Apple devices
            </label>
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

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Access window would close on
            </p>
            <p className={`mt-1 text-4xl font-semibold ${toneText}`}>
              {plan.error ? DASH : plan.window.endDate}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {plan.error
                ? "Fix the inputs above to see the result."
                : `${plan.window.days} days after approval, then the account is deleted permanently`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the legacy contact plan"
              className={GHOST_BTN}
              disabled={Boolean(plan.error)}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the plan" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Can use Legacy Contact today",
              plan.error ? DASH : plan.eligibility.eligible ? "Yes" : "No",
            ],
            ["Setting up on", plan.error ? DASH : plan.eligibility.platform],
            ["Minimum version needed", plan.error ? DASH : plan.eligibility.minVersion],
            ["Contacts planned", plan.error ? DASH : `${plan.contactCount} of ${MAX_LEGACY_CONTACTS}`],
            ["Setup progress", plan.error ? DASH : `${plan.score}% · ${plan.band}`],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]">
          <span
            className={`block h-full ${toneBar}`}
            style={{ width: plan.error ? "0%" : `${plan.score}%` }}
          />
        </div>

        {!plan.error && plan.eligibility.blockers.length > 0 && (
          <div className="mt-4 rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm text-[var(--warning)]">
            <p className="font-semibold">What is blocking it right now</p>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {plan.eligibility.blockers.map((blocker) => (
                <li key={blocker}>{blocker}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {!plan.error && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">They can reach</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {plan.included.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">They never receive</h2>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {plan.excluded.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

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
                    htmlFor={`lc-step-${step.id}`}
                  >
                    <input
                      id={`lc-step-${step.id}`}
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
        Informational only, and not legal advice. Apple reviews each request individually, and how
        digital assets pass on differs by jurisdiction — raise it with your solicitor when you write
        or update your will.
      </p>
    </main>
  );
}
