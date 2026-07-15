"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Image as ImageIcon, AlertCircle } from "lucide-react";

export default function UploadPanel({ onUpload, error, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  const handleClick = () => inputRef.current?.click();

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={disabled ? undefined : handleClick}
        className={`
          relative cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12
          transition-all duration-200 text-center
          ${dragOver
            ? "border-pink-400 bg-pink-500/10 scale-[1.02]"
            : "border-border hover:border-pink-300 bg-card"
          }
          ${disabled ? "opacity-50 pointer-events-none" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/20 via-purple-500/20 to-blue-500/20">
            {dragOver ? (
              <ImageIcon className="text-pink-400" size={40} />
            ) : (
              <Upload className="text-pink-400" size={40} />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              {dragOver ? "Drop your photo here" : "Upload your photo"}
            </p>
            <p className="text-sm text-muted-foreground">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-muted-foreground/70">
              Supports JPG, PNG, WEBP &bull; Max 10MB
            </p>
          </div>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500 bg-red-500/10 rounded-xl px-4 py-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
