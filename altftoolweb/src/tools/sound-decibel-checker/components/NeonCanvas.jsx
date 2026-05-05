"use client";
import React from "react";

export default function NeonCanvas({ canvasRef }) {
  return (
    <div className="rounded-3xl p-8 border border-(--border) bg-(--card) shadow-md transition-colors">
      <h2 className="text-xl font-semibold text-(--foreground) mb-6">
        Neon Visualizer
      </h2>

      <div className="rounded-xl overflow-hidden border border-(--border) bg-(--muted)">
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full h-48"
        />
      </div>
    </div>
  );
}
