"use client";

import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { RefreshCw } from "lucide-react";
import { Field, NumberInput, Button, CopyField, ResultPanel } from "./ui";
import { clamp } from "./format";

function makeBatch(n) {
  return Array.from({ length: n }, () => uuidv4());
}

export default function UuidGenerator() {
  const [count, setCount] = useState("5");
  const [uuids, setUuids] = useState(() => makeBatch(5));

  const n = clamp(Math.round(Number(count) || 0), 1, 50);

  const generate = () => setUuids(makeBatch(n));

  return (
    <div className="afc-calc">
      <div className="afc-conv-row">
        <Field label="How many" hint="1 to 50 UUIDs (version 4, random).">
          <NumberInput
            value={count}
            min="1"
            max="50"
            step="1"
            onChange={(e) => setCount(e.target.value)}
          />
        </Field>
        <Field label="Generate">
          <div className="afc-actions">
            <Button variant="primary" onClick={generate}>
              <RefreshCw size={15} /> Generate
            </Button>
          </div>
        </Field>
      </div>

      {uuids.length ? (
        <ResultPanel title={`${uuids.length} UUID${uuids.length === 1 ? "" : "s"}`}>
          {uuids.length > 1 ? (
            <>
              <div className="afc-field-label" style={{ marginBottom: 6 }}>Copy all</div>
              <CopyField multiline value={uuids.join("\n")} label="All UUIDs" />
            </>
          ) : null}
          <div className="afc-result-rows" style={{ marginTop: uuids.length > 1 ? 12 : 0 }}>
            {uuids.map((u, i) => (
              <CopyField key={`${u}-${i}`} value={u} label={`UUID ${i + 1}`} />
            ))}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="UUIDs" muted>
          <p className="afc-note">Press Generate to create UUIDs.</p>
        </ResultPanel>
      )}
    </div>
  );
}
