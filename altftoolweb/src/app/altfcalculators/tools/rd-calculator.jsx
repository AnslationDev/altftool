"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, money } from "./format";

export default function RdCalculator() {
  const [monthly, setMonthly] = useState("5000");
  const [rate, setRate] = useState("7");
  const [months, setMonths] = useState("60");

  const result = useMemo(() => {
    const P = num(monthly);
    const annual = num(rate);
    const n = num(months);
    if (P === null || annual === null || n === null || P <= 0 || n <= 0) return null;

    const i = annual / 12 / 100;
    const maturity = i === 0 ? P * n : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const deposited = P * n;
    return { maturity, deposited, interest: maturity - deposited };
  }, [monthly, rate, months]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Monthly deposit">
          <NumberInput prefix="₹" value={monthly} min="0" onChange={(e) => setMonthly(e.target.value)} />
        </Field>
        <Field label="Interest rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Tenure (months)">
          <NumberInput value={months} min="0" onChange={(e) => setMonths(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Maturity value">
          <ResultStat label="Maturity amount" value={`₹ ${money(result.maturity)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Total deposited" value={`₹ ${money(result.deposited)}`} />
            <ResultRow label="Interest earned" value={`₹ ${money(result.interest)}`} strong />
          </div>
          <CalcNote>Estimate uses monthly compounding. Banks usually compound RDs quarterly, so the actual maturity may differ slightly.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Maturity value" muted>
          <p className="afc-note">Enter your monthly deposit, rate and tenure in months.</p>
        </ResultPanel>
      )}
    </div>
  );
}
