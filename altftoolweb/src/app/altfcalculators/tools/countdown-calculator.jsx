"use client";

import React, { useMemo, useState } from "react";
import { Field, TextInput, ResultPanel, ResultStat, ResultRow } from "./ui";
import { fmt } from "./format";

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CountdownCalculator() {
  const [target, setTarget] = useState("2026-12-31");

  const result = useMemo(() => {
    if (!target) return null;
    const t = new Date(target);
    if (Number.isNaN(t.getTime())) return null;
    const today = startOfDay(new Date());
    const tDay = startOfDay(t);
    const msPerDay = 86400000;
    const days = Math.round((tDay - today) / msPerDay);

    const past = days < 0;
    const abs = Math.abs(days);
    return {
      days,
      past,
      abs,
      weeks: Math.floor(abs / 7),
      remDays: abs % 7,
      months: Math.round(abs / 30.44),
    };
  }, [target]);

  return (
    <div className="afc-calc">
      <Field label="Target date">
        <TextInput type="date" value={target} onChange={(e) => setTarget(e.target.value)} />
      </Field>

      {result ? (
        <ResultPanel title={result.past ? "Days since" : "Days remaining"}>
          <ResultStat
            label={result.days === 0 ? "That's today!" : result.past ? "days ago" : "days to go"}
            value={result.days === 0 ? "🎉" : fmt(result.abs, 0)}
            accent
          />
          {result.days !== 0 ? (
            <div className="afc-result-rows">
              <ResultRow label="In weeks" value={`${fmt(result.weeks, 0)} weeks, ${result.remDays} days`} />
              <ResultRow label="Approx. months" value={`${fmt(result.months, 0)} months`} strong />
            </div>
          ) : null}
        </ResultPanel>
      ) : (
        <ResultPanel title="Days remaining" muted>
          <p className="afc-note">Pick a target date to start the countdown.</p>
        </ResultPanel>
      )}
    </div>
  );
}
