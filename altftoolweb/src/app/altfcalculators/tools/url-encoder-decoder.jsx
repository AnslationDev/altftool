"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, Segmented, CopyField, ResultPanel } from "./ui";

const MODES = [
  { label: "Encode", value: "encode" },
  { label: "Decode", value: "decode" },
];
const SCOPES = [
  { label: "Component", value: "component" },
  { label: "Full URI", value: "uri" },
];

export default function UrlEncoderDecoder() {
  const [mode, setMode] = useState("encode");
  const [scope, setScope] = useState("component");
  const [input, setInput] = useState("https://altf.tools/search?q=hello world&lang=en");

  const result = useMemo(() => {
    if (!input) return { empty: true };
    try {
      if (mode === "encode") {
        return {
          output: scope === "uri" ? encodeURI(input) : encodeURIComponent(input),
        };
      }
      return {
        output: scope === "uri" ? decodeURI(input) : decodeURIComponent(input),
      };
    } catch {
      return { error: "Malformed URI sequence — check for stray % characters." };
    }
  }, [mode, scope, input]);

  return (
    <div className="afc-calc">
      <div className="afc-conv-row">
        <Field label="Mode">
          <Segmented options={MODES} value={mode} onChange={setMode} name="url-mode" />
        </Field>
        <Field label="Scope" hint="Component escapes ? & = / ; Full URI keeps them.">
          <Segmented options={SCOPES} value={scope} onChange={setScope} name="url-scope" />
        </Field>
      </div>

      <Field label={mode === "encode" ? "Text to encode" : "Text to decode"}>
        <TextArea
          rows={5}
          className="afc-code"
          value={input}
          spellCheck={false}
          placeholder={mode === "encode" ? "Type a URL or value…" : "Paste an encoded string…"}
          onChange={(e) => setInput(e.target.value)}
        />
      </Field>

      {result.empty ? (
        <ResultPanel title="Output" muted>
          <p className="afc-note">Enter text to {mode === "encode" ? "encode" : "decode"}.</p>
        </ResultPanel>
      ) : result.error ? (
        <ResultPanel title="Output">
          <p className="afc-error">{result.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title={mode === "encode" ? "Encoded output" : "Decoded output"}>
          <CopyField multiline value={result.output} label="Result" />
        </ResultPanel>
      )}
    </div>
  );
}
