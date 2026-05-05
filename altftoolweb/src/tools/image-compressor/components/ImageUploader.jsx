"use client";

import React, { useCallback } from "react";
// import { useDropzone } from "react-dropzone";
import { useDropzone } from "react-dropzone";

export default function ImageUploader({ onImageUpload, hasImage }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    },
    [onImageUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"],
    },
    multiple: false,
  });

  // If image already selected
  if (hasImage) {
    return (
      <div className="text-center">
        <button
          {...getRootProps()}
          className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer 
                     bg-(--primary) text-(--primary-foreground) 
                     hover:opacity-90 transition"
        >
          <input {...getInputProps()} />
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Upload Different Image
        </button>
      </div>
    );
  }

  // Initial upload UI
  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed hover:border-(--primary) rounded-lg p-8 text-center cursor-pointer transition
        ${
          isDragActive
            ? "border-(--primary) bg-(--muted)"
            : "border-(--border) bg-(--card) hover:bg-(--background)"
        }`}
    >
      <input {...getInputProps()} />

      {/* Icon */}
      <div className="mx-auto w-12 h-12 mb-4 text-(--muted-foreground)">
        <svg
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          className="w-full h-full"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
      </div>

      {/* Text */}
      <p className="text-lg font-medium text-(--foreground) mb-2">
        {isDragActive ? "Drop your image here" : "Upload an image"}
      </p>

      <p className="text-sm text-(--muted-foreground)">
        Drag & drop an image, or click to browse
      </p>

      <p className="text-xs text-(--muted-foreground) mt-2">
        Supported: PNG, JPG, JPEG, GIF, BMP, WebP
      </p>
    </div>
  );
}
