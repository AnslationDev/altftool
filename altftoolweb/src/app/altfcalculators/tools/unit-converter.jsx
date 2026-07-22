"use client";

import React, { useMemo, useState } from "react";
import { ArrowRightLeft } from "lucide-react";
import { LinearConverter } from "./converter";
import { Field, NumberInput, Select, Segmented, ResultPanel, ResultStat } from "./ui";
import { num, fmt } from "./format";

// All-in-one converter. Linear measurement types delegate to LinearConverter
// with a factor table (factor = value of 1 unit in the base unit). Temperature
// is non-linear and handled by a small inline converter through a Celsius base.

const LINEAR = {
  length: {
    baseLabel: "length",
    defaultFrom: "m",
    defaultTo: "ft",
    defaultValue: "1",
    // factor = value in metres
    units: [
      { label: "Millimetre (mm)", value: "mm", factor: 0.001 },
      { label: "Centimetre (cm)", value: "cm", factor: 0.01 },
      { label: "Metre (m)", value: "m", factor: 1 },
      { label: "Kilometre (km)", value: "km", factor: 1000 },
      { label: "Inch (in)", value: "in", factor: 0.0254 },
      { label: "Foot (ft)", value: "ft", factor: 0.3048 },
      { label: "Yard (yd)", value: "yd", factor: 0.9144 },
      { label: "Mile (mi)", value: "mi", factor: 1609.344 },
    ],
  },
  weight: {
    baseLabel: "weight",
    defaultFrom: "kg",
    defaultTo: "lb",
    defaultValue: "1",
    // factor = value in grams
    units: [
      { label: "Milligram (mg)", value: "mg", factor: 0.001 },
      { label: "Gram (g)", value: "g", factor: 1 },
      { label: "Kilogram (kg)", value: "kg", factor: 1000 },
      { label: "Tonne (t)", value: "t", factor: 1000000 },
      { label: "Ounce (oz)", value: "oz", factor: 28.349523125 },
      { label: "Pound (lb)", value: "lb", factor: 453.59237 },
      { label: "Stone (st)", value: "st", factor: 6350.29318 },
    ],
  },
  area: {
    baseLabel: "area",
    defaultFrom: "m2",
    defaultTo: "ft2",
    defaultValue: "1",
    // factor = value in square metres
    units: [
      { label: "Square millimetre (mm²)", value: "mm2", factor: 0.000001 },
      { label: "Square centimetre (cm²)", value: "cm2", factor: 0.0001 },
      { label: "Square metre (m²)", value: "m2", factor: 1 },
      { label: "Hectare (ha)", value: "hectare", factor: 10000 },
      { label: "Square kilometre (km²)", value: "km2", factor: 1000000 },
      { label: "Square inch (in²)", value: "in2", factor: 0.00064516 },
      { label: "Square foot (ft²)", value: "ft2", factor: 0.09290304 },
      { label: "Square yard (yd²)", value: "yd2", factor: 0.83612736 },
      { label: "Acre", value: "acre", factor: 4046.8564224 },
      { label: "Square mile (mi²)", value: "mile2", factor: 2589988.110336 },
    ],
  },
  volume: {
    baseLabel: "volume",
    defaultFrom: "L",
    defaultTo: "gallon",
    defaultValue: "1",
    // factor = value in litres
    units: [
      { label: "Millilitre (mL)", value: "mL", factor: 0.001 },
      { label: "Litre (L)", value: "L", factor: 1 },
      { label: "Cubic metre (m³)", value: "m3", factor: 1000 },
      { label: "Cubic centimetre (cm³)", value: "cm3", factor: 0.001 },
      { label: "Gallon (US)", value: "gallon", factor: 3.785411784 },
      { label: "Quart (US)", value: "quart", factor: 0.946352946 },
      { label: "Pint (US)", value: "pint", factor: 0.473176473 },
      { label: "Cup (US)", value: "cup", factor: 0.2365882365 },
      { label: "Fluid ounce (US)", value: "fl-oz", factor: 0.0295735296 },
      { label: "Tablespoon (US)", value: "tbsp", factor: 0.01478676 },
      { label: "Teaspoon (US)", value: "tsp", factor: 0.00492892 },
    ],
  },
  speed: {
    baseLabel: "speed",
    defaultFrom: "kmh",
    defaultTo: "mph",
    defaultValue: "100",
    // factor = value in metres per second
    units: [
      { label: "Metre/second (m/s)", value: "mps", factor: 1 },
      { label: "Kilometre/hour (km/h)", value: "kmh", factor: 1 / 3.6 },
      { label: "Mile/hour (mph)", value: "mph", factor: 0.44704 },
      { label: "Knot (kn)", value: "kn", factor: 0.514444 },
      { label: "Foot/second (ft/s)", value: "fps", factor: 0.3048 },
    ],
  },
  data: {
    baseLabel: "data",
    defaultFrom: "MB",
    defaultTo: "GB",
    defaultValue: "1",
    // factor = value in bytes
    units: [
      { label: "Bit (b)", value: "bit", factor: 0.125 },
      { label: "Byte (B)", value: "Byte", factor: 1 },
      { label: "Kilobyte (KB)", value: "KB", factor: 1000 },
      { label: "Megabyte (MB)", value: "MB", factor: 1e6 },
      { label: "Gigabyte (GB)", value: "GB", factor: 1e9 },
      { label: "Terabyte (TB)", value: "TB", factor: 1e12 },
      { label: "Petabyte (PB)", value: "PB", factor: 1e15 },
      { label: "Kibibyte (KiB)", value: "KiB", factor: 1024 },
      { label: "Mebibyte (MiB)", value: "MiB", factor: 1048576 },
      { label: "Gibibyte (GiB)", value: "GiB", factor: 1073741824 },
      { label: "Tebibyte (TiB)", value: "TiB", factor: 1099511627776 },
    ],
  },
  time: {
    baseLabel: "time",
    defaultFrom: "hour",
    defaultTo: "minute",
    defaultValue: "1",
    // factor = value in seconds
    units: [
      { label: "Millisecond (ms)", value: "millisecond", factor: 0.001 },
      { label: "Second (s)", value: "second", factor: 1 },
      { label: "Minute (min)", value: "minute", factor: 60 },
      { label: "Hour (h)", value: "hour", factor: 3600 },
      { label: "Day (d)", value: "day", factor: 86400 },
      { label: "Week (wk)", value: "week", factor: 604800 },
      { label: "Month (avg)", value: "month", factor: 2629800 },
      { label: "Year (avg)", value: "year", factor: 31557600 },
    ],
  },
};

const TYPES = [
  { label: "Length", value: "length" },
  { label: "Weight", value: "weight" },
  { label: "Area", value: "area" },
  { label: "Volume", value: "volume" },
  { label: "Temperature", value: "temperature" },
  { label: "Speed", value: "speed" },
  { label: "Data", value: "data" },
  { label: "Time", value: "time" },
];

// Non-linear temperature: convert input to Celsius, then Celsius to target.
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
const TEMP_UNITS = [
  { label: "Celsius (°C)", value: "C" },
  { label: "Fahrenheit (°F)", value: "F" },
  { label: "Kelvin (K)", value: "K" },
];

function TemperatureInline() {
  const [value, setValue] = useState("37");
  const [from, setFrom] = useState("C");
  const [to, setTo] = useState("F");

  const result = useMemo(() => {
    const v = num(value);
    if (v === null) return null;
    const c = toC[from](v);
    const converted = fromC[to](c);
    const all = TEMP_UNITS.map((u) => ({ label: u.label, value: fromC[u.value](c) }));
    return { converted, all };
  }, [value, from, to]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const toLabel = TEMP_UNITS.find((u) => u.value === to)?.label || to;

  return (
    <div className="afc-calc">
      <div className="afc-conv-row">
        <Field label="Value">
          <NumberInput value={value} onChange={(e) => setValue(e.target.value)} />
        </Field>
        <Field label="From">
          <Select value={from} onChange={(e) => setFrom(e.target.value)}>
            {TEMP_UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </Select>
        </Field>
        <button type="button" className="afc-swap-btn" onClick={swap} aria-label="Swap units" title="Swap">
          <ArrowRightLeft size={18} />
        </button>
        <Field label="To">
          <Select value={to} onChange={(e) => setTo(e.target.value)}>
            {TEMP_UNITS.map((u) => (
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

export default function UnitConverter() {
  const [type, setType] = useState("length");
  const cfg = LINEAR[type];

  return (
    <div className="afc-calc">
      <Field label="Measurement type">
        <Segmented options={TYPES} value={type} onChange={setType} name="Measurement type" />
      </Field>

      {type === "temperature" ? (
        <TemperatureInline />
      ) : (
        <LinearConverter
          key={type}
          units={cfg.units}
          defaultFrom={cfg.defaultFrom}
          defaultTo={cfg.defaultTo}
          defaultValue={cfg.defaultValue}
          baseLabel={cfg.baseLabel}
        />
      )}
    </div>
  );
}
