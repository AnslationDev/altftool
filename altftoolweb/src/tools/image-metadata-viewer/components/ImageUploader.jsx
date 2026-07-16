"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Replace } from "lucide-react";
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
    noClick: hasImage,
  });

  if (hasImage) {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = FILE_EXTENSIONS.join(",");
            input.onchange = (e) => {
              const f = e.target.files?.[0];
              if (f) onFileUpload(f);
            };
            input.click();
          }}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:bg-[var(--muted)]"
        >
          <Replace className="h-4 w-4" />
          Upload Different Image
        </button>
        <button
          type="button"
          onClick={onRemoveImage}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition-colors duration-150 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
        >
          Remove
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors duration-150 ${
        isDragActive
          ? "border-[var(--primary)] bg-[var(--primary)]/5"
          : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:bg-[var(--muted)]"
      }`}
    >
      <input {...getInputProps()} />
      <UploadCloud
        className={`h-10 w-10 ${isDragActive ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]"}`}
      />
      <span className="mt-3 text-sm font-semibold text-[var(--foreground)]">
        {isDragActive ? "Drop image here" : "Upload an image"}
      </span>
      <span className="mt-1 text-xs text-[var(--muted-foreground)]">
        Drag & drop or click to browse
      </span>
      <span className="mt-2 text-[10px] text-[var(--muted-foreground)]">
        {FILE_EXTENSIONS.join(", ")}
      </span>
    </div>
  );
}
