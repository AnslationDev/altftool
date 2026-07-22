"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, fmt } from "./format";

// 1 US mpg = (miles->km) / (gallons->litres) = 1.609344 / 3.785411784 km/L.
const MPG_TO_KMPL = 1.609344 / 3.785411784; // ≈ 0.4251437

export default function MileageCalculator() {
  const [unit, setUnit] = useState("metric"); // "metric" | "imperial"
  const [distance, setDistance] = useState("420");
  const [fuel, setFuel] = useState("30");

  const metric = unit === "metric";

  const r = useMemo(() => {
    const d = num(distance);
    const f = num(fuel);
    if (d === null || f === null || d < 0 || f <= 0) return null;
    const eff = d / f; // km/L in metric mode, mpg in imperial mode
    let kmpl, mpg;
    if (metric) {
      kmpl = eff;
      mpg = eff / MPG_TO_KMPL;
    } else {
      mpg = eff;
      kmpl = eff * MPG_TO_KMPL;
    }
    const l100 = kmpl > 0 ? 100 / kmpl : null; // litres per 100 km
    return { eff, kmpl, mpg, l100 };
  }, [distance, fuel, metric]);

  const distUnit = metric ? "km" : "mi";
  const fuelUnit = metric ? "L" : "gal";
  const effUnit = metric ? "km/L" : "mpg";

  return (
    <div className="afc-calc">
      <Field label="Units">
        <Segmented
          name="units"
          value={unit}
          onChange={setUnit}
          options={[
            { label: "km & litres", value: "metric" },
            { label: "miles & gallons", value: "imperial" },
          ]}
        />
      </Field>

      <Grid cols={2}>
        <Field label="Distance travelled">
          <NumberInput suffix={distUnit} value={distance} min="0" onChange={(e) => setDistance(e.target.value)} />
        </Field>
        <Field label="Fuel used">
          <NumberInput suffix={fuelUnit} value={fuel} min="0" step="0.1" onChange={(e) => setFuel(e.target.value)} />
        </Field>
      </Grid>

      {r ? (
        <ResultPanel title="Fuel efficiency">
          <ResultStat label="Fuel economy" value={`${fmt(r.eff, 2)} ${effUnit}`} accent />
          <div className="afc-result-rows">
            <ResultRow
              label={metric ? "Equivalent (US)" : "Equivalent (metric)"}
              value={metric ? `${fmt(r.mpg, 2)} mpg` : `${fmt(r.kmpl, 2)} km/L`}
            />
            <ResultRow label="Consumption" value={r.l100 !== null ? `${fmt(r.l100, 2)} L/100km` : "—"} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Fuel efficiency" muted>
          <p className="afc-note">Enter distance travelled and fuel used.</p>
        </ResultPanel>
      )}
    </div>
  );
}
