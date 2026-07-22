"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt, money } from "./format";

// Value of 1 unit expressed in feet.
const TO_FEET = { ft: 1, m: 3.280839895, yd: 3, in: 1 / 12 };

export default function SquareFootageCalculator() {
  const [unit, setUnit] = useState("ft");
  const [length, setLength] = useState("12");
  const [width, setWidth] = useState("10");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");

  const r = useMemo(() => {
    const L = num(length), W = num(width);
    if (L === null || W === null || L <= 0 || W <= 0) return null;
    const f = TO_FEET[unit];
    const oneFt2 = (L * f) * (W * f);
    const q = num(qty);
    const count = q !== null && q > 0 ? q : 1;
    const totalFt2 = oneFt2 * count;
    const totalM2 = totalFt2 * 0.09290304; // 1 ft² = 0.092903 m²
    const p = num(price);
    const cost = p !== null && p >= 0 ? totalFt2 * p : null;
    return { oneFt2, count, totalFt2, totalM2, cost };
  }, [unit, length, width, qty, price]);

  return (
    <div className="afc-calc">
      <Field label="Units">
        <Segmented
          name="unit"
          value={unit}
          onChange={setUnit}
          options={[
            { label: "Feet", value: "ft" },
            { label: "Metres", value: "m" },
            { label: "Yards", value: "yd" },
            { label: "Inches", value: "in" },
          ]}
        />
      </Field>
      <Grid cols={2}>
        <Field label="Length">
          <NumberInput suffix={unit} value={length} min="0" step="0.1" onChange={(e) => setLength(e.target.value)} />
        </Field>
        <Field label="Width">
          <NumberInput suffix={unit} value={width} min="0" step="0.1" onChange={(e) => setWidth(e.target.value)} />
        </Field>
      </Grid>
      <Grid cols={2}>
        <Field label="Number of areas" hint="Identical rooms or sections">
          <NumberInput value={qty} min="0" step="1" onChange={(e) => setQty(e.target.value)} />
        </Field>
        <Field label="Price per sq ft" hint="Optional — for total cost">
          <NumberInput prefix="₹" value={price} min="0" onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </Grid>

      {r ? (
        <ResultPanel title="Area">
          <ResultStat label="Total square footage" value={`${fmt(r.totalFt2, 2)} ft²`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Total area (metric)" value={`${fmt(r.totalM2, 2)} m²`} />
            {r.count > 1 ? <ResultRow label="Area of one section" value={`${fmt(r.oneFt2, 2)} ft²`} /> : null}
            {r.cost !== null ? <ResultRow label="Estimated cost" value={`₹ ${money(r.cost)}`} strong /> : null}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Area" muted>
          <p className="afc-note">Enter length and width to calculate the square footage.</p>
        </ResultPanel>
      )}
    </div>
  );
}
