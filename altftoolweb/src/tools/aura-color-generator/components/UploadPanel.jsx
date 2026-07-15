"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

export default function UploadPanel({ imagePreview, onUpload, onClear }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onUpload(file);
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  };

  return (
    <div className="w-full">
      {!imagePreview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
            dragOver
              ? "border-(--primary) bg-(--primary-soft)"
              : "border-(--border) bg-(--card) hover:bg-(--muted)"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-2xl bg-(--primary-soft) p-4">
              <UploadCloud className="h-8 w-8 text-(--primary)" />
            </div>
            <p className="text-lg font-semibold text-(--foreground)">Upload your photo</p>
            <p className="text-sm text-(--muted-foreground)">Drag & drop or click to browse</p>
            <p className="text-xs text-(--muted-foreground)">PNG, JPG, WebP • Max 10MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl border border-(--border) bg-(--card)">
          <img src={imagePreview} alt="Uploaded" className="max-h-96 w-full object-contain" />
          <button
            onClick={onClear}
            className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white hover:bg-black/80 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
