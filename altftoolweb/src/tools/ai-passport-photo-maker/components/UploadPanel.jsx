"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Camera, Image, X, AlertCircle, Loader2 } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 20 * 1024 * 1024;
const FORMATS = ["JPG", "PNG", "WebP", "HEIC"];

export default function UploadPanel({ onUpload, loading, error, onCameraCapture }) {
  const [dragOver, setDragOver] = useState(false);

  const onDrop = useCallback((acceptedFiles, rejections) => {
    if (rejections.length > 0) return;
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".heic"] },
    maxSize: MAX_SIZE,
    maxFiles: 1,
    multiple: false,
    validator: (file) => {
      if (!ACCEPTED_TYPES.includes(file.type) && !file.name.match(/\.(heic|heif)$/i)) {
        return { code: "invalid-type", message: "Unsupported format. Use JPG, PNG, WebP, or HEIC." };
      }
      return null;
    },
    onDragEnter: () => setDragOver(true),
    onDragLeave: () => setDragOver(false),
  });

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file && file.size <= MAX_SIZE) {
            onUpload(file);
            break;
          }
        }
      }
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [onUpload]);

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div
          {...getRootProps()}
          tabIndex={0}
          role="button"
          aria-label="Upload your photo by clicking or dragging a file"
          className={`
            relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-150
            ${isDragActive || dragOver
              ? "border-(--primary) bg-(--primary-soft)"
              : "border-(--border) bg-(--card) hover:border-(--border-strong) hover:shadow-md"
            }
            ${loading ? "pointer-events-none opacity-60" : ""}
          `}
        >
          <input {...getInputProps()} aria-hidden="true" />

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <Loader2 size={40} className="animate-spin text-(--primary)" />
                <p className="text-sm font-medium text-(--foreground)">Processing image...</p>
              </motion.div>
            ) : error ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <AlertCircle size={24} className="text-red-500" />
                </div>
                <p className="text-sm font-medium text-red-500">{error}</p>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-(--primary-soft)">
                  <Upload size={28} className="text-(--primary)" />
                </div>
                <div>
                  <p className="text-base font-semibold text-(--foreground)">
                    {isDragActive ? "Drop your photo here" : "Upload your photo"}
                  </p>
                  <p className="mt-1 text-xs text-(--muted-foreground)">
                    Drag & drop or click to browse · Max 20MB
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {FORMATS.map((fmt) => (
              <span
                key={fmt}
                className="rounded-lg border border-(--border) bg-(--card) px-2.5 py-1 text-xs font-medium text-(--muted-foreground)"
              >
                {fmt}
              </span>
            ))}
          </div>

          {onCameraCapture && (
            <button
              type="button"
              onClick={onCameraCapture}
              className="flex items-center gap-1.5 rounded-xl border border-(--border) bg-(--card) px-4 py-2 text-xs font-semibold text-(--foreground) shadow-sm transition-all hover:border-(--border-strong) hover:shadow-md focus:outline-none focus:ring-3 focus:ring-(--primary)/35"
              aria-label="Capture photo using camera"
            >
              <Camera size={16} />
              Use Camera
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
