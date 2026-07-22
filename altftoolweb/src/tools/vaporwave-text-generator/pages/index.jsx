"use client";
import { useState, useMemo } from "react";
import { Clipboard, RotateCcw, Shuffle } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

function toFullWidth(text) {
  return text.split("").map((ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 0x21 && code <= 0x7e) {
      return String.fromCharCode(code + 0xfee0);
    }
    if (code === 0x20) return "\u3000";
    return ch;
  }).join("");
}

function toFullWidthWide(text) {
  return text.split("").map((ch) => {
    const code = ch.charCodeAt(0);
    if (code >= 0x21 && code <= 0x7e) {
      return String.fromCharCode(code + 0xfee0);
    }
    return ch;
  }).join(" ");
}

function toAesthetic(text) {
  const result = toFullWidth(text);
  const decorations = [
    "\u2606", "\u2727", "\u2661", "\u2665", "\u273f", "\u2740",
    "\u2728", "\u00b0", "\u2022", "\u25cb", "\u25c7", "\u266a",
  ];
  const sep = decorations[Math.floor(Math.random() * decorations.length)];
  return `${sep} ${result} ${sep}`;
}

function toVaporwave(text) {
  return `\uff3c ${toFullWidth(text)} \uff0f`;
}

const STYLES = [
  { id: "fullwidth", label: "Full-Width", transform: toFullWidth },
  { id: "wide", label: "Wide Spaced", transform: toFullWidthWide },
  { id: "aesthetic", label: "Aesthetic", transform: toAesthetic },
  { id: "vaporwave", label: "Vaporwave", transform: toVaporwave },
];

const SEPARATORS = [
  "\u3000\u223e\u3000", "\u3000\u2661\u3000", "\u3000\u2727\u3000",
  "\u3000\u25c7\u3000", "\u3000\u203e\u203e\u3000", "\u3000\u00b0\u3000",
];

export default function ToolHome() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const [activeStyle, setActiveStyle] = useState("fullwidth");

  const currentStyle = STYLES.find((s) => s.id === activeStyle) || STYLES[0];

  const result = useMemo(() => {
    if (!text) return "";
    const transformed = currentStyle.transform(text);
    const sep = SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)];
    return `\u300e${transformed}\u300f`;
  }, [text, currentStyle]);

  const allResults = useMemo(() => {
    if (!text) return [];
    return STYLES.map((style) => ({
      id: style.id,
      label: style.label,
      value: `\u300e${style.transform(text)}\u300f`,
    }));
  }, [text]);

  const handleCopy = async (id, value) => {
    if (!value) return;
    setCopied(await safeCopyText(value) ? id : "");
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Vaporwave Text Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">Convert text into full-width vaporwave aesthetic styles</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allResults.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 space-y-3 transition ${
                activeStyle === item.id
                  ? "border-(--primary) bg-(--card)"
                  : "border-(--border) bg-(--card) hover:border-(--primary)"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-(--foreground)">{item.label}</h3>
                <button
                  onClick={() => handleCopy(item.id, item.value)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) text-xs font-semibold hover:opacity-90 transition"
                >
                  <Clipboard size="14" />
                  {copied === item.id ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="break-all text-lg leading-8 text-(--foreground) font-mono">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
