"use client";

import React, { useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Field, NumberInput, Select, ResultPanel, ResultStat } from "./ui";
import { num, fmt } from "./format";

// Convert any input temperature to Celsius, then to the target.
const toC = {
  C: (v) => v,
  F: (v) => (v - 32) * (5 / 9),
  K: (v) => v - 273.15,
};
const fromC = {
  C: (v) => v,
  F: (v) => v * (9 / 5) + 32,
  K: (v) => v + 273.15,
};
const UNITS = [
  { label: "Celsius (°C)", value: "C" },
  { label: "Fahrenheit (°F)", value: "F" },
  { label: "Kelvin (K)", value: "K" },
];

export default function TemperatureConverter() {
  const [value, setValue] = useState("37");
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");

  const result = useMemo(() => {
    const v = num(value);
    if (v === null) return null;
    const c = toC[from](v);
    const converted = fromC[to](c);
    const all = UNITS.map((u) => ({ label: u.label, value: fromC[u.value](c) }));
    return { converted, all };
  }, [value, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const toLabel = UNITS.find((u) => u.value === to)?.label || to;

  return (
    <div className="afc-calc">
      <div className="afc-conv-row">
        <Field label="Value">
          <NumberInput value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="From">
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>
        <button type="button" className="afc-swap-btn" onClick={swap} aria-label="Swap units" title="Swap">
          <ArrowRightLeft size={18} />
        </button>
        <Field label="To">
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {result ? (
        <ResultPanel title="Converted temperature">
          <ResultStat label={toLabel} value={fmt(result.converted, 2)} accent />
          <div className="afc-conv-table">
            {result.all.map((row) => (
              <div key={row.label} className="afc-conv-cell">
                <span className="afc-conv-cell-val">{fmt(row.value, 2)}</span>
                <span className="afc-conv-cell-label">{row.label}</span>
              </div>
            ))}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Converted temperature" muted>
          <p className="afc-note">Enter a temperature to convert.</p>
        </ResultPanel>
      )}
    </div>
  );
}
