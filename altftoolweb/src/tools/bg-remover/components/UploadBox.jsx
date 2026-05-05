import { useState } from "react";

export default function UploadBox({ processImage, isLoading }) {
  const [isDragging, setIsDragging] = useState(false);
  const [mode, setMode] = useState("single"); // "single" | "batch"

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (mode === "single") {
      processImage(files[0]);
    } else {
      processImage(files);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files || []);

    if (mode === "single") {
      processImage(files[0]);
    } else {
      processImage(files);
    }
  };

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl rounded-2xl border border-(--border) bg-(--card) p-6 shadow-lg animate-fade-up space-y-6">

        {/* ✅ NEW TOGGLE (SEGMENTED PILL) */}
        <div className="flex justify-center">
          <div className="relative flex w-full max-w-xs bg-(--background) border border-(--border) rounded-full p-1">

            {/* Sliding background */}
            <div
              className={`absolute top-1 bottom-1 w-1/2 rounded-full bg-(--primary) transition-all duration-300 ${
                mode === "single" ? "left-1" : "left-1/2"
              }`}
            />

            <button
              onClick={() => setMode("single")}
              className={`relative z-10 w-1/2 py-2 text-sm font-semibold rounded-full transition ${
                mode === "single"
                  ? "text-white"
                  : "text-(--muted-foreground)"
              }`}
            >
              Single
            </button>

            <button
              onClick={() => setMode("batch")}
              className={`relative z-10 w-1/2 py-2 text-sm font-semibold rounded-full transition ${
                mode === "batch"
                  ? "text-white"
                  : "text-(--muted-foreground)"
              }`}
            >
              Batch
            </button>
          </div>
        </div>

        {/* DROP ZONE */}
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
            isDragging
              ? "border-(--border) scale-[1.02]"
              : "border-(--border)"
          }`}
        >
          <p className="text-lg font-semibold mb-2">
            {mode === "single"
              ? "Drag & drop your image here"
              : "Drag & drop multiple images here"}
          </p>

          <p className="text-sm text-(--muted-foreground) mb-4">
            {mode === "single"
              ? "or select an image from your device"
              : "or select multiple images from your device"}
          </p>

          <label className="inline-flex items-center justify-center cursor-pointer bg-(--primary) transition-colors px-6 py-2 rounded-xl font-semibold text-sm sm:text-base text-white">
            {mode === "single" ? "Select Image" : "Select Images"}

            <input
              type="file"
              accept="image/*"
              multiple={mode === "batch"}
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </section>

        {isLoading && (
          <div className="text-center mt-5">
            <p className="text-base font-medium animate-pulse">
              Removing background...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}