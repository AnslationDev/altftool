"use client";
import { useState, useMemo } from "react";
import { Clipboard, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";
import { STYLES, getEnclosedStyle, transformEnclosedText } from "../lib";

export default function ToolHome() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const [activeStyle, setActiveStyle] = useState("circled");

  const currentStyle = getEnclosedStyle(activeStyle);
  const result = useMemo(() => transformEnclosedText(text, currentStyle), [text, currentStyle]);

  const handleCopy = async (id, value) => {
    if (!value) return;
    setCopied(await safeCopyText(value) ? id : "");
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Circled Text Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">Convert supported text into enclosed Unicode characters</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                activeStyle === style.id
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
              }`}
            >
              {style.label}
            </button>
          ))}
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
              onClick={() => { setText(""); setCopied(""); }}
              disabled={!text}
              className="flex items-center gap-1 text-xs text-(--muted-foreground) hover:text-(--foreground) disabled:opacity-40 transition"
            >
              <RotateCcw size="12" /> Reset
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-(--foreground)">{currentStyle.label} Output</h2>
            <button
              onClick={() => handleCopy(activeStyle, result)}
              disabled={!result}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-(--primary) text-(--primary-foreground) text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition"
            >
              <Clipboard size="16" />
              {copied === activeStyle ? "Copied!" : "Copy"}
            </button>
          </div>
          {result ? (
            <p className="break-all text-xl leading-9 sm:text-2xl text-(--foreground)">{result}</p>
          ) : (
            <p className="text-sm text-(--muted-foreground) py-6 text-center">Enter text above to see circled output</p>
          )}
        </div>
      </div>
    </main>
  );
}
