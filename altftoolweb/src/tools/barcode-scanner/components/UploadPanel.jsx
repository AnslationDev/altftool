"use client";

import { useRef, useState } from "react";
import { FileOutput, Image as ImageIcon, Loader2, ScanLine, UploadCloud } from "lucide-react";

const STEPS = [
  { icon: UploadCloud, title: "1. Upload", description: "Upload an image with barcode" },
  { icon: ScanLine, title: "2. Scan", description: "We scan and decode the barcode" },
  { icon: FileOutput, title: "3. Get Result", description: "View and copy the decoded result" },
];

export default function UploadPanel({ onFile, busy }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="rounded-2xl border border-dashed border-border bg-card p-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onFile(file);
          event.target.value = "";
        }}
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) onFile(file);
        }}
        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
        }`}
      >
        {busy ? (
          <>
            <Loader2 aria-hidden="true" size={30} className="mb-3 animate-spin text-primary" />
            <p className="text-sm font-semibold text-foreground">Scanning image…</p>
          </>
        ) : (
          <>
            <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UploadCloud aria-hidden="true" size={22} />
            </span>
            <p className="text-sm font-medium text-foreground">Drag &amp; drop an image here</p>
            <p className="my-1.5 text-xs text-muted-foreground">or</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              <ImageIcon aria-hidden="true" size={15} /> Choose Image
            </button>
            <p className="mt-3 text-xs text-muted-foreground">Supports: PNG, JPG, JPEG, WEBP</p>
          </>
        )}
      </div>

      {/* How it works */}
      <div className="mt-4 border-t border-border pt-4">
        <h2 className="text-sm font-bold text-foreground">How it works</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {STEPS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center text-center">
              <span className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background text-primary">
                <Icon aria-hidden="true" size={18} />
              </span>
              <p className="text-xs font-bold text-foreground">{title}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
