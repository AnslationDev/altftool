"use client";

import React from "react";
import { Download, Image as ImageIcon } from "lucide-react";

export default function ExportOptions({
  format,
  setFormat,
  quality,
  setQuality,
  handleDownload,
}) {
  return (
    <div className="w-full space-y-4 p-4 rounded-2xl border border-(--border) bg-(--card)">
      
      <h3 className="flex items-center gap-2 font-semibold">
        <ImageIcon className="text-blue-500" />
        Export Options
      </h3>

      {/* FORMAT */}
      <div className="flex gap-2">
        {["png", "jpg", "webp"].map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={`px-3 py-1 rounded-lg text-sm capitalize ${
              format === f
                ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                : "bg-white/10"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* QUALITY */}
      {(format === "jpg" || format === "webp") && (
        <div className="space-y-2">
          <label className="text-sm">Quality: {quality}</label>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full"
          />
        </div>
      )}

      {/* DOWNLOAD */}
      <button
        onClick={handleDownload}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white"
      >
        <Download size={18} />
        Download
      </button>
    </div>
  );
}
