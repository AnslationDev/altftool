"use client";

import { useState } from "react";
import toast from "react-hot-toast";

const FONT_SIZES = ["text-2xl", "text-3xl", "text-4xl", "text-5xl", "text-6xl"];
const FONT_WEIGHTS = ["font-normal", "font-medium", "font-semibold", "font-bold", "font-black"];
const FONT_FAMILIES = [
  { label: "Sans", class: "font-sans" },
  { label: "Serif", class: "font-serif" },
  { label: "Mono", class: "font-mono" },
];

export default function GradientTextGenerator({ color1, color2, angle }) {
  const [text, setText] = useState("Build Something Beautiful");
  const [fontSize, setFontSize] = useState("text-4xl");
  const [fontWeight, setFontWeight] = useState("font-bold");
  const [fontFamily, setFontFamily] = useState("font-sans");
  const [isGradient, setIsGradient] = useState(true);
  const [letterSpacing, setLetterSpacing] = useState("tracking-normal");

  const LETTER_SPACINGS = [
    { label: "Tight", class: "tracking-tight" },
    { label: "Normal", class: "tracking-normal" },
    { label: "Wide", class: "tracking-wide" },
    { label: "Wider", class: "tracking-wider" },
    { label: "Widest", class: "tracking-widest" },
  ];

  const gradientTextStyle = isGradient
    ? {
        backgroundImage: `linear-gradient(${angle}deg, ${color1}, ${color2})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : {};

  const cssCode = `background: linear-gradient(${angle}deg, ${color1}, ${color2});
-webkit-background-clip: text;
-webkit-text-fill-color: transparent;
background-clip: text;`;

  const copyCSS = () => {
    navigator.clipboard.writeText(cssCode);
    toast.success("Text gradient CSS copied!");
  };

  const copySVGText = () => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="200">
  <defs>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    fill="url(#textGrad)" font-size="64" font-weight="bold"
    font-family="sans-serif">${text}</text>
</svg>`;
    navigator.clipboard.writeText(svg);
    toast.success("SVG code copied!");
  };

  return (
    <div className="sm:m-8 p-4 border border-(--border) rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Gradient Text Generator</h3>
          <p className="text-sm text-(--foreground) mt-1">
            Apply your gradient directly to text
          </p>
        </div>

        {/* Toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm">{isGradient ? <span className="hidden sm:inline-flex">Gradient On</span> : <span className="hidden sm:inline-flex">Gradient Off</span>}</span>
          <div
            onClick={() => setIsGradient((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
              isGradient ? "bg-blue-600" : "bg-gray-300"
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
                isGradient ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </div>
        </label>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Controls */}
        <div className="space-y-5">

          {/* Text Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type anything..."
              className="w-full px-4 py-2 rounded-lg border border-(--border) bg-(--card) text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mt-1"
            />
          </div>

          {/* Font Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Size</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {FONT_SIZES.map((s) => (
                <button
                  key={s}
                  onClick={() => setFontSize(s)}
                  className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${
                    fontSize === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {s.replace("text-", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Font Weight */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Weight</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {FONT_WEIGHTS.map((w) => (
                <button
                  key={w}
                  onClick={() => setFontWeight(w)}
                  className={`px-3 py-1 rounded-lg flex flex-wrap border text-xs transition cursor-pointer ${
                    fontWeight === w
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {w.replace("font-", "")}
                </button>
              ))}
            </div>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Font Family</label>
            <div className="flex gap-2 mt-1">
              {FONT_FAMILIES.map((f) => (
                <button
                  key={f.class}
                  onClick={() => setFontFamily(f.class)}
                  className={`px-4 py-1 rounded-lg border text-xs transition cursor-pointer ${
                    fontFamily === f.class
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Letter Spacing</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {LETTER_SPACINGS.map((l) => (
                <button
                  key={l.class}
                  onClick={() => setLetterSpacing(l.class)}
                  className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${
                    letterSpacing === l.class
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* CSS Output */}
          <div className="p-4 bg-(--card) rounded-lg">
            <p className="text-xs font-mono mb-2">CSS Code:</p>
            <pre className="text-xs font-mono whitespace-pre-wrap">{cssCode}</pre>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={copyCSS}
              className="flex-1 cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Copy CSS
            </button>
            <button
              onClick={copySVGText}
              className="flex-1 cursor-pointer border border-(--border) py-2 rounded-lg hover:bg-(--card) transition text-sm"
            >
              Copy as SVG
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="space-y-4">
          <label className="text-sm font-medium">Live Preview</label>

          {/* Main preview box */}
          <div className="w-full min-h-52 rounded-xl border border-(--border) bg-(--card) flex items-center justify-center p-2 md:p-6 overflow-hidden mt-1">
            <p
              style={gradientTextStyle}
              className={`${fontSize} ${fontWeight} ${fontFamily} ${letterSpacing} text-center break-words break-all leading-tight`}
            >
              {text || "Type something..."}
             
            </p>
          </div>

          {/* Sizes showcase */}
          {isGradient && (
            <div className="p-4 bg-(--card) rounded-xl border border-(--border) space-y-2">
              <p className="text-xs text-(--foreground) mb-3">Size showcase</p>
              {["text-lg", "text-2xl", "text-3xl", "text-4xl"].map((s) => (
                <p
                  key={s}
                  style={gradientTextStyle}
                  className={`${s} font-bold leading-tight break-all`}
                >
                  {text || "Preview"}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}