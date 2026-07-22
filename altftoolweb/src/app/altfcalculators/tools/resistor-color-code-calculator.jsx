"use client";
import React, { useMemo, useState } from "react";
import { Field, Select, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { fmt } from "./format";

// Hex swatch colour for every band colour.
const HEX = {
  black: "#1c1c1c", brown: "#7c4a1e", red: "#d32f2f", orange: "#ef6c00",
  yellow: "#f6c000", green: "#2e7d32", blue: "#1565c0", violet: "#7b1fa2",
  grey: "#6b7280", white: "#f4f4f5", gold: "#c9a227", silver: "#b8b8bd",
};

// Digit bands: value = array index.
const DIGIT_COLORS = ["black", "brown", "red", "orange", "yellow", "green", "blue", "violet", "grey", "white"];

// Multiplier bands.
const MULT_COLORS = [
  { name: "black", mult: 1 }, { name: "brown", mult: 10 }, { name: "red", mult: 100 },
  { name: "orange", mult: 1e3 }, { name: "yellow", mult: 1e4 }, { name: "green", mult: 1e5 },
  { name: "blue", mult: 1e6 }, { name: "violet", mult: 1e7 }, { name: "grey", mult: 1e8 },
  { name: "white", mult: 1e9 }, { name: "gold", mult: 0.1 }, { name: "silver", mult: 0.01 },
];

// Tolerance bands.
const TOL_COLORS = [
  { name: "brown", tol: 1 }, { name: "red", tol: 2 }, { name: "green", tol: 0.5 },
  { name: "blue", tol: 0.25 }, { name: "violet", tol: 0.1 }, { name: "gold", tol: 5 },
  { name: "silver", tol: 10 },
];

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const digitVal = (name) => DIGIT_COLORS.indexOf(name);
const multVal = (name) => (MULT_COLORS.find((c) => c.name === name) || {}).mult;
const tolVal = (name) => (TOL_COLORS.find((c) => c.name === name) || {}).tol;

function formatOhms(ohms) {
  if (!Number.isFinite(ohms)) return "—";
  if (ohms >= 1e9) return `${fmt(ohms / 1e9, 3)} GΩ`;
  if (ohms >= 1e6) return `${fmt(ohms / 1e6, 3)} MΩ`;
  if (ohms >= 1e3) return `${fmt(ohms / 1e3, 3)} kΩ`;
  return `${fmt(ohms, 3)} Ω`;
}

export default function ResistorColorCodeCalculator() {
  const [mode, setMode] = useState("4");
  const [d1, setD1] = useState("brown");
  const [d2, setD2] = useState("black");
  const [d3, setD3] = useState("black");
  const [mult, setMult] = useState("red");
  const [tol, setTol] = useState("gold");

  const result = useMemo(() => {
    const m = multVal(mult);
    const t = tolVal(tol);
    let digits;
    let bands;
    if (mode === "5") {
      digits = digitVal(d1) * 100 + digitVal(d2) * 10 + digitVal(d3);
      bands = [d1, d2, d3, mult, tol];
    } else {
      digits = digitVal(d1) * 10 + digitVal(d2);
      bands = [d1, d2, mult, tol];
    }
    const resistance = digits * m;
    const delta = (resistance * t) / 100;
    return { resistance, tol: t, bands, min: resistance - delta, max: resistance + delta };
  }, [mode, d1, d2, d3, mult, tol]);

  return (
    <div className="afc-calc">
      <Field label="Number of bands">
        <Segmented
          name="bands"
          value={mode}
          onChange={setMode}
          options={[
            { label: "4 bands", value: "4" },
            { label: "5 bands", value: "5" },
          ]}
        />
      </Field>

      <Grid cols={mode === "5" ? 3 : 2}>
        <Field label="Band 1 (1st digit)">
          <Select value={d1} onChange={(e) => setD1(e.target.value)}>
            {DIGIT_COLORS.map((c) => <option key={c} value={c}>{cap(c)} ({digitVal(c)})</option>)}
          </Select>
        </Field>
        <Field label="Band 2 (2nd digit)">
          <Select value={d2} onChange={(e) => setD2(e.target.value)}>
            {DIGIT_COLORS.map((c) => <option key={c} value={c}>{cap(c)} ({digitVal(c)})</option>)}
          </Select>
        </Field>
        {mode === "5" ? (
          <Field label="Band 3 (3rd digit)">
            <Select value={d3} onChange={(e) => setD3(e.target.value)}>
              {DIGIT_COLORS.map((c) => <option key={c} value={c}>{cap(c)} ({digitVal(c)})</option>)}
            </Select>
          </Field>
        ) : null}
      </Grid>

      <Grid cols={2}>
        <Field label={mode === "5" ? "Band 4 (multiplier)" : "Band 3 (multiplier)"}>
          <Select value={mult} onChange={(e) => setMult(e.target.value)}>
            {MULT_COLORS.map((c) => (
              <option key={c.name} value={c.name}>{cap(c.name)} (×{c.mult >= 1 ? fmt(c.mult, 0) : c.mult})</option>
            ))}
          </Select>
        </Field>
        <Field label={mode === "5" ? "Band 5 (tolerance)" : "Band 4 (tolerance)"}>
          <Select value={tol} onChange={(e) => setTol(e.target.value)}>
            {TOL_COLORS.map((c) => <option key={c.name} value={c.name}>{cap(c.name)} (±{c.tol}%)</option>)}
          </Select>
        </Field>
      </Grid>

      <ResultPanel title="Resistance">
        <div className="afc-swatch-row" style={{ marginBottom: 12 }}>
          {result.bands.map((b, idx) => (
            <span key={idx} className="afc-swatch" style={{ background: HEX[b] }} title={cap(b)} />
          ))}
        </div>
        <ResultStat label="Resistance value" value={formatOhms(result.resistance)} sub={`± ${result.tol}% tolerance`} accent />
        <div className="afc-result-rows">
          <ResultRow label="Exact value" value={`${fmt(result.resistance, 3)} Ω`} />
          <ResultRow label="Minimum" value={formatOhms(result.min)} />
          <ResultRow label="Maximum" value={formatOhms(result.max)} strong />
        </div>
        <CalcNote>Colour order is read from the band nearest the end lead. Gold/silver multipliers give sub-ohm values.</CalcNote>
      </ResultPanel>
    </div>
  );
}
