"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money, round } from "./format";

export default function FuelCostCalculator() {
  const [distance, setDistance] = useState("300");
  const [mileage, setMileage] = useState("18");
  const [price, setPrice] = useState("100");

  const result = useMemo(() => {
    const d = num(distance);
    const m = num(mileage);
    const p = num(price);
    if (d === null || m === null || p === null || m <= 0 || d < 0 || p < 0) return null;
    const litres = d / m;
    const cost = litres * p;
    return { litres, cost, perKm: cost / (d || 1) };
  }, [distance, mileage, price]);

  return (
    <div className="afc-calc">
      <Grid cols={3}>
        <Field label="Trip distance">
          <NumberInput suffix="km" value={distance} min="0" onChange={(e) => setDistance(e.target.value)} />
        </Field>
        <Field label="Mileage">
          <NumberInput suffix="km/L" value={mileage} min="0" onChange={(e) => setMileage(e.target.value)} />
        </Field>
        <Field label="Fuel price">
          <NumberInput prefix="₹" suffix="/L" value={price} min="0" onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Trip cost">
          <ResultStat label="Total fuel cost" value={`₹ ${money(result.cost)}`} accent />
          <div className="afc-result-rows">
            <ResultRow label="Fuel needed" value={`${round(result.litres, 2)} L`} />
            <ResultRow label="Cost per km" value={`₹ ${money(result.perKm)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Trip cost" muted>
          <p className="afc-note">Enter distance, mileage and fuel price.</p>
        </ResultPanel>
      )}
    </div>
  );
}
