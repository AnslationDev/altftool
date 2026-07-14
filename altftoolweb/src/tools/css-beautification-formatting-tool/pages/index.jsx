"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header";
import EditorPanel from "../components/EditorPanel";
import Controls from "../components/Controls";
import StatusPanels from "../components/StatusPanels";
import Features from "../components/Features";
import { DEFAULT_SETTINGS, formatCss, getCssStats } from "../utils/cssFormatter";

const STORAGE_KEY = "cssFormatterStudioState";
const HISTORY_KEY = "cssFormatterStudioHistory";

export default function ToolHome() {
  const savedState = getSavedState();
  const [input, setInput] = useState(savedState.input);
  const [settings, setSettings] = useState(savedState.settings);
  const [mode, setMode] = useState(savedState.mode);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");
  const [history, setHistory] = useState(() => getSavedHistory());

  const result = useMemo(() => formatCss(input, settings), [input, settings]);
  const output = mode === "minify" ? result.minified : result.output;
  const hasError = result.messages.some((message) => message.type === "error");
  const outputPlaceholder = input.trim()
    ? hasError
      ? "Invalid CSS. Enter CSS like:\n\nbody {\n  margin: 0;\n  padding: 0;\n}\n\nor:\n\nbody{margin:0;padding:0}"
      : "Formatted CSS will appear here..."
    : "Paste CSS to see live output...";
  const stats = useMemo(() => getCssStats(input, result.output, result.minified), [input, result]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, settings, mode }));
  }, [input, settings, mode]);

  useEffect(() => {
    if (!input.trim() || !result.output.trim()) return;
    const timer = setTimeout(() => {
      setHistory((prev) => {
        const next = [
          {
            id: Date.now(),
            title: input.trim().slice(0, 60).replace(/\n/g, " "),
            input,
            settings,
            lines: input.split("\n").length,
          },
          ...prev.filter((item) => item.input !== input),
        ].slice(0, 6);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }, 700);
    return () => clearTimeout(timer);
  }, [input, result.output, settings]);

  const copyText = async (text, label) => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  };

  const downloadCss = () => {
    if (!output.trim()) return;
    const blob = new Blob([output], { type: "text/css;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = mode === "minify" ? "styles.min.css" : "styles.formatted.css";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const restoreHistory = (item) => {
    setInput(item.input);
    setSettings({ ...DEFAULT_SETTINGS, ...item.settings });
  };

  const clearAll = () => {
    setInput("");
    setSearch("");
  };

  return (
    <div className="css-formatter-tool">
      <div className="cf-shell relative z-10">
      <Header />

      <main className="max-w-7xl mx-auto space-y-5">
        <Controls settings={settings} setSettings={setSettings} mode={mode} setMode={setMode} clearAll={clearAll} />

        {copied && (
          <div className="rounded-xl border border-emerald-400 bg-emerald-500/10 text-emerald-600 px-4 py-3 text-sm">
            {copied} copied to clipboard.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          <EditorPanel
            title="CSS Input Editor"
            value={input}
            onChange={setInput}
            search={search}
            onSearch={setSearch}
            onCopy={() => copyText(input, "Input CSS")}
            placeholder="Paste or write CSS here..."
          />
          <EditorPanel
            title={mode === "minify" ? "Minified Output" : "Beautified Output"}
            value={output}
            readOnly
            placeholder={outputPlaceholder}
            onCopy={() => copyText(output, mode === "minify" ? "Minified CSS" : "Formatted CSS")}
            onDownload={downloadCss}
          />
        </div>

        <StatusPanels messages={result.messages} stats={stats} history={history} restoreHistory={restoreHistory} />

        <section className="rounded-3xl p-4 cf-glass cf-neon">
          <h2 className="text-lg font-bold text-(--foreground) mb-4">Compare View</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <pre className="h-80 overflow-auto rounded-xl border border-(--border) bg-(--muted)/25 p-4 text-sm font-mono text-(--foreground) whitespace-pre">
              {input}
            </pre>
            <pre className="h-80 overflow-auto rounded-xl border border-(--border) bg-(--muted)/25 p-4 text-sm font-mono text-(--foreground) whitespace-pre">
              {output}
            </pre>
          </div>
        </section>
      </main>

      <Features />
      </div>
    </div>
  );
}

function getSavedState() {
  if (typeof window === "undefined") {
    return { input: "", settings: DEFAULT_SETTINGS, mode: "beautify" };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      input: saved.input || "",
      settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
      mode: saved.mode || "beautify",
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { input: "", settings: DEFAULT_SETTINGS, mode: "beautify" };
  }
}

function getSavedHistory() {
  if (typeof window === "undefined") return [];
  try {
    const saved = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    localStorage.removeItem(HISTORY_KEY);
    return [];
  }
}
