"use client";

import { UploadCloud, Camera, X } from "lucide-react";
import { useRef } from "react";
import { supportedFormats } from "../constants/styles";

const ACCEPT_ATTR = Object.keys(supportedFormats).join(",");

export default function UploadBox({ previewUrl, error, isProcessing, onFile, onDrop, onDragOver, onRemove }) {
  const inputRef = useRef(null);
  const cameraRef = useRef(null);

  const handleInputChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = "";
  };

  const handleCameraCapture = () => {
    cameraRef.current?.click();
  };

  const handleCameraChange = (e) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = "";
  };

  const handleRemove = () => {
    if (window.confirm("Remove this photo and reset all styling? This can't be undone.")) {
      onRemove();
    }
  };

  if (previewUrl) {
    return (
      <div className="relative w-full max-w-md mx-auto">
        <div className="rounded-xl border border-(--border) bg-(--card) overflow-hidden shadow-[var(--anslation-ds-shadow-sm)]">
          {/* Blob URLs are local user files and cannot use Next Image optimisation. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="w-full h-auto object-contain max-h-80"
          />
        </div>
        <button
          onClick={handleRemove}
          disabled={isProcessing}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-(--danger) text-(--danger-foreground) flex items-center justify-center hover:opacity-90 transition shadow-md disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Remove image"
        >
          <X className="h-4 w-4" />
        </button>
        {error && (
          <p role="alert" className="mt-2 text-xs font-semibold text-(--danger)">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      aria-busy={isProcessing}
      className="w-full max-w-md mx-auto"
    >
      <label className="flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) bg-(--background) p-6 text-center hover:border-(--primary) hover:bg-(--muted) transition">
        <UploadCloud className="h-12 w-12 text-(--primary) mb-3" />
        <span className="text-sm font-semibold text-(--foreground)">Drop your image here</span>
        <span className="text-xs text-(--muted-foreground) mt-1">or click to browse</span>
        <span className="text-xs text-(--muted-foreground) mt-2">Supports JPG, PNG, WEBP (max 10MB)</span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          disabled={isProcessing}
          className="hidden"
          onChange={handleInputChange}
        />
      </label>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-(--danger)">
          {error}
        </p>
      )}
      {isProcessing && (
        <p role="status" aria-live="polite" className="mt-2 text-xs font-semibold text-(--muted-foreground)">
          Checking and decoding the image locally…
        </p>
      )}

      <div className="flex items-center gap-3 mt-3 justify-center">
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-(--foreground) bg-(--card) border border-(--border) rounded-lg hover:border-(--primary) transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <UploadCloud className="h-4 w-4" />
          Browse Files
        </button>
        <button
          onClick={handleCameraCapture}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-(--foreground) bg-(--card) border border-(--border) rounded-lg hover:border-(--primary) transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Camera className="h-4 w-4" />
          Camera
        </button>
      </div>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        disabled={isProcessing}
        className="hidden"
        onChange={handleCameraChange}
      />
    </div>
  );
}
