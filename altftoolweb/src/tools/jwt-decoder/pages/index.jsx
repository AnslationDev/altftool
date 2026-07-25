"use client";

import { useMemo, useState } from "react";
import { Clipboard, FileDown, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SAMPLE_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbHRmdG9vbC11c2VyIiwibmFtZSI6IlNhdXJhYmgiLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNzE3MjAwMDAwLCJleHAiOjQxMDI0NDQ4MDB9.signature";

const formatJson = (value) => JSON.stringify(value, null, 2);

function decodePart(part) {
  const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}

function getClaimDate(value) {
  if (!value || Number.isNaN(Number(value))) return "Not available";
  return new Date(Number(value) * 1000).toLocaleString();
}

function getRelativeExpiry(value) {
  if (!value || Number.isNaN(Number(value))) return "No exp claim";
  const diff = Number(value) * 1000 - Date.now();
  const absMinutes = Math.round(Math.abs(diff) / 60000);
  const unit = absMinutes >= 1440 ? `${Math.round(absMinutes / 1440)}d` : absMinutes >= 60 ? `${Math.round(absMinutes / 60)}h` : `${absMinutes}m`;
  return diff >= 0 ? `Expires in ${unit}` : `Expired ${unit} ago`;
}

function getClaimType(value) {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function downloadJson(filename, value) {
  const url = URL.createObjectURL(new Blob([value], { type: "application/json;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function ToolHome() {
  const [token, setToken] = useState(SAMPLE_TOKEN);
  const [copied, setCopied] = useState("");

  const decoded = useMemo(() => {
    try {
      const parts = token.trim().split(".");
      if (parts.length < 2) throw new Error("JWT must include header and payload.");
      return {
        ok: true,
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
        signature: parts[2] || "",
      };
    } catch (error) {
      return { ok: false, message: error.message || "Unable to decode this token." };
    }
  }, [token]);

  const copyValue = async (label, value) => {
    setCopied((await safeCopyText(value)) ? label : "");
    setTimeout(() => setCopied(""), 1200);
  };

  const isExpired =
    decoded.ok && decoded.payload.exp ? Number(decoded.payload.exp) * 1000 < Date.now() : false;
  const decodedBundle = decoded.ok
    ? formatJson({
        header: decoded.header,
        payload: decoded.payload,
        signatureLength: decoded.signature.length,
      })
    : "";

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="grid gap-6 2xl:grid-cols-[1fr_320px] 2xl:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
                <KeyRound className="h-4 w-4" />
                Developer security
              </div>
              <h1 className="text-4xl font-semibold leading-tight">JWT Decoder</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
                Decode JSON Web Token headers and payload claims locally without sending tokens to a server.
              </p>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Token status</p>
              <div className="mt-3 flex items-center gap-3">
                <ShieldCheck
                  aria-hidden="true"
                  className="h-8 w-8"
                  style={{ color: decoded.ok && !isExpired ? "var(--success)" : "var(--danger)" }}
                />
                <div>
                  <p className="text-xl font-semibold">
                    {decoded.ok ? (isExpired ? "Expired" : "Decoded") : "Invalid token"}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {decoded.ok ? `${token.trim().split(".").length} parts. ${getRelativeExpiry(decoded.payload.exp)}` : decoded.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <Panel title="Paste JWT">
            <textarea
              value={token}
              onChange={(event) => setToken(event.target.value)}
              aria-label="JWT token input"
              placeholder="Paste a JSON Web Token (header.payload.signature)..."
              className="min-h-56 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/25 motion-reduce:transition-none"
              spellCheck={false}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setToken(SAMPLE_TOKEN)}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--muted)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                <RotateCcw className="h-4 w-4" />
                Sample
              </button>
              <button
                type="button"
                onClick={() => setToken("")}
                className="inline-flex min-h-11 items-center rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--muted)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
              >
                Clear
              </button>
              {decoded.ok ? (
                <>
                  <button
                    type="button"
                    onClick={() => copyValue("Decoded bundle", decodedBundle)}
                    aria-label="Copy decoded header and payload to clipboard"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--muted)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <Clipboard className="h-4 w-4" />
                    {copied === "Decoded bundle" ? "Copied!" : "Copy decoded"}
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadJson("altftool-jwt-decoded.json", decodedBundle)}
                    aria-label="Download decoded token as JSON"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold transition hover:bg-[var(--muted)] active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                  >
                    <FileDown className="h-4 w-4" />
                    Download JSON
                  </button>
                </>
              ) : null}
            </div>
          </Panel>

          <Panel title="Claims overview">
            {decoded.ok ? (
              <div className="space-y-3 text-sm">
                {[
                  ["Algorithm", decoded.header.alg || "Not available"],
                  ["Type", decoded.header.typ || "Not available"],
                  ["Subject", decoded.payload.sub || "Not available"],
                  ["Issued at", getClaimDate(decoded.payload.iat)],
                  ["Expires", getClaimDate(decoded.payload.exp)],
                  ["Expiry delta", getRelativeExpiry(decoded.payload.exp)],
                  ["Signature bytes", decoded.signature.length || "Unsigned"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 rounded-lg bg-[var(--muted)] px-3 py-2">
                    <span className="font-medium text-[var(--muted-foreground)]">{label}</span>
                    <span className="text-right font-semibold text-[var(--foreground)]">{value}</span>
                  </div>
                ))}
              </div>
            ) : token.trim() === "" ? (
              <p className="rounded-lg bg-[var(--muted)] p-4 text-sm text-[var(--muted-foreground)]">
                Paste a JWT on the left to see its decoded claims here.
              </p>
            ) : (
              <p
                role="alert"
                className="rounded-lg border p-4 text-sm"
                style={{
                  backgroundColor: "var(--danger-soft)",
                  borderColor: "color-mix(in srgb, var(--danger) 35%, transparent)",
                  color: "var(--danger)",
                }}
              >
                {decoded.message}
              </p>
            )}
          </Panel>
        </div>

        {decoded.ok && (
          <div className="grid gap-6 2xl:grid-cols-2">
            {[
              ["Header", formatJson(decoded.header)],
              ["Payload", formatJson(decoded.payload)],
            ].map(([label, value]) => (
              <Panel key={label} title={label}>
                <pre className="max-h-96 overflow-auto rounded-lg bg-slate-950 p-4 text-sm leading-6 text-slate-100">
                  {value}
                </pre>
                <button
                  type="button"
                  onClick={() => copyValue(label, value)}
                  aria-label={`Copy ${label} JSON to clipboard`}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] transition active:scale-[0.98] motion-reduce:transition-none motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-[var(--primary)]/35"
                >
                  <Clipboard className="h-4 w-4" />
                  {copied === label ? "Copied!" : `Copy ${label}`}
                </button>
              </Panel>
            ))}
          </div>
        )}

        {decoded.ok && (
          <Panel title="Payload claims">
            <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="bg-[var(--background)] text-xs uppercase text-[var(--muted-foreground)]">
                  <tr>
                    <th className="px-3 py-2">Claim</th>
                    <th className="px-3 py-2">Type</th>
                    <th className="px-3 py-2">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {Object.entries(decoded.payload).map(([key, value]) => (
                    <tr key={key}>
                      <td className="px-3 py-2 font-mono text-xs font-semibold text-[var(--foreground)]">{key}</td>
                      <td className="px-3 py-2 text-xs text-[var(--muted-foreground)]">{getClaimType(value)}</td>
                      <td className="px-3 py-2 font-mono text-xs text-[var(--muted-foreground)]">
                        {typeof value === "object" ? JSON.stringify(value) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </main>
  );
}
