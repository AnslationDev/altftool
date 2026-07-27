"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Plus, Receipt, RotateCcw, Trash2 } from "lucide-react";

import {
  GST_OPTIONS,
  ROUNDING_OPTIONS,
  TIP_PRESETS,
  buildBill,
  splitByShares,
  splitEqually,
} from "../lib";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});
const NUM = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => (Number.isFinite(value) ? `${NUM.format(value)}%` : "—");
const DASH = "—";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP =
  "min-h-11 rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-xs font-semibold text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CHIP_ON =
  "min-h-11 rounded-md border border-[var(--primary)] bg-[var(--muted)] px-3 text-xs font-semibold text-[var(--foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const CARD = "rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5";

const toNumber = (raw) => {
  const text = String(raw).replace(/,/g, "").trim();
  if (text === "") return NaN;
  const value = Number(text);
  return Number.isFinite(value) ? value : NaN;
};

const DEFAULT_DINERS = [
  { id: 1, name: "Diner 1", amount: "800" },
  { id: 2, name: "Diner 2", amount: "700" },
  { id: 3, name: "Diner 3", amount: "500" },
];

const DEFAULTS = {
  food: "2000",
  alcohol: "0",
  alcoholTax: "25",
  serviceCharge: "0",
  gst: "5",
  tip: "10",
  tipOnPreTax: true,
  people: "4",
  roundTo: "0",
  mode: "equal",
};

export default function ToolHome() {
  const [food, setFood] = useState(DEFAULTS.food);
  const [alcohol, setAlcohol] = useState(DEFAULTS.alcohol);
  const [alcoholTax, setAlcoholTax] = useState(DEFAULTS.alcoholTax);
  const [serviceCharge, setServiceCharge] = useState(DEFAULTS.serviceCharge);
  const [gst, setGst] = useState(DEFAULTS.gst);
  const [tip, setTip] = useState(DEFAULTS.tip);
  const [tipOnPreTax, setTipOnPreTax] = useState(DEFAULTS.tipOnPreTax);
  const [people, setPeople] = useState(DEFAULTS.people);
  const [roundTo, setRoundTo] = useState(DEFAULTS.roundTo);
  const [mode, setMode] = useState(DEFAULTS.mode);
  const [diners, setDiners] = useState(DEFAULT_DINERS);
  const [copied, setCopied] = useState(false);

  const bill = useMemo(
    () =>
      buildBill({
        foodSubtotal: toNumber(food),
        alcoholSubtotal: toNumber(alcohol),
        alcoholTaxPct: toNumber(alcoholTax),
        serviceChargePct: toNumber(serviceCharge),
        gstRatePct: toNumber(gst),
        tipPct: toNumber(tip),
        tipOnPreTax,
      }),
    [food, alcohol, alcoholTax, serviceCharge, gst, tip, tipOnPreTax],
  );

  const billError = Boolean(bill.error);

  const equal = useMemo(
    () =>
      billError
        ? { error: bill.error }
        : splitEqually({
            grandTotal: bill.grandTotal,
            people: toNumber(people),
            roundTo: toNumber(roundTo),
          }),
    [billError, bill, people, roundTo],
  );

  const byShares = useMemo(
    () =>
      billError
        ? { error: bill.error }
        : splitByShares({
            bill,
            roundTo: toNumber(roundTo),
            shares: diners.map((diner) => ({
              id: String(diner.id),
              name: diner.name,
              amount: toNumber(diner.amount),
            })),
          }),
    [billError, bill, roundTo, diners],
  );

  const split = mode === "equal" ? equal : byShares;
  const splitError = Boolean(split.error);
  const anyError = billError || splitError;

  const summary = useMemo(() => {
    if (anyError) return "";
    const head = [
      "Restaurant bill split",
      `Food and beverages: ${money(bill.foodSubtotal)}`,
      bill.alcoholSubtotal > 0 ? `Alcohol: ${money(bill.alcoholSubtotal)}` : null,
      bill.serviceCharge > 0
        ? `Service charge at ${pct(bill.serviceChargePct)}: ${money(bill.serviceCharge)}`
        : null,
      `GST at ${pct(bill.gstRatePct)}: ${money(bill.gst)}`,
      bill.alcoholTax > 0 ? `State tax on alcohol: ${money(bill.alcoholTax)}` : null,
      `Tip at ${pct(bill.tipPct)}: ${money(bill.tip)}`,
      `Grand total: ${money(bill.grandTotal)}`,
    ].filter(Boolean);

    if (mode === "equal") {
      head.push(`Each of ${equal.people} pays: ${money(equal.perPerson)}`);
    } else {
      byShares.rows.forEach((row) => head.push(`${row.name} pays: ${money(row.pays)}`));
    }
    return head.join("\n");
  }, [anyError, bill, mode, equal, byShares]);

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
    setFood(DEFAULTS.food);
    setAlcohol(DEFAULTS.alcohol);
    setAlcoholTax(DEFAULTS.alcoholTax);
    setServiceCharge(DEFAULTS.serviceCharge);
    setGst(DEFAULTS.gst);
    setTip(DEFAULTS.tip);
    setTipOnPreTax(DEFAULTS.tipOnPreTax);
    setPeople(DEFAULTS.people);
    setRoundTo(DEFAULTS.roundTo);
    setMode(DEFAULTS.mode);
    setDiners(DEFAULT_DINERS);
    setCopied(false);
  };

  const updateDiner = (id, patch) =>
    setDiners((rows) => rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));

  const addDiner = () =>
    setDiners((rows) => {
      const nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      return [...rows, { id: nextId, name: `Diner ${nextId}`, amount: "0" }];
    });

  const removeDiner = (id) => setDiners((rows) => rows.filter((row) => row.id !== id));

  const headline =
    anyError
      ? DASH
      : mode === "equal"
        ? money(equal.perPerson)
        : money(bill.grandTotal);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Receipt className="h-4 w-4" aria-hidden="true" />
          Eating out
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Tip and Bill Split Calculator India
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Add GST at 5% or 18%, a service charge if you have agreed to one, a tip and any alcohol
          taxed outside GST — then split the total equally or by what each person actually ordered.
        </p>
      </header>

      <section className={CARD} aria-labelledby="bs-bill">
        <h2 id="bs-bill" className="text-base font-semibold">
          What is on the bill
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-food">
              Food and soft drinks, pre-tax (INR)
            </label>
            <input
              id="bs-food"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={food}
              onChange={(event) => setFood(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-alcohol">
              Alcohol, pre-tax (INR)
            </label>
            <input
              id="bs-alcohol"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={alcohol}
              onChange={(event) => setAlcohol(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Alcohol is outside GST and carries state VAT or excise instead.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-alcohol-tax">
              State tax on alcohol (%)
            </label>
            <input
              id="bs-alcohol-tax"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={alcoholTax}
              onChange={(event) => setAlcoholTax(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-service">
              Service charge (% of food bill)
            </label>
            <input
              id="bs-service"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="0.5"
              value={serviceCharge}
              onChange={(event) => setServiceCharge(event.target.value)}
            />
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              Voluntary. CCPA guidelines of 4 July 2022 bar restaurants from adding it by default.
            </p>
          </div>
          <div className="sm:col-span-2">
            <span className={LABEL_CLASS} id="bs-gst-label">
              GST rate on the restaurant service
            </span>
            <div className="mt-2 grid gap-2">
              {GST_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  htmlFor={`bs-gst-${option.id}`}
                  className={`flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                    toNumber(gst) === option.ratePct
                      ? "border-[var(--primary)] bg-[var(--muted)]"
                      : "border-[var(--border)]"
                  }`}
                >
                  <input
                    id={`bs-gst-${option.id}`}
                    type="radio"
                    name="bs-gst"
                    className="mt-1 h-4 w-4 accent-[var(--primary)]"
                    checked={toNumber(gst) === option.ratePct}
                    onChange={() => setGst(String(option.ratePct))}
                  />
                  <span>
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-0.5 block text-xs text-[var(--muted-foreground)]">
                      {option.hint}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className={LABEL_CLASS} htmlFor="bs-tip">
              Tip (%)
            </label>
            <input
              id="bs-tip"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="100"
              step="1"
              value={tip}
              onChange={(event) => setTip(event.target.value)}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {TIP_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTip(String(preset))}
                  className={toNumber(tip) === preset ? CHIP_ON : CHIP}
                >
                  {preset}%
                </button>
              ))}
            </div>
            <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={tipOnPreTax}
                onChange={(event) => setTipOnPreTax(event.target.checked)}
              />
              Tip on the pre-tax bill rather than the taxed total
            </label>
          </div>
        </div>
      </section>

      <section className={`mt-6 ${CARD}`} aria-labelledby="bs-split">
        <h2 id="bs-split" className="text-base font-semibold">
          How to split it
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            ["equal", "Equally"],
            ["shares", "By what each ordered"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
              className={mode === id ? CHIP_ON : CHIP}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {mode === "equal" && (
            <div>
              <label className={LABEL_CLASS} htmlFor="bs-people">
                Number of people
              </label>
              <input
                id="bs-people"
                className={`mt-2 ${INPUT_CLASS}`}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                value={people}
                onChange={(event) => setPeople(event.target.value)}
              />
            </div>
          )}
          <div>
            <label className={LABEL_CLASS} htmlFor="bs-round">
              Round each share up to the nearest
            </label>
            <select
              id="bs-round"
              className={`mt-2 ${INPUT_CLASS}`}
              value={roundTo}
              onChange={(event) => setRoundTo(event.target.value)}
            >
              {ROUNDING_OPTIONS.map((option) => (
                <option key={option} value={String(option)}>
                  {option === 0 ? "No rounding — exact paise" : `Rs ${option}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {mode === "shares" && (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">What each person ordered</h3>
              <button type="button" onClick={addDiner} className={GHOST_BTN} aria-label="Add a diner">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add diner
              </button>
            </div>
            <ul className="mt-3 space-y-3">
              {diners.map((diner, index) => (
                <li key={diner.id} className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`bs-diner-name-${diner.id}`}>
                        Name
                      </label>
                      <input
                        id={`bs-diner-name-${diner.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="text"
                        value={diner.name}
                        onChange={(event) => updateDiner(diner.id, { name: event.target.value })}
                      />
                    </div>
                    <div>
                      <label className={LABEL_CLASS} htmlFor={`bs-diner-amount-${diner.id}`}>
                        Their order, pre-tax (INR)
                      </label>
                      <input
                        id={`bs-diner-amount-${diner.id}`}
                        className={`mt-2 ${INPUT_CLASS}`}
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="10"
                        value={diner.amount}
                        onChange={(event) => updateDiner(diner.id, { amount: event.target.value })}
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeDiner(diner.id)}
                    aria-label={`Remove diner ${index + 1}`}
                    className="inline-flex min-h-11 items-center justify-center gap-1.5 self-end rounded-md px-3 text-xs font-semibold text-[var(--danger)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {anyError && (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {bill.error || split.error}
        </p>
      )}

      <section className={`mt-6 ${CARD}`} aria-labelledby="bs-result">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id="bs-result"
              className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]"
            >
              {mode === "equal" ? "Each person pays" : "Grand total"}
            </h2>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">{headline}</p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {anyError
                ? "Fix the input above to see the split."
                : mode === "equal"
                  ? `${money(bill.grandTotal)} split ${equal.people} ways`
                  : `split across ${byShares.rows.length} diners by what each ordered`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={anyError}
              aria-label="Copy the bill split result"
              className={`${GHOST_BTN} disabled:opacity-50`}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
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
            ["Food and soft drinks", anyError ? DASH : money(bill.foodSubtotal)],
            ["Alcohol", anyError ? DASH : money(bill.alcoholSubtotal)],
            [
              "Service charge",
              anyError ? DASH : `${money(bill.serviceCharge)} at ${pct(bill.serviceChargePct)}`,
            ],
            ["Value GST is charged on", anyError ? DASH : money(bill.gstTaxableValue)],
            [
              `GST at ${anyError ? "—" : pct(bill.gstRatePct)}`,
              anyError ? DASH : `${money(bill.gst)} (CGST ${money(bill.cgst)} + SGST ${money(bill.sgst)})`,
            ],
            ["State tax on alcohol", anyError ? DASH : money(bill.alcoholTax)],
            ["Bill before tip", anyError ? DASH : money(bill.preTip)],
            [
              `Tip at ${anyError ? "—" : pct(bill.tipPct)}`,
              anyError ? DASH : `${money(bill.tip)} on ${money(bill.tipBase)}`,
            ],
            ["Grand total", anyError ? DASH : money(bill.grandTotal)],
            [
              "Added on top of the menu price",
              anyError ? DASH : pct(bill.effectiveUpliftPct),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!anyError && mode === "equal" && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            Exact share is {money(equal.exactPerPerson)}.{" "}
            {equal.surplus > 0
              ? `Rounding up collects ${money(equal.collected)} in all, ${money(equal.surplus)} more than the bill.`
              : "No rounding applied, so the shares add up to the bill exactly."}
          </p>
        )}
      </section>

      {!anyError && mode === "shares" && (
        <section className={`mt-6 ${CARD}`} aria-labelledby="bs-rows">
          <h2 id="bs-rows" className="text-base font-semibold">
            Who pays what
          </h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[400px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Diner
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Ordered
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Share
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Pays
                  </th>
                </tr>
              </thead>
              <tbody>
                {byShares.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{money(row.amount)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {pct(row.sharePct)}
                    </td>
                    <td className="py-2 text-right font-semibold">{money(row.pays)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-[var(--muted-foreground)]">
            Collected {money(byShares.collected)} against a bill of {money(bill.grandTotal)}
            {byShares.surplus > 0 ? ` — ${money(byShares.surplus)} over, from rounding up.` : "."}
          </p>
          {Math.abs(byShares.mismatch) > 0.5 && (
            <p className="mt-3 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
              The individual orders add up to {money(byShares.orderedTotal)} but the bill subtotal is{" "}
              {money(byShares.billedSubtotal)}. Shares are still proportional, but one of the two
              figures needs checking.
            </p>
          )}
        </section>
      )}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        For working out a bill, not for tax filing. GST on restaurant service is 5% without input
        tax credit for standalone restaurants and 18% where the restaurant sits in a hotel with a
        declared room tariff above Rs 7,500 a day. Service charge is voluntary and can be asked for
        in writing to be removed; a tip is separate and is not taxed.
      </p>
    </main>
  );
}
