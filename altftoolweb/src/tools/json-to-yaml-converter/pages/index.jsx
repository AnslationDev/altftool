"use client";

import { useMemo, useState } from "react";
import { Clipboard, FileCode2 } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const sampleJson = JSON.stringify(
  {
    name: "AltFTool",
    category: "Developer tools",
    features: ["fast", "clean", "browser-based"],
    active: true,
  },
  null,
  2,
);

function scalar(value) {
  if (value === null) return "null";
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (value === "") return '""';
  if (/[:#{}\[\],&*?|\-<>=!%@`]/.test(value) || /^\s|\s$/.test(value)) return JSON.stringify(value);
  return value;
}

function toYaml(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (!value.length) return "[]";
    return value
      .map((item) => {
        if (item && typeof item === "object") return `${pad}-\n${toYaml(item, indent + 2)}`;
        return `${pad}- ${scalar(item)}`;
      })
      .join("\n");
  }
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    if (!entries.length) return "{}";
    return entries
      .map(([key, item]) => {
        if (item && typeof item === "object") return `${pad}${key}:\n${toYaml(item, indent + 2)}`;
        return `${pad}${key}: ${scalar(item)}`;
      })
      .join("\n");
  }
  return `${pad}${scalar(value)}`;
}

export default function ToolHome() {
  const [input, setInput] = useState(sampleJson);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    try {
      return { ok: true, value: toYaml(JSON.parse(input)) };
    } catch (error) {
      return { ok: false, value: error.message };
    }
  }, [input]);

  const copyYaml = async () => {
    setCopied(await safeCopyText(result.value));
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <FileCode2 className="h-4 w-4" />
            Data conversion
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">JSON to YAML Converter</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Convert JSON objects and arrays into clean YAML for configs, docs, and developer workflows.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-2">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <h2 className="text-lg font-semibold">JSON input</h2>
            <textarea value={input} onChange={(event) => setInput(event.target.value)} className="mt-4 min-h-[360px] w-full resize-y rounded-lg border border-[var(--border)] bg-[var(--background)] p-4 font-mono text-sm leading-6 outline-none focus:border-[var(--primary)] sm:min-h-[460px]" spellCheck={false} />
          </div>
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">YAML output</h2>
              <button type="button" disabled={!result.ok} onClick={copyYaml} className="btn-primary min-h-10 px-3 py-2 disabled:opacity-50">
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className={`mt-4 min-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-lg p-4 text-sm leading-6 sm:min-h-[460px] ${result.ok ? "bg-slate-950 text-slate-100" : "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"}`}>
              {result.value}
            </pre>
          </div>
        </section>
      </div>
    </main>
  );
}
