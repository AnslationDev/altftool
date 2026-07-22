"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function LumpsumCalculator() {
  const [amount, setAmount] = useState("100000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const P = num(amount);
    const annual = num(rate);
    const y = num(years);
    if (P === null || annual === null || y === null || P <= 0 || y < 0) return null;

    const fv = P * Math.pow(1 + annual / 100, y);
    return { fv, invested: P, returns: fv - P };
  }, [amount, rate, years]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Investment amount">
          <NumberInput prefix="₹" value={amount} min="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="Expected return (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Investment period (years)">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Projected value">
          <ResultStat label="Total value" value={`₹ ${money(result.fv)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Invested amount" value={`₹ ${money(result.invested)}`} />
            <ResultRow label="Estimated returns" value={`₹ ${money(result.returns)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Projected value" muted>
          <p className="afc-note">Enter a one-time investment, expected return and duration.</p>
        </ResultPanel>
      )}
    </div>
  );
}
