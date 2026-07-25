"use client";

import { useMemo, useState } from "react";
import { ArrowDownUp, Clipboard, FileDown, Link2, RotateCcw, Search } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import Toast from "./Toast";

const sampleUrl = "https://www.example.com/search?q=online tools & category=developer";
const modes = [
  { id: "encode", label: "Encode", helper: "URI component safe" },
  { id: "decode", label: "Decode", helper: "Readable URL text" },
  { id: "query", label: "Query JSON", helper: "Inspect parameters" },
];

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

function parseQuery(value) {
  const source = value.includes("?") ? value : `https://altftool.local/?${value}`;
  const url = new URL(source);
  return [...url.searchParams.entries()];
}

function getOutput(mode, input) {
  const value = input.trim();
  if (!value) return { output: "", error: "" };

  try {
    if (mode === "decode") return { output: decodeURIComponent(value), error: "" };
    if (mode === "query") {
      const entries = parseQuery(value);
      return {
        output: JSON.stringify(Object.fromEntries(entries), null, 2),
        error: entries.length ? "" : "No query parameters found.",
      };
    }
    return { output: encodeURIComponent(value), error: "" };
  } catch {
    return { output: "", error: "Input could not be processed for this mode." };
  }
}

export default function EncoderDecoder() {
  const [input, setInput] = useState(sampleUrl);
  const [mode, setMode] = useState("encode");
  const [toastMsg, setToastMsg] = useState("");
  const result = useMemo(() => getOutput(mode, input), [input, mode]);
  const queryRows = useMemo(() => {
    try {
      return parseQuery(input);
    } catch {
      return [];
    }
  }, [input]);

  const copyOutput = async () => {
    if (!result.output) return;
    setToastMsg((await safeCopyText(result.output)) ? "Copied!" : "Copy failed");
  };

  const useOutput = () => {
    if (!result.output) return;
    setInput(result.output);
    setMode(mode === "encode" ? "decode" : "encode");
    setToastMsg("Output moved to input");
  };

  return (
    <div className="grid w-full gap-4">
      <section className="rounded-[8px] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Mode</p>
            <h2 className="mt-1 text-xl font-semibold text-(--foreground)">URL workspace</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`min-h-11 rounded-[8px] border px-3 py-2 text-left transition active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 ${
                  mode === item.id
                    ? "border-(--primary) bg-(--primary) text-(--primary-foreground)"
                    : "border-(--border) bg-(--background) text-(--foreground) hover:border-(--primary)"
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className={mode === item.id ? "block text-xs text-white/80" : "block text-xs text-(--muted-foreground)"}>
                  {item.helper}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[8px] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Input</p>
              <p className="mt-1 text-xs text-(--muted-foreground)">{input.length.toLocaleString()} characters</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setInput(sampleUrl)} className="btn-secondary min-h-11 px-3 py-1.5 text-xs active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 sm:min-h-9">
                <Link2 className="h-3.5 w-3.5" />
                Sample
              </button>
              <button type="button" onClick={() => setInput("")} className="btn-secondary min-h-11 px-3 py-1.5 text-xs active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 sm:min-h-9">
                <RotateCcw className="h-3.5 w-3.5" />
                Clear
              </button>
            </div>
          </div>
          <textarea
            data-testid="tool-input"
            aria-label="URL or text input"
            className="min-h-[300px] w-full resize-y rounded-[8px] border border-(--border) bg-(--background) p-4 font-mono text-sm leading-6 text-(--foreground) outline-none transition placeholder:text-(--muted-foreground) focus:border-(--primary) focus:ring-[3px] focus:ring-(--primary)/25"
            placeholder="Paste URL, encoded text, or query string..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
          />
        </section>

        <section className="rounded-[8px] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Output</p>
              <p className={`mt-1 text-xs ${result.error ? "inline-block rounded-md bg-(--danger-soft) px-2 py-1 font-semibold text-(--danger)" : "text-(--muted-foreground)"}`}>
                {result.error || `${result.output.length.toLocaleString()} characters`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyOutput} disabled={!result.output} className="btn-secondary min-h-11 px-3 py-1.5 text-xs active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 sm:min-h-9 disabled:opacity-50">
                <Clipboard className="h-3.5 w-3.5" />
                Copy
              </button>
              <button type="button" onClick={useOutput} disabled={!result.output} className="btn-secondary min-h-11 px-3 py-1.5 text-xs active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 sm:min-h-9 disabled:opacity-50">
                <ArrowDownUp className="h-3.5 w-3.5" />
                Use output
              </button>
              <button
                type="button"
                onClick={() => downloadTextFile("altftool-url-output.txt", result.output)}
                disabled={!result.output}
                className="btn-secondary min-h-11 px-3 py-1.5 text-xs active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)/35 sm:min-h-9 disabled:opacity-50"
              >
                <FileDown className="h-3.5 w-3.5" />
                Download
              </button>
            </div>
          </div>
          <pre
            data-testid="tool-output"
            aria-live="polite"
            className="min-h-[300px] overflow-auto whitespace-pre-wrap break-words rounded-[8px] border border-(--border) bg-(--background) p-4 font-mono text-sm leading-6 text-(--foreground)"
          >
            {result.output || "Result will appear here."}
          </pre>
        </section>
      </div>

      <section className="rounded-[8px] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">Query inspector</p>
            <p className="mt-1 text-xs text-(--muted-foreground)">{queryRows.length} parameters detected</p>
          </div>
          <Search className="h-4 w-4 text-(--primary)" />
        </div>
        {queryRows.length ? (
          <div className="overflow-x-auto rounded-[8px] border border-(--border)">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="bg-(--background) text-xs uppercase text-(--muted-foreground)">
                <tr>
                  <th className="px-3 py-2">Key</th>
                  <th className="px-3 py-2">Value</th>
                  <th className="px-3 py-2">Encoded</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {queryRows.map(([key, value], index) => (
                  <tr key={`${key}-${index}`}>
                    <td className="px-3 py-2 font-mono text-xs text-(--foreground)">{key}</td>
                    <td className="px-3 py-2 font-mono text-xs text-(--muted-foreground)">{value}</td>
                    <td className="px-3 py-2 font-mono text-xs text-(--muted-foreground)">{encodeURIComponent(value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-(--border) bg-(--background) p-5 text-sm text-(--muted-foreground)">
            Add a URL with query parameters to inspect keys and values.
          </div>
        )}
      </section>

      {toastMsg ? <Toast message={toastMsg} onClose={() => setToastMsg("")} /> : null}
      {result.output ? (
        <span className="sr-only" aria-live="polite">
          {mode} output updated
        </span>
      ) : null}
    </div>
  );
}
