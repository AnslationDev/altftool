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

const DIGIT_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyz";

// Parses a validated, sign-free digit string in an arbitrary base (2-36) into
// a BigInt. BigInt() itself only understands decimal (or 0x/0o/0b-PREFIXED)
// literals, so it cannot be handed a bare base-N digit string directly.
function parseDigitsInBase(digits, base) {
  const bigBase = BigInt(base);
  let result = 0n;
  for (const char of digits.toLowerCase()) {
    const digitValue = DIGIT_ALPHABET.indexOf(char);
    if (digitValue === -1 || digitValue >= base) {
      throw new Error(`"${char}" is not a valid base-${base} digit.`);
    }
    result = result * bigBase + BigInt(digitValue);
  }
  return result;
}

export function parseValue(value, system) {
  const text = clean(value);
  if (!text) return { ok: true, number: 0n };
  const { base, id } = system;
  // Strip the sign before any base-specific prefix/digit handling, so a
  // negative value is accepted uniformly in every base (matches what
  // formatNumber can now produce for all five bases, not just decimal/base36).
  const negative = text.startsWith("-");
  let normalized = negative ? text.slice(1) : text;
  if (id === "binary") {
    normalized = normalized.replace(/^0b/i, "");
    if (!/^[01]+$/.test(normalized)) throw new Error("Binary can only contain 0 and 1.");
  } else if (id === "octal") {
    normalized = normalized.replace(/^0o/i, "");
    if (!/^[0-7]+$/.test(normalized)) throw new Error("Octal can only contain 0-7.");
  } else if (id === "hex") {
    normalized = normalized.replace(/^0x/i, "");
    if (!/^[0-9a-fA-F]+$/.test(normalized)) throw new Error("Hex can only contain 0-9 and A-F.");
  } else if (id === "decimal") {
    if (!/^\d+$/.test(normalized)) throw new Error("Decimal must be a whole number.");
  } else if (id === "base36") {
    if (!/^[0-9a-zA-Z]+$/.test(normalized)) throw new Error("Base-36 can only contain 0-9 and A-Z.");
  }
  const magnitude = parseDigitsInBase(normalized, base);
  return { ok: true, number: negative ? -magnitude : magnitude };
}

// Prepends a base prefix (0b/0o/0x) after any leading minus sign, so a
// negative value reads as "-0b101" rather than the invalid "0b-101".
function withPrefix(prefix, value) {
  if (!prefix) return value;
  if (value.startsWith("-")) return `-${prefix}${value.slice(1)}`;
  return `${prefix}${value}`;
}

export function formatNumber(number, system) {
  const { base, id } = system;
  const negative = number < 0n;
  const magnitude = negative ? -number : number;
  let result = magnitude.toString(base).toUpperCase();
  if (id === "binary" && result.length > 64) return "Too large";
  return negative ? `-${result}` : result;
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
  const display = value !== "—" && value !== "Too large" && value !== "N/A" ? withPrefix(prefix, value) : value;
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
        onClick={() => onCopy(withPrefix(prefix, value))}
        disabled={!valid || value === "—" || value === "Too large" || value === "N/A"}
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
    if (!parseResult.ok) return;
    const lines = SYSTEMS.map((sys) => {
      const val = formatNumber(parseResult.number, sys);
      const prefix = sys.id !== "decimal" && sys.id !== "base36" ? sys.prefix : "";
      return `${sys.label} (base ${sys.base}): ${withPrefix(prefix, val)}`;
    }).join("\n");
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
              <label htmlFor="number-system-input" className="text-sm font-semibold text-[var(--foreground)]">
                Input format
              </label>
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
                  aria-label={sys.label}
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
                id="number-system-input"
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
                disabled={!parseResult.ok}
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
