"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money, fmt } from "./format";

export default function CagrCalculator() {
  const [initial, setInitial] = useState("100000");
  const [final, setFinal] = useState("200000");
  const [years, setYears] = useState("5");

  const result = useMemo(() => {
    const start = num(initial);
    const end = num(final);
    const y = num(years);
    if (start === null || end === null || y === null || start <= 0 || end <= 0 || y <= 0) return null;

    const cagr = (Math.pow(end / start, 1 / y) - 1) * 100;
    const totalGrowth = (end / start - 1) * 100;
    return { cagr, totalGrowth, gain: end - start };
  }, [initial, final, years]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Initial value">
          <NumberInput prefix="₹" value={initial} min="0" onChange={(e) => setInitial(e.target.value)} />
        </Field>
        <Field label="Final value">
          <NumberInput prefix="₹" value={final} min="0" onChange={(e) => setFinal(e.target.value)} />
        </Field>
        <Field label="Period (years)">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Growth rate">
          <ResultStat label="CAGR" value={`${fmt(result.cagr)} %`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Absolute gain" value={`₹ ${money(result.gain)}`} />
            <ResultRow label="Total growth" value={`${fmt(result.totalGrowth)} %`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Growth rate" muted>
          <p className="afc-note">Enter the initial value, final value and number of years.</p>
        </ResultPanel>
      )}
    </div>
  );
}
