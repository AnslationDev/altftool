"use client";

import { useMemo, useState } from "react";
import { Clipboard, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";
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
                <ShieldCheck className={decoded.ok && !isExpired ? "h-8 w-8 text-green-600" : "h-8 w-8 text-red-500"} />
                <div>
                  <p className="text-xl font-semibold">
                    {decoded.ok ? (isExpired ? "Expired" : "Decoded") : "Invalid token"}
                  </p>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    {decoded.ok ? `${token.trim().split(".").length} JWT parts detected` : decoded.message}
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
              className="min-h-56 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm outline-none transition focus:border-[var(--primary)]"
              spellCheck={false}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setToken(SAMPLE_TOKEN)}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)]"
              >
                <RotateCcw className="h-4 w-4" />
                Sample
              </button>
              <button
                type="button"
                onClick={() => setToken("")}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)]"
              >
                Clear
              </button>
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
                ].map(([label, value]) => (
                  <div key={label} className="flex items-start justify-between gap-4 rounded-lg bg-[var(--muted)] px-3 py-2">
                    <span className="font-medium text-[var(--muted-foreground)]">{label}</span>
                    <span className="text-right font-semibold text-[var(--foreground)]">{value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
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
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  <Clipboard className="h-4 w-4" />
                  {copied === label ? "Copied" : `Copy ${label}`}
                </button>
              </Panel>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
