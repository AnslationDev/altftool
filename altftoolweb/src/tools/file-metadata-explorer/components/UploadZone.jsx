"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, File as FileIcon, AlertCircle } from "lucide-react";

export default function UploadZone({ onFilesAdded, loading }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) {
      onFilesAdded(e.dataTransfer.files);
    }
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.length) {
      onFilesAdded(e.target.files);
      e.target.value = "";
    }
  }, [onFilesAdded]);

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
        dragging
          ? "border-(--primary) bg-(--primary-soft)"
          : "border-(--border) hover:border-(--primary) bg-(--card)"
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      aria-label="Upload files"
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        onChange={handleFileInput}
        className="hidden"
        accept="*/*"
      />
      <div className="text-center">
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 rounded-full border-2 border-(--primary) border-t-transparent animate-spin" />
            <span className="text-sm text-(--muted-foreground)">Processing...</span>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-(--primary-soft) flex items-center justify-center">
              <Upload size="24" className="text-(--primary)" />
            </div>
            <p className="text-sm font-semibold text-(--foreground) mb-1">
              Drop files here or click to browse
            </p>
            <p className="text-xs text-(--muted-foreground)">
              Supports images, PDFs, documents, audio, video, and text files
            </p>
          </>
        )}
      </div>
    </div>
  );
}
