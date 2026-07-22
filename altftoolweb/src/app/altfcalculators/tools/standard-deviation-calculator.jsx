"use client";

import React, { useMemo, useState } from "react";
import { Field, ResultPanel, ResultStat, ResultRow } from "./ui";
import { fmt } from "./format";

function parseNumbers(text) {
  return String(text)
    .split(/[\s,;\n]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));
}

export default function StandardDeviationCalculator() {
  const [text, setText] = useState("4, 8, 15, 16, 23, 42");

  const result = useMemo(() => {
    const nums = parseNumbers(text);
    if (nums.length < 2) return null;
    const n = nums.length;
    const mean = nums.reduce((a, b) => a + b, 0) / n;
    const sqSum = nums.reduce((a, b) => a + (b - mean) ** 2, 0);
    const popVar = sqSum / n;
    const sampVar = sqSum / (n - 1);
    return {
      n,
      mean,
      popVar,
      sampVar,
      popSd: Math.sqrt(popVar),
      sampSd: Math.sqrt(sampVar),
    };
  }, [text]);

  return (
    <div className="afc-calc">
      <Field label="Data set" hint="Separate with commas, spaces or new lines (min 2 values).">
        <textarea
          className="afc-input afc-textarea"
          rows={3}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. 4, 8, 15, 16, 23, 42"
        />
      </Field>

      {result ? (
        <ResultPanel title="Standard deviation">
          <ResultStat label="Sample std. dev. (s)" value={fmt(result.sampSd, 4)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Population std. dev. (σ)" value={fmt(result.popSd, 4)} />
            <ResultRow label="Sample variance (s²)" value={fmt(result.sampVar, 4)} />
            <ResultRow label="Population variance (σ²)" value={fmt(result.popVar, 4)} />
            <ResultRow label="Mean" value={fmt(result.mean, 4)} />
            <ResultRow label="Count" value={result.n} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Standard deviation" muted>
          <p className="afc-note">Enter at least two numbers.</p>
        </ResultPanel>
      )}
    </div>
  );
}
