"use client";

import React from "react";
import { LinearConverter } from "./converter";

// factor = value in bytes. Decimal units use powers of 1000 (KB, MB, ...);
// binary units use powers of 1024 (KiB, MiB, ...).
const UNITS = [
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
];

export default function DataStorageConverter() {
  return <LinearConverter units={UNITS} defaultFrom="MB" defaultTo="GB" defaultValue="1" baseLabel="data" />;
}
