"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

export default function ConcreteCalculator() {
  const [unit, setUnit] = useState("ft");
  const [length, setLength] = useState("10");
  const [width, setWidth] = useState("10");
  const [thickness, setThickness] = useState("0.5");

  const r = useMemo(() => {
    const L = num(length), W = num(width), T = num(thickness);
    if (L === null || W === null || T === null || L <= 0 || W <= 0 || T <= 0) return null;
    const f = unit === "ft" ? 0.3048 : 1; // metres per input unit
    const m3 = (L * f) * (W * f) * (T * f);
    const ft3 = m3 * 35.3146667; // 1 m³ = 35.3147 ft³
    const yd3 = m3 * 1.30795; // 1 m³ = 1.30795 yd³
    const mass = m3 * 2400; // kg — wet concrete ≈ 2400 kg/m³
    const bags = mass / 50;
    return { m3, ft3, yd3, mass, bags };
  }, [unit, length, width, thickness]);

  return (
    <div className="afc-calc">
      <Field label="Units">
        <Segmented
          name="units"
          value={unit}
          onChange={setUnit}
          options={[
            { label: "Feet", value: "ft" },
            { label: "Metres", value: "m" },
          ]}
        />
      </Field>
      <Grid cols={3}>
        <Field label="Length">
          <NumberInput suffix={unit} value={length} min="0" step="0.1" onChange={(e) => setLength(e.target.value)} />
        </Field>
        <Field label="Width">
          <NumberInput suffix={unit} value={width} min="0" step="0.1" onChange={(e) => setWidth(e.target.value)} />
        </Field>
        <Field label="Thickness / depth">
          <NumberInput suffix={unit} value={thickness} min="0" step="0.1" onChange={(e) => setThickness(e.target.value)} />
        </Field>
      </Grid>

      {r ? (
        <ResultPanel title="Concrete required">
          <ResultStat label="Volume of concrete" value={`${fmt(r.m3, 3)} m³`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Volume (cubic feet)" value={`${fmt(r.ft3, 2)} ft³`} />
            <ResultRow label="Volume (cubic yards)" value={`${fmt(r.yd3, 3)} yd³`} />
            <ResultRow label="Approx. wet concrete mass" value={`${fmt(r.mass, 0)} kg`} />
            <ResultRow label="≈ 50 kg bags (total mix)" value={fmt(Math.ceil(r.bags), 0)} strong />
          </div>
          <CalcNote>
            The bag count is based on the total wet-concrete mass (2400 kg/m³) — that is the whole
            mix, not cement alone. The actual cement, sand and aggregate needed depend on your mix
            ratio (e.g. 1:2:4 or M20). Order 5–10% extra for spillage and over-excavation.
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Concrete required" muted>
          <p className="afc-note">Enter length, width and thickness to estimate the concrete volume.</p>
        </ResultPanel>
      )}
    </div>
  );
}
