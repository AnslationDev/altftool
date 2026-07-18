"use client";
import { useState, useMemo } from "react";
import { Clipboard, RotateCcw, Shuffle } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const LETTERS = "abcdefghijklmnopqrstuvwxyz".split("");

const THEMES = {
  regional: {
    label: "Regional Indicators",
    desc: "Letter emoji flags (🇦 🇧 🇨...)",
    map: Object.fromEntries(
      LETTERS.map((l, i) => [l, String.fromCodePoint(0x1f1e6 + i)])
    ),
  },
  negative: {
    label: "Negative Squared",
    desc: "Negative squared letters 🅰 🅱 🅲...",
    map: Object.fromEntries(
      LETTERS.map((l, i) => [l, String.fromCodePoint(0x1f170 + i)])
    ),
  },
  positive: {
    label: "Positive Squared",
    desc: "Positive squared letters",
    map: Object.fromEntries(
      LETTERS.map((l, i) => [l, String.fromCodePoint(0x1f130 + i)])
    ),
  },
  bubble: {
    label: "Bubble Letters",
    desc: "Circled letter emoji style",
    map: Object.fromEntries(
      LETTERS.map((l, i) => {
        const codes = [
          0x1f150, 0x1f151, 0x1f152, 0x1f153, 0x1f154, 0x1f155,
          0x1f156, 0x1f157, 0x1f158, 0x1f159, 0x1f15a, 0x1f15b,
          0x1f15c, 0x1f15d, 0x1f15e, 0x1f15f, 0x1f160, 0x1f161,
          0x1f162, 0x1f163, 0x1f164, 0x1f165, 0x1f166, 0x1f167,
          0x1f168, 0x1f169,
        ];
        return [l, String.fromCodePoint(codes[i])];
      })
    ),
  },
};

export default function ToolHome() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const [activeTheme, setActiveTheme] = useState("regional");
  const [randomMode, setRandomMode] = useState(false);

  const currentTheme = THEMES[activeTheme] || THEMES.regional;

  const result = useMemo(() => {
    if (!text) return "";
    return text
      .toLowerCase()
      .split("")
      .map((ch) => {
        if (randomMode && /[a-z]/.test(ch)) {
          const themes = Object.values(THEMES);
          const randomTheme = themes[Math.floor(Math.random() * themes.length)];
          return randomTheme.map[ch] || ch;
        }
        return currentTheme.map[ch] || ch;
      })
      .join(" ");
  }, [text, currentTheme, randomMode]);

  const handleCopy = async (value) => {
    if (!value) return;
    setCopied(await safeCopyText(value) ? "main" : "");
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Emoji Letter Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">Convert letters into emoji equivalents with multiple themes</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(THEMES).map(([id, theme]) => (
            <button
              key={id}
              onClick={() => setActiveTheme(id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition ${
                activeTheme === id
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
              }`}
            >
              {theme.label}
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
            <div className="flex items-center gap-3">
              <span className="text-xs text-(--muted-foreground)">{text.length} characters</span>
              <label className="flex items-center gap-1.5 text-xs text-(--muted-foreground) cursor-pointer">
                <input
                  type="checkbox"
                  checked={randomMode}
                  onChange={(e) => setRandomMode(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
                />
                <Shuffle size="12" /> Random
              </label>
            </div>
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
            <div>
              <h2 className="text-sm font-semibold text-(--foreground)">{currentTheme.label} Output</h2>
              <p className="text-xs text-(--muted-foreground) mt-0.5">{currentTheme.desc}</p>
            </div>
            <button
              onClick={() => handleCopy(result)}
              disabled={!result}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-(--primary) text-(--primary-foreground) text-sm font-semibold hover:opacity-90 disabled:opacity-40 transition"
            >
              <Clipboard size="16" />
              {copied === "main" ? "Copied!" : "Copy"}
            </button>
          </div>
          {result ? (
            <p className="break-all text-xl leading-9 sm:text-2xl text-(--foreground)">{result}</p>
          ) : (
            <p className="text-sm text-(--muted-foreground) py-6 text-center">Enter text above to see emoji letters</p>
          )}
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5">
          <h2 className="text-sm font-semibold text-(--foreground) mb-3">Letter Reference</h2>
          <div className="flex flex-wrap gap-1.5">
            {LETTERS.map((l) => (
              <span key={l} className="flex flex-col items-center px-2 py-1 rounded-lg bg-(--muted) border border-(--border)">
                <span className="text-[10px] font-mono text-(--muted-foreground)">{l}</span>
                <span className="text-lg">{currentTheme.map[l] || l}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
