"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

export default function DistanceCalculator() {
  const [x1, setX1] = useState("1");
  const [y1, setY1] = useState("2");
  const [x2, setX2] = useState("5");
  const [y2, setY2] = useState("6");

  const result = useMemo(() => {
    const ax = num(x1), ay = num(y1), bx = num(x2), by = num(y2);
    if (ax === null || ay === null || bx === null || by === null) return null;
    const dx = bx - ax;
    const dy = by - ay;
    return { dx, dy, dist: Math.sqrt(dx * dx + dy * dy) };
  }, [x1, y1, x2, y2]);

  return (
    <div className="afc-calc">
      <Field label="Point A (x₁, y₁)">
        <Grid cols={2}>
          <NumberInput value={x1} step="any" onChange={(e) => setX1(e.target.value)} placeholder="x₁" />
          <NumberInput value={y1} step="any" onChange={(e) => setY1(e.target.value)} placeholder="y₁" />
        </Grid>
      </Field>
      <Field label="Point B (x₂, y₂)">
        <Grid cols={2}>
          <NumberInput value={x2} step="any" onChange={(e) => setX2(e.target.value)} placeholder="x₂" />
          <NumberInput value={y2} step="any" onChange={(e) => setY2(e.target.value)} placeholder="y₂" />
        </Grid>
      </Field>

      {result ? (
        <ResultPanel title="Distance">
          <ResultStat label="Distance between A and B" value={fmt(result.dist, 6)} sub="units" accent />
          <div className="afc-result-rows">
            <ResultRow label="Δx (x₂ − x₁)" value={fmt(result.dx, 6)} />
            <ResultRow label="Δy (y₂ − y₁)" value={fmt(result.dy, 6)} />
            <ResultRow label="Formula" value="d = √(Δx² + Δy²)" strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Distance" muted>
          <p className="afc-note">Enter the coordinates of both points.</p>
        </ResultPanel>
      )}
    </div>
  );
}
