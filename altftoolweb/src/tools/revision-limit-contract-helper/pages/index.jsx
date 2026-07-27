"use client";

import { useMemo, useState } from "react";
import { Check, Copy, FileText, RotateCcw, TriangleAlert } from "lucide-react";

import { CURRENCIES, draftRevisionClause, priceRevisionPolicy } from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  currency: "INR",
  projectFee: "100000",
  baseHours: "30",
  includedRounds: "2",
  hoursPerRound: "4",
  hourlyRate: "2000",
  extraRoundFee: "",
  feedbackWindowDays: "5",
  deemedApprovalDays: "7",
  includeKillFee: true,
};

const DASH = "—";
const NUM = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

export default function ToolHome() {
  const [form, setForm] = useState(DEFAULTS);
  const [copied, setCopied] = useState("");

  const set = (key) => (event) => {
    const value = event.target.type === "checkbox" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
    setCopied("");
  };

  const pricing = useMemo(
    () =>
      priceRevisionPolicy({
        currency: form.currency,
        projectFee: form.projectFee,
        baseHours: form.baseHours,
        includedRounds: form.includedRounds === "" ? NaN : Number(form.includedRounds),
        hoursPerRound: form.hoursPerRound,
        hourlyRate: form.hourlyRate,
        extraRoundFee: form.extraRoundFee,
      }),
    [form],
  );

  const money = useMemo(() => {
    const config = CURRENCIES[form.currency] || CURRENCIES.INR;
    const formatter = new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: form.currency in CURRENCIES ? form.currency : "INR",
      maximumFractionDigits: 0,
    });
    return (value) => formatter.format(Number.isFinite(value) ? value : 0);
  }, [form.currency]);

  const draft = useMemo(
    () =>
      draftRevisionClause(pricing, {
        feedbackWindowDays: Number(form.feedbackWindowDays),
        deemedApprovalDays: Number(form.deemedApprovalDays),
        includeKillFee: form.includeKillFee,
        formatMoney: money,
      }),
    [pricing, form.feedbackWindowDays, form.deemedApprovalDays, form.includeKillFee, money],
  );

  const copyValue = async (key, value) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      setCopied("");
    }
  };

  const reset = () => {
    setForm(DEFAULTS);
    setCopied("");
  };

  const summary = pricing.error
    ? ""
    : [
        "Revision policy",
        `Project fee: ${money(pricing.projectFee)}`,
        `Included rounds: ${pricing.includedRounds} x ${pricing.hoursPerRound} hours`,
        `Effective hourly rate if all rounds are used: ${money(pricing.effectiveHourlyRate)}`,
        `Extra round: ${money(pricing.extraRoundFee)}`,
        "",
        draft.error ? "" : draft.text,
      ]
        .filter(Boolean)
        .join("\n");

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <FileText className="h-4 w-4" aria-hidden="true" />
          Client workflow
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Revision Limit Contract Helper</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Work out what your included revision rounds are really costing you, price the extra
          ones, and draft the scope clause that stops a project turning into an open tab.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-currency">
              Currency
            </label>
            <select id="rev-currency" className={`mt-2 ${INPUT_CLASS}`} value={form.currency} onChange={set("currency")}>
              {Object.entries(CURRENCIES).map(([key, value]) => (
                <option key={key} value={key}>
                  {value.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-fee">
              Project fee
            </label>
            <input
              id="rev-fee"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1000"
              value={form.projectFee}
              onChange={set("projectFee")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-basehours">
              Base hours (before revisions)
            </label>
            <input
              id="rev-basehours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={form.baseHours}
              onChange={set("baseHours")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-rate">
              Target hourly rate
            </label>
            <input
              id="rev-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={form.hourlyRate}
              onChange={set("hourlyRate")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-rounds">
              Included revision rounds
            </label>
            <input
              id="rev-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="10"
              step="1"
              value={form.includedRounds}
              onChange={set("includedRounds")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-hours">
              Hours allowed per round
            </label>
            <input
              id="rev-hours"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={form.hoursPerRound}
              onChange={set("hoursPerRound")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-extra">
              Extra round fee (blank = calculated)
            </label>
            <input
              id="rev-extra"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="500"
              value={form.extraRoundFee}
              onChange={set("extraRoundFee")}
              placeholder="Hours per round x hourly rate"
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-feedback">
              Feedback due within (business days)
            </label>
            <input
              id="rev-feedback"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={form.feedbackWindowDays}
              onChange={set("feedbackWindowDays")}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="rev-deemed">
              Deemed approval after (business days)
            </label>
            <input
              id="rev-deemed"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="0"
              max="90"
              step="1"
              value={form.deemedApprovalDays}
              onChange={set("deemedApprovalDays")}
            />
          </div>
        </div>

        <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium" htmlFor="rev-kill">
          <input
            id="rev-kill"
            type="checkbox"
            className="h-5 w-5 shrink-0 rounded border border-[var(--border)] accent-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none"
            checked={Boolean(form.includeKillFee)}
            onChange={set("includeKillFee")}
          />
          Include a cancellation clause
        </label>
      </section>

      {pricing.error ? (
        <>
          <p
            role="alert"
            className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            {pricing.error}
          </p>
          <section className="mt-4 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Effective hourly rate
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--muted-foreground)]">{DASH}</p>
            <dl className="mt-4 divide-y divide-[var(--border)] text-sm">
              {["Total hours if all rounds are used", "Value of included revisions", "Extra round fee"].map((label) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold text-[var(--muted-foreground)]">{DASH}</dd>
                </div>
              ))}
            </dl>
          </section>
        </>
      ) : (
        <>
          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
                  Effective hourly rate
                </p>
                <p
                  className={`mt-1 text-4xl font-semibold ${pricing.effectiveHourlyRate >= pricing.hourlyRate ? "text-[var(--success)]" : "text-[var(--primary)]"}`}
                >
                  {money(pricing.effectiveHourlyRate)}
                </p>
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                  if all {pricing.includedRounds} included round{pricing.includedRounds === 1 ? "" : "s"} are used,
                  against a target of {money(pricing.hourlyRate)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => copyValue("summary", summary)}
                  aria-label="Copy the pricing summary and clause"
                  className={GHOST_BTN}
                >
                  {copied === "summary" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === "summary" ? "Copied!" : "Copy result"}
                </button>
                <button type="button" onClick={reset} aria-label="Reset all fields" className={PRIMARY_BTN}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Reset
                </button>
              </div>
            </div>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              {[
                ["Total hours if all rounds are used", `${NUM.format(pricing.totalHours)} hours`],
                ["Hours given to revisions", `${NUM.format(pricing.revisionHours)} hours`],
                ["Value of included revisions", money(pricing.includedRevisionValue)],
                ["Share of the fee that is revision time", `${pricing.revisionSharePercent.toFixed(0)}%`],
                ["Extra round fee", money(pricing.extraRoundFee)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start justify-between gap-4 py-2.5">
                  <dt className="shrink-0 text-[var(--muted-foreground)]">{label}</dt>
                  <dd className="text-right font-semibold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {pricing.warnings.length > 0 && (
            <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
              <h2 className="text-base font-semibold">What the numbers are telling you</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                {pricing.warnings.map((warning) => (
                  <li
                    key={warning}
                    className="flex items-start gap-2 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-[var(--danger)]"
                  >
                    <TriangleAlert className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <h2 className="text-base font-semibold">If the client asks for more rounds</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[360px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Extra rounds
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Billed total
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Rate if billed
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Rate if absorbed
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pricing.scenarios.map((row) => (
                    <tr key={row.rounds} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2 pr-3 font-semibold">+{row.rounds}</td>
                      <td className="py-2 pr-3 text-right">{money(row.billedTotal)}</td>
                      <td className="py-2 pr-3 text-right">{money(row.effectiveRateIfBilled)}</td>
                      <td className="py-2 text-right text-[var(--danger)]">{money(row.effectiveRateIfAbsorbed)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              The last column is what happens when you say yes for free. That is the number worth
              showing yourself before the conversation, not after.
            </p>
          </section>

          <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">Draft clause</h2>
              {!draft.error && (
                <button
                  type="button"
                  onClick={() => copyValue("clause", draft.text)}
                  aria-label="Copy the draft revision clause"
                  className={GHOST_BTN}
                >
                  {copied === "clause" ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  {copied === "clause" ? "Copied!" : "Copy clause"}
                </button>
              )}
            </div>
            {draft.error ? (
              <p
                role="alert"
                className="mt-3 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
              >
                {draft.error}
              </p>
            ) : (
              <dl className="mt-3 space-y-3">
                {draft.clauses.map((clause) => (
                  <div key={clause.heading} className="rounded-md bg-[var(--muted)] p-3">
                    <dt className="text-sm font-semibold">{clause.heading}</dt>
                    <dd className="mt-1 text-sm leading-6 text-[var(--muted-foreground)]">{clause.body}</dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        </>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Drafting help, not legal advice. Contract law, consumer-protection rules and enforceable
        cancellation terms differ by country — have a lawyer review anything you intend to sign.
      </p>
    </main>
  );
}
