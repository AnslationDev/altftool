"use client";

import { safeCopyText } from "@/shared/utils/clipboard";
import { useState } from "react";
import { Clipboard, Check, Droplets } from "lucide-react";

export default function ColorPalette({
  palette,
  dominantColor,
  averageColor,
  hasTransparency,
}) {
  const [copiedColor, setCopiedColor] = useState("");

  const handleCopy = async (color) => {
    const success = await safeCopyText(color);
    if (success) {
      setCopiedColor(color);
      setTimeout(() => setCopiedColor(""), 1500);
    }
  };

  if (!palette || palette.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-8 text-center text-sm text-[var(--muted-foreground)]">
        Upload an image to extract its color palette.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
          Color Palette
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {palette.map((color, index) => (
            <button
              key={`${color}-${index}`}
              type="button"
              onClick={() => handleCopy(color)}
              className="group overflow-hidden rounded-lg border border-[var(--border)] text-left transition-shadow duration-150 hover:shadow-md"
            >
              <span
                className="block h-16 w-full"
                style={{ backgroundColor: color }}
              />
              <span className="flex items-center justify-between gap-1 bg-[var(--background)] px-2 py-1.5">
                <span className="font-mono text-[10px] font-semibold text-[var(--foreground)]">
                  {color.toUpperCase()}
                </span>
                {copiedColor === color ? (
                  <Check className="h-3 w-3 shrink-0 text-green-500" />
                ) : (
                  <Clipboard className="h-3 w-3 shrink-0 text-[var(--muted-foreground)] opacity-0 group-hover:opacity-100 transition-opacity duration-150" />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {dominantColor && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Dominant Color
            </p>
            <div className="flex items-center gap-3">
              <span
                className="block h-10 w-10 shrink-0 rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: dominantColor }}
              />
              <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                {dominantColor.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {averageColor && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
            <p className="mb-2 text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Average Color
            </p>
            <div className="flex items-center gap-3">
              <span
                className="block h-10 w-10 shrink-0 rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: averageColor }}
              />
              <span className="font-mono text-sm font-semibold text-[var(--foreground)]">
                {averageColor.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {hasTransparency && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3">
          <Droplets className="h-4 w-4 shrink-0 text-[var(--primary)]" />
          <span className="text-xs font-semibold text-[var(--foreground)]">
            This image contains transparent pixels
          </span>
        </div>
      )}
    </div>
  );
}
