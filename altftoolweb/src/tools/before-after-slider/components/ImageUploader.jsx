"use client";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function ImageUploader({ label, onUpload, hasImage, testId }) {
  const onDrop = useCallback((files) => {
    if (files.length > 0) onUpload(files[0]);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp", ".bmp", ".gif"] },
    multiple: false,
  });

  if (hasImage) {
    return (
      <div className="text-center">
        <button
          {...getRootProps()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer bg-(--primary) text-(--primary-foreground) hover:opacity-90 transition text-sm"
        >
          <input {...getInputProps({ "data-testid": testId })} />
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {label}
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
        isDragActive
          ? "border-(--primary) bg-(--muted)"
          : "border-(--border) bg-(--card) hover:border-(--primary) hover:bg-(--background)"
      }`}
    >
      <input {...getInputProps({ "data-testid": testId })} />
      <div className="mx-auto w-12 h-12 rounded-full bg-(--primary)/10 flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-(--primary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-(--foreground) mb-1">{isDragActive ? "Drop image here" : `Upload ${label}`}</p>
      <p className="text-xs text-(--muted-foreground)">PNG, JPG, WEBP, BMP, GIF</p>
    </div>
  );
}
