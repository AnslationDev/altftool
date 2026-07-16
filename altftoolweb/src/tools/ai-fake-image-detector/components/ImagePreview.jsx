"use client";

import { FileImage } from "lucide-react";
import ManagedImage from "@/components/ui/ManagedImage";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImagePreview({ file, preview }) {
  if (!preview) return null;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-[var(--border)]">
        <ManagedImage
          src={preview}
          alt={file?.name || "Uploaded image"}
          className="max-h-72 w-full object-contain"
        />
      </div>
      {file && (
        <div className="flex items-center gap-3 rounded-lg bg-[var(--muted)] px-4 py-2.5">
          <FileImage className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">{file.name}</p>
            <p className="text-xs text-[var(--muted-foreground)]">
              {formatFileSize(file.size)} &middot; {file.type}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
