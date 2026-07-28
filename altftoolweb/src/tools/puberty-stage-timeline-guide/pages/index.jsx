"use client";

import { useMemo, useState } from "react";
import { CalendarRange, Check, Copy, RotateCcw } from "lucide-react";
import { assessPubertyTimeline } from "../lib";

const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const DEFAULTS = { sex: "female", age: "11", firstSign: "10", menarche: "" };

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const STATUS_LABEL = {
  upcoming: "Still ahead",
  "in-window": "Typical window now",
  "usually-past": "Usually already passed",
};

const TIMING_TONE = {
  typical: "text-[var(--success)]",
  "not-started": "text-[var(--foreground)]",
  "before-window": "text-[var(--foreground)]",
  early: "text-[var(--danger)]",
  late: "text-[var(--danger)]",
};

const DASH = "—";

export default function ToolHome() {
  const [sex, setSex] = useState(DEFAULTS.sex);
  const [age, setAge] = useState(DEFAULTS.age);
  const [firstSign, setFirstSign] = useState(DEFAULTS.firstSign);
  const [menarche, setMenarche] = useState(DEFAULTS.menarche);
  const [copied, setCopied] = useState(false);

  const result = useMemo(
    () =>
      assessPubertyTimeline({
        sex,
        ageYears: age === "" ? NaN : Number(age),
        firstSignAgeYears: firstSign === "" ? null : firstSign,
        menarcheAgeYears: sex === "female" && menarche !== "" ? menarche : null,
      }),
    [sex, age, firstSign, menarche],
  );

  const hasError = Boolean(result.error);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      "Puberty Stage Timeline Guide (informational)",
      `Chart: ${result.sex === "female" ? "girls" : "boys"}`,
      `Current age: ${NUM.format(result.ageYears)} years`,
      `First pubertal sign: ${result.firstSignAgeYears === null ? "not noticed yet" : `${NUM.format(result.firstSignAgeYears)} years`}`,
      `Timing: ${result.timing.label}`,
      result.timing.note,
      "",
      "Typical milestone windows:",
      ...result.milestones.map(
        (item) => `- ${item.name}: ${item.fromAge}-${item.toAge} yrs (median ${item.median}) — ${STATUS_LABEL[item.status]}`,
      ),
    ];
    if (result.estimates.length > 0) {
      lines.push("", ...result.estimates.map((item) => `${item.label}: ${item.value}`));
    }
    return lines.join("\n");
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
    setSex(DEFAULTS.sex);
    setAge(DEFAULTS.age);
    setFirstSign(DEFAULTS.firstSign);
    setMenarche(DEFAULTS.menarche);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <CalendarRange className="h-4 w-4" aria-hidden="true" />
          Child health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Puberty Stage Timeline Guide</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Typical age windows for each Tanner stage and pubertal milestone in girls and boys, with a
          simple check of whether the first sign arrived earlier or later than the usual range.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="pst-sex">
              Reference chart
            </label>
            <select
              id="pst-sex"
              className={`mt-2 ${INPUT_CLASS}`}
              value={sex}
              onChange={(event) => setSex(event.target.value)}
            >
              <option value="female">Girl</option>
              <option value="male">Boy</option>
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pst-age">
              Current age (years)
            </label>
            <input
              id="pst-age"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="25"
              step="0.1"
              value={age}
              onChange={(event) => setAge(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="pst-first-sign">
              Age at first sign (years, blank if none yet)
            </label>
            <input
              id="pst-first-sign"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="25"
              step="0.1"
              placeholder="Leave blank"
              value={firstSign}
              onChange={(event) => setFirstSign(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              {sex === "female" ? "Breast budding" : "Testicular enlargement to 4 mL"} is the first sign.
            </p>
          </div>
          {sex === "female" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="pst-menarche">
                Age at first period (optional)
              </label>
              <input
                id="pst-menarche"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="25"
                step="0.1"
                placeholder="Leave blank"
                value={menarche}
                onChange={(event) => setMenarche(event.target.value)}
              />
            </div>
          )}
        </div>
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
              Timing of the first pubertal sign
            </p>
            <p
              className={`mt-1 text-3xl font-semibold sm:text-4xl ${hasError ? "text-[var(--muted-foreground)]" : TIMING_TONE[result.timing.code]}`}
            >
              {hasError ? DASH : result.timing.label}
            </p>
            <p className="mt-2 max-w-prose text-sm leading-6 text-[var(--muted-foreground)]">
              {hasError ? DASH : result.timing.note}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the puberty timeline summary"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Current age", hasError ? DASH : `${NUM.format(result.ageYears)} years`],
            [
              "First sign noticed at",
              hasError ? DASH : result.firstSignAgeYears === null ? "Not noticed yet" : `${NUM.format(result.firstSignAgeYears)} years`,
            ],
            ["Called early if the first sign is before", hasError ? DASH : `${result.earlyAge} years`],
            ["Called delayed if there is no sign by", hasError ? DASH : `${result.lateAge} years`],
            [
              "Tanner stages that overlap this age",
              hasError || result.currentStages.length === 0
                ? DASH
                : result.currentStages.map((item) => item.stage).join(", "),
            ],
            ...(hasError ? [] : result.estimates.map((item) => [item.label, item.value])),
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {!hasError && (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">Milestone windows</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[340px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">Milestone</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Typical age</th>
                    <th scope="col" className="py-2 text-right font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {result.milestones.map((item) => (
                    <tr key={item.key} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-medium">{item.name}</td>
                      <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                        {item.fromAge}–{item.toAge} yrs
                        <span className="block text-xs">median {item.median}</span>
                      </td>
                      <td
                        className={`py-2 text-right ${item.status === "in-window" ? "text-[var(--primary)] font-semibold" : "text-[var(--muted-foreground)]"}`}
                      >
                        {STATUS_LABEL[item.status]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">
              Tanner stages — {result.sex === "female" ? "girls" : "boys"}
            </h2>
            <ol className="mt-3 space-y-3">
              {result.stages.map((item) => {
                const active = result.currentStages.some((row) => row.stage === item.stage);
                return (
                  <li
                    key={item.stage}
                    className={`rounded-lg border p-3 ${active ? "border-[var(--primary)]" : "border-[var(--border)]"}`}
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {item.fromAge}–{item.toAge} yrs
                      </p>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{item.detail}</p>
                  </li>
                );
              })}
            </ol>
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational reference only, not a medical assessment. Tanner staging is done by a clinician,
        and healthy children vary widely around these windows. Speak to a paediatrician about any
        concern over early, late or unusually fast pubertal change.
      </p>
    </main>
  );
}
