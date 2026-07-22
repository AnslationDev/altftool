"use client";

// Reusable unit-converter UI used by the linear converters (length, weight,
// speed). Each unit declares a `factor` = how many base units it equals.

import React, { useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { Field, NumberInput, Select, ResultPanel, ResultStat } from "./ui";
import { num, fmt } from "./format";

export function LinearConverter({ units, defaultFrom, defaultTo, defaultValue = "1", baseLabel }) {
  const [value, setValue] = useState(defaultValue);
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const byValue = useMemo(() => Object.fromEntries(units.map((u) => [u.value, u])), [units]);

  const result = useMemo(() => {
    const v = num(value);
    if (v === null) return null;
    const f = byValue[from];
    const t = byValue[to];
    if (!f || !t) return null;
    const base = v * f.factor;
    const converted = base / t.factor;
    const all = units.map((u) => ({ label: u.label, value: base / u.factor }));
    return { converted, all };
  }, [value, from, to, byValue, units]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const toUnit = byValue[to];

  return (
    <div className="afc-calc">
      <div className="afc-conv-row">
        <Field label="Value">
          <NumberInput value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="From">
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {units.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>
        <button type="button" className="afc-swap-btn" onClick={swap} aria-label="Swap units" title="Swap">
          <ArrowRightLeft size={18} />
        </button>
        <Field label="To">
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            {units.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>
      </div>

      {result ? (
        <ResultPanel title="Converted value">
          <ResultStat label={toUnit?.label || to} value={fmt(result.converted, 6)} accent />
          <div className="afc-conv-table">
            {result.all.map((row) => (
              <div key={row.label} className="afc-conv-cell">
                <span className="afc-conv-cell-val">{fmt(row.value, 4)}</span>
                <span className="afc-conv-cell-label">{row.label}</span>
              </div>
            ))}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Converted value" muted>
          <p className="afc-note">Enter a value to convert{baseLabel ? ` ${baseLabel}` : ""}.</p>
        </ResultPanel>
      )}
    </div>
  );
}
