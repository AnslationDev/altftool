"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image, X, Loader2 } from "lucide-react";

export default function UploadPanel({ onImagesAdded, loading }) {
  const [dragOver, setDragOver] = useState(null);
  const inputARef = useRef(null);
  const inputBRef = useRef(null);

  const handleDragOver = useCallback((slot, e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(slot);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(null);
  }, []);

  const handleDrop = useCallback(
    (slot, e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(null);
      const file = e.dataTransfer?.files?.[0];
      if (file) onImagesAdded(file, slot);
    },
    [onImagesAdded]
  );

  const handleClick = useCallback((slot) => {
    if (slot === "A") inputARef.current?.click();
    else inputBRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (slot, e) => {
      const file = e.target.files?.[0];
      if (file) onImagesAdded(file, slot);
      e.target.value = "";
    },
    [onImagesAdded]
  );

  const dropZoneClass = (slot) =>
    `relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all duration-200 cursor-pointer min-h-[220px] ${
      dragOver === slot
        ? "border-(--primary) bg-(--primary-soft) scale-[1.02]"
        : "border-(--border) hover:border-(--primary)/50 bg-(--card)"
    }`;

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {["A", "B"].map((slot) => (
        <motion.div
          key={slot}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: slot === "A" ? 0 : 0.15 }}
        >
          <div
            onDragOver={(e) => handleDragOver(slot, e)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(slot, e)}
            onClick={() => handleClick(slot)}
            className={dropZoneClass(slot)}
            role="button"
            tabIndex={0}
            aria-label={`Upload Image ${slot}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") handleClick(slot);
            }}
          >
            <input
              ref={slot === "A" ? inputARef : inputBRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(slot, e)}
            />

            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Loader2 size={36} className="text-(--primary) animate-spin" />
                  <p className="text-sm text-(--muted-foreground)">Processing...</p>
                </motion.div>
              ) : dragOver === slot ? (
                <motion.div
                  key="drag"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Upload size={36} className="text-(--primary)" />
                  <p className="text-sm font-semibold text-(--primary)">Drop here!</p>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <div className="rounded-xl bg-(--muted) p-3">
                    <Image size={28} className="text-(--muted-foreground)" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-(--foreground)">
                      Upload Image {slot}
                    </p>
                    <p className="mt-1 text-xs text-(--muted-foreground)">
                      Drag & drop or click to browse
                    </p>
                  </div>
                  <span className="rounded-full bg-(--muted) px-2.5 py-0.5 text-[10px] font-medium text-(--muted-foreground)">
                    Max 10MB
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
