"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import EditorPanel from "../components/EditorPanel";
import Controls from "../components/Controls";
import StatusPanels from "../components/StatusPanels";
import Features from "../components/Features";
import { DEFAULT_SETTINGS, formatPhp, getPhpStats, loadPhpFormatter } from "../utils/phpFormatter";

const STORAGE_KEY = "phpBeautifierStudioState";
const HISTORY_KEY = "phpBeautifierStudioHistory";

export default function ToolHome() {
  const [input, setInput] = useState("");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState("");
  const [history, setHistory] = useState([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const [result, setResult] = useState({ output: "", messages: [] });
  const [isFormatting, setIsFormatting] = useState(false);
  const formatRunRef = useRef(0);

  useEffect(() => {
    loadPhpFormatter().catch(() => {});
    const savedState = getSavedState();
    setInput(savedState.input);
    setSettings(savedState.settings);
    setHistory(getSavedHistory());
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, settings }));
    }
  }, [input, settings, isMounted]);

  useEffect(() => {
    let active = true;
    const runId = ++formatRunRef.current;

    const runFormatter = async () => {
      if (!input.trim()) {
        if (active && runId === formatRunRef.current) {
          setResult({ output: "", messages: [] });
          setIsFormatting(false);
        }
        return;
      }

      setIsFormatting(true);
      const res = await formatPhp(input, settings);
      if (active && runId === formatRunRef.current) {
        setResult(res);
        setIsFormatting(false);
      }
    };

    const timer = setTimeout(runFormatter, 150);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [input, settings]);

  const output = result.output;
  const hasError = result.messages.some((message) => message.type === "error");
  
  const outputPlaceholder = input.trim()
    ? hasError
      ? "Syntax Error detected. Fix the PHP code to see formatted output."
      : isFormatting ? "Formatting..." : "Formatted PHP will appear here..."
    : "Paste PHP to see live output...";
    
  const stats = useMemo(() => getPhpStats(input, output), [input, output]);

  useEffect(() => {
    if (!input.trim() || !output.trim()) return;
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
    }, 1000);
    return () => clearTimeout(timer);
  }, [input, output, settings]);

  const copyText = async (text, label) => {
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 1600);
  };

  const downloadPhp = () => {
    if (!output.trim()) return;
    const blob = new Blob([output], { type: "application/x-httpd-php;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "formatted.php";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setInput(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = "";
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
    <div className="php-formatter-tool">
      <div className="cf-shell relative z-10">
        <Header />

        <main className="max-w-7xl mx-auto space-y-5">
          <Controls 
            settings={settings} 
            setSettings={setSettings} 
            clearAll={clearAll} 
            onUpload={handleUpload}
          />

          {copied && (
            <div className="rounded-xl border border-emerald-400 bg-emerald-500/10 text-emerald-600 px-4 py-3 text-sm">
              {copied} copied to clipboard.
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <EditorPanel
              title="PHP Input Editor"
              value={input}
              onChange={setInput}
              search={search}
              onSearch={setSearch}
              onCopy={() => copyText(input, "Input PHP")}
              placeholder="Paste or write PHP code here... e.g. <?php echo 'Hello World'; ?>"
            />
            <EditorPanel
              title="Beautified Output"
              value={output}
              readOnly
              placeholder={outputPlaceholder}
              onCopy={() => copyText(output, "Formatted PHP")}
              onDownload={downloadPhp}
            />
          </div>

          <StatusPanels messages={result.messages} stats={stats} history={history} restoreHistory={restoreHistory} />

        </main>

        <Features />
      </div>
    </div>
  );
}

function getSavedState() {
  if (typeof window === "undefined") {
    return { input: "", settings: DEFAULT_SETTINGS };
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      input: saved.input || "",
      settings: { ...DEFAULT_SETTINGS, ...(saved.settings || {}) },
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return { input: "", settings: DEFAULT_SETTINGS };
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
