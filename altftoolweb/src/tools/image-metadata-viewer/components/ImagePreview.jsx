"use client";

import ManagedImage from "@/components/ui/ManagedImage";
import { Replace, X, FileImage, HardDrive, FileType } from "lucide-react";

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );
  return `${(bytes / 1024 ** index).toFixed(index ? 2 : 0)} ${units[index]}`;
}

export default function ImagePreview({ file, preview, metadata, onReplace, onRemove }) {
  if (!preview) return null;

  const fileInfo = metadata?.fileInfo || {};
  const width = metadata?.camera?.find((r) => r.name === "Image Width" || r.name === "Pixel X Dimension");
  const height = metadata?.camera?.find((r) => r.name === "Image Height" || r.name === "Pixel Y Dimension");

  return (
    <div className="space-y-3">
      <div className="group relative overflow-hidden rounded-lg border border-[var(--border)]">
        <ManagedImage
          src={preview}
          alt={file?.name || "Uploaded image"}
          className="max-h-72 w-full object-contain bg-[var(--muted)]"
        />
        <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            type="button"
            onClick={onReplace}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] shadow-sm hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors duration-150"
          >
            <Replace className="h-3 w-3" />
            Replace
          </button>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1 rounded-md bg-[var(--card)]/90 backdrop-blur-sm border border-[var(--border)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] shadow-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors duration-150"
          >
            <X className="h-3 w-3" />
            Remove
          </button>
        </div>
      </div>

      <div className="grid gap-1.5 text-sm">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--muted)] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <FileImage className="h-3.5 w-3.5" />
            File
          </span>
          <span className="text-right font-semibold truncate max-w-[200px]" title={fileInfo.name || file?.name}>
            {fileInfo.name || file?.name}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--muted)] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <HardDrive className="h-3.5 w-3.5" />
            Size
          </span>
          <span className="font-semibold">
            {formatBytes(fileInfo.size || file?.size)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--muted)] px-3 py-2">
          <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
            <FileType className="h-3.5 w-3.5" />
            Type
          </span>
          <span className="font-semibold">{fileInfo.type || file?.type}</span>
        </div>
        {width && height && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[var(--muted)] px-3 py-2">
            <span className="flex items-center gap-1.5 text-[var(--muted-foreground)]">
              <FileImage className="h-3.5 w-3.5" />
              Dimensions
            </span>
            <span className="font-semibold">
              {width.value} x {height.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
