"use client";

import { useRef } from "react";

export default function AngleDial({ angle, setAngle }) {
  const dialRef = useRef(null);

  const handleMouseDown = (e) => {
    // e.preventDefault();
    const move = (moveEvent) => {
      const rect = dialRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const x = (moveEvent.clientX || moveEvent.touches?.[0]?.clientX) - cx;
      const y = (moveEvent.clientY || moveEvent.touches?.[0]?.clientY) - cy;
      let deg = Math.round(Math.atan2(y, x) * (180 / Math.PI)) + 90;
      if (deg < 0) deg += 360;
      setAngle(deg % 360);
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
  };

  const thumbX = 50 + 38 * Math.sin((angle * Math.PI) / 180);
  const thumbY = 50 - 38 * Math.cos((angle * Math.PI) / 180);

  return (
    <div className="flex items-center gap-4 mt-1">
      {/* Dial */}
      <div
        ref={dialRef}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className="relative w-20 h-20 rounded-full border-2 border-(--border) bg-(--card) cursor-grab active:cursor-grabbing flex-shrink-0"
        style={{ userSelect: "none" }}
      >
        {/* Center dot */}
        <div className="absolute w-2 h-2 bg-blue-600 rounded-full"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        />

        {/* Line from center to thumb */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
          <line
            x1="50" y1="50"
            x2={thumbX} y2={thumbY}
            stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round"
          />
        </svg>

        {/* Thumb */}
        <div
          className="absolute w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow"
          style={{
            left: `${thumbX}%`,
            top: `${thumbY}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Tick marks */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((tick) => {
          const tx = 50 + 46 * Math.sin((tick * Math.PI) / 180);
          const ty = 50 - 46 * Math.cos((tick * Math.PI) / 180);
          return (
            <div
              key={tick}
              className="absolute w-1 h-1 bg-gray-300 rounded-full"
              style={{
                left: `${tx}%`,
                top: `${ty}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          );
        })}
      </div>

      {/* Angle display + quick presets */}
      <div className="space-y-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Angle</span>
          <span className="text-sm font-mono bg-(--card) px-2 py-0.5 rounded border border-(--border)">
            {angle}°
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[0, 45, 90, 135, 180].map((a) => (
            <button
              key={a}
              onClick={() => setAngle(a)}
              className={`px-2 py-0.5 rounded text-xs border transition cursor-pointer ${
                angle === a
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-(--border) hover:bg-(--card)"
              }`}
            >
              {a}°
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}