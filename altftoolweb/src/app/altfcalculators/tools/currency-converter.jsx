"use client";

import React, { useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Field, NumberInput, Select, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt, round } from "./format";

// Indicative, bundled offline rates. Base = USD (value of 1 USD in each currency).
const RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.3,
  JPY: 157,
  AUD: 1.52,
  CAD: 1.37,
  CNY: 7.24,
  AED: 3.67,
  SGD: 1.35,
  CHF: 0.88,
};

const NAMES = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  INR: "Indian Rupee",
  JPY: "Japanese Yen",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CNY: "Chinese Yuan",
  AED: "UAE Dirham",
  SGD: "Singapore Dollar",
  CHF: "Swiss Franc",
};

const CODES = Object.keys(RATES);

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("INR");

  const result = useMemo(() => {
    const a = num(amount);
    if (a === null) return null;
    if (!RATES[from] || !RATES[to]) return null;
    // Convert via USD base: amount -> USD -> target.
    const usd = a / RATES[from];
    const converted = usd * RATES[to];
    const unitRate = RATES[to] / RATES[from]; // 1 `from` in `to`
    return { converted, unitRate };
  }, [amount, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <div className="afc-calc">
      <div className="afc-conv-row">
        <Field label="Amount">
          <NumberInput value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="From">
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {CODES.map((c) => (
              <option key={c} value={c}>{c} — {NAMES[c]}</option>
            ))}
          </Select>
        </Field>
        <button type="button" className="afc-swap-btn" onClick={swap} aria-label="Swap currencies" title="Swap">
          <ArrowRightLeft size={18} />
        </button>
        <Field label="To">
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            {CODES.map((c) => (
              <option key={c} value={c}>{c} — {NAMES[c]}</option>
            ))}
          </Select>
        </Field>
      </div>

      {result ? (
        <ResultPanel title="Converted amount">
          <ResultStat label={`${to} — ${NAMES[to]}`} value={`${fmt(result.converted, 2)} ${to}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Exchange rate" value={`1 ${from} = ${round(result.unitRate, 4)} ${to}`} />
            <ResultRow label="Inverse rate" value={`1 ${to} = ${round(1 / result.unitRate, 4)} ${from}`} />
          </div>
          <CalcNote>
            Rates are indicative and bundled for offline use, so they will drift from the live market. For an exact
            figure, check your bank or a live rates provider.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Converted amount" muted>
          <p className="afc-note">Enter an amount to convert between currencies.</p>
        </ResultPanel>
      )}
    </div>
  );
}
