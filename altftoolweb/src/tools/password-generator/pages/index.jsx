"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, RefreshCw, ShieldCheck } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const pools = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function randomIndex(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

function makePassword(length, options) {
  const activePools = Object.entries(options)
    .filter(([, enabled]) => enabled)
    .map(([key]) => pools[key]);
  const chars = activePools.join("");
  if (!chars) return "";
  const required = activePools.map((pool) => pool[randomIndex(pool.length)]);
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => chars[randomIndex(chars.length)]);
  return [...required, ...rest].sort(() => randomIndex(1000) - 500).join("");
}

export default function ToolHome() {
  const [length, setLength] = useState(18);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => {
    const enabled = Object.values(options).filter(Boolean).length;
    const score = length * enabled;
    if (score >= 72) return "Strong";
    if (score >= 40) return "Good";
    return "Basic";
  }, [length, options]);

  const regenerate = () => setPassword(makePassword(length, options));

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, options]);

  const copyPassword = async () => {
    setCopied(await safeCopyText(password));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ShieldCheck className="h-4 w-4" />
            Secure utility
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Password Generator</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Generate random passwords in the browser with length and character set controls.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[360px_1fr]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="block">
              <span className="text-sm font-semibold">Length: {length}</span>
              <input type="range" min="8" max="64" value={length} onChange={(event) => setLength(Number(event.target.value))} className="mt-3 w-full" />
            </label>
            <div className="mt-5 grid gap-3">
              {Object.keys(pools).map((key) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--muted)] px-4 py-3 text-sm font-semibold capitalize break-words">
                  {key}
                  <input type="checkbox" checked={options[key]} onChange={(event) => setOptions((current) => ({ ...current, [key]: event.target.checked }))} />
                </label>
              ))}
            </div>
            <button type="button" onClick={regenerate} className="btn-secondary mt-5 w-full">
              <RefreshCw className="h-4 w-4" />
              Regenerate
            </button>
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <p className="text-sm font-semibold text-[var(--muted-foreground)]">Generated password</p>
            <div className="mt-3 rounded-lg bg-slate-950 p-5">
              <p className="break-all font-mono text-lg font-semibold leading-8 text-white sm:text-2xl sm:leading-10">{password}</p>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button type="button" onClick={copyPassword} className="btn-primary">
                <Copy className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
              <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-sm font-semibold text-[var(--muted-foreground)]">Strength: {strength}</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
