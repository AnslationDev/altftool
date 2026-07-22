"use client";
import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt } from "./format";

export default function SpeedCalculator() {
  const [speed, setSpeed] = useState("");
  const [distance, setDistance] = useState("240");
  const [time, setTime] = useState("3");

  const result = useMemo(() => {
    const S = num(speed), D = num(distance), T = num(time);
    const filled = [S, D, T].filter((x) => x !== null).length;
    if (filled < 2) return { status: "few" };
    if (filled > 2) return { status: "many" };

    let s = S, d = D, t = T, solved;
    if (S === null) {
      if (T === 0) return { status: "err", msg: "Time cannot be zero when solving for speed." };
      s = D / T;
      solved = "speed";
    } else if (D === null) {
      d = S * T;
      solved = "distance";
    } else {
      if (S === 0) return { status: "err", msg: "Speed cannot be zero when solving for time." };
      t = D / S;
      solved = "time";
    }
    return { status: "ok", s, d, t, solved };
  }, [speed, distance, time]);

  const headline =
    result.status === "ok"
      ? result.solved === "speed"
        ? { label: "Speed", value: `${fmt(result.s, 3)} km/h`, sub: `${fmt(result.s / 3.6, 3)} m/s` }
        : result.solved === "distance"
        ? { label: "Distance", value: `${fmt(result.d, 3)} km` }
        : { label: "Time", value: `${fmt(result.t, 3)} h`, sub: `${fmt(result.t * 60, 2)} min` }
      : null;

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Speed" hint="km per hour">
          <NumberInput suffix="km/h" value={speed} min="0" step="any" placeholder="—" onChange={(e) => setSpeed(e.target.value)} />
        </Field>
        <Field label="Distance" hint="kilometres">
          <NumberInput suffix="km" value={distance} min="0" step="any" placeholder="—" onChange={(e) => setDistance(e.target.value)} />
        </Field>
        <Field label="Time" hint="hours">
          <NumberInput suffix="h" value={time} min="0" step="any" placeholder="—" onChange={(e) => setTime(e.target.value)} />
        </Field>
      </Grid>

      {result.status === "ok" ? (
        <ResultPanel title="Solution">
          <ResultStat label={headline.label} value={headline.value} sub={headline.sub} accent />
          <div className="afc-result-rows">
            <ResultRow label="Speed" value={`${fmt(result.s, 3)} km/h`} strong={result.solved === "speed"} />
            <ResultRow label="Distance" value={`${fmt(result.d, 3)} km`} strong={result.solved === "distance"} />
            <ResultRow label="Time" value={`${fmt(result.t, 3)} h`} strong={result.solved === "time"} />
          </div>
          <CalcNote>speed = distance ÷ time,  distance = speed × time,  time = distance ÷ speed.</CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Solution" muted>
          <CalcNote>
            {result.status === "err"
              ? result.msg
              : result.status === "many"
              ? "Enter exactly two values — clear one field to solve for the third."
              : "Enter any two of speed, distance or time to solve for the third."}
          </CalcNote>
        </ResultPanel>
      )}
    </div>
  );
}
