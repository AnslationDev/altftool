"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, CalcNote } from "./ui";
import { num } from "./format";

const ZONES = [
  { name: "Warm-up", low: 0.5, high: 0.6 },
  { name: "Fat burn", low: 0.6, high: 0.7 },
  { name: "Cardio (aerobic)", low: 0.7, high: 0.8 },
  { name: "Peak (anaerobic)", low: 0.8, high: 0.9 },
];

export default function TargetHeartRateCalculator() {
  const [age, setAge] = useState("30");
  const [resting, setResting] = useState("");

  const result = useMemo(() => {
    const a = num(age);
    if (a === null || a <= 0 || a >= 130) return null;
    const maxHR = 220 - a;
    const rhr = num(resting);
    const useKarvonen = rhr !== null && rhr > 0 && rhr < maxHR;
    const bpm = (intensity) =>
      useKarvonen ? Math.round((maxHR - rhr) * intensity + rhr) : Math.round(maxHR * intensity);
    const zones = ZONES.map((z) => ({
      name: z.name,
      pct: `${Math.round(z.low * 100)}–${Math.round(z.high * 100)}%`,
      range: `${bpm(z.low)}–${bpm(z.high)} bpm`,
    }));
    return { maxHR, useKarvonen, zones };
  }, [age, resting]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Age (years)">
          <NumberInput value={age} min="0" onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label="Resting heart rate (optional)" hint="Enables the more accurate Karvonen method.">
          <NumberInput suffix="bpm" value={resting} min="0" placeholder="e.g. 60" onChange={(e) => setResting(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Target heart-rate zones">
          <ResultStat label="Estimated maximum heart rate" value={`${result.maxHR} bpm`} sub="220 − age" accent />
          <div className="afc-table-wrap">
            <table className="afc-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Intensity</th>
                  <th>Target heart rate</th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((z) => (
                  <tr key={z.name}>
                    <td>{z.name}</td>
                    <td>{z.pct}</td>
                    <td>{z.range}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CalcNote>
            {result.useKarvonen
              ? "Zones use the Karvonen (heart-rate reserve) method: target = ((max HR − resting HR) × intensity) + resting HR."
              : "Zones use the percentage-of-maximum method. Add your resting heart rate for the more personalised Karvonen estimate."}
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Target heart-rate zones" muted>
          <p className="afc-note">Enter your age to see your training heart-rate zones.</p>
        </ResultPanel>
      )}
    </div>
  );
}
