import React from "react";

export default function Slider({ min, max, step, value, onChange }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="w-full"
    />
  );
}