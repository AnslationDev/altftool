"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function InvestmentCalculator() {
  const [initial, setInitial] = useState("100000");
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("10");
  const [years, setYears] = useState("10");

  const result = useMemo(() => {
    const init = num(initial) ?? 0;
    const P = num(monthly) ?? 0;
    const annual = num(rate);
    const y = num(years);
    if (annual === null || y === null || y <= 0 || init < 0 || P < 0) return null;
    if (init === 0 && P === 0) return null;

    const i = annual / 12 / 100;
    const n = y * 12;
    const growth = Math.pow(1 + i, n);
    const fromMonthly = i === 0 ? P * n : P * ((growth - 1) / i);
    const fv = init * growth + fromMonthly;
    const invested = init + P * n;
    return { fv, invested, returns: fv - invested };
  }, [initial, monthly, rate, years]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Initial investment">
          <NumberInput prefix="₹" value={initial} min="0" onChange={(e) => setInitial(e.target.value)} />
        </Field>
        <Field label="Monthly contribution">
          <NumberInput prefix="₹" value={monthly} min="0" onChange={(e) => setMonthly(e.target.value)} />
        </Field>
        <Field label="Expected return (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Investment period (years)">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Investment projection">
          <ResultStat label="Future value" value={`₹ ${money(result.fv)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Total invested" value={`₹ ${money(result.invested)}`} />
            <ResultRow label="Estimated returns" value={`₹ ${money(result.returns)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Investment projection" muted>
          <p className="afc-note">Enter an initial amount and/or monthly contribution, return and duration.</p>
        </ResultPanel>
      )}
    </div>
  );
}
