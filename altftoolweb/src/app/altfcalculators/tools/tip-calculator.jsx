"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function TipCalculator() {
  const [bill, setBill] = useState("1200");
  const [tip, setTip] = useState("10");
  const [people, setPeople] = useState("2");

  const result = useMemo(() => {
    const b = num(bill);
    const t = num(tip);
    const p = Math.max(1, Math.round(num(people) || 1));
    if (b === null || t === null || b < 0) return null;
    const tipAmount = (b * t) / 100;
    const total = b + tipAmount;
    return { tipAmount, total, perPerson: total / p, tipPerPerson: tipAmount / p, people: p };
  }, [bill, tip, people]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Bill amount">
          <NumberInput prefix="₹" value={bill} min="0" onChange={(e) => setBill(e.target.value)} />
        </Field>
        <Field label="Number of people">
          <NumberInput value={people} min="1" onChange={(e) => setPeople(e.target.value)} />
        </Field>
      </Grid>
      <Field label="Tip">
        <Segmented
          name="tip"
          value={String(tip)}
          onChange={setTip}
          options={[
            { label: "5%", value: "5" },
            { label: "10%", value: "10" },
            { label: "15%", value: "15" },
            { label: "20%", value: "20" },
          ]}
        />
      </Field>
      <Field label="Or custom tip %">
        <NumberInput suffix="%" value={tip} min="0" onChange={(e) => setTip(e.target.value)} />
      </Field>

      {result ? (
        <ResultPanel title="Split">
          <ResultStat label={`Each person pays (${result.people})`} value={`₹ ${money(result.perPerson)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Tip amount" value={`₹ ${money(result.tipAmount)}`} />
            <ResultRow label="Total bill" value={`₹ ${money(result.total)}`} />
            <ResultRow label="Tip per person" value={`₹ ${money(result.tipPerPerson)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Split" muted>
          <p className="afc-note">Enter the bill, tip and party size.</p>
        </ResultPanel>
      )}
    </div>
  );
}
