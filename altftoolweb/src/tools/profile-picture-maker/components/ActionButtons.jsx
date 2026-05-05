"use client";

import React from "react";
import { Trash2 } from "lucide-react";

export default function ActionButtons({
  handleFile,
  removeBackground,
  clearAll,
  processing,
  file,
}) {
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <label className="bg-(--primary) text-(--primary-foreground) px-4 py-2 rounded-lg cursor-pointer">
        Replace
        <input
          hidden
          type="file"
          accept="image/*"
          onChange={handleFile}
        />
      </label>

      <button
        onClick={removeBackground}
        disabled={!file || processing}
        className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 cursor-pointer"
      >
        {processing ? "Processing..." : "Remove BG"}
      </button>

      <button
        onClick={clearAll}
        className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 cursor-pointer"
      >
        <Trash2 size={16} /> Clear
      </button>
    </div>
  );
}