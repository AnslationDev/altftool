"use client";

import { useMemo, useState } from "react";
import { ArrowRightLeft, Check, Copy, RotateCcw } from "lucide-react";

import { CURRENCY, SHOPPING_ACCURACY_PERCENT, buildCheatSheet } from "../lib";

const INR0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR2 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const FOREIGN = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const DASH = "—";
const money = (value) => (Number.isFinite(value) ? INR0.format(value) : DASH);
const money2 = (value) => (Number.isFinite(value) ? INR2.format(value) : DASH);
const foreign = (value) =>
  Number.isFinite(value) ? `${CURRENCY.symbol}${FOREIGN.format(value)}` : DASH;
const signedPct = (value) =>
  Number.isFinite(value) ? `${value > 0 ? "+" : ""}${NUM2.format(value)}%` : DASH;

const DEFAULTS = {
  rate: String(CURRENCY.defaultInrPerUnit),
  amount: "450",
};

const INPUT_CLASS =
  "mt-2 h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_BTN =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const TH = "py-2 pr-3 text-right text-xs font-semibold tracking-wide uppercase";

export default function ToolHome() {
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(() => buildCheatSheet({ inrPerUnit: rate, amount }), [rate, amount]);
  const hasError = Boolean(sheet.error);

  const rules = hasError
    ? []
    : [sheet.forward.quick, sheet.forward.tuned, sheet.forward.fraction];
  const recommended = hasError
    ? null
    : rules.find((rule) => rule.id === sheet.forward.recommendedId);

  const summary = useMemo(() => {
    if (hasError) return "";
    const lines = [
      `${CURRENCY.code} to INR mental-math cheat sheet`,
      `Rate used: Rs ${NUM2.format(sheet.rate)} per 1 ${CURRENCY.code} (Rs 1 = ${NUM2.format(sheet.unitsPerRupee)} ${CURRENCY.code})`,
      `Rule to memorise (${recommended.label}): ${recommended.steps.join(" -> ")}`,
      `Accuracy: ${signedPct(recommended.errorPercent)} against the exact rate`,
      `Going back: ${sheet.reverse.quick.steps.join(" -> ")}`,
      "",
      "Price ladder",
      ...sheet.priceLadder.map(
        (row) =>
          `${CURRENCY.symbol}${FOREIGN.format(row.amount)} = ${INR0.format(row.exactInr)} exact / ${INR0.format(row.quickInr)} by the quick rule`,
      ),
    ];
    if (sheet.worked) {
      lines.push(
        "",
        `${CURRENCY.symbol}${FOREIGN.format(sheet.worked.amount)} = ${INR2.format(sheet.worked.exactInr)} exact, ${INR2.format(sheet.worked.quickInr)} in your head`,
      );
    }
    return lines.join("\n");
  }, [hasError, sheet, recommended]);

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
    setRate(DEFAULTS.rate);
    setAmount(DEFAULTS.amount);
    setCopied(false);
  };

  const rows = [
    ["Exact conversion", hasError ? DASH : money2(sheet.worked?.exactInr)],
    ["Quick rule answer", hasError ? DASH : money2(sheet.worked?.quickInr)],
    ["Tuned rule answer", hasError ? DASH : money2(sheet.worked?.tunedInr)],
    [
      "Quick rule is off by",
      hasError ? DASH : `${money2(sheet.worked?.quickGapInr)} (${signedPct(sheet.forward.quick.errorPercent)})`,
    ],
    ["Rate used", hasError ? DASH : `Rs ${NUM2.format(sheet.rate)} per 1 ${CURRENCY.code}`],
    [
      "Rupee 1 buys",
      hasError ? DASH : `${FOREIGN.format(sheet.unitsPerRupee)} ${CURRENCY.code}`,
    ],
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
          {CURRENCY.code} · {CURRENCY.country}
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">INR to NPR Mental Math Cheat Sheet</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">Nepal pegs its rupee to the Indian rupee at NPR 1.60 = INR 1, so this conversion never moves &mdash; it is exactly five-eighths. The sheet shows that rule, the easier approximations to it, and how far each one is out.</p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sheet-rate">
              Today&rsquo;s rate (₹ per 1 {CURRENCY.code})
            </label>
            <input
              id="sheet-rate"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.005"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">0.625 is the Nepal Rastra Bank peg (NPR 1.60 = INR 1). Change it only if you are pricing a money changer&rsquo;s worse rate.</p>
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sheet-amount">
              A price to check ({CURRENCY.code})
            </label>
            <input
              id="sheet-amount"
              className={INPUT_CLASS}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
            <p className="mt-1.5 text-xs text-[var(--muted-foreground)]">
              The price on the tag or the menu, in {CURRENCY.plural}.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
            Common prices
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CURRENCY.pricePoints.slice(0, 6).map((point) => (
              <button
                key={point.amount}
                type="button"
                className={CHIP_BTN}
                onClick={() => setAmount(String(point.amount))}
              >
                {CURRENCY.symbol}
                {FOREIGN.format(point.amount)} · {point.note}
              </button>
            ))}
          </div>
        </div>
      </section>

      {hasError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {sheet.error}
        </p>
      )}

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              {hasError ? "In rupees" : `${foreign(sheet.worked?.amount)} in rupees`}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(sheet.worked?.exactInr)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the rate above to see the cheat sheet."
                : `In your head you would say ${money(sheet.worked?.quickInr)} — ${signedPct(sheet.forward.quick.errorPercent)} out.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the cheat sheet"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset the rate and price" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">The rule to memorise</h2>
        {hasError ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{DASH}</p>
        ) : (
          <>
            <ol className="mt-3 space-y-2 text-sm">
              {recommended.steps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--muted)] text-xs font-semibold text-[var(--primary)]">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
            <p
              className={`mt-4 inline-block rounded-md px-2.5 py-1 text-xs font-semibold ${
                sheet.forward.shoppingAccurate
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--danger-soft)] text-[var(--danger)]"
              }`}
            >
              {sheet.forward.shoppingAccurate
                ? `Within ${SHOPPING_ACCURACY_PERCENT}% of the exact answer — fine for shopping`
                : `Off by ${signedPct(sheet.forward.recommendedErrorPercent)} — check big purchases on a phone`}
            </p>
            <h3 className="mt-5 text-sm font-semibold">Going the other way (₹ to {CURRENCY.code})</h3>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              {sheet.reverse.quick.steps.join(" → ")} ({signedPct(sheet.reverse.quick.errorPercent)})
            </p>
          </>
        )}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">All three rules compared</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Rule
                </th>
                <th scope="col" className="py-2 pr-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Steps
                </th>
                <th scope="col" className={TH}>
                  Implied rate
                </th>
                <th scope="col" className={TH}>
                  Error
                </th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {rule.label}
                    {rule.id === sheet.forward.recommendedId && (
                      <span className="ml-2 rounded-md bg-[var(--muted)] px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase text-[var(--primary)]">
                        best
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{rule.steps.join(" → ")}</td>
                  <td className="py-2 pr-3 text-right">{NUM2.format(rule.rate)}</td>
                  <td className="py-2 text-right">{signedPct(rule.errorPercent)}</td>
                </tr>
              ))}
              {rules.length === 0 && (
                <tr>
                  <td className="py-2 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          &ldquo;Best&rdquo; is the most accurate rule that is still easy to run in your head. A
          fraction with a large numerator can be more exact and still not worth using, because
          multiplying by it is no longer mental arithmetic.
        </p>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-base font-semibold">Price ladder to learn by heart</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 text-left text-xs font-semibold tracking-wide uppercase">
                  {CURRENCY.code}
                </th>
                <th scope="col" className="py-2 pr-3 text-left text-xs font-semibold tracking-wide uppercase">
                  Typically
                </th>
                <th scope="col" className={TH}>
                  Exact ₹
                </th>
                <th scope="col" className={TH}>
                  In your head
                </th>
              </tr>
            </thead>
            <tbody>
              {(hasError ? [] : sheet.priceLadder).map((row) => (
                <tr key={row.amount} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">
                    {CURRENCY.symbol}
                    {FOREIGN.format(row.amount)}
                  </td>
                  <td className="py-2 pr-3 text-[var(--muted-foreground)]">{row.note}</td>
                  <td className="py-2 pr-3 text-right">{money(row.exactInr)}</td>
                  <td className="py-2 text-right font-semibold">{money(row.quickInr)}</td>
                </tr>
              ))}
              {hasError && (
                <tr>
                  <td className="py-2 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What each note is worth</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {(hasError ? [] : sheet.noteLadder).map((row) => (
              <div key={row.note} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">
                  {CURRENCY.symbol}
                  {FOREIGN.format(row.note)}
                </dt>
                <dd className="text-right font-semibold">{money(row.inr)}</dd>
              </div>
            ))}
            {hasError && <p className="py-2.5 text-[var(--muted-foreground)]">{DASH}</p>}
          </dl>
        </section>

        <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Rupees back into {CURRENCY.plural}</h2>
          <dl className="mt-3 divide-y divide-[var(--border)] text-sm">
            {(hasError ? [] : sheet.rupeeLadder).map((row) => (
              <div key={row.rupees} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[var(--muted-foreground)]">{money(row.rupees)}</dt>
                <dd className="text-right font-semibold">{foreign(row.exactUnits)}</dd>
              </div>
            ))}
            {hasError && <p className="py-2.5 text-[var(--muted-foreground)]">{DASH}</p>}
          </dl>
        </section>
      </div>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The peg has held at NPR 1.60 = INR 1 since February 1993, but it is a policy decision and can be revised &mdash; confirm before a large transfer. A money changer will quote a spread around the peg rather than the peg itself. Note that Indian ₹500 notes are not accepted in Nepal; carry ₹100 notes or exchange formally.
      </p>
    </main>
  );
}
