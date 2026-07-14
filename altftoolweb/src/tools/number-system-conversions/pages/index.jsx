"use client";

import { useMemo, useState, useCallback } from "react";
import { Binary, Copy, RotateCcw, Hash, Monitor, Terminal, Cpu } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SYSTEMS = [
  { id: "binary", base: 2, label: "Binary", prefix: "0b", icon: Binary, color: "text-blue-600 dark:text-blue-400" },
  { id: "octal", base: 8, label: "Octal", prefix: "0o", icon: Monitor, color: "text-purple-600 dark:text-purple-400" },
  { id: "decimal", base: 10, label: "Decimal", prefix: "", icon: Hash, color: "text-teal-600 dark:text-teal-400" },
  { id: "hex", base: 16, label: "Hexadecimal", prefix: "0x", icon: Terminal, color: "text-rose-600 dark:text-rose-400" },
  { id: "base36", base: 36, label: "Base-36", prefix: "", icon: Cpu, color: "text-amber-600 dark:text-amber-400" },
];

const clean = (value) => value.trim().replace(/\s+/g, "");

function parseValue(value, system) {
  const text = clean(value);
  if (!text) return { ok: true, number: 0n };
  const { base, id } = system;
  let normalized = text;
  if (id === "binary") {
    normalized = text.replace(/^0b/i, "");
    if (!/^[01]+$/.test(normalized)) throw new Error("Binary can only contain 0 and 1.");
  } else if (id === "octal") {
    normalized = text.replace(/^0o/i, "");
    if (!/^[0-7]+$/.test(normalized)) throw new Error("Octal can only contain 0-7.");
  } else if (id === "hex") {
    normalized = text.replace(/^0x/i, "");
    if (!/^[0-9a-fA-F]+$/.test(normalized)) throw new Error("Hex can only contain 0-9 and A-F.");
  } else if (id === "decimal") {
    if (!/^-?\d+$/.test(normalized)) throw new Error("Decimal must be a whole number.");
  } else if (id === "base36") {
    if (!/^-?[0-9a-zA-Z]+$/.test(normalized)) throw new Error("Base-36 can only contain 0-9 and A-Z.");
  }
  return { ok: true, number: BigInt(normalized) };
}

function formatNumber(number, system) {
  const { base, id } = system;
  if (number < 0n) return "N/A";
  let result = number.toString(base).toUpperCase();
  if (id === "binary") {
    if (result.length > 64) return "Too large";
    return result;
  }
  return result;
}

function asciiFromNumber(number) {
  if (number < 0n || number > 0x10ffffn) return "Outside Unicode range";
  try {
    return String.fromCodePoint(Number(number));
  } catch {
    return "Outside Unicode range";
  }
}

function OutputCard({ system, number, valid, onCopy }) {
  const value = valid ? formatNumber(number, system) : "—";
  const prefix = system.id !== "decimal" && system.id !== "base36" && valid ? system.prefix : "";
  const display = value !== "—" && value !== "Too large" && value !== "N/A" ? `${prefix}${value}` : value;
  const bits = valid && number >= 0n ? (number.toString(2).length).toString() : "—";
  const bytes = bits !== "—" ? Math.max(1, Math.ceil(Number(bits) / 8)).toString() : "—";
  const ascii = valid ? asciiFromNumber(number) : "—";

  return (
    <div className="group rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] transition-all duration-150 hover:shadow-[var(--anslation-ds-shadow-md)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-lg p-1.5 ${system.color.replace("text", "bg")}/10`}>
            <system.icon className={`h-4 w-4 ${system.color}`} />
          </div>
          <span className="text-sm font-semibold text-[var(--foreground)]">{system.label}</span>
        </div>
        <span className="rounded-md bg-[var(--muted)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
          Base-{system.base}
        </span>
      </div>
      <p className="break-all font-mono text-xl font-semibold leading-relaxed text-[var(--foreground)]">
        {display}
      </p>
      {valid && number >= 0n && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-foreground)]">
          <span>Bits: {bits}</span>
          <span>Bytes: {bytes}</span>
          {ascii !== "Outside Unicode range" && (
            <span>Unicode: &quot;{ascii}&quot;</span>
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => onCopy(`${prefix}${value}`)}
        disabled={!valid || value === "—" || value === "Too large"}
        className="mt-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] hover:text-[var(--foreground)] disabled:opacity-40"
      >
        <Copy className="h-3.5 w-3.5" />
        Copy
      </button>
    </div>
  );
}

export default function ToolHome() {
  const [inputSystem, setInputSystem] = useState(SYSTEMS[2]);
  const [value, setValue] = useState("255");
  const [copiedInput, setCopiedInput] = useState(false);

  const parseResult = useMemo(() => {
    try {
      return parseValue(value, inputSystem);
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, [value, inputSystem]);

  const copyValue = useCallback(async (text) => {
    await safeCopyText(text);
  }, []);

  const copyAll = useCallback(async () => {
    const lines = SYSTEMS.map((sys) => {
      if (!parseResult.ok || parseResult.number < 0n) return "";
      const val = formatNumber(parseResult.number, sys);
      const prefix = sys.id !== "decimal" && sys.id !== "base36" ? sys.prefix : "";
      return `${sys.label} (base ${sys.base}): ${prefix}${val}`;
    }).filter(Boolean).join("\n");
    if (!lines) return;
    const ok = await safeCopyText(lines);
    if (ok) {
      setCopiedInput(true);
      setTimeout(() => setCopiedInput(false), 1200);
    }
  }, [parseResult]);

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6 lg:py-10">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Binary className="h-4 w-4" />
            Developer utility
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Number System Conversions</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Instantly convert numbers between binary, octal, decimal, hexadecimal, and base-36. 
            Supports large integers, negative values, and Unicode character lookup.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[400px_1fr]">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-semibold text-[var(--foreground)]">Input format</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                {inputSystem.label} · Base-{inputSystem.base}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-lg bg-[var(--muted)] p-1">
              {SYSTEMS.map((sys) => (
                <button
                  key={sys.id}
                  type="button"
                  onClick={() => setInputSystem(sys)}
                  className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-semibold transition-all ${
                    inputSystem.id === sys.id
                      ? "bg-[var(--card)] text-[var(--primary)] shadow-sm"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <sys.icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">{sys.label}</span>
                </button>
              ))}
            </div>
            <div className="relative mt-4">
              <textarea
                value={value}
                onChange={(event) => setValue(event.target.value)}
                className="min-h-32 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-relaxed outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus:border-[var(--primary)] focus:shadow-[var(--anslation-ds-focus-ring)]"
                spellCheck={false}
                placeholder={`Enter a ${inputSystem.label.toLowerCase()} value...`}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setInputSystem(SYSTEMS[2]);
                  setValue("255");
                }}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={copyAll}
                disabled={!parseResult.ok || parseResult.number < 0n}
                className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-40"
              >
                <Copy className="h-4 w-4" />
                {copiedInput ? "Copied all" : "Copy all"}
              </button>
              {!parseResult.ok && (
                <span className="text-sm font-medium text-[var(--anslation-ds-danger,#EF4444)]">
                  {parseResult.message}
                </span>
              )}
            </div>
          </div>

          <div>
            {parseResult.ok ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {SYSTEMS.map((sys) => (
                  <OutputCard
                    key={sys.id}
                    system={sys}
                    number={parseResult.number}
                    valid={true}
                    onCopy={(text) => copyValue(text, sys.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex h-full min-h-[200px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-[var(--anslation-ds-shadow-sm)]">
                <p className="text-center text-sm text-[var(--muted-foreground)]">
                  Enter a valid {inputSystem.label.toLowerCase()} value to see conversions.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
