"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow } from "./ui";
import { num, money } from "./format";

export default function UnitPriceCalculator() {
  const [priceA, setPriceA] = useState("120");
  const [qtyA, setQtyA] = useState("500");
  const [priceB, setPriceB] = useState("210");
  const [qtyB, setQtyB] = useState("1000");

  const result = useMemo(() => {
    const pa = num(priceA);
    const qa = num(qtyA);
    const pb = num(priceB);
    const qb = num(qtyB);
    if (pa === null || qa === null || pb === null || qb === null || qa <= 0 || qb <= 0) return null;
    const unitA = pa / qa;
    const unitB = pb / qb;
    const cheaper = unitA === unitB ? "equal" : unitA < unitB ? "A" : "B";
    const save = Math.abs(unitA - unitB) / Math.max(unitA, unitB) * 100;
    return { unitA, unitB, cheaper, save };
  }, [priceA, qtyA, priceB, qtyB]);

  return (
    <div className="afc-calc">
      <div className="afc-compare">
        <div className={`afc-compare-col ${result?.cheaper === "A" ? "win" : ""}`}>
          <div className="afc-compare-head">Product A</div>
          <Grid cols={2}>
            <Field label="Price">
              <NumberInput prefix="₹" value={priceA} min="0" onChange={(e) => setPriceA(e.target.value)} />
            </Field>
            <Field label="Quantity">
              <NumberInput suffix="units" value={qtyA} min="0" onChange={(e) => setQtyA(e.target.value)} />
            </Field>
          </Grid>
        </div>
        <div className={`afc-compare-col ${result?.cheaper === "B" ? "win" : ""}`}>
          <div className="afc-compare-head">Product B</div>
          <Grid cols={2}>
            <Field label="Price">
              <NumberInput prefix="₹" value={priceB} min="0" onChange={(e) => setPriceB(e.target.value)} />
            </Field>
            <Field label="Quantity">
              <NumberInput suffix="units" value={qtyB} min="0" onChange={(e) => setQtyB(e.target.value)} />
            </Field>
          </Grid>
        </div>
      </div>

      {result ? (
        <ResultPanel title="Best value">
          <ResultStat
            label={result.cheaper === "equal" ? "Both are equal value" : `Product ${result.cheaper} is cheaper per unit`}
            value={result.cheaper === "equal" ? "—" : `Save ${result.save.toFixed(1)}%`}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label="Product A — price per unit" value={`₹ ${money(result.unitA, 4)}`} />
            <ResultRow label="Product B — price per unit" value={`₹ ${money(result.unitB, 4)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Best value" muted>
          <p className="afc-note">Enter price and quantity for both products.</p>
        </ResultPanel>
      )}
    </div>
  );
}
