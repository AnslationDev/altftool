"use client";
import { useState, useMemo } from "react";
import { Clipboard, RotateCcw, Info, X } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const SUB_MAP = {
  a: "\u1d43", b: "\u1d47", c: "\u1d9c", d: "\u1d48", e: "\u1d49",
  f: "\u1da0", g: "\u1d4d", h: "\u02b0", i: "\u2071", j: "\u02b2",
  k: "\u1d4f", l: "\u02e1", m: "\u1d50", n: "\u207f", o: "\u1d52",
  p: "\u1d56", r: "\u02b3", s: "\u02e2", t: "\u1d57", u: "\u1d58",
  v: "\u1d5b", w: "\u02b7", x: "\u02e3", y: "\u02b8", z: "\u1dbb",
  "0": "\u2080", "1": "\u2081", "2": "\u2082", "3": "\u2083",
  "4": "\u2084", "5": "\u2085", "6": "\u2086", "7": "\u2087",
  "8": "\u2088", "9": "\u2089",
  "+": "\u208a", "-": "\u208b", "=": "\u208c", "(": "\u208d", ")": "\u208e",
};

const SUB_CHARS = Object.keys(SUB_MAP);

function toSubscript(text) {
  return text.split("").map((ch) => SUB_MAP[ch] || ch).join("");
}

export default function ToolHome() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const result = useMemo(() => toSubscript(text), [text]);

  const unsupported = useMemo(() => {
    if (!text) return [];
    return text.split("").filter((ch) => !SUB_CHARS.includes(ch) && !/[\s]/.test(ch));
  }, [text]);

  const handleCopy = async () => {
    if (!result) return;
    setCopied(await safeCopyText(result));
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Subscript Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">Convert text into Unicode subscript characters</p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-(--foreground)">Input Text</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              className="mt-2 w-full rounded-xl border border-(--border) bg-(--background) px-4 py-3 text-lg outline-none focus:border-(--primary) text-(--foreground) placeholder:text-(--muted-foreground) resize-none"
              rows="3"
            />
          </label>

          <div className="flex items-center justify-between">
            <span className="text-xs text-(--muted-foreground)">{text.length} characters</span>
            <button
              onClick={() => { setText(""); setCopied(false); }}
              disabled={!text}
              className="flex items-center gap-1 text-xs text-(--muted-foreground) hover:text-(--foreground) disabled:opacity-40 transition"
            >
              <RotateCcw size="12" /> Reset
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-(--foreground)">Subscript Output</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 rounded-lg hover:bg-(--muted) text-(--muted-foreground) transition"
              >
                <Info size="16" />
              </button>
              <button
                onClick={handleCopy}
                disabled={!result}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition"
              >
                <Clipboard size="16" />
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          {result ? (
            <p className="break-all text-xl leading-9 sm:text-2xl text-(--foreground)">{result}</p>
          ) : (
            <p className="text-sm text-(--muted-foreground) py-6 text-center">Enter text above to see subscript output</p>
          )}

          {unsupported.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                Unsupported characters: {unsupported.join(" ")}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                These characters have no subscript equivalent and will appear as-is.
              </p>
            </div>
          )}

          {showInfo && (
            <div className="p-4 rounded-xl bg-(--muted) border border-(--border) space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-(--foreground) uppercase">Supported Characters</h3>
                <button onClick={() => setShowInfo(false)} className="text-(--muted-foreground) hover:text-(--foreground)">
                  <X size="14" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {SUB_CHARS.filter((c) => c !== " ").map((ch) => (
                  <span key={ch} className="px-1.5 py-0.5 rounded bg-(--card) text-xs font-mono text-(--foreground) border border-(--border)">
                    {ch}
                  </span>
                ))}
              </div>
              <p className="text-xs text-(--muted-foreground)">Unsupported characters appear in their original form.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
