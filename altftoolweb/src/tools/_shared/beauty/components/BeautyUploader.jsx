"use client";
import { useCallback, useRef, useState } from "react";
import { Upload, Sparkles } from "lucide-react";

export default function BeautyUploader({ onImage }) {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const processFile = useCallback((file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      onImage({ src: url, img });
    };
    img.src = url;
  }, [onImage]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [processFile]);

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  }, [processFile]);

  const triggerBrowse = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerBrowse();
    }
  }, [triggerBrowse]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a photo: drag and drop, or press Enter to browse files"
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary) focus-visible:ring-offset-2 focus-visible:ring-offset-(--background) ${
        dragActive
          ? "border-(--primary) bg-(--primary)/5"
          : "border-(--border) hover:border-(--primary)/50 bg-(--card)"
      }`}
      onClick={triggerBrowse}
      onKeyDown={handleKeyDown}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="space-y-4">
        <div className="w-16 h-16 mx-auto rounded-full bg-(--primary)/10 flex items-center justify-center">
          <Upload className="w-8 h-8 text-(--primary)" />
        </div>
        <div>
          <p className="font-semibold text-lg text-(--foreground)">
            Upload a clear front-facing photo
          </p>
          <p className="text-sm text-(--muted-foreground) mt-1">
            Drag & drop your image here, or click to browse
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs text-(--muted-foreground) bg-(--muted)/50 px-3 py-1.5 rounded-full w-fit mx-auto">
          <Sparkles className="w-3.5 h-3.5 text-(--primary)" />
          Best results with natural lighting and no makeup/filters
        </div>
      </div>
    </div>
  );
}
