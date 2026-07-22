"use client";
import { useState, useMemo } from "react";
import { Clipboard, RotateCcw } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const STYLES = [
  {
    id: "circled",
    label: "Circled",
    map: {
      a: "\u24d0", b: "\u24d1", c: "\u24d2", d: "\u24d3", e: "\u24d4",
      f: "\u24d5", g: "\u24d6", h: "\u24d7", i: "\u24d8", j: "\u24d9",
      k: "\u24da", l: "\u24db", m: "\u24dc", n: "\u24dd", o: "\u24de",
      p: "\u24df", q: "\u24e0", r: "\u24e1", s: "\u24e2", t: "\u24e3",
      u: "\u24e4", v: "\u24e5", w: "\u24e6", x: "\u24e7", y: "\u24e8", z: "\u24e9",
      A: "\u24b6", B: "\u24b7", C: "\u24b8", D: "\u24b9", E: "\u24ba",
      F: "\u24bb", G: "\u24bc", H: "\u24bd", I: "\u24be", J: "\u24bf",
      K: "\u24c0", L: "\u24c1", M: "\u24c2", N: "\u24c3", O: "\u24c4",
      P: "\u24c5", Q: "\u24c6", R: "\u24c7", S: "\u24c8", T: "\u24c9",
      U: "\u24ca", V: "\u24cb", W: "\u24cc", X: "\u24cd", Y: "\u24ce", Z: "\u24cf",
      "0": "\u24ea", "1": "\u2460", "2": "\u2461", "3": "\u2462", "4": "\u2463",
      "5": "\u2464", "6": "\u2465", "7": "\u2466", "8": "\u2467", "9": "\u2468",
    },
  },
  {
    id: "filled",
    label: "Filled Circle",
    map: {
      a: "\u1f150", b: "\u1f151", c: "\u1f152", d: "\u1f153", e: "\u1f154",
      f: "\u1f155", g: "\u1f156", h: "\u1f157", i: "\u1f158", j: "\u1f159",
      k: "\u1f15a", l: "\u1f15b", m: "\u1f15c", n: "\u1f15d", o: "\u1f15e",
      p: "\u1f15f", q: "\u1f160", r: "\u1f161", s: "\u1f162", t: "\u1f163",
      u: "\u1f164", v: "\u1f165", w: "\u1f166", x: "\u1f167", y: "\u1f168", z: "\u1f169",
      "0": "\u24ff", "1": "\u2776", "2": "\u2777", "3": "\u2778", "4": "\u2779",
      "5": "\u277a", "6": "\u277b", "7": "\u277c", "8": "\u277d", "9": "\u277e",
    },
  },
  {
    id: "double",
    label: "Double Circled",
    map: {
      a: "\u1f170", b: "\u1f171", c: "\u1f172", d: "\u1f173", e: "\u1f174",
      f: "\u1f175", g: "\u1f176", h: "\u1f177", i: "\u1f178", j: "\u1f179",
      k: "\u1f17a", l: "\u1f17b", m: "\u1f17c", n: "\u1f17d", o: "\u1f17e",
      p: "\u1f17f", q: "\u1f180", r: "\u1f181", s: "\u1f182", t: "\u1f183",
      u: "\u1f184", v: "\u1f185", w: "\u1f186", x: "\u1f187", y: "\u1f188", z: "\u1f189",
    },
  },
  {
    id: "parenthesized",
    label: "Parenthesized",
    map: {
      a: "\u1f110", b: "\u1f111", c: "\u1f112", d: "\u1f113", e: "\u1f114",
      f: "\u1f115", g: "\u1f116", h: "\u1f117", i: "\u1f118", j: "\u1f119",
      k: "\u1f11a", l: "\u1f11b", m: "\u1f11c", n: "\u1f11d", o: "\u1f11e",
      p: "\u1f11f", q: "\u1f120", r: "\u1f121", s: "\u1f122", t: "\u1f123",
      u: "\u1f124", v: "\u1f125", w: "\u1f126", x: "\u1f127", y: "\u1f128", z: "\u1f129",
      "0": "\u1f10b", "1": "\u2474", "2": "\u2475", "3": "\u2476", "4": "\u2477",
      "5": "\u2478", "6": "\u2479", "7": "\u247a", "8": "\u247b", "9": "\u247c",
    },
  },
];

function transform(text, style) {
  return text.split("").map((ch) => style.map[ch.toLowerCase()] || style.map[ch] || ch).join("");
}

export default function ToolHome() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState("");
  const [activeStyle, setActiveStyle] = useState("circled");

  const currentStyle = STYLES.find((s) => s.id === activeStyle) || STYLES[0];
  const result = useMemo(() => transform(text, currentStyle), [text, currentStyle]);

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
          <p className="mt-1 text-(--muted-foreground)">Convert letters and numbers into circled Unicode characters</p>
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
