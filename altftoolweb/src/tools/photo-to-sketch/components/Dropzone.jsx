"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

// Empty-state dropzone with native drag & drop + hidden file input.
export default function Dropzone({ onFile, disabled }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = useCallback(
    (files) => {
      const file = files && files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mx-auto w-full max-w-lg"
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        disabled={disabled}
        className={`group flex w-full flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed px-6 py-12 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) ${
          dragging
            ? "border-(--primary) bg-(--primary)/10"
            : "border-(--border) bg-(--card) hover:border-(--primary)/60"
        }`}
        aria-label="Upload a photo by clicking or dropping a file here"
      >
        <div className="rounded-full bg-(--primary)/10 p-4 text-(--primary) transition-transform duration-500 group-hover:scale-110">
          <UploadCloud size={28} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-(--foreground)">
            Drop a photo to sketch
          </h2>
          <p className="mt-1 text-sm text-(--muted-foreground)">
            Drag &amp; drop or click to browse. JPG, PNG and WEBP supported.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-xl bg-(--primary) px-4 py-2 text-sm font-semibold text-(--primary-foreground) transition active:scale-95">
          <ImageIcon size={16} />
          Select Photo
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </motion.div>
  );
}
