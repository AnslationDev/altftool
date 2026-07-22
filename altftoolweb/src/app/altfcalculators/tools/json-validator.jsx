"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, ResultPanel, ResultRow } from "./ui";

// Describe the parsed top-level value.
function describe(value) {
  if (value === null) return "null";
  if (Array.isArray(value)) return `array · ${value.length} ${value.length === 1 ? "item" : "items"}`;
  const t = typeof value;
  if (t === "object") {
    const keys = Object.keys(value);
    return `object · ${keys.length} ${keys.length === 1 ? "key" : "keys"}`;
  }
  return t;
}

// Turn a character position into 1-based line / column.
function lineColFromPos(text, pos) {
  const upto = text.slice(0, pos);
  const line = (upto.match(/\n/g) || []).length + 1;
  const col = pos - upto.lastIndexOf("\n");
  return { line, col };
}

export default function JsonValidator() {
  const [input, setInput] = useState('{\n  "id": 42,\n  "ok": true\n}');

  const result = useMemo(() => {
    const text = input.trim();
    if (!text) return { empty: true };
    try {
      const value = JSON.parse(text);
      const rootKeys =
        value && typeof value === "object" && !Array.isArray(value)
          ? Object.keys(value)
          : [];
      return { valid: true, summary: describe(value), rootKeys };
    } catch (e) {
      // V8 messages: "... in JSON at position 23 (line 2 column 5)"
      let where = "";
      const lc = /line (\d+) column (\d+)/.exec(e.message);
      const posMatch = /position (\d+)/.exec(e.message);
      if (lc) {
        where = `Line ${lc[1]}, column ${lc[2]}`;
      } else if (posMatch) {
        const { line, col } = lineColFromPos(input, Number(posMatch[1]));
        where = `Line ${line}, column ${col} (position ${posMatch[1]})`;
      }
      return { valid: false, message: e.message, where };
    }
  }, [input]);

  return (
    <div className="afc-calc">
      <Field label="JSON to validate" hint="Validation runs live as you type.">
        <TextArea
          rows={8}
          className="afc-code"
          value={input}
          spellCheck={false}
          placeholder='{"key": "value"}'
          onChange={(e) => setInput(e.target.value)}
        />
      </Field>

      {result.empty ? (
        <ResultPanel title="Result" muted>
          <p className="afc-note">Enter JSON to check whether it is valid.</p>
        </ResultPanel>
      ) : result.valid ? (
        <ResultPanel title="Result">
          <p className="afc-success">✓ Valid JSON</p>
          <div className="afc-result-rows">
            <ResultRow label="Top level" value={result.summary} strong />
            {result.rootKeys.length ? (
              <ResultRow
                label="Keys"
                value={
                  result.rootKeys.slice(0, 12).join(", ") +
                  (result.rootKeys.length > 12 ? " …" : "")
                }
              />
            ) : null}
          </div>
        </ResultPanel>
      ) : (
        <ResultPanel title="Result">
          <p className="afc-error">✗ Invalid JSON — {result.message}</p>
          {result.where ? (
            <div className="afc-result-rows">
              <ResultRow label="Location" value={result.where} />
            </div>
          ) : null}
        </ResultPanel>
      )}
    </div>
  );
}
