"use client";
import { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

export default function UploadZone({ onFile, onPaste, hasImage }) {
  const onDrop = useCallback((files) => {
    if (files.length > 0) onFile(files[0]);
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/avif": [".avif"],
    },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  });

  useEffect(() => {
    const handler = (e) => {
      if (e.clipboardData?.files?.length > 0) {
        onFile(e.clipboardData.files[0]);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [onFile]);

  if (hasImage) {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          {...getRootProps()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) transition text-sm cursor-pointer"
        >
          <input {...getInputProps({ "data-testid": "watermark-file-input" })} />
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Browse Files
        </button>
        <button
          onClick={onPaste}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-(--border) bg-(--background) text-(--foreground) hover:bg-(--muted) transition text-sm cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste Image
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-(--primary) bg-(--primary)/5 scale-[1.01]"
            : "border-(--border) bg-(--card) hover:border-(--primary) hover:bg-(--muted)/30"
        }`}
      >
        <input {...getInputProps({ "data-testid": "watermark-file-input" })} />
        <div className="mx-auto w-16 h-16 rounded-2xl bg-(--primary)/10 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <p className="text-lg font-medium text-(--foreground) mb-2">
          {isDragActive ? "Drop your image here" : "Drag & Drop or Browse Files"}
        </p>
        <p className="text-sm text-(--muted-foreground) mb-4">
          Supports JPG, JPEG, PNG, WEBP, BMP, TIFF, AVIF &bull; Max 50 MB
        </p>
        <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-(--primary) text-(--primary-foreground) font-medium hover:opacity-90 transition text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Browse Files
        </span>
      </div>
      <div className="text-center">
        <button
          onClick={onPaste}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-(--muted-foreground) hover:text-(--foreground) transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Paste Image from Clipboard
        </button>
      </div>
    </div>
  );
}
