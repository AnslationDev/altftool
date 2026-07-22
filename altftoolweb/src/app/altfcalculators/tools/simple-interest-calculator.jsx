"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function SimpleInterestCalculator() {
  const [principal, setPrincipal] = useState("50000");
  const [rate, setRate] = useState("7");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    const P = num(principal);
    const r = num(rate);
    const t = num(years);
    if (P === null || r === null || t === null || P < 0 || t < 0) return null;
    const interest = (P * r * t) / 100;
    return { interest, total: P + interest, principal: P };
  }, [principal, rate, years]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Principal">
          <NumberInput prefix="₹" value={principal} min="0" onChange={(e) => setPrincipal(e.target.value)} />
        </Field>
        <Field label="Rate (per year)">
          <NumberInput suffix="%" value={rate} min="0" step="0.1" onChange={(e) => setRate(e.target.value)} />
        </Field>
        <Field label="Time (years)">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Simple interest">
          <ResultStat label="Interest" value={`₹ ${money(result.interest)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Principal" value={`₹ ${money(result.principal)}`} />
            <ResultRow label="Total amount" value={`₹ ${money(result.total)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Simple interest" muted>
          <p className="afc-note">Enter principal, rate and time to calculate interest.</p>
        </ResultPanel>
      )}
    </div>
  );
}
