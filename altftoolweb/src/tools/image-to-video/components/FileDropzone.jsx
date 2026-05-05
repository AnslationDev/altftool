"use client";
import { useRef, useState } from "react";
import { detectOrientation } from "../utils/motionBuilder";
import { ImageIcon } from "lucide-react";

export default function FileDropzone({ onImagesLoaded }) {
  const inputRef            = useRef(null);
  const [dragging, setDrag] = useState(false);

  const processFiles = async (files) => {
    const valid = [...files].filter((f) => f.type.startsWith("image/"));
    if (!valid.length) return;

    const slides = await Promise.all(
      valid.map(
        (file) =>
          new Promise((res) => {
            const img = new Image();
            const url = URL.createObjectURL(file);
            img.onload = () =>
              res({
                id: crypto.randomUUID(),
                file, img, url,
                orientation: detectOrientation(img),
                animation:   "auto",
                duration:    null,
              });
            img.src = url;
          })
      )
    );
    onImagesLoaded(slides);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e)   => { e.preventDefault(); setDrag(false); processFiles(e.dataTransfer.files); }}
      onClick={() => inputRef.current?.click()}
      className={`
         min-h-[160px] sm:min-h-[200px] rounded-2xl border-2 border-dashed
        flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200
        ${dragging
          ? "border-(--primary) bg-(--primary)/10"
          : "border-(--border) hover:border-(--primary)/60 hover:bg-(--muted)/30"}
      `}
    >
      <input
        ref={inputRef} type="file" accept="image/*"
        multiple hidden
        onChange={(e) => processFiles(e.target.files)}
      />
      <div className="flex items-center justify-center">
  <div className="w-15 h-15 rounded-full bg-(--card) flex items-center justify-center shadow-sm">
    <ImageIcon className="w-9 h-9 text-(--primary)" />
  </div>
</div>
      <div className="text-center px-4">
        <p className="font-semibold text-(--foreground) text-sm sm:text-base">
          Drop images here
        </p>
        <p className="text-xs text-(--muted-foreground) mt-1">
          or click to browse · PNG, JPG, WEBP
        </p>
      </div>
    </div>
  );
}