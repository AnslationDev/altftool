"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money, round } from "./format";

export default function DiscountCalculator() {
  const [price, setPrice] = useState("2499");
  const [discount, setDiscount] = useState("25");

  const result = useMemo(() => {
    const p = num(price);
    const d = num(discount);
    if (p === null || d === null || p < 0) return null;
    const saved = (p * d) / 100;
    return { saved, final: p - saved, original: p, pct: round(d, 2) };
  }, [price, discount]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Original price">
          <NumberInput prefix="₹" value={price} min="0" onChange={(e) => setPrice(e.target.value)} />
        </Field>
        <Field label="Discount">
          <NumberInput suffix="%" value={discount} min="0" step="1" onChange={(e) => setDiscount(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="You pay">
          <ResultStat label="Final price" value={`₹ ${money(result.final)}`} accent sub={`${result.pct}% off`} />
          <div className="afc-result-rows">
            <ResultRow label="Original price" value={`₹ ${money(result.original)}`} />
            <ResultRow label="You save" value={`₹ ${money(result.saved)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="You pay" muted>
          <p className="afc-note">Enter a price and discount percentage.</p>
        </ResultPanel>
      )}
    </div>
  );
}
