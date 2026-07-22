"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in litres (L)
const UNITS = [
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
];

export default function VolumeConverter() {
  return <LinearConverter units={UNITS} defaultFrom="L" defaultTo="gallon" defaultValue="1" baseLabel="volume" />;
}
