"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Percent, Plus, RotateCcw, Trash2 } from "lucide-react";

import {
  MARKUP_BENCHMARKS,
  QUOTE_DIRECTIONS,
  compareQuotes,
  computeMarkup,
  midFromBidAsk,
} from "../lib";

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DASH = "—";

const CURRENCY_LOCALES = {
  USD: "en-US", EUR: "en-IE", GBP: "en-GB", INR: "en-IN",
  AED: "en-AE", SGD: "en-SG", AUD: "en-AU", CAD: "en-CA", JPY: "ja-JP", CHF: "de-CH",
};
const CURRENCY_CODES = Object.keys(CURRENCY_LOCALES);

const DEFAULTS = {
  amount: "1000",
  from: "GBP",
  to: "EUR",
  midRate: "1.17",
  offeredRate: "1.1466",
  direction: "per-unit",
  fixedFee: "5",
  percentFee: "0",
  bid: "1.1690",
  ask: "1.1710",
};

const START_QUOTES = [
  { id: 1, name: "High-street bank", offeredRate: "1.1349", fixedFee: "20", percentFee: "0" },
  { id: 2, name: "Fintech transfer", offeredRate: "1.1665", fixedFee: "0", percentFee: "0.45" },
  { id: 3, name: "Broker", offeredRate: "1.1466", fixedFee: "5", percentFee: "0" },
];

const toNumber = (raw) => {
  const trimmed = String(raw).replace(/,/g, "").trim();
  if (trimmed === "") return NaN;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : NaN;
};

const makeMoney = (code) => {
  const formatter = new Intl.NumberFormat(CURRENCY_LOCALES[code] ?? "en-US", {
    style: "currency",
    currency: code,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return (value) => formatter.format(Number.isFinite(value) ? value : 0);
};

export default function ToolHome() {
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [from, setFrom] = useState(DEFAULTS.from);
  const [to, setTo] = useState(DEFAULTS.to);
  const [midRate, setMidRate] = useState(DEFAULTS.midRate);
  const [offeredRate, setOfferedRate] = useState(DEFAULTS.offeredRate);
  const [direction, setDirection] = useState(DEFAULTS.direction);
  const [fixedFee, setFixedFee] = useState(DEFAULTS.fixedFee);
  const [percentFee, setPercentFee] = useState(DEFAULTS.percentFee);
  const [bid, setBid] = useState(DEFAULTS.bid);
  const [ask, setAsk] = useState(DEFAULTS.ask);
  const [quotes, setQuotes] = useState(START_QUOTES);
  const [copied, setCopied] = useState(false);

  const fromMoney = useMemo(() => makeMoney(from), [from]);
  const toMoney = useMemo(() => makeMoney(to), [to]);
  const rateFmt = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }), []);
  const pct = useMemo(() => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }), []);

  const result = useMemo(
    () =>
      computeMarkup({
        amount: toNumber(amount),
        midRate: toNumber(midRate),
        offeredRate: toNumber(offeredRate),
        direction,
        fixedFee: toNumber(fixedFee),
        percentFee: toNumber(percentFee),
      }),
    [amount, midRate, offeredRate, direction, fixedFee, percentFee],
  );

  const twoWay = useMemo(() => midFromBidAsk(toNumber(bid), toNumber(ask)), [bid, ask]);

  const comparison = useMemo(
    () =>
      compareQuotes(
        quotes.map((quote) => ({
          name: quote.name || "Provider",
          offeredRate: toNumber(quote.offeredRate),
          fixedFee: toNumber(quote.fixedFee),
          percentFee: toNumber(quote.percentFee),
        })),
        { amount: toNumber(amount), midRate: toNumber(midRate), direction },
      ),
    [quotes, amount, midRate, direction],
  );

  const ok = !result.error;

  const band = useMemo(() => {
    if (!ok) return null;
    return MARKUP_BENCHMARKS.find(
      (item) => result.totalCostPercent >= item.lowPercent && result.totalCostPercent <= item.highPercent,
    );
  }, [ok, result]);

  const updateQuote = (id, field, value) => {
    setQuotes((prev) => prev.map((quote) => (quote.id === id ? { ...quote, [field]: value } : quote)));
  };

  const addQuote = () => {
    setQuotes((prev) => {
      const nextId = prev.reduce((max, quote) => Math.max(max, quote.id), 0) + 1;
      return [...prev, { id: nextId, name: "", offeredRate: String(DEFAULTS.midRate), fixedFee: "0", percentFee: "0" }];
    });
  };

  const removeQuote = (id) => {
    setQuotes((prev) => (prev.length > 1 ? prev.filter((quote) => quote.id !== id) : prev));
  };

  const summary = useMemo(() => {
    if (!ok) return "";
    return [
      `Currency markup: ${from} → ${to}`,
      `Converting: ${fromMoney(result.amount)}`,
      `Mid-market rate: ${rateFmt.format(result.midRate)}`,
      `Rate offered: ${rateFmt.format(result.offeredRate)}`,
      `Rate markup: ${pct.format(result.markupPercent)}%`,
      `Explicit fees: ${fromMoney(result.explicitFees)}`,
      `You receive: ${toMoney(result.received)} (worth ${toMoney(result.valueAtMid)} at mid)`,
      `True all-in cost: ${fromMoney(result.totalCostSource)} = ${pct.format(result.totalCostPercent)}%`,
      `Effective all-in rate: ${rateFmt.format(result.effectiveAllInRate)}`,
    ].join("\n");
  }, [ok, result, from, to, fromMoney, toMoney, rateFmt, pct]);

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
    setAmount(DEFAULTS.amount);
    setFrom(DEFAULTS.from);
    setTo(DEFAULTS.to);
    setMidRate(DEFAULTS.midRate);
    setOfferedRate(DEFAULTS.offeredRate);
    setDirection(DEFAULTS.direction);
    setFixedFee(DEFAULTS.fixedFee);
    setPercentFee(DEFAULTS.percentFee);
    setBid(DEFAULTS.bid);
    setAsk(DEFAULTS.ask);
    setQuotes(START_QUOTES);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Percent className="h-4 w-4" aria-hidden="true" />
          Foreign exchange
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Currency Conversion Markup Calculator</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Compare the rate you were offered with the mid-market rate and see the spread you are
          paying — then add the visible fees to get the true all-in cost in your own currency.
        </p>
      </header>

      <section className="rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">The conversion</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cm-amount">Amount to convert</label>
            <input id="cm-amount" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="10" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="cm-from">From</label>
              <select id="cm-from" className={`mt-2 ${INPUT_CLASS}`} value={from} onChange={(e) => setFrom(e.target.value)}>
                {CURRENCY_CODES.map((code) => (<option key={code} value={code}>{code}</option>))}
              </select>
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cm-to">To</label>
              <select id="cm-to" className={`mt-2 ${INPUT_CLASS}`} value={to} onChange={(e) => setTo(e.target.value)}>
                {CURRENCY_CODES.map((code) => (<option key={code} value={code}>{code}</option>))}
              </select>
            </div>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cm-mid">
              Mid-market rate ({QUOTE_DIRECTIONS[direction].describe(from, to)})
            </label>
            <input id="cm-mid" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.0001" value={midRate} onChange={(e) => setMidRate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cm-offered">Rate you were offered</label>
            <input id="cm-offered" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.0001" value={offeredRate} onChange={(e) => setOfferedRate(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cm-dir">Both rates are quoted as</label>
            <select id="cm-dir" className={`mt-2 ${INPUT_CLASS}`} value={direction} onChange={(e) => setDirection(e.target.value)}>
              {Object.values(QUOTE_DIRECTIONS).map((item) => (
                <option key={item.id} value={item.id}>{item.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS} htmlFor="cm-fixed">Fixed fee</label>
              <input id="cm-fixed" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={fixedFee} onChange={(e) => setFixedFee(e.target.value)} />
            </div>
            <div>
              <label className={LABEL_CLASS} htmlFor="cm-pct">Fee (%)</label>
              <input id="cm-pct" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.05" value={percentFee} onChange={(e) => setPercentFee(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {result.error && (
        <p role="alert" className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
          {result.error}
        </p>
      )}

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              True all-in cost
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {ok ? `${pct.format(result.totalCostPercent)}%` : DASH}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {ok ? `${fromMoney(result.totalCostSource)} of ${fromMoney(result.amount)}` : DASH}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={copyResult} aria-label="Copy the markup breakdown" className={GHOST_BTN} disabled={!summary}>
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? "Copied!" : "Copy result"}
            </button>
            <button type="button" onClick={reset} aria-label="Reset all inputs" className={PRIMARY_BTN}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        {ok && result.betterThanMid && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-sm text-[var(--foreground)]">
            The offered rate is better than the mid-market rate you entered — double-check the
            direction of both quotes.
          </p>
        )}

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Rate markup (spread only)", ok ? `${pct.format(result.markupPercent)}%` : DASH],
            ["Hidden cost in the rate", ok ? fromMoney(result.hiddenCostSource) : DASH],
            ["Visible fees", ok ? fromMoney(result.feeCostSource) : DASH],
            [`You receive (${to})`, ok ? toMoney(result.received) : DASH],
            [`Worth at mid-market (${to})`, ok ? toMoney(result.valueAtMid) : DASH],
            ["Shortfall against mid", ok ? toMoney(result.shortfallTarget) : DASH],
            ["Effective all-in rate", ok ? rateFmt.format(result.effectiveAllInRate) : DASH],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {band && (
          <p className="mt-4 rounded-md bg-[var(--muted)] px-3 py-2 text-xs text-[var(--muted-foreground)]">
            That is in the range usually seen for: {band.label} ({band.lowPercent}%-{band.highPercent}%).
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <h2 className="text-base font-semibold">Work out the mid from a two-way price</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="cm-bid">Bid</label>
            <input id="cm-bid" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.0001" value={bid} onChange={(e) => setBid(e.target.value)} />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="cm-ask">Ask</label>
            <input id="cm-ask" className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.0001" value={ask} onChange={(e) => setAsk(e.target.value)} />
          </div>
        </div>
        {twoWay.error ? (
          <p role="alert" className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]">
            {twoWay.error}
          </p>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <p className="text-sm text-[var(--muted-foreground)]">
              Mid <strong className="text-[var(--foreground)]">{rateFmt.format(twoWay.mid)}</strong> · dealer spread{" "}
              <strong className="text-[var(--foreground)]">{pct.format(twoWay.spreadPercent)}%</strong>
            </p>
            <button type="button" onClick={() => setMidRate(String(twoWay.mid))} className={GHOST_BTN} aria-label="Use this mid-market rate above">
              Use this mid
            </button>
          </div>
        )}
      </section>

      <section className="mt-6 rounded-xl ring-1 ring-[var(--border)] bg-[var(--card)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Compare providers</h2>
          <button type="button" onClick={addQuote} className={GHOST_BTN} aria-label="Add a provider quote">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add quote
          </button>
        </div>

        <div className="mt-4 grid gap-4">
          {quotes.map((quote, index) => (
            <div key={quote.id} className="rounded-lg border border-[var(--border)] p-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={LABEL_CLASS} htmlFor={`cm-qname-${quote.id}`}>Provider</label>
                  <input id={`cm-qname-${quote.id}`} className={`mt-2 ${INPUT_CLASS}`} type="text" value={quote.name} onChange={(e) => updateQuote(quote.id, "name", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL_CLASS} htmlFor={`cm-qrate-${quote.id}`}>Rate offered</label>
                  <input id={`cm-qrate-${quote.id}`} className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="0.0001" value={quote.offeredRate} onChange={(e) => updateQuote(quote.id, "offeredRate", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`cm-qfix-${quote.id}`}>Fixed fee</label>
                    <input id={`cm-qfix-${quote.id}`} className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" step="1" value={quote.fixedFee} onChange={(e) => updateQuote(quote.id, "fixedFee", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`cm-qpct-${quote.id}`}>Fee %</label>
                    <input id={`cm-qpct-${quote.id}`} className={`mt-2 ${INPUT_CLASS}`} type="number" inputMode="decimal" min="0" max="100" step="0.05" value={quote.percentFee} onChange={(e) => updateQuote(quote.id, "percentFee", e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center justify-end sm:col-span-2">
                  <button type="button" onClick={() => removeQuote(quote.id)} className={GHOST_BTN} aria-label={`Remove provider ${index + 1}`} disabled={quotes.length === 1}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {comparison.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Provider</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">You get</th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">All-in cost</th>
                  <th scope="col" className="py-2 text-right font-semibold">vs best</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row) => (
                  <tr key={row.name} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.name}</td>
                    <td className="py-2 pr-3 text-right">{row.error ? DASH : toMoney(row.received)}</td>
                    <td className="py-2 pr-3 text-right text-[var(--muted-foreground)]">
                      {row.error ? DASH : `${pct.format(row.totalCostPercent)}%`}
                    </td>
                    <td className={`py-2 text-right font-semibold ${!row.error && row.lossVersusBest > 0 ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                      {row.error ? DASH : row.lossVersusBest > 0 ? `-${toMoney(row.lossVersusBest)}` : "best"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Informational only, and no live rates are used — enter the mid-market rate you can see at the
        time of your quote. Benchmark ranges describe what is commonly observed, not a guarantee, and
        nothing here is financial advice.
      </p>
    </main>
  );
}
