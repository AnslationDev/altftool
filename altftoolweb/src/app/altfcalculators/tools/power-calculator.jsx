"use client";
import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

export default function PowerCalculator() {
  const [mode, setMode] = useState("vi");
  const [v, setV] = useState("230");
  const [i, setI] = useState("5");
  const [r, setR] = useState("47");

  const result = useMemo(() => {
    const V = num(v), I = num(i), R = num(r);
    let P, formula;
    if (mode === "vi") {
      if (V === null || I === null) return null;
      P = V * I;
      formula = "P = V × I";
    } else if (mode === "ir") {
      if (I === null || R === null) return null;
      P = I * I * R;
      formula = "P = I² × R";
    } else {
      if (V === null || R === null) return null;
      if (R === 0) return { err: true };
      P = (V * V) / R;
      formula = "P = V² ÷ R";
    }
    return { P, formula };
  }, [mode, v, i, r]);

  return (
    <div className="afc-calc">
      <Field label="Known quantities">
        <Segmented
          name="mode"
          value={mode}
          onChange={setMode}
          options={[
            { label: "Voltage & Current", value: "vi" },
            { label: "Current & Resistance", value: "ir" },
            { label: "Voltage & Resistance", value: "vr" },
          ]}
        />
      </Field>

      <Grid cols={2}>
        {mode !== "ir" ? (
          <Field label="Voltage" hint="Volts (V)">
            <NumberInput suffix="V" value={v} step="any" onChange={(e) => setV(e.target.value)} />
          </Field>
        ) : null}
        {mode !== "vr" ? (
          <Field label="Current" hint="Amperes (A)">
            <NumberInput suffix="A" value={i} step="any" onChange={(e) => setI(e.target.value)} />
          </Field>
        ) : null}
        {mode !== "vi" ? (
          <Field label="Resistance" hint="Ohms (Ω)">
            <NumberInput suffix="Ω" value={r} step="any" onChange={(e) => setR(e.target.value)} />
          </Field>
        ) : null}
      </Grid>

      {result && !result.err ? (
        <ResultPanel title="Electrical power">
          <ResultStat label="Power" value={`${fmt(result.P, 3)} W`} sub={`${fmt(result.P / 1000, 4)} kW`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Watts" value={`${fmt(result.P, 3)} W`} />
            <ResultRow label="Kilowatts" value={`${fmt(result.P / 1000, 4)} kW`} strong />
          </div>
          <CalcNote>Using {result.formula}.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Electrical power" muted>
          <CalcNote>
            {result && result.err
              ? "Resistance cannot be zero."
              : "Enter the two known quantities to calculate power."}
          </CalcNote>
        </ResultPanel>
      )}
    </div>
  );
}
