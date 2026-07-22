"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function VatCalculator() {
  const [amount, setAmount] = useState("1000");
  const [rate, setRate] = useState("20");
  const [mode, setMode] = useState("add");

  const result = useMemo(() => {
    const a = num(amount);
    const r = num(rate);
    if (a === null || r === null || a < 0 || r < 0) return null;

    if (mode === "add") {
      const vat = (a * r) / 100;
      return { net: a, vat, gross: a + vat };
    }
    // remove: `amount` already includes VAT
    const net = a / (1 + r / 100);
    const vat = a - net;
    return { net, vat, gross: a };
  }, [amount, rate, mode]);

  return (
    <div className="afc-calc">
      <Field label="Mode">
        <Segmented
          name="vat mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Add VAT", value: "add" },
            { label: "Remove VAT", value: "remove" },
          ]}
        />
      </Field>
      <Grid cols={2}>
        <Field label={mode === "add" ? "Amount (excl. VAT)" : "Amount (incl. VAT)"}>
          <NumberInput prefix="₹" value={amount} min="0" onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label="VAT rate">
          <NumberInput suffix="%" value={rate} min="0" step="0.5" onChange={(e) => setRate(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Breakdown">
          <ResultStat label="VAT amount" value={`₹ ${money(result.vat)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Net (excl. VAT)" value={`₹ ${money(result.net)}`} />
            <ResultRow label="Gross (incl. VAT)" value={`₹ ${money(result.gross)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Breakdown" muted>
          <p className="afc-note">Enter an amount and VAT rate to compute the split.</p>
        </ResultPanel>
      )}
    </div>
  );
}
