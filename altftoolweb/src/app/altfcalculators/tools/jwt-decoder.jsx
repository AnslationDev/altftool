"use client";

import React, { useMemo, useState } from "react";
import { Field, TextArea, CopyField, ResultPanel, ResultRow, CalcNote } from "./ui";

// Decode a base64url segment to a UTF-8 string.
function b64urlDecode(seg) {
  let s = seg.replace(/-/g, "+").replace(/_/g, "/");
  const pad = s.length % 4;
  if (pad === 2) s += "==";
  else if (pad === 3) s += "=";
  else if (pad === 1) throw new Error("bad length");
  return decodeURIComponent(escape(atob(s)));
}

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsdEYgVG9vbHMiLCJpYXQiOjE1MTYyMzkwMjJ9." +
  "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const CLAIM_LABEL = { iat: "Issued at (iat)", exp: "Expires (exp)", nbf: "Not before (nbf)" };

export default function JwtDecoder() {
  const [token, setToken] = useState(SAMPLE);

  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return { empty: true };
    const parts = t.split(".");
    if (parts.length < 2 || !parts[0] || !parts[1]) {
      return { error: "A JWT must have at least two dot-separated segments (header.payload)." };
    }
    try {
      const header = JSON.parse(b64urlDecode(parts[0]));
      const payload = JSON.parse(b64urlDecode(parts[1]));
      const times = ["iat", "nbf", "exp"]
        .filter((k) => typeof payload[k] === "number")
        .map((k) => ({
          key: k,
          label: CLAIM_LABEL[k],
          date: new Date(payload[k] * 1000).toUTCString(),
        }));
      const now = Math.floor(Date.now() / 1000);
      const expired = typeof payload.exp === "number" ? payload.exp < now : null;
      return {
        header: JSON.stringify(header, null, 2),
        payload: JSON.stringify(payload, null, 2),
        alg: header.alg || "—",
        typ: header.typ || "—",
        times,
        expired,
      };
    } catch {
      return { error: "Could not decode — header/payload are not valid base64url JSON." };
    }
  }, [token]);

  return (
    <div className="afc-calc">
      <Field label="JWT" hint="Paste a JSON Web Token (header.payload.signature).">
        <TextArea
          rows={5}
          className="afc-code"
          value={token}
          spellCheck={false}
          placeholder="eyJhbGciOi…"
          onChange={(e) => setToken(e.target.value)}
        />
      </Field>

      {result.empty ? (
        <ResultPanel title="Decoded token" muted>
          <p className="afc-note">Paste a JWT to decode its header and payload.</p>
        </ResultPanel>
      ) : result.error ? (
        <ResultPanel title="Decoded token">
          <p className="afc-error">{result.error}</p>
        </ResultPanel>
      ) : (
        <ResultPanel title="Decoded token">
          <div className="afc-result-rows">
            <ResultRow label="Algorithm" value={result.alg} strong />
            <ResultRow label="Type" value={result.typ} />
            {result.times.map((t) => (
              <ResultRow key={t.key} label={t.label} value={t.date} />
            ))}
            {result.expired !== null ? (
              <ResultRow
                label="Status"
                value={result.expired ? "Expired" : "Not expired"}
                strong
              />
            ) : null}
          </div>

          <div className="afc-field-label" style={{ margin: "12px 0 6px" }}>Header</div>
          <CopyField multiline value={result.header} label="JWT header" />

          <div className="afc-field-label" style={{ margin: "12px 0 6px" }}>Payload</div>
          <CopyField multiline value={result.payload} label="JWT payload" />

          <CalcNote>
            Signature is not verified — this tool only decodes the token. Never trust an
            unverified JWT for authorization.
          </CalcNote>
        </ResultPanel>
      )}
    </div>
  );
}
