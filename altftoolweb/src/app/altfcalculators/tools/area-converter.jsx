"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in square metres (m²)
const UNITS = [
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
];

export default function AreaConverter() {
  return <LinearConverter units={UNITS} defaultFrom="m2" defaultTo="ft2" defaultValue="1" baseLabel="area" />;
}
