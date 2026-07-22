"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function LoanCalculator() {
  const [amount, setAmount] = useState("500000");
  const [rate, setRate] = useState("11");
  const [term, setTerm] = useState("5");

  const r = useMemo(() => {
    const P = num(amount);
    const a = num(rate);
    const years = num(term);
    if (P === null || a === null || years === null || P <= 0 || years <= 0) return null;

    const n = Math.round(years * 12);
    if (n <= 0) return null;
    const i = a / 12 / 100;
    const emi = i === 0 ? P / n : (P * i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
    const total = emi * n;

    let bal = P;
    const schedule = [];
    const rows = Math.min(12, n);
    for (let m = 1; m <= rows; m += 1) {
      const interest = bal * i;
      let principal = emi - interest;
      if (principal > bal) principal = bal;
      bal -= principal;
      schedule.push({ month: m, principal, interest, balance: bal < 0 ? 0 : bal });
    }

    return { emi, total, interest: total - P, months: n, schedule };
  }, [amount, rate, term]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Loan amount">
          <NumberInput prefix="₹" value={amount} min="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Loan term (years)">
          <NumberInput value={term} min="0" onChange={(e) => setTerm(e.target.value)} />
        </Field>
      </Grid>

      {r ? (
        <>
          <ResultPanel title="Loan summary">
            <ResultStat label="Monthly payment" value={`₹ ${money(r.emi)}`} accent />
            <div className="afc-result-rows">
              <ResultRow label="Total interest" value={`₹ ${money(r.interest)}`} />
              <ResultRow label={`Total payable (${r.months} months)`} value={`₹ ${money(r.total)}`} strong />
            </div>
          </ResultPanel>

          <ResultPanel title="Amortization schedule (first 12 months)">
            <div className="afc-table-wrap">
              <table className="afc-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Principal</th>
                    <th>Interest</th>
                    <th>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {r.schedule.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>₹ {money(row.principal)}</td>
                      <td>₹ {money(row.interest)}</td>
                      <td>₹ {money(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ResultPanel>
        </>
      ) : (
        <ResultPanel title="Loan summary" muted>
          <p className="afc-note">Enter a loan amount, interest rate and term to see your payment.</p>
        </ResultPanel>
      )}
    </div>
  );
}
