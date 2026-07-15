"use client";

import { useRef, useState } from "react";
import { Camera, CloudUpload, ShieldCheck, Upload } from "lucide-react";
import { CARD, FOCUS_RING } from "./ui.jsx";

export default function UploadArea({ onFile, onOpenCamera, disabled }) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  function openPicker() {
    inputRef.current?.click();
  }

  function handleChange(event) {
    const file = event.target.files?.[0];
    if (file) onFile(file);
    event.target.value = "";
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragOver(false);
    if (disabled) return;
    const file = event.dataTransfer?.files?.[0];
    if (file) onFile(file);
  }

  return (
    <section aria-label="Upload a photo" className={`${CARD} flex flex-col p-4 sm:p-5`}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drag and drop an image here, or press Enter to browse"
        onClick={openPicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex flex-1 cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed px-6 py-10 text-center transition sm:py-14 ${FOCUS_RING} ${
          dragOver
            ? "border-(--primary) bg-[color-mix(in_srgb,var(--primary)_7%,transparent)]"
            : "border-[color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-(--background) hover:border-(--primary)"
        } ${disabled ? "pointer-events-none opacity-60" : ""}`}
      >
        <span
          className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--anslation-ds-primary-soft)" }}
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_20px_color-mix(in_srgb,var(--primary)_35%,transparent)]"
            style={{ background: "var(--anslation-ds-cta-gradient)" }}
          >
            <CloudUpload size={26} aria-hidden="true" />
          </span>
        </span>

        <p className="text-base font-bold text-(--foreground)">
          Drag &amp; drop an image here
        </p>
        <p className="mt-0.5 text-sm font-semibold text-(--muted-foreground)">
          or click to browse
        </p>
        <p className="mt-3 text-xs font-medium text-(--muted-foreground)">
          Supports: JPG, PNG, WebP · Max size: 10MB
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <span
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[8px] px-4 text-sm font-bold text-white shadow-[0_6px_16px_color-mix(in_srgb,var(--primary)_30%,transparent)] transition hover:opacity-95`}
            style={{ background: "var(--anslation-ds-cta-gradient)" }}
          >
            <Upload size={16} aria-hidden="true" />
            Upload Image
          </span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenCamera();
            }}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-(--border) bg-(--card) px-4 text-sm font-bold text-(--foreground) transition hover:border-(--primary) hover:text-(--primary-hover) dark:hover:text-(--primary) ${FOCUS_RING}`}
          >
            <Camera size={16} aria-hidden="true" />
            Use Camera
          </button>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />

      <p className="mt-4 flex items-start justify-center gap-1.5 text-center text-xs font-medium leading-5 text-(--muted-foreground)">
        <ShieldCheck size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
        Your images are processed locally in your browser. We do not upload or store any data.
      </p>
    </section>
  );
}
