"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, Select, Button, CopyField, ResultPanel } from "./ui";

const INDENTS = { "2": 2, "4": 4, tab: "\t" };

export default function JsonFormatter() {
  const [input, setInput] = useState(
    '{"name":"AltF Tools","tags":["json","formatter"],"active":true,"count":3}'
  );
  const [mode, setMode] = useState("beautify"); // beautify | minify
  const [indent, setIndent] = useState("2");

  const result = useMemo(() => {
    const text = input.trim();
    if (!text) return { empty: true };
    try {
      const obj = JSON.parse(text);
      const output =
        mode === "minify"
          ? JSON.stringify(obj)
          : JSON.stringify(obj, null, INDENTS[indent]);
      return { output };
    } catch (e) {
      return { error: e.message };
    }
  }, [input, mode, indent]);

  return (
    <div className="afc-calc">
      <Field label="JSON input" hint="Paste or type JSON, then beautify or minify it.">
        <TextArea
          rows={8}
          className="afc-code"
          value={input}
          spellCheck={false}
          placeholder='{"key": "value"}'
          onChange={(e) => setInput(e.target.value)}
        />
      </Field>

      <div className="afc-conv-row">
        <Field label="Action">
          <div className="afc-actions">
            <Button
              variant={mode === "beautify" ? "primary" : "ghost"}
              onClick={() => setMode("beautify")}
            >
              Beautify
            </Button>
            <Button
              variant={mode === "minify" ? "primary" : "ghost"}
              onClick={() => setMode("minify")}
            >
              Minify
            </Button>
          </div>
        </Field>
        <Field label="Indent" hint="Applies when beautifying.">
          <Select value={indent} onChange={(e) => setIndent(e.target.value)}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
            <option value="tab">Tab</option>
          </Select>
        </Field>
      </div>

      {result.empty ? (
        <ResultPanel title="Output" muted>
          <p className="afc-note">Enter some JSON to format.</p>
        </ResultPanel>
      ) : result.error ? (
        <ResultPanel title="Output">
          <p className="afc-error">Invalid JSON — {result.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title={mode === "minify" ? "Minified JSON" : "Beautified JSON"}>
          <CopyField multiline value={result.output} label="Formatted JSON" />
        </ResultPanel>
      )}
    </div>
  );
}
