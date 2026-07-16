"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ShieldCheck, Upload, ImagePlus } from "lucide-react";
import { SUPPORTED_FORMATS, FILE_EXTENSIONS } from "../constants/index";

export default function ImageUploader({ onFileUpload, onRemoveImage, hasImage }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileUpload(acceptedFiles[0]);
      }
    },
    [onFileUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_FORMATS.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {}),
    multiple: false,
  });

  if (hasImage) {
    return (
      <div className="text-center">
        <button
          {...getRootProps()}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--anslation-ds-shadow-sm)] transition hover:opacity-90 cursor-pointer"
        >
          <input {...getInputProps()} />
          <ImagePlus className="h-4 w-4" />
          Upload Different Image
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition ${
        isDragActive
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40 hover:bg-[var(--muted)]/50"
      }`}
    >
      <input {...getInputProps()} />
      <div className={`mb-4 rounded-full p-4 ${isDragActive ? "bg-[var(--primary)]/10" : "bg-[var(--muted)]"}`}>
        <ShieldCheck className={`h-10 w-10 ${isDragActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`} />
      </div>
      <p className="text-base font-semibold text-[var(--foreground)]">
        Upload an image for analysis
      </p>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        {isDragActive ? "Drop your image here" : "Drag & drop or click to browse"}
      </p>
      <p className="mt-3 text-xs text-[var(--muted-foreground)]">
        Supports JPG, PNG, WebP, TIFF
      </p>
    </div>
  );
}
