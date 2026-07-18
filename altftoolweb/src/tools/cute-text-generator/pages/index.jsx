"use client";
import { useState, useMemo } from "react";
import { Clipboard, RotateCcw, Search, Star } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STYLES = [
  {
    id: "kawaii",
    label: "Kawaii",
    prefix: "\u3042\u308a\u304c\u3068\u3046 ",
    suffix: " \u2764",
    transform: (t) => t.toLowerCase().split("").join("\u3000"),
  },
  {
    id: "decoration",
    label: "Decorated",
    prefix: "\u2728 ",
    suffix: " \u2728",
    transform: (t) => t,
  },
  {
    id: "sparkle",
    label: "Sparkle",
    prefix: "\u2606* ",
    suffix: " *\u2606",
    transform: (t) => t,
  },
  {
    id: "heart",
    label: "Hearts",
    prefix: "\u2661 ",
    suffix: " \u2661",
    transform: (t) => t.split("").join(" \u2661 "),
  },
  {
    id: "star",
    label: "Stars",
    prefix: "\u2b50 ",
    suffix: " \u2b50",
    transform: (t) => t.split("").join(" \u2605 "),
  },
  {
    id: "dotty",
    label: "Dotty",
    prefix: "\u2022 ",
    suffix: " \u2022",
    transform: (t) => t.split("").join(" \u00b7 "),
  },
  {
    id: "flower",
    label: "Flower",
    prefix: "\u273f ",
    suffix: " \u273f",
    transform: (t) => t,
  },
  {
    id: "moons",
    label: "Moons",
    prefix: "\u263e ",
    suffix: " \u263d",
    transform: (t) => t.split("").join(" \u263f "),
  },
];

const KAOMOJI = [
  "(\u30c5\u309c\u309c\u30c5)", "(\u2323\u25d4\u203f\u25d4\u2323)",
  "(\u25d5\u203f\u25d5\u2741)", "(\u25e1\u25e1\u2741)", "(\u30fb\u03c9\u30fb)",
  "(\uffe3\u25d5\u3145\u25d5\uffe3)", "(\u2560\u25d5\u203f\u25d5\u2560)",
  "\u30fd(\uff9f\u25d5\u30e5\u25d5\uff9f)\u30ce", "(\u2560_\u2560)",
  "\uff08\u25d5\u25e1\u25d5\uff09", "(\u25d5\u3145\u25d5)",
  "(\u02c3\u25d4\u0300\u3145\u25d4\u0301)", "(\u02c3\u25d5\u25e1\u25d5\u02c2)",
  "\u30ce(\u309c-\u309c)\u30ce", "\u256e(\u25d5\u25e1\u25d5)\u256f",
  "(\u256f\u25d5\u25e1\u25d5)\u256f", "(\u25d5\u2032\u25e1\u2032\u25d5)",
  "(\uff9f\u25d5\u3145\u25d5\uff9f)", "(\u25e1\u0300_\u25e1\u0301)",
  "(\u25d5\u203f\u25d5\u2741)",
];

const CUTE_SYMBOLS = [
  "\u2764", "\u2661", "\u2665", "\u2728", "\u2606", "\u2605",
  "\u273f", "\u2740", "\u2b50", "\u2727", "\u266a", "\u266b",
  "\u263e", "\u263d", "\u263f", "\u00b0", "\u2022", "\u266c",
];

export default function ToolHome() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const [activeStyle, setActiveStyle] = useState("kawaii");
  const [favorites, setFavorites] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const currentStyle = STYLES.find((s) => s.id === activeStyle) || STYLES[0];

  const result = useMemo(() => {
    if (!text) return "";
    return currentStyle.prefix + currentStyle.transform(text) + currentStyle.suffix;
  }, [text, currentStyle]);

  const filteredStyles = useMemo(() => {
    if (!searchTerm) return STYLES;
    return STYLES.filter((s) => s.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleCopy = async (value) => {
    if (!value) return;
    setCopied(await safeCopyText(value) ? "main" : "");
    setTimeout(() => setCopied(""), 1500);
  };

  const randomKaomoji = KAOMOJI[Math.floor(Math.random() * KAOMOJI.length)];

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Cute Text Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">
            Convert your text into adorable Unicode styles with kaomoji and decorations
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-(--foreground)">Input Text</span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type something cute..."
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

        <div className="relative">
          <Search size="16" className="absolute left-3 top-1/2 -translate-y-1/2 text-(--muted-foreground)" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search styles..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-(--border) bg-(--card) text-(--foreground) placeholder:text-(--muted-foreground) outline-none focus:border-(--primary) text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filteredStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition flex items-center gap-1.5 ${
                activeStyle === style.id
                  ? "bg-(--primary) text-(--primary-foreground) border-(--primary)"
                  : "bg-(--card) text-(--muted-foreground) border-(--border) hover:border-(--primary)"
              }`}
            >
              {style.label}
              <button
                onClick={(e) => { e.stopPropagation(); toggleFavorite(style.id); }}
                className="p-0.5"
              >
                <Star size="12" className={favorites.includes(style.id) ? "fill-amber-400 text-amber-400" : ""} />
              </button>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredStyles.map((style) => {
            const val = style.prefix + style.transform(text || "cute") + style.suffix;
            return (
              <div
                key={style.id}
                className={`rounded-2xl border p-5 space-y-3 transition ${
                  activeStyle === style.id
                    ? "border-(--primary) bg-(--card)"
                    : "border-(--border) bg-(--card) hover:border-(--primary)"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-(--foreground)">{style.label}</h3>
                    <button onClick={() => toggleFavorite(style.id)}>
                      <Star size="12" className={favorites.includes(style.id) ? "fill-amber-400 text-amber-400" : "text-(--muted-foreground)"} />
                    </button>
                  </div>
                  <button
                    onClick={() => handleCopy(val)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) text-xs font-semibold hover:opacity-90 transition"
                  >
                    <Clipboard size="14" />
                    {copied === "main" ? "Copied!" : "Copy"}
                  </button>
                </div>
                <p className="break-all text-lg leading-8 text-(--foreground)">{val}</p>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-3">
          <h2 className="text-sm font-semibold text-(--foreground)">Kaomoji & Cute Symbols</h2>
          <div className="flex flex-wrap gap-2">
            {KAOMOJI.slice(0, 10).map((kao, i) => (
              <button
                key={i}
                onClick={async () => {
                  const ok = await safeCopyText(kao);
                  if (ok) setCopied("kao-" + i);
                  setTimeout(() => setCopied(""), 1000);
                }}
                className="px-3 py-2 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) text-sm hover:border-(--primary) transition font-mono"
              >
                {kao}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CUTE_SYMBOLS.map((sym, i) => (
              <button
                key={i}
                onClick={async () => {
                  const ok = await safeCopyText(sym);
                  if (ok) setCopied("sym-" + i);
                  setTimeout(() => setCopied(""), 1000);
                }}
                className="w-10 h-10 rounded-xl bg-(--muted) border border-(--border) text-(--foreground) text-lg hover:border-(--primary) transition flex items-center justify-center"
              >
                {sym}
              </button>
            ))}
          </div>
          {copied && <p className="text-xs text-green-600">Copied!</p>}
        </div>
      </div>
    </main>
  );
}
