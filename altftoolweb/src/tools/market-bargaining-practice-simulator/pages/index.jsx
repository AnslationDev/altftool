"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Handshake, RotateCcw } from "lucide-react";
import { MARKET_PRESETS, MAX_ROUNDS, simulateHaggle } from "../lib";

const CURRENCIES = [
  { code: "INR", label: "Indian rupee (INR)" },
  { code: "THB", label: "Thai baht (THB)" },
  { code: "IDR", label: "Indonesian rupiah (IDR)" },
  { code: "VND", label: "Vietnamese dong (VND)" },
  { code: "MAD", label: "Moroccan dirham (MAD)" },
  { code: "TRY", label: "Turkish lira (TRY)" },
  { code: "EGP", label: "Egyptian pound (EGP)" },
  { code: "MXN", label: "Mexican peso (MXN)" },
  { code: "USD", label: "US dollar (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
];

const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const DEFAULTS = {
  currency: "THB",
  presetId: "tourist-stall",
  askingPrice: "3000",
  fairPrice: "900",
  touristPremiumPct: "20",
  sellerMinMarginPct: "25",
  walkAwayTolerancePct: "15",
  rounds: "5",
};

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const HINT_CLASS = "mt-1 text-xs leading-5 text-[var(--muted-foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const DASH = "—";

export default function ToolHome() {
  const [currency, setCurrency] = useState(DEFAULTS.currency);
  const [presetId, setPresetId] = useState(DEFAULTS.presetId);
  const [askingPrice, setAskingPrice] = useState(DEFAULTS.askingPrice);
  const [fairPrice, setFairPrice] = useState(DEFAULTS.fairPrice);
  const [premium, setPremium] = useState(DEFAULTS.touristPremiumPct);
  const [sellerMargin, setSellerMargin] = useState(DEFAULTS.sellerMinMarginPct);
  const [tolerance, setTolerance] = useState(DEFAULTS.walkAwayTolerancePct);
  const [rounds, setRounds] = useState(DEFAULTS.rounds);
  const [copied, setCopied] = useState(false);

  const money = useMemo(() => {
    const formatter = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
    return (value) => (Number.isFinite(value) ? formatter.format(value) : DASH);
  }, [currency]);

  const preset = useMemo(
    () => MARKET_PRESETS.find((item) => item.id === presetId) || MARKET_PRESETS[0],
    [presetId],
  );

  const result = useMemo(
    () =>
      simulateHaggle({
        askingPrice,
        fairPrice,
        touristPremiumPct: premium,
        sellerMinMarginPct: sellerMargin,
        walkAwayTolerancePct: tolerance,
        rounds,
      }),
    [askingPrice, fairPrice, premium, sellerMargin, tolerance, rounds],
  );

  const hasError = Boolean(result.error);

  const applyPreset = (id) => {
    const next = MARKET_PRESETS.find((item) => item.id === id);
    setPresetId(id);
    if (next) {
      setSellerMargin(String(next.sellerMinMarginPct));
      // Seed a suggested asking price from the preset's opening markup over the
      // local price the buyer researched, when that figure is usable.
      const fairNum = Number(String(fairPrice).replace(/,/g, "").trim());
      if (Number.isFinite(fairNum) && fairNum > 0) {
        setAskingPrice(String(Math.round(fairNum * (1 + next.openingMarkupPct / 100))));
      }
    }
    setCopied(false);
  };

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      "Bargaining Practice Simulator",
      `Seller's quote: ${money(result.asking)}`,
      `Local price you researched: ${money(result.fair)}`,
      "",
      `Open at: ${money(result.openingCounter)}`,
      `Target: ${money(result.target)}`,
      `Walk away above: ${money(result.walkAway)}`,
      "",
      result.settled
        ? `Modelled close: ${money(result.dealPrice)} in round ${result.dealRound} (${PCT.format(result.savingPct)}% off the quote)`
        : result.walkAwayOffer !== null
          ? `No close inside ${rounds} rounds. Expect about ${money(result.walkAwayOffer)} if you walk.`
          : "No overlap between the seller's floor and your walk-away on these assumptions.",
    ].join("\n");
  }, [result, hasError, money, rounds]);

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
    setCurrency(DEFAULTS.currency);
    setPresetId(DEFAULTS.presetId);
    setAskingPrice(DEFAULTS.askingPrice);
    setFairPrice(DEFAULTS.fairPrice);
    setPremium(DEFAULTS.touristPremiumPct);
    setSellerMargin(DEFAULTS.sellerMinMarginPct);
    setTolerance(DEFAULTS.walkAwayTolerancePct);
    setRounds(DEFAULTS.rounds);
    setCopied(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--primary)]">
          <Handshake className="h-4 w-4" aria-hidden="true" />
          Bargaining practice
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Bargaining Practice Simulator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Rehearse the numbers before you are standing at the stall. Enter the quote and what you
          think a local pays, and the model places your opening counter so that splitting the
          difference lands on your target, then plays out the concessions round by round.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-market">
              What kind of seller?
            </label>
            <select
              id="hg-market"
              className={`mt-2 ${INPUT_CLASS}`}
              value={presetId}
              onChange={(event) => applyPreset(event.target.value)}
            >
              {MARKET_PRESETS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
            <p className={HINT_CLASS}>{preset.note}</p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-currency">
              Currency
            </label>
            <select
              id="hg-currency"
              className={`mt-2 ${INPUT_CLASS}`}
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              {CURRENCIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-asking">
              Seller&rsquo;s first quote
            </label>
            <input
              id="hg-asking"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={askingPrice}
              onChange={(event) => setAskingPrice(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-fair">
              What you think a local pays
            </label>
            <input
              id="hg-fair"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              step="10"
              value={fairPrice}
              onChange={(event) => setFairPrice(event.target.value)}
            />
            <p className={HINT_CLASS}>
              Ask two or three other sellers, or someone who is not selling, before you trust this
              number.
            </p>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-premium">
              Premium you accept paying (%)
            </label>
            <input
              id="hg-premium"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="5"
              value={premium}
              onChange={(event) => setPremium(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-margin">
              Seller&rsquo;s assumed floor above local price (%)
            </label>
            <input
              id="hg-margin"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="5"
              value={sellerMargin}
              onChange={(event) => setSellerMargin(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-tolerance">
              How far above target you will still pay (%)
            </label>
            <input
              id="hg-tolerance"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="decimal"
              min="0"
              max="500"
              step="5"
              value={tolerance}
              onChange={(event) => setTolerance(event.target.value)}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="hg-rounds">
              Rounds to model (1&ndash;{MAX_ROUNDS})
            </label>
            <input
              id="hg-rounds"
              className={`mt-2 ${INPUT_CLASS}`}
              type="number"
              inputMode="numeric"
              min="1"
              max={MAX_ROUNDS}
              step="1"
              value={rounds}
              onChange={(event) => setRounds(event.target.value)}
            />
          </div>
        </div>
      </section>

      {hasError ? (
        <p
          role="alert"
          className="mt-6 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
        >
          {result.error}
        </p>
      ) : null}

      <section
        className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Open at
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : money(result.openingCounter)}
            </p>
            <p className="mt-1 text-sm text-[var(--muted-foreground)]">
              {hasError
                ? DASH
                : `${PCT.format(result.openingAsShareOfAsking)}% of the quote, so the midpoint lands on your target`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              aria-label="Copy the bargaining plan"
              className={GHOST_BTN}
              disabled={hasError}
            >
              {copied ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied ? "Copied!" : "Copy plan"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Reset the simulator"
              className={PRIMARY_BTN}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>
        </div>

        <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
          {[
            ["Seller's quote", hasError ? DASH : money(result.asking)],
            ["Your target", hasError ? DASH : money(result.target)],
            ["Walk away above", hasError ? DASH : money(result.walkAway)],
            ["Seller's assumed floor", hasError ? DASH : money(result.sellerReserve)],
            [
              "Modelled close",
              hasError
                ? DASH
                : result.settled
                  ? `${money(result.dealPrice)} in round ${result.dealRound}`
                  : "No close inside the rounds modelled",
            ],
            [
              "Saving against the quote",
              hasError || !result.settled
                ? DASH
                : `${money(result.savingVsAsking)} (${PCT.format(result.savingPct)}%)`,
            ],
            [
              "Over the local price",
              hasError || !result.settled ? DASH : `${PCT.format(result.overFairPct)}%`,
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[var(--muted-foreground)]">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>

        {!hasError && !result.zopaExists ? (
          <p
            role="alert"
            className="mt-4 rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm font-medium text-[var(--danger)]"
          >
            The seller&rsquo;s floor sits above your walk-away, so on these assumptions there is no
            price you would both accept.
          </p>
        ) : null}
      </section>

      {!hasError && result.ladder.length > 0 ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">How the rounds play out</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[320px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Round
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    They say
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    You say
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Gap
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.ladder.map((row) => (
                  <tr key={row.round} className="border-b border-[var(--border)] last:border-0">
                    <td className="py-2 pr-3 font-semibold">{row.round}</td>
                    <td className="py-2 pr-3 text-right">{money(row.sellerAsk)}</td>
                    <td className="py-2 pr-3 text-right">{money(row.buyerOffer)}</td>
                    <td className="py-2 text-right text-[var(--muted-foreground)]">
                      {row.crossed || row.splittable ? "closes here" : money(row.gap)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">What to actually do</h2>
          <ul className="mt-3 space-y-2 text-sm leading-6">
            {result.coaching.map((line) => (
              <li key={line} className="flex gap-2">
                <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--success)]" aria-hidden="true" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        The market presets are starting assumptions for practice, not measurements of any country
        or market. Haggling is expected in some places and rude in others — food stalls, fixed-price
        shops and cooperatives among them — and the difference you are arguing over is often small
        to you and not to the seller.
      </p>
    </main>
  );
}
