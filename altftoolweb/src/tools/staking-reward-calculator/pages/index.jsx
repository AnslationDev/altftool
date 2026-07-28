"use client";

import { useMemo, useState } from "react";
import { Check, Coins, Copy, RotateCcw } from "lucide-react";

import { COMPOUND_FREQUENCIES, computeStakingRewards } from "../lib";

const DASH = "—";

const CURRENCIES = [
  { id: "USD", label: "US dollar (USD)", locale: "en-US" },
  { id: "EUR", label: "Euro (EUR)", locale: "de-DE" },
  { id: "GBP", label: "Pound sterling (GBP)", locale: "en-GB" },
  { id: "INR", label: "Indian rupee (INR)", locale: "en-IN" },
];

const TOKENS = new Intl.NumberFormat("en-US", { maximumFractionDigits: 4 });
const PCT = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 2 });

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35";

const DEFAULTS = {
  principalTokens: "1000",
  aprPercent: "10",
  commissionPercent: "5",
  frequencyId: "daily",
  restake: true,
  years: "2",
  tokenPrice: "3.20",
  ticker: "ATOM",
  currencyId: "USD",
};

export default function ToolHome() {
  const [principalTokens, setPrincipalTokens] = useState(DEFAULTS.principalTokens);
  const [aprPercent, setAprPercent] = useState(DEFAULTS.aprPercent);
  const [commissionPercent, setCommissionPercent] = useState(DEFAULTS.commissionPercent);
  const [frequencyId, setFrequencyId] = useState(DEFAULTS.frequencyId);
  const [restake, setRestake] = useState(DEFAULTS.restake);
  const [years, setYears] = useState(DEFAULTS.years);
  const [tokenPrice, setTokenPrice] = useState(DEFAULTS.tokenPrice);
  const [ticker, setTicker] = useState(DEFAULTS.ticker);
  const [currencyId, setCurrencyId] = useState(DEFAULTS.currencyId);
  const [copied, setCopied] = useState(false);

  const currency = CURRENCIES.find((c) => c.id === currencyId) ?? CURRENCIES[0];
  const money = useMemo(
    () =>
      new Intl.NumberFormat(currency.locale, {
        style: "currency",
        currency: currency.id,
        maximumFractionDigits: currency.id === "INR" ? 0 : 2,
      }),
    [currency],
  );

  const result = useMemo(
    () =>
      computeStakingRewards({
        principalTokens: Number(principalTokens),
        aprPercent: Number(aprPercent),
        commissionPercent: Number(commissionPercent),
        frequencyId,
        restake,
        years: Number(years),
        tokenPrice: Number(tokenPrice),
      }),
    [principalTokens, aprPercent, commissionPercent, frequencyId, restake, years, tokenPrice],
  );

  const hasError = Boolean(result.error);
  const symbol = ticker.trim() === "" ? "tokens" : ticker.trim().toUpperCase();

  const summary = useMemo(() => {
    if (hasError) return "";
    return [
      `Staking projection — ${TOKENS.format(result.principal)} ${symbol} for ${result.years} year(s)`,
      `Nominal APR: ${PCT.format(result.apr)} | APR after commission: ${PCT.format(result.effectiveApr)}`,
      `Effective APY (${result.frequency.label.toLowerCase()} ${result.restake ? "compounding" : "payout, not restaked"}): ${PCT.format(result.apy)}`,
      `Rewards earned: ${TOKENS.format(result.rewardTokens)} ${symbol}`,
      `Final balance: ${TOKENS.format(result.finalTokens)} ${symbol}`,
      result.tokenPrice > 0
        ? `At ${money.format(result.tokenPrice)} per token: ${money.format(result.fiatFinal)} (rewards ${money.format(result.fiatReward)})`
        : null,
    ]
      .filter(Boolean)
      .join("\n");
  }, [hasError, result, symbol, money]);

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
    setPrincipalTokens(DEFAULTS.principalTokens);
    setAprPercent(DEFAULTS.aprPercent);
    setCommissionPercent(DEFAULTS.commissionPercent);
    setFrequencyId(DEFAULTS.frequencyId);
    setRestake(DEFAULTS.restake);
    setYears(DEFAULTS.years);
    setTokenPrice(DEFAULTS.tokenPrice);
    setTicker(DEFAULTS.ticker);
    setCurrencyId(DEFAULTS.currencyId);
    setCopied(false);
  };

  const rows = hasError
    ? [
        ["Effective APY", DASH],
        ["Rewards earned", DASH],
        ["Commission kept by validator", DASH],
        ["Final balance", DASH],
        ["Value of rewards", DASH],
      ]
    : [
        ["Effective APY", PCT.format(result.apy)],
        ["Rewards earned", `${TOKENS.format(result.rewardTokens)} ${symbol}`],
        [
          "Commission kept by validator",
          `${TOKENS.format(result.commissionTokens)} ${symbol}`,
        ],
        ["Final balance", `${TOKENS.format(result.finalTokens)} ${symbol}`],
        [
          "Value of rewards",
          result.tokenPrice > 0 ? money.format(result.fiatReward) : "Add a token price",
        ],
      ];

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold tracking-wide uppercase text-[var(--primary)]">
          <Coins className="h-4 w-4" aria-hidden="true" />
          Crypto staking
        </div>
        <h1 className="text-3xl leading-tight font-semibold sm:text-4xl">
          Staking Reward Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Project staking rewards from an advertised APR. Validator commission is deducted first,
          then rewards are compounded at your payout frequency using A = P(1 + r/n)
          <sup>nt</sup>.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-principal">
              Tokens staked
            </label>
            <input
              id="stk-principal"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={principalTokens}
              onChange={(event) => setPrincipalTokens(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-ticker">
              Token symbol
            </label>
            <input
              id="stk-ticker"
              type="text"
              value={ticker}
              onChange={(event) => setTicker(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-apr">
              Advertised APR (%)
            </label>
            <input
              id="stk-apr"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={aprPercent}
              onChange={(event) => setAprPercent(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-commission">
              Validator commission (% of rewards)
            </label>
            <input
              id="stk-commission"
              type="number"
              inputMode="decimal"
              min="0"
              max="99.99"
              step="0.01"
              value={commissionPercent}
              onChange={(event) => setCommissionPercent(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-frequency">
              Reward payout frequency
            </label>
            <select
              id="stk-frequency"
              value={frequencyId}
              onChange={(event) => setFrequencyId(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {COMPOUND_FREQUENCIES.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label} ({f.periodsPerYear}× a year)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-years">
              Staking period (years)
            </label>
            <input
              id="stk-years"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.25"
              value={years}
              onChange={(event) => setYears(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-price">
              Token price (optional)
            </label>
            <input
              id="stk-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="any"
              value={tokenPrice}
              onChange={(event) => setTokenPrice(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            />
          </div>
          <div>
            <label className={LABEL_CLASS} htmlFor="stk-currency">
              Display currency
            </label>
            <select
              id="stk-currency"
              value={currencyId}
              onChange={(event) => setCurrencyId(event.target.value)}
              className={`mt-2 ${INPUT_CLASS}`}
            >
              {CURRENCIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"
              htmlFor="stk-restake"
            >
              <input
                id="stk-restake"
                type="checkbox"
                checked={restake}
                onChange={(event) => setRestake(event.target.checked)}
                className="h-5 w-5 rounded border-[var(--border)] accent-[var(--primary)]"
              />
              Automatically restake rewards (compound)
            </label>
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

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold tracking-wide uppercase text-[var(--muted-foreground)]">
              Final balance
            </p>
            <p className="mt-1 text-4xl font-semibold text-[var(--primary)]">
              {hasError ? DASH : `${TOKENS.format(result.finalTokens)} ${symbol}`}
            </p>
            <p className="mt-1 max-w-md text-sm text-[var(--muted-foreground)]">
              {hasError
                ? "Fix the input above to see a result."
                : `${TOKENS.format(result.rewardTokens)} ${symbol} of rewards on top of your ${TOKENS.format(result.principal)} ${symbol} stake.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyResult}
              disabled={hasError}
              aria-label="Copy the staking projection"
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
              aria-label="Reset all inputs to defaults"
              className={PRIMARY_BTN}
            >
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

      {!hasError ? (
        <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
          <h2 className="text-base font-semibold">Balance year by year</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead>
                <tr className="text-xs tracking-wide uppercase text-[var(--muted-foreground)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Year
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Balance ({symbol})
                  </th>
                  <th scope="col" className="py-2 font-semibold">
                    Cumulative rewards
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {result.schedule.map((row) => (
                  <tr key={row.year}>
                    <td className="py-2.5 pr-3">
                      {row.year}
                      {row.partial ? " (end)" : ""}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold">{TOKENS.format(row.balance)}</td>
                    <td className="py-2.5">{TOKENS.format(row.reward)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Educational projection only, not financial advice. Real staking yields move with network
        participation, inflation schedules and validator performance, and slashing, unbonding
        periods and token price changes can leave you with less than you staked.
      </p>
    </main>
  );
}
