"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Download,
  FlipHorizontal,
  FlipVertical,
  Image,
  RotateCcw,
  RotateCw,
  Sliders,
  Undo2,
  Upload,
} from "lucide-react";

export default function ToolHome() {
  const fileInputRef = useRef(null);
  const previewRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [inversion, setInversion] = useState(0);
  const [grayscale, setGrayscale] = useState(0);
  const [rotate, setRotate] = useState(0);
  const [flipH, setFlipH] = useState(1);
  const [flipV, setFlipV] = useState(1);
  const [activeFilter, setActiveFilter] = useState("brightness");
  const [loaded, setLoaded] = useState(false);

  const activeValue =
    activeFilter === "brightness"
      ? brightness
      : activeFilter === "saturation"
        ? saturation
        : activeFilter === "inversion"
          ? inversion
          : grayscale;

  const activeMax =
    activeFilter === "brightness" || activeFilter === "saturation" ? 200 : 100;

  const handleFile = useCallback((file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    setLoaded(false);
  }, []);

  const onFileChange = useCallback(
    (e) => {
      handleFile(e.target.files?.[0]);
    },
    [handleFile]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFile(e.dataTransfer.files?.[0]);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (imageSrc && previewRef.current) {
      previewRef.current.onload = () => setLoaded(true);
    }
  }, [imageSrc]);

  const filterStyle = loaded
    ? `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`
    : "none";

  const transformStyle = loaded
    ? `rotate(${rotate}deg) scale(${flipH}, ${flipV})`
    : "none";

  const resetFilters = useCallback(() => {
    setBrightness(100);
    setSaturation(100);
    setInversion(0);
    setGrayscale(0);
    setRotate(0);
    setFlipH(1);
    setFlipV(1);
    setActiveFilter("brightness");
  }, []);

  const saveImage = useCallback(() => {
    if (!previewRef.current || !loaded) return;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = previewRef.current;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    if (rotate !== 0) ctx.rotate((rotate * Math.PI) / 180);
    ctx.scale(flipH, flipV);
    ctx.drawImage(
      img,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height
    );

    const link = document.createElement("a");
    link.download = "edited-image.jpg";
    link.href = canvas.toDataURL("image/jpeg");
    link.click();
  }, [brightness, saturation, inversion, grayscale, rotate, flipH, flipV, loaded]);

  const filters = [
    { key: "brightness", label: "Brightness", value: brightness, max: 200, set: setBrightness },
    { key: "saturation", label: "Saturation", value: saturation, max: 200, set: setSaturation },
    { key: "inversion", label: "Inversion", value: inversion, max: 100, set: setInversion },
    { key: "grayscale", label: "Grayscale", value: grayscale, max: 100, set: setGrayscale },
  ];

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8 text-[var(--foreground)] sm:px-6">
      <div className="mx-auto w-full max-w-5xl">
        <header className="mb-6 text-center">
          <div className="mx-auto mb-4 flex max-w-5xl flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-600">
              <Image className="h-3.5 w-3.5" />
              Image Editor
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-1 text-xs font-bold text-[var(--foreground)]">
              <Sliders className="h-3.5 w-3.5 text-[var(--primary)]" />
              Filters & Transform
            </span>
          </div>
          <h1 className="heading mx-auto max-w-5xl text-center">Image Editor</h1>
          <p className="description mx-auto mt-3 max-w-4xl text-center">
            Adjust brightness, saturation, inversion, grayscale, rotation, and flip.
          </p>
        </header>

        <div
          className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-[var(--anslation-ds-shadow-sm)]"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <div className="flex flex-col gap-5 lg:flex-row">
            <div className="w-full space-y-5 lg:w-72 lg:shrink-0">
              <section className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                  <Sliders className="mr-1.5 inline-block h-4 w-4 text-[var(--primary)]" />
                  Filters
                </h2>
                <div className="mb-3 grid grid-cols-2 gap-2">
                  {filters.map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setActiveFilter(f.key)}
                      className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                        activeFilter === f.key
                          ? "bg-[var(--primary)] text-white shadow-sm"
                          : "border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold text-[var(--foreground)]">
                      {filters.find((f) => f.key === activeFilter)?.label}
                    </span>
                    <span className="font-bold text-[var(--primary)]">
                      {activeValue}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={activeMax}
                    value={activeValue}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const setter = filters.find((f) => f.key === activeFilter)?.set;
                      if (setter) setter(val);
                    }}
                    className="w-full accent-[var(--primary)]"
                    aria-label={filters.find((f) => f.key === activeFilter)?.label}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4">
                <h2 className="mb-3 text-sm font-semibold text-[var(--foreground)]">
                  <RotateCcw className="mr-1.5 inline-block h-4 w-4 text-[var(--primary)]" />
                  Rotate & Flip
                </h2>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setRotate((r) => r - 90)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    aria-label="Rotate left"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">Left</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotate((r) => r + 90)}
                    className="flex flex-col items-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--card)] px-2 py-2 text-[var(--muted-foreground)] transition-all hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    aria-label="Rotate right"
                  >
                    <RotateCw className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">Right</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipH((f) => (f === 1 ? -1 : 1))}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-all ${
                      flipH === -1
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    }`}
                    aria-label="Flip horizontal"
                  >
                    <FlipHorizontal className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">H-Flip</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFlipV((f) => (f === 1 ? -1 : 1))}
                    className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2 transition-all ${
                      flipV === -1
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                        : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)]"
                    }`}
                    aria-label="Flip vertical"
                  >
                    <FlipVertical className="h-4 w-4" />
                    <span className="text-[10px] font-semibold">V-Flip</span>
                  </button>
                </div>
              </section>
            </div>

            <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-[var(--border)] bg-[var(--background)]">
              {imageSrc ? (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <img
                    ref={previewRef}
                    src={imageSrc}
                    alt="Preview"
                    className="max-h-[500px] max-w-full rounded-lg object-contain transition-all duration-200"
                    style={{
                      filter: filterStyle,
                      transform: transformStyle,
                    }}
                  />
                </div>
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-3 px-6 py-12 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--muted)]">
                    <Upload className="h-8 w-8 text-[var(--muted-foreground)]" />
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">
                      Drop an image here
                    </p>
                    <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                      or click to browse files
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 border-t border-[var(--border)] pt-5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm"
            >
              <Upload className="h-4 w-4" />
              Choose Image
            </button>
            <button
              type="button"
              onClick={resetFilters}
              disabled={!loaded}
              className="btn-secondary flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" />
              Reset
            </button>
            <button
              type="button"
              onClick={saveImage}
              disabled={!loaded}
              className="btn-primary flex items-center gap-2 px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              Save Image
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
