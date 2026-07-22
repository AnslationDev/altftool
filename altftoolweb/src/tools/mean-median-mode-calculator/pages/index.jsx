"use client";

import CalcTool from "@/tools/_shared/batch/CalcTool";

const fields = [{"key":"nums","label":"Numbers (comma or space separated)","type":"text","default":"4, 8, 15, 16, 23, 42, 8"}];
const compute = (v) => { const arr = (v.nums.match(/-?\d+(\.\d+)?/g) || []).map(Number); if (!arr.length) return { result: "—", caption: "Enter some numbers" }; const sum = arr.reduce((a, b) => a + b, 0); const mean = sum / arr.length; const s = [...arr].sort((a, b) => a - b); const mid = Math.floor(s.length / 2); const median = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2; const freq = {}; let mode = s[0], best = 0; for (const n of arr) { freq[n] = (freq[n] || 0) + 1; if (freq[n] > best) { best = freq[n]; mode = n; } } return { result: "Mean " + mean.toFixed(2), rows: [["Median", median], ["Mode", best > 1 ? mode : "none"], ["Range", s[s.length - 1] - s[0]], ["Count", arr.length]] }; };

export default function Page() {
  return (
    <CalcTool title={"Mean Median Mode Calculator"} description={"Paste a list of numbers to get the mean, median, mode and range."} note={""} fields={fields} compute={compute} />
  );
}
