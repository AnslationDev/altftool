"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, RotateCcw } from "lucide-react";
import {
  CURRENCY,
  GST_REFUND_MIN_PURCHASE_SGD,
  SHOPPING_ACCURACY_PERCENT,
  SINGAPORE_GST_PERCENT,
  TYPICAL_SERVICE_CHARGE_PERCENT,
  buildCheatSheet,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const INR_PRECISE = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM2 = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const moneyExact = (value) => INR_PRECISE.format(Number.isFinite(value) ? value : 0);
const sgd = (value) => `${CURRENCY.symbol}${NUM2.format(Number.isFinite(value) ? value : 0)}`;
const signedPct = (value) => `${value > 0 ? "+" : ""}${NUM2.format(value)}%`;
const DASH = "—";

const DEFAULTS = {
  rate: String(CURRENCY.defaultInrPerUnit),
  amount: "50",
  service: String(TYPICAL_SERVICE_CHARGE_PERCENT),
  gst: String(SINGAPORE_GST_PERCENT),
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

export default function ToolHome() {
  const [rate, setRate] = useState(DEFAULTS.rate);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [service, setService] = useState(DEFAULTS.service);
  const [gst, setGst] = useState(DEFAULTS.gst);
  const [copied, setCopied] = useState(false);

  const sheet = useMemo(
    () =>
      buildCheatSheet({
        inrPerUnit: rate,
        amount,
        servicePercent: service,
        gstPercent: gst,
      }),
    [rate, amount, service, gst],
  );

  const ok = !sheet.error;
  const forward = ok ? sheet.forward : null;
  const rules = ok ? [forward.quick, forward.tuned, forward.fraction] : [];

  const summary = useMemo(() => {
    if (!ok) return "";
    const lines = [
      `INR / SGD mental math cheat sheet at ₹${sheet.rate} per ${CURRENCY.symbol}1`,
      `Best rule: ${forward[forward.recommendedId].label} — ${forward[forward.recommendedId].steps.join(", then ")} (${signedPct(forward.recommendedErrorPercent)})`,
      "",
      "Singapore dollars to rupees:",
      ...sheet.priceLadder.map(
        (row) => `${CURRENCY.symbol}${row.amount} = ${money(row.exactInr)} (rule ${money(row.tunedInr)})`,
      ),
      "",
      "Rupees to Singapore dollars:",
      ...sheet.rupeeLadder.map(
        (row) => `₹${row.rupees} = ${CURRENCY.symbol}${NUM2.format(row.exactUnits)}`,
      ),
    ];
    if (sheet.worked) {
      lines.push(
        "",
        `${CURRENCY.symbol}${sheet.worked.amount} on the menu = ${CURRENCY.symbol}${NUM2.format(sheet.worked.till.total)} after ++ = ${money(sheet.worked.tillInr)}`,
      );
    }
    return lines.join("\n");
  }, [ok, sheet, forward]);

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
    setService(DEFAULTS.service);
    setGst(DEFAULTS.gst);
    setCopied(false);
  };

  const addOnFields = [
    { id: "sgd-service", label: "Service charge (%)", value: service, set: setService, step: "1" },
    { id: "sgd-gst", label: "GST (%)", value: gst, set: setGst, step: "1" },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Singapore dollars in your head
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          INR to SGD Mental Math Cheat Sheet
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Enter today&apos;s rate and this finds the roundest multiplication that still lands close
          to the real answer, states how far off it is, and prints a ladder for your phone. It also
          turns a &ldquo;++&rdquo; menu price into the number that actually reaches your card.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="sgd-rate">
              Rupees per {CURRENCY.symbol}1 (today&apos;s rate)
            </label>
            <input
              id="sgd-rate"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={rate}
              onChange={(event) => setRate(event.target.value)}
            />
          </div>

          <div>
            <label className={LABEL_CLASS} htmlFor="sgd-amount">
              A menu or tag price ({CURRENCY.symbol})
            </label>
            <input
              id="sgd-amount"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            />
          </div>

          {addOnFields.map((field) => (
            <div key={field.id}>
              <label className={LABEL_CLASS} htmlFor={field.id}>
                {field.label}
              </label>
              <input
                id={field.id}
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="decimal"
                min="0"
                max="50"
                step={field.step}
                value={field.value}
                onChange={(event) => field.set(event.target.value)}
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-5 text-[var(--muted-foreground)]">
          Set both to 0 for hawker centres, food courts and shops, where the price shown is the
          price paid. The service charge and GST only stack on menus and rate cards marked
          &ldquo;++&rdquo;.
        </p>
      </section>

      {!ok && (
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
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {ok && sheet.worked
                ? `${CURRENCY.symbol}${NUM2.format(sheet.worked.amount)} on the menu is`
                : "Enter a price to convert"}
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok && sheet.worked ? moneyExact(sheet.worked.exactInr) : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok && sheet.worked
                ? `${moneyExact(sheet.worked.tillInr)} once ++ adds ${NUM2.format(sheet.grossUpPercent)}%`
                : "Fix the inputs above to see a figure."}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={!ok}
              aria-label="Copy the Singapore dollar to rupee cheat sheet"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy sheet"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            [
              "Best rule to memorise",
              ok ? forward[forward.recommendedId].steps.join(", then ") : DASH,
            ],
            [
              "How far off that rule is",
              ok
                ? `${signedPct(forward.recommendedErrorPercent)} — ${forward.shoppingAccurate ? `inside ${SHOPPING_ACCURACY_PERCENT}%, fine for shopping` : "check the exact figure for big purchases"}`
                : DASH,
            ],
            [
              "Going the other way",
              ok ? sheet.reverse[sheet.reverse.recommendedId].steps.join(", then ") : DASH,
            ],
            ["Exact rate", ok ? `₹${NUM2.format(sheet.rate)} per ${CURRENCY.symbol}1` : DASH],
            ["One rupee is", ok ? `${CURRENCY.symbol}${sheet.unitsPerRupee.toFixed(4)}` : DASH],
            ["Bill total after ++", ok && sheet.worked ? sgd(sheet.worked.till.total) : DASH],
            [
              "Add-ons broken down",
              ok && sheet.worked
                ? `${sgd(sheet.worked.till.serviceAmount)} service + ${sgd(sheet.worked.till.gstAmount)} GST`
                : DASH,
            ],
            [
              "Your quick rule on that price",
              ok && sheet.worked
                ? `${moneyExact(sheet.worked.quickInr)} (${sheet.worked.quickGapInr >= 0 ? "over" : "under"} by ${moneyExact(Math.abs(sheet.worked.quickGapInr))})`
                : DASH,
            ],
            [
              "Tourist GST refund threshold",
              `${CURRENCY.symbol}${GST_REFUND_MIN_PURCHASE_SGD} minimum per eligible claim`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-start justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="max-w-[60%] text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`rounded-xl bg-[var(--card)] p-4 ring-1 ${
              ok && rule.id === forward.recommendedId
                ? "ring-[var(--primary)]"
                : "ring-[var(--border)]"
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {rule.label}
              {ok && rule.id === forward.recommendedId ? " · pick this" : ""}
            </p>
            <ol className="mt-2 space-y-1 text-sm font-semibold">
              {rule.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-[var(--muted-foreground)]">
              Lands {signedPct(rule.errorPercent)} from the exact answer
            </p>
          </div>
        ))}
        {!ok && <p className="text-sm text-[var(--muted-foreground)] sm:col-span-3">{DASH}</p>}
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-lg font-semibold">Singapore dollars to rupees</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[380px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Price
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Exact
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  In your head
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  Out by
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? sheet.priceLadder : []).map((row) => (
                <tr key={row.amount} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3">
                    <span className="font-semibold">
                      {CURRENCY.symbol}
                      {row.amount}
                    </span>
                    <span className="block text-xs text-[var(--muted-foreground)]">{row.note}</span>
                  </td>
                  <td className="py-2 pr-3 text-right font-semibold">{money(row.exactInr)}</td>
                  <td className="py-2 pr-3 text-right">{money(row.tunedInr)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {row.tunedGapInr >= 0 ? "+" : "−"}
                    {money(Math.abs(row.tunedGapInr))}
                  </td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={4}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-6 text-lg font-semibold">Rupees to Singapore dollars</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[320px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                <th scope="col" className="py-2 pr-3 font-semibold">
                  Rupees
                </th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">
                  Exact
                </th>
                <th scope="col" className="py-2 text-right font-semibold">
                  In your head
                </th>
              </tr>
            </thead>
            <tbody>
              {(ok ? sheet.rupeeLadder : []).map((row) => (
                <tr key={row.rupees} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-2 pr-3 font-semibold">₹{row.rupees.toLocaleString("en-IN")}</td>
                  <td className="py-2 pr-3 text-right">{sgd(row.exactUnits)}</td>
                  <td className="py-2 text-right text-[var(--muted-foreground)]">
                    {sgd(row.ruleUnits)}
                  </td>
                </tr>
              ))}
              {!ok && (
                <tr>
                  <td className="py-3 text-[var(--muted-foreground)]" colSpan={3}>
                    {DASH}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h2 className="mt-6 text-lg font-semibold">What each note is worth</h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {(ok ? sheet.noteLadder : []).map((row) => (
            <li
              key={row.note}
              className="flex items-center justify-between rounded-md bg-[var(--muted)] px-3 py-2 text-sm"
            >
              <span className="font-semibold">
                {CURRENCY.symbol}
                {row.note}
              </span>
              <span className="text-[var(--muted-foreground)]">{money(row.inr)}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The Singapore dollar floats within a managed band, and the rate your card or money changer
        gives you is not the mid-market rate — enter the rate you are actually quoted. These rules
        are for estimating in a shop, not for accounting.
      </p>
    </main>
  );
}
