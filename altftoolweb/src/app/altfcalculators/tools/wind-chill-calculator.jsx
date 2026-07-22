"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, round } from "./format";

const toF = (c) => (c * 9) / 5 + 32;
const toC = (f) => ((f - 32) * 5) / 9;
const KMH_PER_MPH = 1.609344;

// Approximate NWS frostbite risk, based on the wind chill in °F.
function frostbite(wcF) {
  if (wcF > -18) return { tag: "Low frostbite risk", note: "Frostbite is unlikely for most people at this wind chill." };
  if (wcF > -35) return { tag: "Frostbite risk — about 30 min", note: "Exposed skin may develop frostbite within about 30 minutes." };
  if (wcF > -55) return { tag: "Frostbite risk — about 10 min", note: "Exposed skin may develop frostbite within about 10 minutes." };
  return { tag: "Severe frostbite risk — about 5 min", note: "Exposed skin may develop frostbite within about 5 minutes." };
}

export default function WindChillCalculator() {
  const [unit, setUnit] = useState("C");
  const [temp, setTemp] = useState("-5");
  const [windUnit, setWindUnit] = useState("kmh");
  const [wind, setWind] = useState("25");

  const result = useMemo(() => {
    const t = num(temp);
    const w = num(wind);
    if (t === null || w === null || w < 0) return null;
    const T = unit === "C" ? toF(t) : t; // temperature in °F
    const V = windUnit === "kmh" ? w / KMH_PER_MPH : w; // wind speed in mph

    // NWS 2001 wind chill is only defined for T ≤ 50 °F and V > 3 mph.
    const applicable = T <= 50 && V > 3;
    let wcF;
    if (applicable) {
      const vp = Math.pow(V, 0.16);
      wcF = 35.74 + 0.6215 * T - 35.75 * vp + 0.4275 * T * vp;
    } else {
      wcF = T; // feels-like ≈ air temperature
    }

    return { applicable, wcF, wcC: toC(wcF), risk: frostbite(wcF) };
  }, [unit, temp, wind, windUnit]);

  const selectedWC = result ? (unit === "C" ? `${round(result.wcC, 1)} °C` : `${round(result.wcF, 1)} °F`) : "";
  const otherWC = result ? (unit === "C" ? `${round(result.wcF, 1)} °F` : `${round(result.wcC, 1)} °C`) : "";

  return (
    <div className="afc-calc">
      <Grid cols={2}>
        <Field label="Temperature unit">
          <Segmented
            name="unit"
            value={unit}
            onChange={setUnit}
            options={[
              { label: "Celsius (°C)", value: "C" },
              { label: "Fahrenheit (°F)", value: "F" },
            ]}
          />
        </Field>
        <Field label="Wind speed unit">
          <Segmented
            name="windUnit"
            value={windUnit}
            onChange={setWindUnit}
            options={[
              { label: "km/h", value: "kmh" },
              { label: "mph", value: "mph" },
            ]}
          />
        </Field>
      </Grid>

      <Grid cols={2}>
        <Field label="Air temperature">
          <NumberInput
            suffix={unit === "C" ? "°C" : "°F"}
            value={temp}
            step="0.1"
            onChange={(e) => setTemp(e.target.value)}
          />
        </Field>
        <Field label="Wind speed">
          <NumberInput
            suffix={windUnit === "kmh" ? "km/h" : "mph"}
            value={wind}
            min="0"
            step="0.1"
            onChange={(e) => setWind(e.target.value)}
          />
        </Field>
      </Grid>

      {result ? (
        result.applicable ? (
          <ResultPanel title="Wind chill (feels like)">
            <ResultStat label={result.risk.tag} value={selectedWC} sub={otherWC} accent />
            <div className="afc-result-rows">
              <ResultRow label="Wind chill (°F)" value={`${round(result.wcF, 1)} °F`} />
              <ResultRow label="Wind chill (°C)" value={`${round(result.wcC, 1)} °C`} strong />
            </div>
            <CalcNote>{`${result.risk.note} Keep skin covered and limit time outdoors in these conditions.`}</CalcNote>
          </ResultPanel>
        ) : (
          <ResultPanel title="Wind chill (feels like)" muted>
            <ResultStat label="Wind chill not applicable" value={selectedWC} />
            <CalcNote>
              Wind chill is only defined for air temperatures at or below 10 °C (50 °F) with wind above about 4.8 km/h (3 mph). Outside that range the ‘feels like’ temperature is essentially the air temperature.
            </CalcNote>
          </ResultPanel>
        )
      ) : (
        <ResultPanel title="Wind chill (feels like)" muted>
          <p className="afc-note">Enter the air temperature and wind speed.</p>
        </ResultPanel>
      )}
    </div>
  );
}
