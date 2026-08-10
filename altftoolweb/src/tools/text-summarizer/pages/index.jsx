"use client";

"use-client";
import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import Description from "../components/Description"

function localSummarize(text, level) {
  if (!text || !text.trim()) return "";
  // ASCII terminal punctuation requires trailing whitespace (so decimals like
  // "3.14" are not split); CJK/full-width terminal punctuation is often not
  // followed by a space, so its trailing whitespace is optional. The
  // lookbehind splits *after* the punctuation instead of consuming it, so
  // each sentence keeps its own terminal mark (a question stays a question)
  // instead of every sentence being forced onto a shared "." later.
  const sentences = text
    .split(/(?<=[.?!])\s+|(?<=[。！？])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length <= 2) return text;

  let count = level === "short" ? 1 : level === "medium" ? 2 : 3;

  // Every sentence above already carries its own terminal punctuation from
  // the split; only fall back to "." when the source sentence had none.
  const withEnd = (s) => (/[.?!。！？]$/.test(s) ? s : s + ".");

  const first = withEnd(sentences[0]);
  const middle = withEnd(sentences[Math.floor(sentences.length / 2)]);
  const last = withEnd(sentences[sentences.length - 1]);

  if (count === 1) return first;
  if (count === 2) return first + " " + last;
  return first + " " + middle + " " + last;
}

export default function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [level, setLevel] = useState("medium");
  const [history, setHistory] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  const handleSummarize = () => {
    const result = localSummarize(text, level);
    if (result) {
      setSummary(result);
      setHistory((prev) =>
        [{ text, summary: result, level, id: Date.now() }, ...prev].slice(
          0,
          10,
        ),
      );
    }
  };

  const handleCopySummary = () => {
    if (!summary) return;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleDownloadSummary = () => {
    if (!summary) return;

    const blob = new Blob([summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (!text && !summary) return;
    const confirmed = window.confirm(
      "Clear the text and summary? This cannot be undone.",
    );
    if (!confirmed) return;
    setText("");
    setSummary("");
  };

  const handleRestoreHistory = (item) => {
    setText(item.text);
    setSummary(item.summary);
    setLevel(item.level);
    setHistoryOpen(false);
  };

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)">
      <Header />
      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-6 pb-20">
        {/* SUMMARIZER */}
        <section id="summarizer" className="mt-12">
          <div className="bg-(--card) border border-(--border) rounded-xl p-4 sm:p-6 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-6">
              {/* LEFT INPUT */}
              <div>
                <label htmlFor="summarizer-input" className="font-bold mb-2 block text-(--foreground)/80">
                  Paste your text
                </label>

                <textarea
                  id="summarizer-input"
                  className="
                    w-full min-h-40 sm:min-h-56
                    bg-(--background)
                    border border-(--border)
                    rounded-lg
                    p-3 sm:p-4
                    outline-none
                    focus:ring-2 focus:ring-(--primary)
                  "
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />

                {/* CONTROLS */}
                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* LEVEL */}
                  <div className="flex gap-2 flex-wrap">
                    {["short", "medium", "long"].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setLevel(lvl)}
                        aria-pressed={level === lvl}
                        className={`px-4 py-2 rounded-lg border text-sm
                          ${
                            level === lvl
                              ? "bg-(--primary) text-(--primary-foreground)"
                              : "border-(--border) text-(--muted-foreground)"
                          }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={handleSummarize}
                      className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg text-sm"
                    >
                      Summarize
                    </button>

                    <button
                      onClick={handleClear}
                      className="border border-(--border) px-4 py-2 rounded-lg text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT SUMMARY */}
              <div className="h-full">
                {summary ? (
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-bold text-sm sm:text-base">
                        Summary{" "}
                        <span className="text-xs sm:text-sm">({level})</span>
                      </h3>

                      <div className="flex gap-2">
                        <button
                          onClick={handleDownloadSummary}
                          className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-(--border) hover:bg-(--muted) transition"
                        >
                          Download
                        </button>

                        <button
                          onClick={handleCopySummary}
                          aria-live="polite"
                          className="px-3 py-1.5 text-xs sm:text-sm rounded-md border border-(--border) hover:bg-(--muted) transition"
                        >
                          {copied ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    <div
                      role="status"
                      aria-live="polite"
                      className="flex-1 bg-(--background) border border-(--border) rounded-lg p-4 text-sm leading-relaxed whitespace-pre-wrap"
                    >
                      {summary}
                    </div>
                  </div>
                ) : (
                  <div className="h-full bg-(--background) border border-(--border) rounded-lg p-6 flex items-center justify-center text-center text-(--muted-foreground) text-sm">
                    No summary yet
                  </div>
                )}
              </div>
            </div>

            {/* HISTORY */}
            {history.length > 0 && (
              <div className="mt-6 border-t border-(--border) pt-4">
                <button
                  onClick={() => setHistoryOpen((prev) => !prev)}
                  aria-expanded={historyOpen}
                  className="flex items-center justify-between w-full text-left font-bold text-sm sm:text-base"
                >
                  <span>History ({history.length})</span>
                  <span className="text-(--muted-foreground) text-xs font-normal">
                    {historyOpen ? "Hide" : "Show"}
                  </span>
                </button>

                {historyOpen && (
                  <ul className="mt-3 flex flex-col gap-2 max-h-64 overflow-y-auto">
                    {history.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleRestoreHistory(item)}
                          className="w-full text-left px-3 py-2 rounded-lg border border-(--border) bg-(--background) hover:bg-(--muted) transition text-xs sm:text-sm"
                        >
                          <span className="block font-semibold text-(--foreground)/80">
                            {item.level} &middot;{" "}
                            {new Date(item.id).toLocaleTimeString()}
                          </span>
                          <span className="block text-(--muted-foreground) truncate">
                            {item.summary}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </section>
        {/* FEATURES */}
        <section id="features" className="mt-10">
          <h2 className="text-center text-2xl font-bold mb-6">Features</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {["Quick Summaries", "Copy & Download", "History", "Clean UI"].map(
              (f, i) => (
                <div
                  key={i}
                  className="p-5 rounded-xl border border-(--border) bg-(--card) shadow"
                >
                  <div className="w-9 h-9 mb-3 rounded-lg bg-(--primary) text-(--primary-foreground) flex items-center justify-center font-bold">
                    {i + 1}
                  </div>

                  <h3 className="font-bold mb-2">{f}</h3>

                  <p className="text-sm text-(--muted-foreground)">
                    Simple, fast and clean experience.
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
            {/* Render Description at the very end */}
        <Description />
        
      </main>
    </div>
  );
}
