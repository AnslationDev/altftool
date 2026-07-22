"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, round } from "./format";

// U.S. Navy body-fat method (measurements in cm).
export default function BodyFatCalculator() {
  const [sex, setSex] = useState("male");
  const [height, setHeight] = useState("175");
  const [neck, setNeck] = useState("38");
  const [waist, setWaist] = useState("85");
  const [hip, setHip] = useState("95");

  const result = useMemo(() => {
    const h = num(height);
    const n = num(neck);
    const w = num(waist);
    const hp = num(hip);
    if (h === null || n === null || w === null || h <= 0 || n <= 0 || w <= 0) return null;

    let bf;
    if (sex === "male") {
      if (w - n <= 0) return null;
      bf = 495 / (1.0324 - 0.19077 * Math.log10(w - n) + 0.15456 * Math.log10(h)) - 450;
    } else {
      if (hp === null || hp <= 0 || w + hp - n <= 0) return null;
      bf = 495 / (1.29579 - 0.35004 * Math.log10(w + hp - n) + 0.221 * Math.log10(h)) - 450;
    }
    if (!Number.isFinite(bf) || bf <= 0) return null;

    let cat;
    if (sex === "male") {
      cat = bf < 6 ? "Essential fat" : bf < 14 ? "Athletic" : bf < 18 ? "Fitness" : bf < 25 ? "Average" : "Above average";
    } else {
      cat = bf < 14 ? "Essential fat" : bf < 21 ? "Athletic" : bf < 25 ? "Fitness" : bf < 32 ? "Average" : "Above average";
    }
    return { bf: round(bf, 1), cat };
  }, [sex, height, neck, waist, hip]);

  return (
    <div className="afc-calc">
      <Field label="Sex">
        <Segmented
          name="sex"
          value={sex}
          onChange={setSex}
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
          ]}
        />
      </Field>
      <Grid cols={2}>
        <Field label="Height">
          <NumberInput suffix="cm" value={height} min="0" onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label="Neck">
          <NumberInput suffix="cm" value={neck} min="0" onChange={(e) => setNeck(e.target.value)} />
        </Field>
        <Field label="Waist">
          <NumberInput suffix="cm" value={waist} min="0" onChange={(e) => setWaist(e.target.value)} />
        </Field>
        {sex === "female" ? (
          <Field label="Hip">
            <NumberInput suffix="cm" value={hip} min="0" onChange={(e) => setHip(e.target.value)} />
          </Field>
        ) : null}
      </Grid>

      {result ? (
        <ResultPanel title="Body fat estimate">
          <ResultStat label={result.cat} value={`${result.bf}%`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Method" value="U.S. Navy circumference" strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Body fat estimate" muted>
          <p className="afc-note">Enter your measurements to estimate body fat.</p>
        </ResultPanel>
      )}
    </div>
  );
}
