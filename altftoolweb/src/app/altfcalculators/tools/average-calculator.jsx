"use client";

import React, { useMemo, useState } from "react";
import { Field, ResultPanel, ResultStat, ResultRow } from "./ui";
import { fmt, round } from "./format";

function parseNumbers(text) {
  return String(text)
    .split(/[\s,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

export default function AverageCalculator() {
  const [text, setText] = useState("12, 18, 24, 9, 30, 15");

  const result = useMemo(() => {
    const nums = parseNumbers(text);
    if (nums.length === 0) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    const mean = sum / nums.length;

    const sorted = [...nums].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

    const freq = {};
    let best = 0;
    nums.forEach((n) => {
      freq[n] = (freq[n] || 0) + 1;
      if (freq[n] > best) best = freq[n];
    });
    const modes = best > 1 ? Object.keys(freq).filter((k) => freq[k] === best).map(Number) : [];

    return {
      count: nums.length,
      sum,
      mean,
      median,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      range: sorted[sorted.length - 1] - sorted[0],
      modes,
    };
  }, [text]);

  return (
    <div className="afc-calc">
      <Field label="Numbers" hint="Separate with commas, spaces or new lines.">
        <textarea
          className="afc-input afc-textarea"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 12, 18, 24, 9, 30"
        />
      </Field>

      {result ? (
        <ResultPanel title="Statistics">
          <ResultStat label="Mean (average)" value={fmt(result.mean, 4)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Count" value={result.count} />
            <ResultRow label="Sum" value={fmt(result.sum, 4)} />
            <ResultRow label="Median" value={fmt(result.median, 4)} />
            <ResultRow
              label="Mode"
              value={result.modes.length ? result.modes.map((m) => round(m, 4)).join(", ") : "None"}
            />
            <ResultRow label="Min / Max" value={`${fmt(result.min, 4)} / ${fmt(result.max, 4)}`} />
            <ResultRow label="Range" value={fmt(result.range, 4)} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Statistics" muted>
          <p className="afc-note">Enter a few numbers to see the statistics.</p>
        </ResultPanel>
      )}
    </div>
  );
}
