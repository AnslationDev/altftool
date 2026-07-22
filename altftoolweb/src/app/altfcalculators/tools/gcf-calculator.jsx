"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, ResultPanel, ResultStat, ResultRow } from "./ui";
import { parseNumbers, lcm, gcd, fmt } from "./format";

export default function GcfCalculator() {
  const [text, setText] = useState("24, 36, 60");

  const result = useMemo(() => {
    const nums = parseNumbers(text);
    if (nums.length < 2) return { state: "empty" };
    if (nums.some((n) => !Number.isInteger(n))) return { state: "notInt" };
    if (nums.some((n) => n === 0)) return { state: "zero" };
    const ints = nums.map((n) => Math.abs(n));
    const gcfAll = ints.reduce((acc, n) => gcd(acc, n));
    const lcmAll = ints.reduce((acc, n) => lcm(acc, n));
    return { state: "ok", gcfAll, lcmAll, ints };
  }, [text]);

  return (
    <div className="afc-calc">
      <Field label="Numbers" hint="Enter two or more whole numbers, separated by commas, spaces or new lines.">
        <TextArea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 24, 36, 60" />
      </Field>

      {result.state === "ok" ? (
        <ResultPanel title="Greatest common factor">
          <ResultStat label={`GCF (HCF) of ${result.ints.join(", ")}`} value={fmt(result.gcfAll, 0)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Least common multiple (LCM)" value={fmt(result.lcmAll, 0)} />
            <ResultRow label="Count of numbers" value={result.ints.length} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Greatest common factor" muted>
          {result.state === "notInt" ? (
            <p className="afc-error">The GCF is only defined for whole numbers. Remove any decimals.</p>
          ) : result.state === "zero" ? (
            <p className="afc-error">Zero has no greatest common factor. Use non-zero whole numbers.</p>
          ) : (
            <p className="afc-note">Enter at least two whole numbers.</p>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
