"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, ResultPanel, ResultStat, ResultRow } from "./ui";
import { parseNumbers, lcm, gcd, fmt } from "./format";

export default function LcmCalculator() {
  const [text, setText] = useState("12, 18, 24");

  const result = useMemo(() => {
    const nums = parseNumbers(text);
    if (nums.length < 2) return { state: "empty" };
    if (nums.some((n) => !Number.isInteger(n))) return { state: "notInt" };
    if (nums.some((n) => n === 0)) return { state: "zero" };
    const ints = nums.map((n) => Math.abs(n));
    const lcmAll = ints.reduce((acc, n) => lcm(acc, n));
    const gcfAll = ints.reduce((acc, n) => gcd(acc, n));
    return { state: "ok", lcmAll, gcfAll, ints };
  }, [text]);

  return (
    <div className="afc-calc">
      <Field label="Numbers" hint="Enter two or more whole numbers, separated by commas, spaces or new lines.">
        <TextArea rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. 12, 18, 24" />
      </Field>

      {result.state === "ok" ? (
        <ResultPanel title="Least common multiple">
          <ResultStat label={`LCM of ${result.ints.join(", ")}`} value={fmt(result.lcmAll, 0)} accent />
          <div className="afc-result-rows">
            <ResultRow label="Greatest common factor (GCF)" value={fmt(result.gcfAll, 0)} />
            <ResultRow label="Count of numbers" value={result.ints.length} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Least common multiple" muted>
          {result.state === "notInt" ? (
            <p className="afc-error">The LCM is only defined for whole numbers. Remove any decimals.</p>
          ) : result.state === "zero" ? (
            <p className="afc-error">Zero has no least common multiple. Use non-zero whole numbers.</p>
          ) : (
            <p className="afc-note">Enter at least two whole numbers.</p>
          )}
        </ResultPanel>
      )}
    </div>
  );
}
