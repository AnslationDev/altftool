"use client";
import { useState } from "react";
import { Clipboard, Check, Eye, EyeOff, Info } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const CHARACTERS = [
  {
    id: "zwsp",
    name: "Zero-Width Space (ZWSP)",
    char: "\u200B",
    code: "U+200B",
    desc: "An invisible space that creates a line break opportunity without visible space.",
    use: "Hidden text in usernames, preventing auto-linking.",
  },
  {
    id: "zwnj",
    name: "Zero-Width Non-Joiner (ZWNJ)",
    char: "\u200C",
    code: "U+200C",
    desc: "Prevents two adjacent characters from being joined into a ligature.",
    use: "Typography, separating characters in scripts.",
  },
  {
    id: "zwj",
    name: "Zero-Width Joiner (ZWJ)",
    char: "\u200D",
    code: "U+200D",
    desc: "Joins two characters together, often used to create emoji sequences.",
    use: "Creating custom emoji combinations (e.g., family emoji).",
  },
  {
    id: "lr",
    name: "Left-to-Right Mark (LRM)",
    char: "\u200E",
    code: "U+200E",
    desc: "Indicates that the following text should be treated as left-to-right.",
    use: "Mixing LTR and RTL text in the same paragraph.",
  },
  {
    id: "rl",
    name: "Right-to-Left Mark (RLM)",
    char: "\u200F",
    code: "U+200F",
    desc: "Indicates that the following text should be treated as right-to-left.",
    use: "Mixing RTL and LTR text correctly.",
  },
  {
    id: "nbps",
    name: "Non-Breaking Space (NBSP)",
    char: "\u00A0",
    code: "U+00A0",
    desc: "A space that prevents automatic line breaks at its position.",
    use: "Keeping units with numbers (e.g., 100 km).",
  },
  {
    id: "mspace",
    name: "Medium Mathematical Space",
    char: "\u205F",
    code: "U+205F",
    desc: "A medium-width space used in mathematical typesetting.",
    use: "Math formulas, academic writing.",
  },
  {
    id: "hair",
    name: "Hair Space",
    char: "\u200A",
    code: "U+200A",
    desc: "The thinnest available Unicode space character.",
    use: "Fine typographic adjustments.",
  },
  {
    id: "thsp",
    name: "Thin Space",
    char: "\u2009",
    code: "U+2009",
    desc: "A thin space, about one-fifth of an em.",
    use: "Separating thousands in numbers, typographic spacing.",
  },
  {
    id: "punct",
    name: "Invisible Separator",
    char: "\u2063",
    code: "U+2063",
    desc: "An invisible separator between characters.",
    use: "Separating text elements without visible characters.",
  },
];

export default function ToolHome() {
  const [copied, setCopied] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const handleCopy = async (id, char) => {
    const ok = await safeCopyText(char);
    setCopied(ok ? id : "");
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <main className="min-h-screen bg-(--background) px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border border-(--border) bg-(--card) p-6">
          <h1 className="text-3xl font-bold text-(--foreground)">Invisible Character Generator</h1>
          <p className="mt-1 text-(--muted-foreground)">
            Generate and copy invisible Unicode characters for various uses
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-4">
          <label className="flex items-center gap-2 text-sm text-(--muted-foreground) cursor-pointer">
            <input
              type="checkbox"
              checked={showPreview}
              onChange={(e) => setShowPreview(e.target.checked)}
              className="w-4 h-4 rounded border-(--border) text-(--primary) focus:ring-(--primary)"
            />
            <Eye size="14" /> Show invisible character previews
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHARACTERS.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-(--border) bg-(--card) p-5 space-y-3 hover:border-(--primary) transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-(--foreground)">{item.name}</h3>
                  <span className="text-[10px] font-mono text-(--muted-foreground)">{item.code}</span>
                </div>
                <button
                  onClick={() => handleCopy(item.id, item.char)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-(--primary) text-(--primary-foreground) text-xs font-semibold hover:opacity-90 transition"
                >
                  {copied === item.id ? <Check size="14" /> : <Clipboard size="14" />}
                  {copied === item.id ? "Copied!" : "Copy"}
                </button>
              </div>

              {showPreview && (
                <div className="p-3 rounded-xl bg-(--muted) border border-(--border) text-center">
                  <p className="text-xs text-(--muted-foreground) mb-1">Preview (surrounded by brackets):</p>
                  <span className="text-lg font-mono text-(--foreground)">
                    [<span className="text-(--primary)">{item.char}</span>]
                  </span>
                </div>
              )}

              <p className="text-xs text-(--muted-foreground) leading-relaxed">{item.desc}</p>

              <div className="p-2.5 rounded-lg bg-(--muted) border border-(--border)">
                <p className="text-[10px] font-semibold text-(--muted-foreground) uppercase mb-0.5">Usage</p>
                <p className="text-xs text-(--foreground)">{item.use}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
