"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in metres
const UNITS = [
  { label: "Millimetre (mm)", value: "mm", factor: 0.001 },
  { label: "Centimetre (cm)", value: "cm", factor: 0.01 },
  { label: "Metre (m)", value: "m", factor: 1 },
  { label: "Kilometre (km)", value: "km", factor: 1000 },
  { label: "Inch (in)", value: "in", factor: 0.0254 },
  { label: "Foot (ft)", value: "ft", factor: 0.3048 },
  { label: "Yard (yd)", value: "yd", factor: 0.9144 },
  { label: "Mile (mi)", value: "mi", factor: 1609.344 },
];

export default function LengthConverter() {
  return <LinearConverter units={UNITS} defaultFrom="m" defaultTo="ft" defaultValue="1" baseLabel="length" />;
}
