"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money, fmt } from "./format";

export default function RoiCalculator() {
  const [invested, setInvested] = useState("100000");
  const [returned, setReturned] = useState("150000");
  const [years, setYears] = useState("3");

  const result = useMemo(() => {
    const inv = num(invested);
    const ret = num(returned);
    const y = num(years);
    if (inv === null || ret === null || inv <= 0) return null;

    const net = ret - inv;
    const roi = (net / inv) * 100;
    let annualized = null;
    if (y !== null && y > 0 && ret > 0) {
      annualized = (Math.pow(ret / inv, 1 / y) - 1) * 100;
    }
    return { net, roi, annualized };
  }, [invested, returned, years]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Amount invested">
          <NumberInput prefix="₹" value={invested} min="0" onChange={(e) => setInvested(e.target.value)} />
        </Field>
        <Field label="Amount returned">
          <NumberInput prefix="₹" value={returned} min="0" onChange={(e) => setReturned(e.target.value)} />
        </Field>
        <Field label="Holding period (years)" hint="Optional — for annualized ROI">
          <NumberInput value={years} min="0" step="0.5" onChange={(e) => setYears(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Return on investment">
          <ResultStat label="ROI" value={`${fmt(result.roi)} %`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Net profit" value={`₹ ${money(result.net)}`} strong />
            {result.annualized !== null ? (
              <ResultRow label="Annualized ROI" value={`${fmt(result.annualized)} %`} />
            ) : null}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Return on investment" muted>
          <p className="afc-note">Enter the amount invested and the final value returned.</p>
        </ResultPanel>
      )}
    </div>
  );
}
