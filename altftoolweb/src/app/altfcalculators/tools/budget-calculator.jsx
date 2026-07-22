"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, money, round } from "./format";

export default function BudgetCalculator() {
  const [income, setIncome] = useState("50000");
  const [needsPct, setNeedsPct] = useState("50");
  const [wantsPct, setWantsPct] = useState("30");
  const [savingsPct, setSavingsPct] = useState("20");

  const result = useMemo(() => {
    const inc = num(income);
    const n = num(needsPct);
    const w = num(wantsPct);
    const s = num(savingsPct);
    if (inc === null || inc < 0) return null;
    if (n === null || w === null || s === null || n < 0 || w < 0 || s < 0) return null;

    const sum = n + w + s;
    return {
      needs: (inc * n) / 100,
      wants: (inc * w) / 100,
      savings: (inc * s) / 100,
      sum,
      balanced: Math.abs(sum - 100) < 0.5,
    };
  }, [income, needsPct, wantsPct, savingsPct]);

  return (
    <div className="afc-calc">
      <Field label="Monthly after-tax income" hint="Your take-home pay each month">
        <NumberInput prefix="₹" value={income} min="0" step="1000" onChange={(e) => setIncome(e.target.value)} />
      </Field>

      <Grid cols={3}>
        <Field label="Needs %">
          <NumberInput suffix="%" value={needsPct} min="0" max="100" step="1" onChange={(e) => setNeedsPct(e.target.value)} />
        </Field>
        <Field label="Wants %">
          <NumberInput suffix="%" value={wantsPct} min="0" max="100" step="1" onChange={(e) => setWantsPct(e.target.value)} />
        </Field>
        <Field label="Savings %">
          <NumberInput suffix="%" value={savingsPct} min="0" max="100" step="1" onChange={(e) => setSavingsPct(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Monthly budget split">
          <ResultStat label="Set aside for savings" value={`₹ ${money(result.savings)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label={`Needs (${round(num(needsPct), 0)}%)`} value={`₹ ${money(result.needs)}`} />
            <ResultRow label={`Wants (${round(num(wantsPct), 0)}%)`} value={`₹ ${money(result.wants)}`} />
            <ResultRow label={`Savings (${round(num(savingsPct), 0)}%)`} value={`₹ ${money(result.savings)}`} strong />
          </div>
          {!result.balanced ? (
            <CalcNote>
              Your percentages add up to {round(result.sum, 0)}% — adjust them to total 100% for an accurate split.
            </CalcNote>
          ) : (
            <CalcNote>
              Based on the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Tweak the percentages to match your goals.
            </CalcNote>
          )}
        </ResultPanel>
      ) : (
        <ResultPanel title="Monthly budget split" muted>
          <p className="afc-note">Enter your monthly income to see your budget breakdown.</p>
        </ResultPanel>
      )}
    </div>
  );
}
