"use client";

import React, { useState, useEffect } from "react";
import { RotateCw, CheckCircle2, Copy, FileText, Sparkles } from "lucide-react";

// Unicode flip character mappings
const FLIP_MAP = {
  a: "ɐ", b: "q", c: "ɔ", d: "p", e: "ǝ", f: "ɟ", g: "ƃ", h: "ɥ", i: "ı", j: "ſ", k: "ʞ", l: "l", m: "ɯ",
  n: "u", o: "o", p: "d", q: "b", r: "ɹ", s: "s", t: "ʇ", u: "n", v: "ʌ", w: "ʍ", x: "x", y: "ʎ", z: "z",
  A: "∀", B: "𐐒", C: "Ɔ", D: "◖", E: "Ǝ", F: "Ⅎ", G: "פ", H: "H", I: "I", J: "ſ", K: "ʞ", L: "˥", M: "W",
  N: "N", O: "O", P: "Ԁ", Q: "Ό", R: "ᴚ", S: "S", T: "┴", U: "∩", V: "Λ", W: "M", X: "X", Y: "⅄", Z: "Z",
  1: "Ɩ", 2: "ᄅ", 3: "Ɛ", 4: "ㄣ", 5: "ϛ", 6: "9", 7: "ㄥ", 8: "8", 9: "6", 0: "0",
  ".": "˙", ",": "`", "'": ",", '"': "„", "?": "¿", "!": "¡", "(": ")", ")": "(", "[": "]", "]": "[", "{": "}", "}": "{", "<": ">", ">": "<",
  "&": "⅋", "_": "‾", ";": "؛", "`": ",", "-": "-", "+": "+"
};

const BUBBLE_MAP = {
  a: "ⓐ", b: "ⓑ", c: "ⓒ", d: "ⓓ", e: "ⓔ", f: "ⓕ", g: "ⓖ", h: "ⓗ", i: "ⓘ", j: "ⓙ", k: "ⓚ", l: "ⓛ", m: "ⓜ",
  n: "ⓝ", o: "ⓞ", p: "ⓟ", q: "ⓠ", r: "ⓡ", s: "ⓢ", t: "ⓣ", u: "ⓤ", v: "ⓥ", w: "ⓦ", x: "ⓧ", y: "ⓨ", z: "ⓩ",
  A: "Ⓐ", B: "Ⓑ", C: "Ⓒ", D: "Ⓓ", E: "Ⓔ", F: "Ⓕ", G: "Ⓖ", H: "Ⓗ", I: "Ⓘ", J: "Ⓙ", K: "Ⓚ", L: "Ⓛ", M: "Ⓜ",
  N: "Ⓝ", O: "Ⓞ", P: "Ⓟ", Q: "Ⓠ", R: "Ⓡ", S: "Ⓢ", T: "Ⓣ", U: "Ⓤ", V: "Ⓥ", W: "Ⓦ", X: "Ⓧ", Y: "Ⓨ", Z: "Ⓩ",
  "1": "①", "2": "②", "3": "③", "4": "④", "5": "⑤", "6": "⑥", "7": "⑦", "8": "⑧", "9": "⑨", "0": "⓪"
};

const SQUARE_MAP = {
  a: "🄰", b: "🄱", c: "🄲", d: "🄳", e: "🄴", f: "🄵", g: "🄶", h: "🄷", i: "🄸", j: "🄹", k: "🄺", l: "🄻", m: "🄼",
  n: "🄽", o: "🄾", p: "🄿", q: "🅀", r: "🅁", s: "🅂", t: "🅃", u: "🅄", v: "🅅", w: "🅆", x: "🅇", y: "🅈", z: "🅉",
  A: "🄰", B: "🄱", C: "🄲", D: "🄳", E: "🄴", F: "🄵", G: "🄶", H: "🄷", I: "🄸", J: "🄹", K: "🄺", L: "🄻", M: "🄼",
  N: "🄽", O: "🄾", P: "🄿", Q: "🅀", R: "🅁", S: "🅂", T: "🅃", U: "🅄", V: "🅅", W: "🅆", X: "🅇", Y: "🅈", Z: "🅉"
};

const LEET_MAP = {
  a: "4", b: "8", e: "3", g: "9", i: "1", o: "0", s: "5", t: "7", z: "2",
  A: "4", B: "8", E: "3", G: "9", I: "1", O: "0", S: "5", T: "7", Z: "2"
};

export default function ToolHome() {
  const [input, setInput] = useState("Flip this text upside down!");
  const [output, setOutput] = useState("");
  const [styleMode, setStyleMode] = useState("upside-down"); // 'upside-down' | 'bubble' | 'square' | 'mirror' | 'leet'
  const [backwards, setBackwards] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input) {
      setOutput("");
      return;
    }

    let result = "";
    if (styleMode === "upside-down") {
      const flippedChars = input.split("").map((char) => FLIP_MAP[char] || char);
      result = backwards ? flippedChars.reverse().join("") : flippedChars.join("");
    } else if (styleMode === "bubble") {
      result = input.split("").map((char) => BUBBLE_MAP[char] || char).join("");
    } else if (styleMode === "square") {
      result = input.split("").map((char) => SQUARE_MAP[char] || char).join("");
    } else if (styleMode === "mirror") {
      result = input.split("").reverse().join("");
    } else if (styleMode === "leet") {
      result = input.split("").map((char) => LEET_MAP[char] || char).join("");
    }

    setOutput(result);
  }, [input, styleMode, backwards]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft text-primary group-hover:bg-primary/10 transition-colors duration-300">
                <RotateCw className="h-5 w-5 text-primary group-hover:rotate-180 group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground leading-none">
                    Upside Down Text
                  </h1>
                  <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Text, Utility
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl leading-relaxed">
                  Transform standard strings into upside-down mathematical representations for custom usernames, gaming tags, or tweets.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold text-muted-foreground shrink-0 self-start md:self-auto">
              {["Runs locally", "No upload", "Instant"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1">
                  <CheckCircle2 className="h-3 w-3 text-primary" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Workspace Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "upside-down", label: "Upside Down" },
                { id: "bubble", label: "Bubble Text" },
                { id: "square", label: "Block Text" },
                { id: "mirror", label: "Mirror/Reverse" },
                { id: "leet", label: "Leetspeak" }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setStyleMode(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    styleMode === m.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-background border-border hover:bg-surface-soft text-foreground"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            
            {styleMode === "upside-down" && (
              <label className="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={backwards}
                  onChange={(e) => setBackwards(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                Reverse Character Order (Backwards + Upside Down)
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-primary" />
                Normal Input Text
              </label>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type text to flip..."
                rows={8}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition"
              />
            </div>

            {/* Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-primary" />
                  Styled Flipped Output
                </label>
                <button
                  onClick={handleCopy}
                  disabled={!output}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-foreground bg-background border border-border rounded-lg px-2.5 py-1.5 hover:border-primary transition disabled:opacity-50"
                >
                  {copied ? <CheckCircle2 size={12} className="text-primary" /> : <Copy size={12} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                placeholder="Resulting output..."
                rows={8}
                className="w-full bg-surface-soft border border-border rounded-xl font-mono text-sm leading-relaxed p-4 outline-none resize-none cursor-text"
              />
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
