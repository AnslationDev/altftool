"use client";
import React, { useMemo, useState } from "react";
import { Field, NumberInput, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, fmt, money, plural } from "./format";

export default function ElectricityCostCalculator() {
  const [power, setPower] = useState("1500");
  const [hours, setHours] = useState("6");
  const [days, setDays] = useState("30");
  const [rate, setRate] = useState("8");

  const result = useMemo(() => {
    const W = num(power), h = num(hours), d = num(days), c = num(rate);
    if (W === null || h === null || d === null || c === null) return null;
    if (W < 0 || h < 0 || d < 0 || c < 0) return null;
    const kwhPerDay = (W / 1000) * h;
    const kwhTotal = kwhPerDay * d;
    const costPerDay = kwhPerDay * c;
    const costTotal = kwhTotal * c;
    return { kwhPerDay, kwhTotal, costPerDay, costTotal, days: d };
  }, [power, hours, days, rate]);

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Appliance power" hint="Watts (W)">
          <NumberInput suffix="W" value={power} min="0" step="any" onChange={(e) => setPower(e.target.value)} />
        </Field>
        <Field label="Hours used per day" hint="0 – 24">
          <NumberInput suffix="h" value={hours} min="0" step="any" onChange={(e) => setHours(e.target.value)} />
        </Field>
        <Field label="Number of days">
          <NumberInput value={days} min="0" step="1" onChange={(e) => setDays(e.target.value)} />
        </Field>
        <Field label="Cost per unit (kWh)">
          <NumberInput prefix="₹" value={rate} min="0" step="any" onChange={(e) => setRate(e.target.value)} />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Running cost">
          <ResultStat
            label={`Total cost over ${plural(result.days, "day", "days")}`}
            value={`₹ ${money(result.costTotal)}`}
            sub={`${fmt(result.kwhTotal, 2)} kWh consumed`}
            accent
          />
          <div className="afc-result-rows">
            <ResultRow label="Energy per day" value={`${fmt(result.kwhPerDay, 3)} kWh`} />
            <ResultRow label="Cost per day" value={`₹ ${money(result.costPerDay)}`} />
            <ResultRow label="Total energy" value={`${fmt(result.kwhTotal, 2)} kWh`} />
            <ResultRow label="Total cost" value={`₹ ${money(result.costTotal)}`} strong />
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Running cost" muted>
          <CalcNote>Enter the appliance wattage, usage hours, days and your electricity tariff.</CalcNote>
        </ResultPanel>
      )}
    </div>
  );
}
