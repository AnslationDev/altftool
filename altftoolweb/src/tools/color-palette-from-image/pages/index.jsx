"use client";

import { useState } from "react";
import { Clipboard, Palette, UploadCloud } from "lucide-react";
import { safeCopyText } from "@/shared/utils/clipboard";

const toHex = (r, g, b) => `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;

function extractPalette(imageElement) {
  const canvas = document.createElement("canvas");
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(imageElement, 0, 0, size, size);
  const data = context.getImageData(0, 0, size, size).data;
  const buckets = new Map();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 128) continue;
    const r = Math.round(data[index] / 32) * 32;
    const g = Math.round(data[index + 1] / 32) * 32;
    const b = Math.round(data[index + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    buckets.set(key, (buckets.get(key) || 0) + 1);
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([key]) => {
      const [r, g, b] = key.split(",").map(Number);
      return toHex(Math.min(r, 255), Math.min(g, 255), Math.min(b, 255));
    });
}

export default function ToolHome() {
  const [preview, setPreview] = useState("");
  const [palette, setPalette] = useState(["#2563eb", "#14b8a6", "#f97316", "#111827"]);
  const [copied, setCopied] = useState("");

  const handleFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const image = new Image();
    image.onload = () => setPalette(extractPalette(image));
    image.src = url;
  };

  const copyColor = async (color) => {
    setCopied((await safeCopyText(color)) ? color : "");
    setTimeout(() => setCopied(""), 1000);
  };

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--anslation-ds-shadow-sm)] 2xl:p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold uppercase text-[var(--primary)]">
            <Palette className="h-4 w-4" />
            Image colors
          </div>
          <h1 className="tool-heading-accent text-3xl font-semibold leading-tight sm:text-4xl">Color Palette from Image</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
            Upload an image and extract a practical set of dominant colors for brand, UI, and content work.
          </p>
        </section>

        <section className="grid gap-6 2xl:grid-cols-[400px_1fr]">
          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <label className="flex min-h-60 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--background)] p-6 text-center hover:bg-[var(--muted)]">
              <UploadCloud className="h-10 w-10 text-[var(--primary)]" />
              <span className="mt-3 text-sm font-semibold">Upload image</span>
              <span className="mt-1 text-xs text-[var(--muted-foreground)]">PNG, JPG, or WebP</span>
              <input type="file" accept="image/*" className="hidden" onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
            {preview ? (
              <div className="mt-5 overflow-hidden rounded-lg border border-[var(--border)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="" className="max-h-80 w-full object-cover" />
              </div>
            ) : null}
          </div>

          <div className="min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Palette</h2>
              {copied && <span className="text-sm font-semibold text-green-600">{copied} copied</span>}
            </div>
            <div className="tool-card-grid">
              {palette.map((color) => (
                <button key={color} type="button" onClick={() => copyColor(color)} className="overflow-hidden rounded-lg border border-[var(--border)] text-left shadow-[var(--anslation-ds-shadow-sm)]">
                  <span className="block h-32" style={{ backgroundColor: color }} />
                  <span className="flex items-center justify-between gap-3 bg-[var(--background)] px-4 py-3 font-mono text-sm font-semibold break-words">
                    {color.toUpperCase()}
                    <Clipboard className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
