"use client";

import React, { useCallback } from "react";
import { Upload, X, ImagePlus } from "lucide-react";

export default function ImageUploader({
  slot,
  image,
  onFileSelect,
  onDrop,
  onDragOver,
  onRemove,
  fileInputRef,
  formatFileSize,
}) {
  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (file) onFileSelect(file);
      e.target.value = "";
    },
    [onFileSelect],
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, [fileInputRef]);

  if (image) {
    return (
      <div className="relative group">
        <div className="relative overflow-hidden rounded-lg border border-(--border) bg-(--card)">
          <img
            src={image.preview}
            alt={`Image ${slot.toUpperCase()}: ${image.name}`}
            className="w-full h-56 sm:h-64 object-contain bg-(--muted)"
          />
          <button
            onClick={() => onRemove(slot)}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-(--card) border border-(--border) shadow-sm
                       opacity-0 group-hover:opacity-100 transition-opacity duration-150
                       hover:bg-red-500 hover:text-white hover:border-red-500"
            aria-label={`Remove image ${slot.toUpperCase()}`}
          >
            <X size={14} />
          </button>
        </div>
        <div className="mt-2 space-y-0.5">
          <p className="text-sm font-medium text-(--foreground) truncate">{image.name}</p>
          <div className="flex flex-wrap gap-2 text-xs text-(--muted-foreground)">
            <span>{image.type.split("/")[1].toUpperCase()}</span>
            <span>{formatFileSize(image.size)}</span>
            <span>{image.width} × {image.height}</span>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="mt-2 text-xs font-medium text-(--primary) hover:underline"
        >
          Replace image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp"
          onChange={handleInputChange}
          className="hidden"
          aria-label={`Upload image ${slot.toUpperCase()}`}
        />
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDrop={(e) => onDrop(e, slot)}
      onDragOver={onDragOver}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleClick(); }}
      className="flex flex-col items-center justify-center gap-3 p-6 sm:p-8
                 border-2 border-dashed border-(--border) rounded-lg cursor-pointer
                 bg-(--background) hover:border-(--primary) hover:bg-(--muted)
                 transition-colors duration-150 min-h-[14rem]"
      aria-label={`Upload image ${slot.toUpperCase()}`}
    >
      <div className="w-12 h-12 rounded-full bg-(--muted) flex items-center justify-center text-(--muted-foreground)">
        {slot === "a" ? <Upload size={22} /> : <ImagePlus size={22} />}
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-(--foreground)">
          Upload Image {slot.toUpperCase()}
        </p>
        <p className="text-xs text-(--muted-foreground) mt-1">
          Drag & drop or click to browse
        </p>
        <p className="text-xs text-(--muted-foreground) mt-0.5">
          PNG, JPG, GIF, WebP, BMP (max 20MB)
        </p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif,image/webp,image/bmp"
        onChange={handleInputChange}
        className="hidden"
        aria-label={`Upload image ${slot.toUpperCase()}`}
      />
    </div>
  );
}
