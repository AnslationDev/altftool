"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

// Amortise a balance at a fixed monthly rate paying `payment` each month.
// Returns null if the payment can never reduce the balance.
function simulate(balance, monthlyRate, payment) {
  let bal = balance;
  let months = 0;
  let totalInterest = 0;
  const maxMonths = 12000; // safety cap (1000 years)
  while (bal > 0.005 && months < maxMonths) {
    const interest = bal * monthlyRate;
    let principal = payment - interest;
    if (principal <= 0) return null; // payment does not cover interest
    if (principal > bal) principal = bal;
    bal -= principal;
    totalInterest += interest;
    months += 1;
  }
  return { months, totalInterest };
}

function fmtMonths(m) {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  const parts = [];
  if (y) parts.push(`${y} yr`);
  if (mo) parts.push(`${mo} mo`);
  return parts.join(" ") || "0 mo";
}

export default function MortgagePayoffCalculator() {
  const [balance, setBalance] = useState("3000000");
  const [rate, setRate] = useState("8.5");
  const [payment, setPayment] = useState("28000");
  const [extra, setExtra] = useState("5000");

  const r = useMemo(() => {
    const B = num(balance);
    const a = num(rate);
    const pay = num(payment);
    if (B === null || a === null || pay === null || B <= 0 || pay <= 0) return null;

    const i = a / 12 / 100;
    if (pay <= B * i) {
      return { error: "The monthly payment is too low to cover the interest — the balance would never reduce." };
    }

    const ex = num(extra) === null || num(extra) < 0 ? 0 : num(extra);
    const base = simulate(B, i, pay);
    const withExtra = simulate(B, i, pay + ex);
    if (!base || !withExtra) return null;

    return {
      base,
      withExtra,
      extra: ex,
      monthsSaved: base.months - withExtra.months,
      interestSaved: base.totalInterest - withExtra.totalInterest,
    };
  }, [balance, rate, payment, extra]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Current balance">
          <NumberInput prefix="₹" value={balance} min="0" onChange={(e) => setBalance(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.05" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Current monthly payment">
          <NumberInput prefix="₹" value={payment} min="0" onChange={(e) => setPayment(e.target.value)} />
        </Field>
        <Field label="Extra monthly payment">
          <NumberInput prefix="₹" value={extra} min="0" onChange={(e) => setExtra(e.target.value)} />
        </Field>
      </Grid>

      {r && !r.error ? (
        <ResultPanel title="Payoff with extra payments">
          <ResultStat label="Time saved" value={fmtMonths(r.monthsSaved)} accent sub={`Interest saved ₹ ${money(r.interestSaved)}`} />
          <div className="afc-result-rows">
            <ResultRow label={`With ₹${money(r.extra)} extra — payoff`} value={fmtMonths(r.withExtra.months)} />
            <ResultRow label="With extra — total interest" value={`₹ ${money(r.withExtra.totalInterest)}`} />
            <ResultRow label="Without extra — payoff" value={fmtMonths(r.base.months)} />
            <ResultRow label="Without extra — total interest" value={`₹ ${money(r.base.totalInterest)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Payoff with extra payments" muted>
          <p className={r && r.error ? "afc-error" : "afc-note"}>
            {r && r.error ? r.error : "Enter your balance, rate, monthly payment and any extra amount."}
          </p>
        </ResultPanel>
      )}
    </div>
  );
}
