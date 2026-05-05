"use client";
import React, { useState } from "react";
import { Settings, Copy, Wand2, ArrowLeft } from "lucide-react";

/* ========= UTILS ========== */
const hexToRgb = (hex) => {
  const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return res
    ? {
        r: parseInt(res[1], 16),
        g: parseInt(res[2], 16),
        b: parseInt(res[3], 16),
      }
    : null;
};

/* ========= SLIDER COMPONENT ========== */
const ControlSlider = ({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  unit,
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm font-semibold text-(--foreground)">{label}</span>
      <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-600">
        {value}
        {unit}
      </span>
    </div>

    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(e, Number(e.target.value))}
      className="
        w-full h-2 rounded-lg cursor-pointer appearance-none
        bg-(--muted)
        accent-(--primary)
      "
    />
  </div>
);

/* ========= MAIN GENERATOR ========== */
export default function Generator({ onStart }) {
  const [values, setValues] = useState({
    hOffset: 10,
    vOffset: 10,
    blur: 20,
    spread: 0,
    opacity: 0.3,
    color: "#000000",
    inset: false,
    boxColor: "#6366f1",
  });

  const [copied, setCopied] = useState(false);

  const handleChange = (field) => (_, newVal) =>
    setValues({ ...values, [field]: newVal });

  const handleColorChange = (field, v) => setValues({ ...values, [field]: v });

  const rgb = hexToRgb(values.color);
  const rgba = rgb
    ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${values.opacity})`
    : values.color;

  const shadowString = `${values.inset ? "inset " : ""}${values.hOffset}px ${
    values.vOffset
  }px ${values.blur}px ${values.spread}px ${rgba}`;

  const codeSnippet = `box-shadow: ${shadowString};`;

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-10 lg:p-20">
      {/* ==== GRID LAYOUT ==== */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* ==== LEFT CONTROL PANEL ==== */}
        <div className="md:col-span-4 bg-(--card) border border-(--border) rounded-2xl p-6 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-(--border)">
            <Settings className="w-6 h-6 text-(--primary)" />
            <h2 className="text-xl font-bold text-(--foreground)">
              Properties
            </h2>
          </div>

          {/* Sliders */}
          <ControlSlider
            label="Horizontal Offset"
            value={values.hOffset}
            min={-100}
            max={100}
            onChange={handleChange("hOffset")}
            unit="px"
          />
          <ControlSlider
            label="Vertical Offset"
            value={values.vOffset}
            min={-100}
            max={100}
            onChange={handleChange("vOffset")}
            unit="px"
          />
          <ControlSlider
            label="Blur Radius"
            value={values.blur}
            min={0}
            max={100}
            onChange={handleChange("blur")}
            unit="px"
          />
          <ControlSlider
            label="Spread Radius"
            value={values.spread}
            min={-50}
            max={50}
            onChange={handleChange("spread")}
            unit="px"
          />
          <ControlSlider
            label="Opacity"
            value={values.opacity}
            min={0}
            max={1}
            step={0.01}
            onChange={handleChange("opacity")}
            unit=""
          />

          {/* Color + Inset */}
          <div className="mt-6 bg-(--card) p-4 rounded-xl border border-blue-100">
            <h3 className="uppercase text-xs font-bold text-(--foreground) tracking-wide mb-3">
              Color & Type
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Color Picker */}
              <div
                className="flex items-center gap-3 p-3 bg-(--background) border border-(--border) rounded-xl cursor-pointer hover:shadow transition"
                onClick={() => document.getElementById("color-input").click()}
              >
                <div
                  className="w-8 h-8 rounded-full border border-(--border)"
                  style={{ background: values.color }}
                />
                <span className="font-semibold text-(--foreground)">
                  Shadow Color
                </span>

                <input
                  id="color-input"
                  type="color"
                  value={values.color}
                  onChange={(e) => handleColorChange("color", e.target.value)}
                  className="hidden"
                />
              </div>

              {/* Inset Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={values.inset}
                  onChange={(e) =>
                    setValues({ ...values, inset: e.target.checked })
                  }
                  className="w-5 h-5 accent-(--primary)"
                />
                <span className="font-semibold text-(--foreground)">
                  Inset Shadow
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ==== RIGHT PREVIEW + CODE ==== */}
        <div className="md:col-span-8 space-y-6">
          {/* Preview */}
          <div className="relative bg-(--muted) border border-(--border) rounded-2xl flex items-center justify-center min-h-90 sm:min-h-120 shadow">
            {/* background grid */}
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%)",
                backgroundSize: "24px 24px",
              }}
            />

            <div
              className="rounded-xl flex items-center justify-center transition-transform"
              style={{
                width: "240px",
                height: "240px",
                background: values.boxColor,
                boxShadow: shadowString,
              }}
            >
              <div className="bg-white/25 backdrop-blur p-4 rounded-full shadow">
                <Wand2 className="text-white w-10 h-10" />
              </div>
            </div>
          </div>

          {/* Code Block */}
          <div className="bg-[#0f172a] p-5 rounded-xl">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[#94a3b8] uppercase tracking-wider text-xs font-semibold">
                CSS Output
              </span>

              <button
                onClick={copyCode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-sm hover:bg-blue-500/30 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                {copied ? "Copied!" : "Copy CSS"}
              </button>
            </div>

            <pre className="text-[#e2e8f0] text-sm p-3 rounded-xl bg-[#1e293b] whitespace-pre-wrap">
              {`box-shadow: ${shadowString};
-webkit-box-shadow: ${shadowString};
-moz-box-shadow: ${shadowString};`}
            </pre>
          </div>

          {/* Back Button */}
          <div className="flex justify-center">
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-(--primary) text-(--primary-foreground) font-semibold hover:bg-blue-600 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
