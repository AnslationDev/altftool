"use client";

import { useMemo, useState } from "react";
import { Check, Copy, CreditCard, Plus, RotateCcw, Trash2 } from "lucide-react";

const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const PCT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

const money = (value) => INR.format(Number.isFinite(value) ? value : 0);
const pct = (value) => `${PCT.format(Number.isFinite(value) ? value : 0)}%`;

/** The threshold most scoring models stop penalising below. */
const HEALTHY_LIMIT = 30;

const DEFAULT_CARDS = [
  { id: 1, name: "HDFC Regalia", limit: "250000", balance: "60000" },
  { id: 2, name: "Axis Ace", limit: "120000", balance: "48000" },
];

const INPUT_CLASS =
  "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-[3px] focus:ring-[var(--primary)]/25 focus:outline-none";
const LABEL_CLASS = "block text-sm font-semibold text-[var(--foreground)]";
const PRIMARY_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]";
const GHOST_BTN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-[var(--border)] bg-[var(--background)] px-4 text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--primary)] active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]";

const toNumber = (raw) => {
  const value = Number(String(raw).replace(/,/g, "").trim());
  return Number.isFinite(value) && value >= 0 ? value : 0;
};

/**
 * Utilisation is reported two ways because lenders look at both: the overall
 * ratio across every card, and the worst single card. A 12% overall ratio still
 * hurts if one card is sitting at 95%.
 */
function summarise(cards) {
  const rows = cards.map((card) => {
    const limit = toNumber(card.limit);
    const balance = toNumber(card.balance);
    const ratio = limit > 0 ? (balance / limit) * 100 : 0;
    // Spend room left before this card crosses the healthy threshold.
    const roomToHealthy = limit > 0 ? (HEALTHY_LIMIT / 100) * limit - balance : 0;
    return { ...card, limit, balance, ratio, roomToHealthy };
  });

  const totalLimit = rows.reduce((sum, r) => sum + r.limit, 0);
  const totalBalance = rows.reduce((sum, r) => sum + r.balance, 0);
  const overallRatio = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
  const overallRoom = totalLimit > 0 ? (HEALTHY_LIMIT / 100) * totalLimit - totalBalance : 0;
  const worst = rows.reduce(
    (acc, r) => (r.limit > 0 && r.ratio > (acc?.ratio ?? -1) ? r : acc),
    null,
  );

  return { rows, totalLimit, totalBalance, overallRatio, overallRoom, worst };
}

function band(ratio) {
  if (ratio <= HEALTHY_LIMIT) return { label: "Healthy", token: "--success" };
  if (ratio <= 50) return { label: "Watch", token: "--warning" };
  return { label: "High", token: "--danger" };
}

export default function CreditUtilisationRatioCalculator() {
  const [cards, setCards] = useState(DEFAULT_CARDS);
  const [nextId, setNextId] = useState(DEFAULT_CARDS.length + 1);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => summarise(cards), [cards]);
  const overallBand = band(result.overallRatio);

  const update = (id, key, value) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)));
    setCopied(false);
  };

  const addCard = () => {
    setCards((prev) => [...prev, { id: nextId, name: "", limit: "", balance: "" }]);
    setNextId((n) => n + 1);
    setCopied(false);
  };

  const removeCard = (id) => {
    setCards((prev) => (prev.length > 1 ? prev.filter((c) => c.id !== id) : prev));
    setCopied(false);
  };

  const reset = () => {
    setCards(DEFAULT_CARDS);
    setNextId(DEFAULT_CARDS.length + 1);
    setCopied(false);
  };

  const copySummary = async () => {
    const lines = [
      `Total limit: ${money(result.totalLimit)}`,
      `Total balance: ${money(result.totalBalance)}`,
      `Overall utilisation: ${pct(result.overallRatio)} (${overallBand.label})`,
      result.overallRoom >= 0
        ? `Room before ${HEALTHY_LIMIT}%: ${money(result.overallRoom)}`
        : `Pay down to reach ${HEALTHY_LIMIT}%: ${money(Math.abs(result.overallRoom))}`,
      "",
      ...result.rows
        .filter((r) => r.limit > 0)
        .map((r) => `${r.name || "Card"}: ${pct(r.ratio)} (${money(r.balance)} of ${money(r.limit)})`),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — the numbers are on screen anyway */
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8 text-[var(--foreground)] sm:px-6">
      <header className="mb-6">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-(--primary-text)">
          <CreditCard className="h-4 w-4" aria-hidden="true" />
          Credit health
        </div>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Credit Utilisation Ratio Calculator
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
          Your utilisation across every card, the ratio on each one, and exactly how much spend room
          is left before you cross the {HEALTHY_LIMIT}% mark most scoring models care about.
        </p>
      </header>

      <section className="rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <h2 className="text-sm font-semibold">Your cards</h2>

        <div className="mt-4 space-y-4">
          {cards.map((card, index) => {
            const row = result.rows[index];
            const rowBand = band(row.ratio);
            return (
              <div
                key={card.id}
                className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
              >
                <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr_auto]">
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`card-name-${card.id}`}>
                      Card
                    </label>
                    <input
                      id={`card-name-${card.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="text"
                      placeholder="Card name"
                      value={card.name}
                      onChange={(e) => update(card.id, "name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`card-limit-${card.id}`}>
                      Limit (INR)
                    </label>
                    <input
                      id={`card-limit-${card.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="1000"
                      value={card.limit}
                      onChange={(e) => update(card.id, "limit", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className={LABEL_CLASS} htmlFor={`card-balance-${card.id}`}>
                      Balance (INR)
                    </label>
                    <input
                      id={`card-balance-${card.id}`}
                      className={`mt-2 ${INPUT_CLASS}`}
                      type="number"
                      inputMode="decimal"
                      min="0"
                      step="500"
                      value={card.balance}
                      onChange={(e) => update(card.id, "balance", e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => removeCard(card.id)}
                      disabled={cards.length === 1}
                      aria-label={`Remove ${card.name || "card"}`}
                      className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[var(--border)] text-[var(--muted-foreground)] transition hover:border-[var(--danger)] hover:text-[var(--danger-text)] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {row.limit > 0 ? (
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <span className="font-semibold" style={{ color: `var(${rowBand.token})` }}>
                      {pct(row.ratio)}
                    </span>
                    <span className="text-[var(--muted-foreground)]">
                      {row.roomToHealthy >= 0
                        ? `${money(row.roomToHealthy)} room before ${HEALTHY_LIMIT}%`
                        : `${money(Math.abs(row.roomToHealthy))} over the ${HEALTHY_LIMIT}% mark`}
                    </span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={addCard} className={GHOST_BTN}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add a card
          </button>
          <button type="button" onClick={reset} className={GHOST_BTN}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
      </section>

      <section className="mt-6 rounded-xl bg-[var(--card)] p-5 ring-1 ring-[var(--border)]">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Overall utilisation</h2>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              color: `var(${overallBand.token})`,
              background: `color-mix(in srgb, var(${overallBand.token}) 14%, transparent)`,
            }}
          >
            {overallBand.label}
          </span>
        </div>

        <p className="mt-2 text-4xl font-semibold" style={{ color: `var(${overallBand.token})` }}>
          {pct(result.overallRatio)}
        </p>

        <div
          className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--muted)]"
          role="img"
          aria-label={`Overall utilisation ${pct(result.overallRatio)}`}
        >
          <div
            className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none"
            style={{
              width: `${Math.min(100, Math.max(0, result.overallRatio))}%`,
              background: `var(${overallBand.token})`,
            }}
          />
        </div>

        <dl className="mt-5 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total limit
            </dt>
            <dd className="mt-1 text-lg font-semibold">{money(result.totalLimit)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              Total balance
            </dt>
            <dd className="mt-1 text-lg font-semibold">{money(result.totalBalance)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
              {result.overallRoom >= 0 ? `Room before ${HEALTHY_LIMIT}%` : "Pay down by"}
            </dt>
            <dd className="mt-1 text-lg font-semibold">
              {money(Math.abs(result.overallRoom))}
            </dd>
          </div>
        </dl>

        {result.worst && result.worst.ratio > HEALTHY_LIMIT ? (
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--background)] p-3 text-sm leading-6 text-[var(--muted-foreground)]">
            Highest single card is{" "}
            <strong className="text-[var(--foreground)]">{result.worst.name || "one card"}</strong>{" "}
            at {pct(result.worst.ratio)}. Lenders look at per-card utilisation too, so clearing{" "}
            {money(Math.abs(result.worst.roomToHealthy))} on that card helps even if your overall
            ratio already looks fine.
          </p>
        ) : null}

        <button type="button" onClick={copySummary} className={`mt-5 ${PRIMARY_BTN}`}>
          {copied ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          {copied ? "Copied" : "Copy summary"}
        </button>
      </section>

      <p className="mt-6 text-xs leading-5 text-[var(--muted-foreground)]">
        Utilisation is reported to bureaus on each card&apos;s statement date, not on your due date —
        so a balance cleared after the statement is generated still shows up for that month.
      </p>
    </main>
  );
}
