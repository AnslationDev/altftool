"use client";

import React, { useMemo, useState } from "react";
import { Field, TextInput, Segmented, CopyField, ResultPanel, ResultRow } from "./ui";

const UNITS = [
  { label: "Seconds", value: "s" },
  { label: "Milliseconds", value: "ms" },
];

export default function TimestampConverter() {
  // Captured once when the tool mounts.
  const [now] = useState(() => new Date());

  const [ts, setTs] = useState(String(Math.floor(now.getTime() / 1000)));
  const [unit, setUnit] = useState("s");
  const [dt, setDt] = useState("");

  // Section A: unix timestamp -> human dates.
  const fromTs = useMemo(() => {
    const raw = ts.trim();
    if (!raw) return { empty: true };
    const n = Number(raw);
    if (!Number.isFinite(n)) return { error: "Enter a numeric timestamp." };
    const ms = unit === "s" ? n * 1000 : n;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return { error: "Timestamp is out of range." };
    return {
      local: d.toLocaleString(),
      utc: d.toUTCString(),
      iso: d.toISOString(),
    };
  }, [ts, unit]);

  // Section B: date -> unix timestamp.
  const fromDate = useMemo(() => {
    if (!dt) return { empty: true };
    const d = new Date(dt);
    if (Number.isNaN(d.getTime())) return { error: "Pick a valid date and time." };
    const ms = d.getTime();
    return { seconds: Math.floor(ms / 1000), ms };
  }, [dt]);

  return (
    <div className="afc-calc">
      <ResultPanel title="Current timestamp">
        <div className="afc-result-rows">
          <ResultRow label="Unix (seconds)" value={String(Math.floor(now.getTime() / 1000))} strong />
          <ResultRow label="Unix (milliseconds)" value={String(now.getTime())} />
          <ResultRow label="ISO 8601" value={now.toISOString()} />
        </div>
      </ResultPanel>

      <div className="afc-conv-row">
        <Field label="Unix timestamp">
          <TextInput
            inputMode="numeric"
            value={ts}
            placeholder="1753056000"
            onChange={(e) => setTs(e.target.value)}
          />
        </Field>
        <Field label="Unit">
          <Segmented options={UNITS} value={unit} onChange={setUnit} name="ts-unit" />
        </Field>
      </div>

      {fromTs.empty ? (
        <ResultPanel title="Timestamp → date" muted>
          <p className="afc-note">Enter a Unix timestamp to convert to a date.</p>
        </ResultPanel>
      ) : fromTs.error ? (
        <ResultPanel title="Timestamp → date">
          <p className="afc-error">{fromTs.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Timestamp → date">
          <div className="afc-result-rows">
            <ResultRow label="Local time" value={fromTs.local} strong />
            <ResultRow label="UTC" value={fromTs.utc} />
            <ResultRow label="ISO 8601" value={fromTs.iso} />
          </div>
        </ResultPanel>
      )}

      <Field label="Date &amp; time" hint="Interpreted in your local time zone.">
        <TextInput type="datetime-local" value={dt} onChange={(e) => setDt(e.target.value)} />
      </Field>

      {fromDate.empty ? (
        <ResultPanel title="Date → timestamp" muted>
          <p className="afc-note">Pick a date and time to convert to a Unix timestamp.</p>
        </ResultPanel>
      ) : fromDate.error ? (
        <ResultPanel title="Date → timestamp">
          <p className="afc-error">{fromDate.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Date → timestamp">
          <CopyField value={String(fromDate.seconds)} label="Unix seconds" />
          <div className="afc-result-rows" style={{ marginTop: 10 }}>
            <ResultRow label="Seconds" value={String(fromDate.seconds)} strong />
            <ResultRow label="Milliseconds" value={String(fromDate.ms)} />
          </div>
        </ResultPanel>
      )}
    </div>
  );
}
