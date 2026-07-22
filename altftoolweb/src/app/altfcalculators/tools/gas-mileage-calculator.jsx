"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt, money } from "./format";

// 1 US mpg = 1.609344 / 3.785411784 km/L ≈ 0.425144.
const MPG_TO_KMPL = 1.609344 / 3.785411784;

export default function GasMileageCalculator() {
  const [units, setUnits] = useState("us"); // "us" = mi/gal, "metric" = km/L
  const [distance, setDistance] = useState("300");
  const [fuel, setFuel] = useState("12");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("$");

  const metric = units === "metric";
  const distUnit = metric ? "km" : "mi";
  const fuelUnit = metric ? "L" : "gal";

  const r = useMemo(() => {
    const d = num(distance);
    const g = num(fuel);
    const p = num(price);
    if (d === null || g === null || d < 0 || g <= 0) return null;

    // Base economy in km/L, derived from whichever units were entered.
    const kmpl = metric ? d / g : (d / g) * MPG_TO_KMPL;
    const mpg = kmpl / MPG_TO_KMPL;
    const l100 = 100 / kmpl;

    const cost = p !== null && p >= 0 ? g * p : null; // fuel × price-per-unit
    const costPerDist = cost !== null && d > 0 ? cost / d : null;
    return { kmpl, mpg, l100, cost, costPerDist };
  }, [distance, fuel, price, metric]);

  return (
    <div className="afc-calc">
      <Field label="Units">
        <Segmented
          name="units"
          value={units}
          onChange={setUnits}
          options={[
            { label: "US (mi, gal)", value: "us" },
            { label: "Metric (km, L)", value: "metric" },
          ]}
        />
      </Field>

      <Grid cols={3}>
        <Field label="Trip distance">
          <NumberInput suffix={distUnit} value={distance} min="0" onChange={(e) => setDistance(e.target.value)} />
        </Field>
        <Field label="Fuel used">
          <NumberInput suffix={fuelUnit} value={fuel} min="0" step="0.1" onChange={(e) => setFuel(e.target.value)} />
        </Field>
        <Field label="Fuel price" hint={`Optional — per ${fuelUnit}, for trip cost`}>
          <NumberInput prefix={currency} suffix={`/${fuelUnit}`} value={price} min="0" step="0.01" onChange={(e) => setPrice(e.target.value)} />
        </Field>
      </Grid>

      <Field label="Currency">
        <Segmented
          name="currency"
          value={currency}
          onChange={setCurrency}
          options={[
            { label: "$ Dollar", value: "$" },
            { label: "₹ Rupee", value: "₹" },
          ]}
        />
      </Field>

      {r ? (
        <ResultPanel title="Gas mileage">
          <ResultStat
            label="Fuel economy"
            value={metric ? `${fmt(r.kmpl, 2)} km/L` : `${fmt(r.mpg, 2)} mpg`}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label={metric ? "US economy" : "Metric economy"} value={metric ? `${fmt(r.mpg, 2)} mpg` : `${fmt(r.kmpl, 2)} km/L`} />
            <ResultRow label="Consumption" value={`${fmt(r.l100, 2)} L/100km`} />
            {r.cost !== null ? <ResultRow label="Trip fuel cost" value={`${currency} ${money(r.cost)}`} strong /> : null}
            {r.costPerDist !== null ? <ResultRow label={`Cost per ${distUnit}`} value={`${currency} ${money(r.costPerDist)}`} /> : null}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Gas mileage" muted>
          <p className="afc-note">Enter trip distance and fuel used.</p>
        </ResultPanel>
      )}
    </div>
  );
}
