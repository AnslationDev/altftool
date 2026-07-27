"use client";

import { useMemo, useState } from "react";
import { Calculator, Check, Copy, RotateCcw } from "lucide-react";

import { CURRENCY, SHOPPING_ACCURACY_PERCENT, buildCheatSheet } from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_EXACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const DEC2 = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });
const PCT = new Intl.NumberFormat("en-GB", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});
const DASH = "—";

const DEFAULTS = {
  inrPerUnit: String(CURRENCY.defaultInrPerUnit),
  amount: "12",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]";

const RULE_KEYS = ["quick", "tuned", "fraction"];

export default function ToolHome() {
  const [inrPerUnit, setInrPerUnit] = useState(DEFAULTS.inrPerUnit);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(() => buildCheatSheet({ inrPerUnit, amount }), [inrPerUnit, amount]);

  const ok = !sheet.error;
  const recommended = ok ? sheet.forward[sheet.forward.recommendedId] : null;
  const worked = ok ? sheet.worked : null;

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `${CURRENCY.code} to INR mental math cheat sheet`,
      `Rate used: 1 ${CURRENCY.code} = ${sheet.rate} INR`,
      "",
      `Rule to use (${recommended.label}, ${sheet.forward.recommendedErrorPercent}% off):`,
      ...recommended.steps.map((step, index) => `  ${index + 1}. ${step}`),
      "",
      "Going the other way (rupees to ringgit):",
      ...sheet.reverse[sheet.reverse.recommendedId].steps.map(
        (step, index) => `  ${index + 1}. ${step}`,
      ),
      "",
      "Price ladder:",
      ...sheet.priceLadder.map(
        (row) =>
          `  ${CURRENCY.symbol}${row.amount} (${row.note}) = Rs ${row.exactInr} exact / Rs ${row.tunedInr} by rule`,
      ),
      "",
      "Notes in your wallet:",
      ...sheet.noteLadder.map((row) => `  ${CURRENCY.symbol}${row.note} = Rs ${row.inr}`),
    ].join("\n");
  }, [ok, sheet, recommended]);

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
    setInrPerUnit(DEFAULTS.inrPerUnit);
    setAmount(DEFAULTS.amount);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Calculator className="h-4 w-4" aria-hidden="true" />
          Currency cheat sheets
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          INR to MYR Mental Math Cheat Sheet
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Type in the rate you actually see today and this works out the rounding shortcut to use in
          a Kuala Lumpur shop — a whole-number multiplier, an easy percentage nudge or a simple
          fraction — and tells you exactly how far off each one lands, so you know before you buy.
        </p>
      </header>

      <section className={CARD} aria-labelledby="my-inputs">
        <h2 id="my-inputs" className="text-base font-semibold">
          Today&apos;s rate
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="my-rate">
              Rupees per 1 {CURRENCY.code}
            </label>
            <input
              id="my-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={inrPerUnit}
              onChange={(event) => setInrPerUnit(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              The {CURRENCY.name} floats, so replace this with the rate on your card statement or
              the airport board.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="my-amount">
              A price to try ({CURRENCY.symbol})
            </label>
            <input
              id="my-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Anything you might see on a menu or a price tag.
            </p>
          </div>
        </div>
      </section>

      {sheet.error ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {sheet.error}
        </p>
      ) : null}

      <section className={`mt-6 ${CARD}`} aria-labelledby="my-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="my-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              {worked ? `${CURRENCY.symbol}${worked.amount} in your head` : "Rule to memorise"}
            </h2>
            <p className="mt-1 text-5xl font-semibold text-[var(--primary)]">
              {ok && worked ? INR.format(worked.tunedInr) : ok ? recommended.label : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok
                ? `${recommended.steps.join(" → ")} · ${PCT.format(sheet.forward.recommendedErrorPercent)}% off the exact figure`
                : "Fix the rate above to see the shortcut."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the cheat sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the rate and price"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rate used", ok ? `1 ${CURRENCY.code} = ${DEC2.format(sheet.rate)} INR` : DASH],
            [
              "Going the other way",
              ok ? `Rs 1 = ${DEC2.format(sheet.unitsPerRupee)} ${CURRENCY.code}` : DASH,
            ],
            ["Exact answer", ok && worked ? INR_EXACT.format(worked.exactInr) : DASH],
            ["Quick rule answer", ok && worked ? INR_EXACT.format(worked.quickInr) : DASH],
            ["Tuned rule answer", ok && worked ? INR_EXACT.format(worked.tunedInr) : DASH],
            [
              "Quick rule difference",
              ok && worked ? `${INR_EXACT.format(worked.quickGapInr)} vs exact` : DASH,
            ],
            [
              "Good enough for shopping",
              ok
                ? sheet.forward.shoppingAccurate
                  ? `Yes — within ${SHOPPING_ACCURACY_PERCENT}%`
                  : `No — the best easy rule is still more than ${SHOPPING_ACCURACY_PERCENT}% out`
                : DASH,
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="grid gap-1 py-2.5 sm:grid-cols-[minmax(0,14rem)_1fr] sm:gap-4"
            >
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="font-medium sm:text-right">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {ok ? (
        <>
          <section className={`mt-6 ${CARD}`} aria-labelledby="my-rules">
            <h2 id="my-rules" className="text-base font-semibold">
              The three rules, ranked by accuracy
            </h2>
            <ul className="mt-3 space-y-3">
              {RULE_KEYS.map((key) => {
                const rule = sheet.forward[key];
                const isBest = sheet.forward.recommendedId === key;
                return (
                  <li
                    key={key}
                    className={`rounded-md border p-3 text-sm ${
                      isBest
                        ? "border-[var(--primary)] bg-[var(--muted)]"
                        : "border-[var(--border)] bg-[var(--background)]"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold">{rule.label}</span>
                      {isBest ? (
                        <span className="rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs font-semibold text-[var(--primary-foreground)]">
                          Use this one
                        </span>
                      ) : null}
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {PCT.format(rule.errorPercent)}% vs exact
                      </span>
                    </div>
                    <ol className="mt-2 list-decimal space-y-1 pl-5 text-[var(--muted-foreground)]">
                      {rule.steps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              Each rule is a single multiplier, so its error is the same percentage on a{" "}
              {CURRENCY.symbol}5 drink as on a {CURRENCY.symbol}500 hotel night. Only the rupee
              amount grows.
            </p>
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="my-ladder">
            <h2 id="my-ladder" className="text-base font-semibold">
              Price ladder to memorise
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Price
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Exact
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      By rule
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      Off by
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.priceLadder.map((row) => (
                    <tr
                      key={row.amount}
                      className="border-b border-[var(--border)] align-top last:border-0"
                    >
                      <td className="py-2.5 pr-3">
                        <span className="font-semibold">
                          {CURRENCY.symbol}
                          {row.amount}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                          {row.note}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right font-semibold">
                        {INR.format(row.exactInr)}
                      </td>
                      <td className="py-2.5 pr-3 text-right">{INR.format(row.tunedInr)}</td>
                      <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                        {INR_EXACT.format(row.tunedGapInr)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="my-notes">
            <h2 id="my-notes" className="text-base font-semibold">
              What each note is worth
            </h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Note
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      In rupees
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.noteLadder.map((row) => (
                    <tr key={row.note} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3 font-semibold">
                        {CURRENCY.symbol}
                        {row.note}
                      </td>
                      <td className="py-2.5 text-right">{INR.format(row.inr)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
              {CURRENCY.symbol}100 is the largest note in circulation, so a big cash withdrawal
              comes as a thick stack.
            </p>
          </section>

          <section className={`mt-6 ${CARD}`} aria-labelledby="my-reverse">
            <h2 id="my-reverse" className="text-base font-semibold">
              Rupees back to {CURRENCY.plural}
            </h2>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-[var(--muted-foreground)]">
              {sheet.reverse[sheet.reverse.recommendedId].steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              {PCT.format(sheet.reverse.recommendedErrorPercent)}% off the exact figure.
            </p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[320px] text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                    <th scope="col" className="py-2 pr-3 font-semibold">
                      Rupees
                    </th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">
                      Exact {CURRENCY.code}
                    </th>
                    <th scope="col" className="py-2 text-right font-semibold">
                      By rule
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sheet.rupeeLadder.map((row) => (
                    <tr key={row.rupees} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5 pr-3 font-semibold">{INR.format(row.rupees)}</td>
                      <td className="py-2.5 pr-3 text-right">
                        {CURRENCY.symbol}
                        {DEC2.format(row.exactUnits)}
                      </td>
                      <td className="py-2.5 text-right text-[var(--muted-foreground)]">
                        {CURRENCY.symbol}
                        {DEC2.format(row.quickUnits)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Nothing here fetches a live rate — you type in the one you are actually being given, which is
        the point: the rate on your card statement already includes the bank spread and any markup,
        so a shortcut built on it reflects what you really pay. Rules are for estimating in a shop,
        not for accounting.
      </p>
    </main>
  );
}
