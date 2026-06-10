"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, FileDown, RefreshCw, ShieldCheck } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const pools = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function randomIndex(max) {
  if (max <= 0) return 0;
  const array = new Uint32Array(1);
  const limit = 0xffffffff - (0xffffffff % max);
  do {
    crypto.getRandomValues(array);
  } while (array[0] >= limit);
  return array[0] % max;
}

function makePassword(length, options) {
  const activePools = Object.entries(options)
    .filter(([key, enabled]) => enabled && pools[key])
    .map(([key]) => pools[key]);
  const ambiguous = /[Il1O0]/g;
  const normalizedPools = options.excludeAmbiguous
    ? activePools.map((pool) => pool.replace(ambiguous, ""))
    : activePools;
  const chars = normalizedPools.join("");
  if (!chars) return "";
  const required = normalizedPools.map((pool) => pool[randomIndex(pool.length)]);
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => chars[randomIndex(chars.length)]);
  return [...required, ...rest].sort(() => randomIndex(1000) - 500).join("");
}

function getPoolSize(options) {
  return Object.entries(options).reduce((total, [key, enabled]) => {
    if (!enabled || !pools[key]) return total;
    const value = options.excludeAmbiguous ? pools[key].replace(/[Il1O0]/g, "") : pools[key];
    return total + value.length;
  }, 0);
}

function downloadTextFile(filename, content) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function ToolHome() {
  const [length, setLength] = useState(18);
  const [batchCount, setBatchCount] = useState(5);
  const [options, setOptions] = useState({
    excludeAmbiguous: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    uppercase: true,
  });
  const [passwords, setPasswords] = useState([]);
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => {
    const entropy = Math.round(length * Math.log2(Math.max(getPoolSize(options), 1)));
    if (entropy >= 96) return { label: "Excellent", entropy };
    if (entropy >= 72) return { label: "Strong", entropy };
    if (entropy >= 48) return { label: "Good", entropy };
    return { label: "Basic", entropy };
  }, [length, options]);

  const password = passwords[0] || "";
  const regenerate = () => {
    const count = Math.min(50, Math.max(1, Number(batchCount) || 1));
    setPasswords(Array.from({ length: count }, () => makePassword(length, options)));
  };

  useEffect(() => {
    regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length, options]);

  const copyPassword = async () => {
    setCopied(await safeCopyText(password));
    setTimeout(() => setCopied(false), 1000);
  };

  const copyAll = async () => {
    setCopied(await safeCopyText(passwords.join("\n")));
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
            <label className="mt-5 block">
              <span className="text-sm font-semibold">Batch count</span>
              <input
                type="number"
                min="1"
                max="50"
                value={batchCount}
                onChange={(event) => setBatchCount(Math.min(50, Math.max(1, Number(event.target.value) || 1)))}
                className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 outline-none focus:border-[var(--primary)]"
              />
            </label>
            <div className="mt-5 grid gap-3">
              {[...Object.keys(pools), "excludeAmbiguous"].map((key) => (
                <label key={key} className="flex items-center justify-between gap-3 rounded-lg bg-[var(--muted)] px-4 py-3 text-sm font-semibold capitalize break-words">
                  {key === "excludeAmbiguous" ? "Exclude ambiguous" : key}
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
              <button type="button" onClick={copyAll} className="btn-secondary">
                <Copy className="h-4 w-4" />
                Copy all
              </button>
              <button type="button" onClick={() => downloadTextFile("altftool-passwords.txt", passwords.join("\n"))} className="btn-secondary">
                <FileDown className="h-4 w-4" />
                Download
              </button>
              <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-sm font-semibold text-[var(--muted-foreground)]">
                Strength: {strength.label} ({strength.entropy} bits)
              </span>
            </div>
            <div className="mt-5 grid gap-2">
              {passwords.slice(1).map((item, index) => (
                <button
                  key={`${item}-${index}`}
                  type="button"
                  onClick={() => safeCopyText(item)}
                  className="rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-left font-mono text-xs text-[var(--muted-foreground)] transition hover:border-[var(--primary)] hover:text-[var(--foreground)]"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
