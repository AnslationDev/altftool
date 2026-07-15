"use client";

import { useState, useRef } from "react";
import { Upload } from "lucide-react";

export default function UploadBox({ processImage, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (file) processImage(file);
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-(--border) bg-(--surface) p-6 shadow-lg animate-fade-up space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer ${
            isDragging
              ? "border-(--primary) bg-(--primary)/5 scale-[1.02]"
              : "border-(--border) hover:border-(--primary)/50"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-(--primary)/10 flex items-center justify-center">
              <Upload className="w-6 h-6 text-(--primary)" />
            </div>
            <div>
              <p className="text-base font-semibold">
                Upload your profile picture
              </p>
              <p className="text-sm text-(--muted-foreground) mt-1">
                Drag & drop or click to browse
              </p>
            </div>
            <p className="text-xs text-(--muted-foreground)">PNG, JPG, WEBP • Max 15MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
          />
        </div>

        {isLoading && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-(--primary) border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium animate-pulse">
                Removing background...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
