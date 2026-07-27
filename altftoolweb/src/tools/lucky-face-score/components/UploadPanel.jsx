"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, ImageIcon, X, Crop } from "lucide-react";

export default function UploadPanel({ onUpload }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [cropping, setCropping] = useState(false);
  const inputRef = useRef(null);

  const processFile = useCallback((file) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setPreview(dataUrl);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height).data;
        onUpload(file, imageData);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  }, [processFile]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    processFile(file);
  }, [processFile]);

  const handleRemove = useCallback(() => {
    setPreview(null);
    setError(null);
    onUpload(null, null);
    if (inputRef.current) inputRef.current.value = "";
  }, [onUpload]);

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={preview ? undefined : handleClick}
        role={preview ? undefined : "button"}
        tabIndex={preview ? undefined : 0}
        aria-label={preview ? undefined : "Upload a photo"}
        onKeyDown={preview ? undefined : (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleClick(); } }}
        className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all motion-reduce:transition-none duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)
          ${dragOver
            ? "border-primary bg-primary/5"
            : preview
              ? "border-border bg-card"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Photo file"
        />

        {preview ? (
          <div className="relative inline-block">
            <img
              src={preview}
              alt="Uploaded preview"
              className="max-h-64 rounded-xl object-contain mx-auto"
            />
            <button
              onClick={(e) => { e.stopPropagation(); handleRemove(); }}
              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-background border border-border text-muted-foreground hover:text-danger hover:border-danger/50 transition focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="p-4 rounded-full bg-primary/10">
              <Upload size={32} className="text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                Drop your photo here or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WEBP — max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 min-h-11 bg-primary hover:bg-primary/90 text-(--primary-foreground) font-semibold rounded-xl cursor-pointer transition active:scale-[0.98] motion-reduce:active:scale-100 duration-100 shadow-sm text-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)"
          >
            <ImageIcon size={16} />
            Change Photo
          </button>
          <button
            onClick={() => setCropping(!cropping)}
            aria-pressed={cropping}
            className={`flex items-center justify-center gap-2 py-2.5 px-4 min-h-11 font-semibold rounded-xl cursor-pointer transition active:scale-[0.98] motion-reduce:active:scale-100 duration-100 text-sm border focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--primary)
              ${cropping
                ? "bg-primary text-(--primary-foreground) border-primary"
                : "border-border text-foreground hover:bg-muted/50"
              }`}
          >
            <Crop size={16} />
            Crop
          </button>
        </div>
      )}

      {cropping && preview && (
        <div className="bg-muted/30 rounded-2xl p-4 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            Crop functionality is available in the image editor tool.
          </p>
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-xl bg-(--danger-soft) border border-(--danger)/30 px-4 py-3 text-sm text-(--danger)">
          {error}
        </div>
      )}
    </div>
  );
}
