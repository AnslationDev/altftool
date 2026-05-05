"use client";

import React from "react";
import { Upload } from "lucide-react";
// import BeforeAfterSlider from "./BeforeAfterSlider";
export default function UploadBox({
  handleDrop,
  handleDragOver,
  previewUrl,
  bgRemovedUrl,
  handleFile,
  canvasRef,
}) {
  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className="w-64 h-64 border-2 border-dashed border-(--primary) rounded-2xl flex items-center justify-center bg-(--card) cursor-pointer"
    >
      {!previewUrl && !bgRemovedUrl ? (
        <label className="text-center cursor-pointer">
          <Upload className="mx-auto w-10 h-10 text-(--primary)" />
          <p className="mt-2 text-(--muted-foreground)">
            Drop or Upload Image
          </p>
          <input
            hidden
            type="file"
            accept="image/*"
            onChange={handleFile}
          />
        </label>
      ) : (
        <canvas ref={canvasRef} className="w-64 h-64 rounded-full" />
      )}
    </div>
  );
}