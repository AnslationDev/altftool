"use client";
import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

export default function OhmsLawCalculator() {
  const [v, setV] = useState("12");
  const [i, setI] = useState("");
  const [r, setR] = useState("100");

  const result = useMemo(() => {
    const V = num(v), I = num(i), R = num(r);
    const filled = [V, I, R].filter((x) => x !== null).length;
    if (filled < 2) return { status: "few" };
    if (filled > 2) return { status: "many" };

    let vv = V, ii = I, rr = R, pp;
    let used;
    if (V !== null && I !== null) {
      if (I === 0) return { status: "err", msg: "Current cannot be zero when solving for resistance." };
      rr = V / I;
      pp = V * I;
      used = "V = I × R,  P = V × I";
    } else if (V !== null && R !== null) {
      if (R === 0) return { status: "err", msg: "Resistance cannot be zero when solving for current." };
      ii = V / R;
      pp = (V * V) / R;
      used = "I = V ÷ R,  P = V² ÷ R";
    } else {
      vv = I * R;
      pp = I * I * R;
      used = "V = I × R,  P = I² × R";
    }
    return { status: "ok", V: vv, I: ii, R: rr, P: pp, used };
  }, [v, i, r]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Voltage" hint="Volts (V)">
          <NumberInput suffix="V" value={v} step="any" placeholder="—" onChange={(e) => setV(e.target.value)} />
        </Field>
        <Field label="Current" hint="Amperes (A)">
          <NumberInput suffix="A" value={i} step="any" placeholder="—" onChange={(e) => setI(e.target.value)} />
        </Field>
        <Field label="Resistance" hint="Ohms (Ω)">
          <NumberInput suffix="Ω" value={r} step="any" placeholder="—" onChange={(e) => setR(e.target.value)} />
        </Field>
      </Grid>

      {result.status === "ok" ? (
        <ResultPanel title="Solution">
          <ResultStat label="Power" value={`${fmt(result.P, 3)} W`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Voltage (V)" value={`${fmt(result.V, 3)} V`} />
            <ResultRow label="Current (I)" value={`${fmt(result.I, 4)} A`} />
            <ResultRow label="Resistance (R)" value={`${fmt(result.R, 3)} Ω`} strong />
          </div>
          <CalcNote>Using {result.used}.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Solution" muted>
          <CalcNote>
            {result.status === "err"
              ? result.msg
              : result.status === "many"
              ? "Enter exactly two values — clear one field to solve for the rest."
              : "Enter any two of voltage, current or resistance to solve for the others and power."}
          </CalcNote>
        </ResultPanel>
      )}
    </div>
  );
}
