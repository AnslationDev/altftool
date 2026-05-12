"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import AngleDial from "./AngleDial";
import { Copy, Download, Share2 } from "lucide-react";
export default function GradientControls({
  color1,
  setColor1,
  color2,
  setColor2,
  angle,
  setAngle,
  onGradientChange,
}) {
  const [gradientType, setGradientType] = useState("linear");
  const [shape, setShape] = useState("circle");
  const [position, setPosition] = useState("center");

  const gradient =
    gradientType === "linear"
      ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
      : `radial-gradient(${shape} at ${position}, ${color1}, ${color2})`;

  const [activeFormat, setActiveFormat] = useState("CSS");

  const FORMATS = {
    CSS: `background: ${gradient};`,
    Tailwind: `className="bg-[linear-gradient(${angle}deg,${color1},${color2})]"`,
    SCSS: `$gradient: linear-gradient(${angle}deg, ${color1}, ${color2});\n\n.element {\n  background: $gradient;\n}`,
    React: `style={{ background: "${gradient}" }}`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(FORMATS[activeFormat]);
    toast.success(`${activeFormat} copied!`);
  };

  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("gradientHistory")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    onGradientChange(gradient);
  }, [gradient, onGradientChange]);

  useEffect(() => {
    const newEntry = { gradient, color1, color2, angle, type: gradientType };
    const updateHistory = setTimeout(() => setHistory((prev) => {
      const filtered = prev.filter((g) => g.gradient !== gradient);
      const updated = [newEntry, ...filtered].slice(0, 10);
      localStorage.setItem("gradientHistory", JSON.stringify(updated));
      return updated;
    }), 0);

    return () => clearTimeout(updateHistory);
  }, [angle, color1, color2, gradient, gradientType]);

  const downloadAsPNG = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext("2d");

    let canvasGradient;
    if (gradientType === "linear") {
      const angleRad = ((angle - 90) * Math.PI) / 180;
      const x1 = canvas.width / 2 - (Math.cos(angleRad) * canvas.width) / 2;
      const y1 = canvas.height / 2 - (Math.sin(angleRad) * canvas.height) / 2;
      const x2 = canvas.width / 2 + (Math.cos(angleRad) * canvas.width) / 2;
      const y2 = canvas.height / 2 + (Math.sin(angleRad) * canvas.height) / 2;
      canvasGradient = ctx.createLinearGradient(x1, y1, x2, y2);
    } else {
      canvasGradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2,
      );
    }

    canvasGradient.addColorStop(0, color1);
    canvasGradient.addColorStop(1, color2);
    ctx.fillStyle = canvasGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const link = document.createElement("a");
    link.download = `gradient-${color1.replace("#", "")}-${color2.replace("#", "")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("PNG downloaded! (1200×630)");
  };

  const shareGradient = () => {
    const c1 = color1.replace("#", "");
    const c2 = color2.replace("#", "");
    const url = `${window.location.origin}${window.location.pathname}?c1=${c1}&c2=${c2}&angle=${angle}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied!");

    window.history.replaceState(null, "", `?c1=${c1}&c2=${c2}&angle=${angle}`);
  };

  return (
    <div className="p-4 border border-(--border) rounded-xl shadow-sm animate-fade-up">
      <h3 className="text-lg font-semibold mb-4">Gradient Controls</h3>

      <div className="space-y-6">
        {/* Color 1 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">First Color</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-12 h-12 cursor-pointer rounded border"
            />
            <span className="text-sm font-mono bg-(--card) px-2 py-1 rounded">
              {color1}
            </span>
          </div>
        </div>

        {/* Color 2 */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Second Color</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-12 h-12 cursor-pointer rounded border"
            />
            <span className="text-sm font-mono bg-(--card) px-2 py-1 rounded">
              {color2}
            </span>
          </div>
        </div>

        {gradientType === "linear" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Angle</label>
            <AngleDial angle={angle} setAngle={setAngle} />
          </div>
        )}

        {/* Gradient Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Gradient Type</label>
          <div className="flex gap-2 mt-1">
            {["linear", "radial"].map((type) => (
              <button
                key={type}
                onClick={() => setGradientType(type)}
                className={`flex-1 py-2 rounded-lg border text-sm transition cursor-pointer capitalize ${
                  gradientType === type
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-(--border) hover:bg-(--card)"
                }`}
              >
                {type === "linear" ? "⟶ Linear" : "◎ Radial"}
              </button>
            ))}
          </div>
        </div>

        {/* Shape — only show when radial */}
        {gradientType === "radial" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Shape</label>
            <div className="flex gap-2 mt-1">
              {["circle", "ellipse"].map((s) => (
                <button
                  key={s}
                  onClick={() => setShape(s)}
                  className={`flex-1 py-2 rounded-lg border text-sm transition cursor-pointer capitalize ${
                    shape === s
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {s === "circle" ? "● Circle" : "⬭ Ellipse"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Position — only show when radial */}
        {gradientType === "radial" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Position</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {[
                "top left",
                "top center",
                "top right",
                "center left",
                "center",
                "center right",
                "bottom left",
                "bottom center",
                "bottom right",
              ].map((pos) => (
                <button
                  key={pos}
                  onClick={() => setPosition(pos)}
                  className={`py-1.5 rounded-lg border text-xs transition cursor-pointer capitalize ${
                    position === pos
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-(--border) hover:bg-(--card)"
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Format Tabs */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Copy Format</label>
          <div className="flex gap-1.5 flex-wrap mt-1">
            {Object.keys(FORMATS).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setActiveFormat(fmt)}
                className={`px-3 py-1 rounded-lg border text-xs transition cursor-pointer ${
                  activeFormat === fmt
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-(--border) hover:bg-(--card)"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          {/* Code preview */}
          <div className="p-3 bg-(--card) rounded-lg">
            <pre className="text-xs font-mono whitespace-pre-wrap break-all leading-relaxed">
              {FORMATS[activeFormat]}
            </pre>
          </div>
        </div>

        <div className="flex gap-3 mt-3">
          {/* Copy Button */}
          <button
            onClick={copyCode}
            className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
          >
            <Copy size={16} />
            <span className="hidden sm:inline-flex">Copy {activeFormat}</span>
          </button>
          <button
            onClick={downloadAsPNG}
            className="w-full cursor-pointer border border-(--border) py-2 rounded-lg hover:bg-(--card) transition text-sm flex items-center justify-center gap-2"
          >
            <Download size={16} />
            <span className="hidden sm:inline-flex">Download</span>
          </button>

          <button
            onClick={shareGradient}
            className="w-full cursor-pointer border border-(--border) py-2 rounded-lg hover:bg-(--card) transition text-sm flex items-center justify-center gap-2"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline-flex">Share</span>
          </button>
        </div>

        {/* Gradient History */}
        {history.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Recent History</label>
            <div className="space-y-1.5 max-h-52 overflow-y-auto no-scrollbar pr-1 mt-1">
              {history.map((item, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setColor1(item.color1);
                    setColor2(item.color2);
                    setAngle(item.angle);
                    setGradientType(item.type);
                    toast.success("Gradient restored!");
                  }}
                  className="flex items-center gap-3 p-2 bg-(--card) border border-(--border) rounded-lg cursor-pointer hover:border-blue-400 transition"
                >
                  {/* Swatch */}
                  <div
                    className="w-10 h-8 rounded-md flex-shrink-0 border border-(--border)"
                    style={{ background: item.gradient }}
                  />
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono truncate">
                      {item.color1} → {item.color2}
                    </p>
                    <p className="text-xs text-(--foreground)">
                      {item.type} · {item.angle}°
                    </p>
                  </div>
                  {/* Restore hint */}
                  <span className="text-xs text-(--foreground)">↩</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("gradientHistory");
                setHistory([]);
                toast.success("History cleared!");
              }}
              className="w-full text-xs text-(--foreground) hover:text-red-500 transition cursor-pointer py-1"
            >
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
