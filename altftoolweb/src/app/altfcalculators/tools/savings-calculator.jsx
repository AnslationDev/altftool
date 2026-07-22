"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function SavingsCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("6");
  const [years, setYears] = useState("10");
  const [start, setStart] = useState("0");

  const result = useMemo(() => {
    const P = num(monthly);
    const annual = num(rate);
    const y = num(years);
    const S = num(start) ?? 0;
    if (P === null || annual === null || y === null || P < 0 || y <= 0 || S < 0) return null;

    const i = annual / 12 / 100;
    const n = y * 12;
    const growth = Math.pow(1 + i, n);
    const fromMonthly = i === 0 ? P * n : P * ((growth - 1) / i);
    const fv = S * growth + fromMonthly;
    const contributions = S + P * n;
    return { fv, contributions, interest: fv - contributions };
  }, [monthly, rate, years, start]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Monthly deposit">
          <NumberInput prefix="₹" value={monthly} min="0" onChange={(e) => setMonthly(e.target.value)} />
        </Field>
        <Field label="Starting balance" hint="Optional">
          <NumberInput prefix="₹" value={start} min="0" onChange={(e) => setStart(e.target.value)} />
        </Field>
        <Field label="Annual interest rate">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Time period (years)">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Savings projection">
          <ResultStat label="Final balance" value={`₹ ${money(result.fv)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Total contributions" value={`₹ ${money(result.contributions)}`} />
            <ResultRow label="Interest earned" value={`₹ ${money(result.interest)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Savings projection" muted>
          <p className="afc-note">Enter a monthly deposit, interest rate and duration.</p>
        </ResultPanel>
      )}
    </div>
  );
}
