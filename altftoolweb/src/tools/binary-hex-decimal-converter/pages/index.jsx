"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight, Clipboard, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const clean = (value) => value.trim().replace(/\s+/g, "");

function parseValue(value, base) {
  const text = clean(value);
  if (!text) return { ok: true, number: 0n };
  if (base === "binary") {
    if (!/^[01]+$/.test(text)) throw new Error("Binary value can only contain 0 and 1.");
    return { ok: true, number: BigInt(`0b${text}`) };
  }
  if (base === "hex") {
    const normalized = text.replace(/^0x/i, "");
    if (!/^[0-9a-fA-F]+$/.test(normalized)) throw new Error("Hex value can only contain 0-9 and A-F.");
    return { ok: true, number: BigInt(`0x${normalized}`) };
  }
  if (!/^-?\d+$/.test(text)) throw new Error("Decimal value must be a whole number.");
  return { ok: true, number: BigInt(text) };
}

function asciiFromNumber(number) {
  if (number < 0n || number > 0x10ffffn) return "Outside Unicode range";
  try {
    return String.fromCodePoint(Number(number));
  } catch {
    return "Outside Unicode range";
  }
}

function OutputRow({ label, value, onCopy }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-[var(--muted-foreground)]">{label}</p>
        <button type="button" onClick={() => onCopy(value)} className="rounded-md p-2 hover:bg-[var(--muted)]">
          <Clipboard className="h-4 w-4" />
        </button>
      </div>
      <p className="break-all font-mono text-lg font-semibold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

export default function ToolHome() {
  const [mode, setMode] = useState("decimal");
  const [value, setValue] = useState("255");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      const parsed = parseValue(value, mode);
      const number = parsed.number;
      return {
        ok: true,
        decimal: number.toString(10),
        binary: number < 0n ? "Negative binary is not supported" : number.toString(2),
        hex: number < 0n ? "Negative hex is not supported" : number.toString(16).toUpperCase(),
        ascii: asciiFromNumber(number),
        bits: number < 0n ? "N/A" : Math.max(1, number.toString(2).length).toString(),
      };
    } catch (error) {
      return { ok: false, message: error.message };
    }
  }, [mode, value]);

  const copyValue = async (text) => {
    setCopied(await safeCopyText(text));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <ArrowLeftRight className="h-4 w-4" />
            Number systems
          </div>
          <h1 className="text-4xl font-semibold leading-tight">Binary / Hex / Decimal Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert developer number formats instantly with clean copy-ready output.
          </p>
        </section>

        <section className="grid gap-6 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)] 2xl:grid-cols-[360px_1fr]">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Input format</p>
            <div className="mt-3 grid grid-cols-3 gap-2 rounded-lg bg-[var(--muted)] p-1">
              {["decimal", "binary", "hex"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold capitalize ${
                    mode === item ? "bg-[var(--card)] text-[var(--primary)] shadow-sm" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
            <textarea
              value={value}
              onChange={(event) => setValue(event.target.value)}
              className="mt-4 min-h-40 w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm outline-none focus:border-[var(--primary)]"
              spellCheck={false}
            />
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("decimal");
                  setValue("255");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              {copied && <span className="self-center text-sm font-semibold text-green-600">Copied</span>}
            </div>
          </div>

          <div>
            {result.ok ? (
              <div className="tool-form-grid">
                <OutputRow label="Decimal" value={result.decimal} onCopy={copyValue} />
                <OutputRow label="Binary" value={result.binary} onCopy={copyValue} />
                <OutputRow label="Hexadecimal" value={`0x${result.hex}`} onCopy={copyValue} />
                <OutputRow label="Unicode character" value={result.ascii} onCopy={copyValue} />
                <OutputRow label="Bit length" value={result.bits} onCopy={copyValue} />
              </div>
            ) : (
              <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                {result.message}
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
