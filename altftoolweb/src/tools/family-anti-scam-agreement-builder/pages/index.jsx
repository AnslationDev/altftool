"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { RULES, buildFamilyAgreement } from "../lib";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const TONE_TEXT = {
  danger: "text-[var(--danger)]",
  warning: "text-[var(--warning)]",
  success: "text-[var(--success)]",
};
const TONE_BAR = {
  danger: "bg-[var(--danger)]",
  warning: "bg-[var(--warning)]",
  success: "bg-[var(--success)]",
};

const DEFAULTS = {
  householdName: "",
  members: [
    { id: 1, name: "" },
    { id: 2, name: "" },
  ],
  rules: ["noOtp", "callBack", "safeWord", "coolingOff", "secondSignature", "digitalArrest", "helper", "reporting"],
  safeWord: "",
  includeSafeWord: false,
  coolingOffHours: "24",
  threshold: "25000",
  helperName: "",
};

const DASH = "—";

export default function ToolHome() {
  const [householdName, setHouseholdName] = useState(DEFAULTS.householdName);
  const [members, setMembers] = useState(DEFAULTS.members);
  const [rules, setRules] = useState(DEFAULTS.rules);
  const [safeWord, setSafeWord] = useState(DEFAULTS.safeWord);
  const [includeSafeWord, setIncludeSafeWord] = useState(DEFAULTS.includeSafeWord);
  const [coolingOffHours, setCoolingOffHours] = useState(DEFAULTS.coolingOffHours);
  const [threshold, setThreshold] = useState(DEFAULTS.threshold);
  const [helperName, setHelperName] = useState(DEFAULTS.helperName);
  const { copy: copyToClipboard, isCopied, announcement, reset: resetCopyState } =
    useCopyToClipboard();

  const result = useMemo(
    () =>
      buildFamilyAgreement({
        householdName,
        members: members.map((member) => member.name),
        selectedRules: rules,
        safeWord,
        includeSafeWord,
        coolingOffHours: coolingOffHours === "" ? Number.NaN : coolingOffHours,
        secondSignatureAmount: threshold === "" ? Number.NaN : threshold,
        helperName,
      }),
    [householdName, members, rules, safeWord, includeSafeWord, coolingOffHours, threshold, helperName],
  );
  const failed = Boolean(result.error);

  const toggleRule = (id) => {
    setRules((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
    resetCopyState();
  };

  const updateMember = (id, name) => {
    setMembers((current) => current.map((member) => (member.id === id ? { ...member, name } : member)));
    resetCopyState();
  };

  const addMember = () => {
    setMembers((current) => {
      const nextId = current.reduce((max, member) => Math.max(max, member.id), 0) + 1;
      return [...current, { id: nextId, name: "" }];
    });
    resetCopyState();
  };

  const removeMember = (id) => {
    setMembers((current) => current.filter((member) => member.id !== id));
    resetCopyState();
  };

  const copyResult = async () => {
    if (failed) return;
    await copyToClipboard("agreement", result.text, { label: "the agreement" });
  };

  const reset = () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm(
        "Reset the builder? This clears the household name, every member's name, the safe word and all chosen clauses — anything you entered will be lost.",
      )
    ) {
      return;
    }
    setHouseholdName(DEFAULTS.householdName);
    setMembers(DEFAULTS.members);
    setRules(DEFAULTS.rules);
    setSafeWord(DEFAULTS.safeWord);
    setIncludeSafeWord(DEFAULTS.includeSafeWord);
    setCoolingOffHours(DEFAULTS.coolingOffHours);
    setThreshold(DEFAULTS.threshold);
    setHelperName(DEFAULTS.helperName);
    resetCopyState();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Users className="h-4 w-4" aria-hidden="true" />
          Household rules
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Family Anti-Scam Agreement Builder
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Scams work by isolating one person and rushing them. Rules agreed in advance — never share
          an OTP, always call back, wait before paying — remove both, without anyone needing to
          recognise the specific trick. Pick your clauses and print the result.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-household">
              Household name (optional)
            </label>
            <input
              id="fa-household"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={householdName}
              placeholder="e.g. Sharma"
              onChange={(event) => {
                setHouseholdName(event.target.value);
                resetCopyState();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-helper">
              Who is the first call when something feels wrong?
            </label>
            <input
              id="fa-helper"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={helperName}
              placeholder="e.g. Meena"
              onChange={(event) => {
                setHelperName(event.target.value);
                resetCopyState();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-cooling">
              Cooling-off period before money moves (hours)
            </label>
            <input
              id="fa-cooling"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max="168"
              step="1"
              value={coolingOffHours}
              onChange={(event) => {
                setCoolingOffHours(event.target.value);
                resetCopyState();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-threshold">
              Payment above which two people must agree (INR)
            </label>
            <input
              id="fa-threshold"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="10000000"
              step="500"
              value={threshold}
              onChange={(event) => {
                setThreshold(event.target.value);
                resetCopyState();
              }}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="fa-safeword">
              Family safe word
            </label>
            <input
              id="fa-safeword"
              className={`mt-2 ${INPUT_CLASS}`}
              type="text"
              value={safeWord}
              placeholder="two unrelated words work best"
              onChange={(event) => {
                setSafeWord(event.target.value);
                resetCopyState();
              }}
            />
            {!failed && (
              <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
                {result.safeWordCheck.message}
              </p>
            )}
          </div>
          <div className="flex items-end">
            <label
              htmlFor="fa-include-safeword"
              className="flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2.5 text-sm leading-6"
            >
              <input
                id="fa-include-safeword"
                type="checkbox"
                className="h-4 w-4 shrink-0 accent-[var(--primary)]"
                checked={includeSafeWord}
                onChange={(event) => {
                  setIncludeSafeWord(event.target.checked);
                  resetCopyState();
                }}
              />
              <span>Print the safe word inside the agreement</span>
            </label>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold">Who is agreeing to this?</legend>
          <ul className="mt-2 grid gap-2">
            {members.map((member, index) => (
              <li key={member.id} className="flex items-end gap-2">
                <div className="flex-1">
                  <label className="sr-only" htmlFor={`member-${member.id}`}>
                    Household member {index + 1}
                  </label>
                  <input
                    id={`member-${member.id}`}
                    className={INPUT_CLASS}
                    type="text"
                    value={member.name}
                    placeholder={`Person ${index + 1}`}
                    onChange={(event) => updateMember(member.id, event.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeMember(member.id)}
                  className={GHOST_BTN}
                  aria-label={`Remove person ${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={addMember} className={`mt-2 ${GHOST_BTN}`}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a person
          </button>
        </fieldset>
      </section>

      <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Clauses to include</h2>
        <div className="mt-3 grid gap-2">
          {RULES.map((rule) => {
            const checked = rules.includes(rule.id);
            return (
              <label
                key={rule.id}
                htmlFor={`rule-${rule.id}`}
                className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-md border px-3 py-2.5 text-sm leading-6 transition ${
                  checked
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <input
                  id={`rule-${rule.id}`}
                  type="checkbox"
                  className="mt-1.5 h-4 w-4 shrink-0 accent-[var(--primary)]"
                  checked={checked}
                  onChange={() => toggleRule(rule.id)}
                />
                <span>{rule.label}</span>
              </label>
            );
          })}
        </div>
      </section>

      {failed && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div aria-live="polite" role="status">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Scam coverage score
            </p>
            <p
              className={`mt-1 text-4xl font-semibold ${
                failed ? "text-[var(--muted-foreground)]" : TONE_TEXT[result.band.tone]
              }`}
            >
              {failed ? DASH : `${result.score}/100`}
            </p>
            <p className="mt-1 text-sm font-semibold">{failed ? DASH : result.band.label}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the family anti-scam agreement"
              className={GHOST_BTN}
              disabled={failed}
            >
              {isCopied("agreement") ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {isCopied("agreement") ? "Copied!" : "Copy agreement"}
            </button>
            <span className="sr-only" role="status" aria-live="polite">
              {announcement}
            </span>
            <button type="button" onClick={reset} aria-label="Reset the builder" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <div
          className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={failed ? "Coverage unavailable" : `Coverage score ${result.score} out of 100`}
        >
          {!failed && (
            <span
              className={`block h-full ${TONE_BAR[result.band.tone]}`}
              style={{ width: `${Math.max(2, result.score)}%` }}
            />
          )}
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Clauses included", failed ? DASH : `${result.clauses.length} of ${RULES.length}`],
            ["Scam types with no rule", failed ? DASH : String(result.uncovered.length)],
            ["Cooling-off period", failed ? DASH : result.coolingText],
            ["Two-person threshold", failed ? DASH : result.thresholdText],
            ["People named", failed ? DASH : result.members.length > 0 ? result.members.join(", ") : "None yet"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[55%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!failed && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm leading-6">{result.band.advice}</p>
        )}

        {!failed && result.warnings.length > 0 && (
          <ul className="mt-3 grid gap-2">
            {result.warnings.map((warning) => (
              <li
                key={warning}
                className="rounded-md bg-[var(--warning-soft)] px-3 py-2 text-sm leading-6 text-[var(--warning)]"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Which scams this covers</h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6">
            {result.vectorCoverage.map((vector) => (
              <li key={vector.id} className="flex items-start justify-between gap-3">
                <span>{vector.label}</span>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    vector.covered
                      ? "bg-[var(--success-soft)] text-[var(--success)]"
                      : "bg-[var(--danger-soft)] text-[var(--danger)]"
                  }`}
                >
                  {vector.covered ? `${vector.rules.length} clause(s)` : "no rule"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!failed && (
        <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
          <h2 className="text-base font-semibold">Your agreement</h2>
          <ol className="mt-3 grid gap-3 text-sm leading-6">
            {result.clauses.map((clause) => (
              <li key={clause.id}>
                <p className="font-semibold">
                  {clause.number}. {clause.title}
                </p>
                <p className="text-[var(--muted-foreground)]">{clause.text}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, not legal advice: this is a family understanding, not a contract. Keep the
        printed copy at home, never message or photograph the safe word, and if money has already
        moved, call 1930 and file at cybercrime.gov.in the same day.
      </p>
    </main>
  );
}
