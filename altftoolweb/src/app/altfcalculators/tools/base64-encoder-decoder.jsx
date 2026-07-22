"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, Segmented, CopyField, ResultPanel } from "./ui";

const MODES = [
  { label: "Encode", value: "encode" },
  { label: "Decode", value: "decode" },
];

export default function Base64EncoderDecoder() {
  const [mode, setMode] = useState("encode");
  const [input, setInput] = useState("Hello, AltF Tools!");

  const result = useMemo(() => {
    if (!input) return { empty: true };
    try {
      if (mode === "encode") {
        // UTF-8 safe encode.
        return { output: btoa(unescape(encodeURIComponent(input))) };
      }
      // UTF-8 safe decode.
      return { output: decodeURIComponent(escape(atob(input.trim()))) };
    } catch {
      return {
        error:
          mode === "decode"
            ? "Not valid Base64 — check for stray characters or padding."
            : "Unable to encode this input.",
      };
    }
  }, [mode, input]);

  return (
    <div className="afc-calc">
      <Field label="Mode">
        <Segmented options={MODES} value={mode} onChange={setMode} name="base64-mode" />
      </Field>

      <Field label={mode === "encode" ? "Text to encode" : "Base64 to decode"}>
        <TextArea
          rows={6}
          className="afc-code"
          value={input}
          spellCheck={false}
          placeholder={mode === "encode" ? "Type plain text…" : "Paste Base64…"}
          onChange={(e) => setInput(e.target.value)}
        />
      </Field>

      {result.empty ? (
        <ResultPanel title="Output" muted>
          <p className="afc-note">
            {mode === "encode" ? "Enter text to Base64-encode." : "Enter Base64 to decode."}
          </p>
        </ResultPanel>
      ) : result.error ? (
        <ResultPanel title="Output">
          <p className="afc-error">{result.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title={mode === "encode" ? "Base64 output" : "Decoded text"}>
          <CopyField multiline value={result.output} label="Result" />
        </ResultPanel>
      )}
    </div>
  );
}
