"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function GstCalculator() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("18");
  const [mode, setMode] = useState("add");

  const result = useMemo(() => {
    const a = num(amount);
    const r = num(rate);
    if (a === null || r === null || a < 0 || r < 0) return null;

    if (mode === "add") {
      const gst = (a * r) / 100;
      return { net: a, gst, gross: a + gst };
    }
    // remove: `amount` already includes GST
    const net = a / (1 + r / 100);
    const gst = a - net;
    return { net, gst, gross: a };
  }, [amount, rate, mode]);

  return (
    <div className="afc-calc">
      <Field label="Mode">
        <Segmented
          name="gst mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Add GST", value: "add" },
            { label: "Remove GST", value: "remove" },
          ]}
        />
      </Field>
      <Grid cols={2}>
        <Field label={mode === "add" ? "Amount (excl. GST)" : "Amount (incl. GST)"}>
          <NumberInput prefix="₹" value={amount} min="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="GST / tax rate">
          <NumberInput suffix="%" value={rate} min="0" step="0.5" onChange={(e) => setRate(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Breakdown">
          <ResultStat label="GST amount" value={`₹ ${money(result.gst)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Net (excl. GST)" value={`₹ ${money(result.net)}`} />
            <ResultRow label="Gross (incl. GST)" value={`₹ ${money(result.gross)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Breakdown" muted>
          <p className="afc-note">Enter an amount and rate to compute the GST split.</p>
        </ResultPanel>
      )}
    </div>
  );
}
