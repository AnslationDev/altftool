"use client";

import React, { useMemo, useState } from "react";
import { Field, NumberInput, Segmented, Grid, ResultPanel, ResultStat, ResultRow, CalcNote } from "./ui";
import { num, round, clamp } from "./format";

const toF = (c) => (c * 9) / 5 + 32;
const toC = (f) => ((f - 32) * 5) / 9;

// NWS heat index risk bands, based on the heat index in °F.
function riskCategory(hiF) {
  if (hiF < 80) return "No significant risk";
  if (hiF < 90) return "Caution";
  if (hiF < 103) return "Extreme caution";
  if (hiF < 125) return "Danger";
  return "Extreme danger";
}

function riskNote(hiF) {
  if (hiF < 80) return "Comfortable range — heat stress is unlikely under normal activity.";
  if (hiF < 90) return "Fatigue is possible with prolonged exposure and physical activity.";
  if (hiF < 103) return "Heat cramps and heat exhaustion are possible with prolonged exposure and activity.";
  if (hiF < 125) return "Heat cramps or heat exhaustion are likely, and heat stroke is possible with continued exposure.";
  return "Heat stroke is highly likely with continued exposure.";
}

export default function HeatIndexCalculator() {
  const [unit, setUnit] = useState("C");
  const [temp, setTemp] = useState("32");
  const [humidity, setHumidity] = useState("70");

  const result = useMemo(() => {
    const t = num(temp);
    const rRaw = num(humidity);
    if (t === null || rRaw === null) return null;
    const R = clamp(rRaw, 0, 100);
    const T = unit === "C" ? toF(t) : t; // temperature in °F

    let hiF;
    let meaningful;
    if (T < 80) {
      // Rothfusz regression is not defined below ~80 °F; feels-like ≈ air temp.
      meaningful = false;
      hiF = T;
    } else {
      meaningful = true;
      hiF =
        -42.379 +
        2.04901523 * T +
        10.14333127 * R -
        0.22475541 * T * R -
        0.00683783 * T * T -
        0.05481717 * R * R +
        0.00122874 * T * T * R +
        0.00085282 * T * R * R -
        0.00000199 * T * T * R * R;
      // NWS corrections for extreme humidity ranges.
      if (R < 13 && T >= 80 && T <= 112) {
        hiF -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      } else if (R > 85 && T >= 80 && T <= 87) {
        hiF += ((R - 85) / 10) * ((87 - T) / 5);
      }
    }

    return {
      hiF,
      hiC: toC(hiF),
      meaningful,
      risk: riskCategory(hiF),
      note: riskNote(hiF),
      humidity: R,
    };
  }, [unit, temp, humidity]);

  const selectedHI = result ? (unit === "C" ? `${round(result.hiC, 1)} °C` : `${round(result.hiF, 1)} °F`) : "";
  const otherHI = result ? (unit === "C" ? `${round(result.hiF, 1)} °F` : `${round(result.hiC, 1)} °C`) : "";

  return (
    <div className="afc-calc">
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

      <Grid cols={2}>
        <Field label="Air temperature">
          <NumberInput
            suffix={unit === "C" ? "°C" : "°F"}
            value={temp}
            step="0.1"
            onChange={(e) => setTemp(e.target.value)}
          />
        </Field>
        <Field label="Relative humidity">
          <NumberInput
            suffix="%"
            value={humidity}
            min="0"
            max="100"
            step="1"
            onChange={(e) => setHumidity(e.target.value)}
          />
        </Field>
      </Grid>

      {result ? (
        <ResultPanel title="Heat index (feels like)">
          <ResultStat label={result.risk} value={selectedHI} sub={otherHI} accent />
          <div className="afc-result-rows">
            <ResultRow label="Heat index (°F)" value={`${round(result.hiF, 1)} °F`} />
            <ResultRow label="Heat index (°C)" value={`${round(result.hiC, 1)} °C`} />
            <ResultRow label="Relative humidity" value={`${round(result.humidity, 0)} %`} strong />
          </div>
          <CalcNote>
            {result.meaningful
              ? `${result.note} Values assume shade and light wind — direct sun can raise the heat index by up to about 8 °C (15 °F).`
              : "Below about 27 °C (80 °F) the heat index is not defined, so the ‘feels like’ temperature is essentially the same as the air temperature."}
          </CalcNote>
        </ResultPanel>
      ) : (
        <ResultPanel title="Heat index (feels like)" muted>
          <p className="afc-note">Enter the air temperature and relative humidity.</p>
        </ResultPanel>
      )}
    </div>
  );
}
