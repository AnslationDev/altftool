"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  Clipboard,
  Download,
  FileImage,
  FlipHorizontal2,
  FlipVertical2,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Lock,
  MoveDiagonal,
  RefreshCw,
  RotateCcw,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UploadCloud,
} from "lucide-react";

const DEFAULT_SETTINGS = {
  rotation: 0,
  flipHorizontal: false,
  flipVertical: false,
  expandCanvas: true,
  transparentBackground: false,
  background: "#ffffff",
  format: "original",
  quality: 0.92,
  filenameSuffix: "flipped-rotated",
};

const FORMAT_OPTIONS = {
  original: { label: "Keep Source", mime: null, ext: null },
  jpeg: { label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  png: { label: "PNG", mime: "image/png", ext: "png" },
  webp: { label: "WebP", mime: "image/webp", ext: "webp" },
};

const QUICK_ACTIONS = [
  {
    id: "left",
    label: "Rotate Left",
    detail: "-90 degrees",
    icon: RotateCcw,
  },
  {
    id: "right",
    label: "Rotate Right",
    detail: "+90 degrees",
    icon: RotateCw,
  },
  {
    id: "half-turn",
    label: "Rotate 180",
    detail: "Upside down",
    icon: RefreshCw,
  },
  {
    id: "flip-horizontal",
    label: "Mirror",
    detail: "Horizontal flip",
    icon: FlipHorizontal2,
  },
  {
    id: "flip-vertical",
    label: "Flip Vertical",
    detail: "Top to bottom",
    icon: FlipVertical2,
  },
  {
    id: "reset",
    label: "Reset",
    detail: "Clear transform",
    icon: Sparkles,
  },
];

function formatBytes(bytes = 0) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** index;
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`;
}

function sanitizeFileName(name) {
  return (
    name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 70) || "image"
  );
}

function normalizeDegrees(value) {
  const numeric = Number(value) || 0;
  const normalized = ((numeric % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
}

function getSourceExtension(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  if (["jpg", "jpeg"].includes(ext)) return "jpg";
  if (["png", "webp"].includes(ext)) return ext;
  return "png";
}

function getOutputFormat(format, file) {
  if (format !== "original") return FORMAT_OPTIONS[format];
  const sourceExt = getSourceExtension(file);
  if (sourceExt === "jpg") return FORMAT_OPTIONS.jpeg;
  if (sourceExt === "webp") return FORMAT_OPTIONS.webp;
  return FORMAT_OPTIONS.png;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error("This browser could not export the transformed image."));
      },
      mime,
      quality,
    );
  });
}

async function loadImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new window.Image();
    image.decoding = "async";
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = () => reject(new Error("This image could not be decoded."));
      image.src = url;
    });
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function getCanvasSize(source, settings) {
  if (!settings.expandCanvas) {
    return {
      width: source.width,
      height: source.height,
    };
  }

  const radians = (normalizeDegrees(settings.rotation) * Math.PI) / 180;
  const cos = Math.abs(Math.cos(radians));
  const sin = Math.abs(Math.sin(radians));

  return {
    width: Math.max(1, Math.ceil(source.width * cos + source.height * sin)),
    height: Math.max(1, Math.ceil(source.width * sin + source.height * cos)),
  };
}

async function transformImage(file, settings) {
  const source = await loadImage(file);
  const outputFormat = getOutputFormat(settings.format, file);
  const target = getCanvasSize(source, settings);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d", {
    alpha: outputFormat.mime !== "image/jpeg",
  });
  if (!ctx) {
    throw new Error("Canvas is not available in this browser.");
  }

  if (settings.transparentBackground && outputFormat.mime !== "image/jpeg") {
    ctx.clearRect(0, 0, target.width, target.height);
  } else {
    ctx.fillStyle = settings.background || "#ffffff";
    ctx.fillRect(0, 0, target.width, target.height);
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.translate(target.width / 2, target.height / 2);
  ctx.scale(settings.flipHorizontal ? -1 : 1, settings.flipVertical ? -1 : 1);
  ctx.rotate((normalizeDegrees(settings.rotation) * Math.PI) / 180);
  ctx.drawImage(source.image, -source.width / 2, -source.height / 2);

  const blob = await canvasToBlob(canvas, outputFormat.mime, settings.quality);
  return {
    blob,
    width: target.width,
    height: target.height,
    sourceWidth: source.width,
    sourceHeight: source.height,
    ext: outputFormat.ext,
    label: outputFormat.label,
  };
}

function buildFilename(file, settings, transformed) {
  const suffix =
    settings.filenameSuffix
      .replace(/[^a-z0-9_-]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "flipped-rotated";
  return `${sanitizeFileName(file.name)}-${suffix}.${transformed.ext}`;
}

function buildSummary(items, settings) {
  return [
    "Image Flip & Rotate Tool",
    `Images: ${items.length}`,
    `Rotation: ${normalizeDegrees(settings.rotation)} degrees`,
    `Flip horizontal: ${settings.flipHorizontal ? "Yes" : "No"}`,
    `Flip vertical: ${settings.flipVertical ? "Yes" : "No"}`,
    `Canvas: ${settings.expandCanvas ? "Expanded to fit rotation" : "Original size crop"}`,
    `Format: ${FORMAT_OPTIONS[settings.format].label}`,
    `Quality: ${Math.round(settings.quality * 100)}%`,
  ].join("\n");
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
            {label}
          </p>
          <p className="break-words text-lg font-bold leading-tight text-(--foreground)">
            {value}
          </p>
          {detail && <p className="text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedId) || items[0] || null,
    [items, selectedId],
  );
  const totalSourceSize = useMemo(
    () => items.reduce((total, item) => total + item.file.size, 0),
    [items],
  );
  const outputFormat = selectedItem
    ? getOutputFormat(settings.format, selectedItem.file)
    : FORMAT_OPTIONS[settings.format];
  const estimatedCanvas = selectedItem
    ? getCanvasSize(selectedItem, settings)
    : { width: 0, height: 0 };
  const activeTransform = [
    `${normalizeDegrees(settings.rotation)}°`,
    settings.flipHorizontal ? "Mirror" : null,
    settings.flipVertical ? "Vertical flip" : null,
  ]
    .filter(Boolean)
    .join(" + ");

  const clearPreview = () => {
    setPreview((current) => {
      if (current?.url) URL.revokeObjectURL(current.url);
      return null;
    });
  };

  const updateSetting = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    clearPreview();
    setStatus("");
    setError("");
  };

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/"),
    );
    if (!files.length) {
      setError("Choose browser-readable image files like JPG, PNG, WebP, AVIF, or GIF.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Reading image dimensions...");
    setProgress({ done: 0, total: files.length });

    const prepared = [];
    for (const [index, file] of files.entries()) {
      try {
        const source = await loadImage(file);
        prepared.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
          file,
          previewUrl: URL.createObjectURL(file),
          width: source.width,
          height: source.height,
        });
      } catch {
        setError(`Skipped "${file.name}" because it could not be decoded.`);
      } finally {
        setProgress({ done: index + 1, total: files.length });
      }
    }

    if (prepared.length) {
      setItems((current) => [...current, ...prepared]);
      if (!selectedId) setSelectedId(prepared[0].id);
      setStatus(`${prepared.length} image${prepared.length === 1 ? "" : "s"} loaded.`);
    }

    setProgress({ done: 0, total: 0 });
    setIsProcessing(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeItem = (id) => {
    const removedItem = items.find((item) => item.id === id);
    if (removedItem?.previewUrl) URL.revokeObjectURL(removedItem.previewUrl);
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    if (selectedId === id) {
      setSelectedId(next[0]?.id || null);
    }
    clearPreview();
  };

  const resetTool = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setSelectedId(null);
    setSettings(DEFAULT_SETTINGS);
    clearPreview();
    setStatus("");
    setError("");
    setProgress({ done: 0, total: 0 });
  };

  const applyQuickAction = (actionId) => {
    setSettings((current) => {
      if (actionId === "reset") return DEFAULT_SETTINGS;
      if (actionId === "left") {
        return { ...current, rotation: normalizeDegrees(current.rotation - 90) };
      }
      if (actionId === "right") {
        return { ...current, rotation: normalizeDegrees(current.rotation + 90) };
      }
      if (actionId === "half-turn") {
        return { ...current, rotation: normalizeDegrees(current.rotation + 180) };
      }
      if (actionId === "flip-horizontal") {
        return { ...current, flipHorizontal: !current.flipHorizontal };
      }
      if (actionId === "flip-vertical") {
        return { ...current, flipVertical: !current.flipVertical };
      }
      return current;
    });
    clearPreview();
    setStatus("");
    setError("");
  };

  const generatePreview = async () => {
    if (!selectedItem) {
      setError("Upload an image first.");
      return;
    }
    setIsProcessing(true);
    setError("");
    setStatus("Rendering preview...");
    try {
      const transformed = await transformImage(selectedItem.file, settings);
      const url = URL.createObjectURL(transformed.blob);
      clearPreview();
      setPreview({
        ...transformed,
        url,
        name: buildFilename(selectedItem.file, settings, transformed),
      });
      setStatus("Preview rendered.");
    } catch (err) {
      console.error("Preview failed:", err);
      setError("Could not render this image. Try a smaller image or another format.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImages = async () => {
    if (!items.length) {
      setError("Upload at least one image first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Transforming images...");
    setProgress({ done: 0, total: items.length });

    try {
      const outputs = [];
      for (const [index, item] of items.entries()) {
        const transformed = await transformImage(item.file, settings);
        outputs.push({
          blob: transformed.blob,
          filename: buildFilename(item.file, settings, transformed),
        });
        setProgress({ done: index + 1, total: items.length });
      }

      if (outputs.length === 1) {
        downloadBlob(outputs[0].blob, outputs[0].filename);
      } else {
        const zip = new JSZip();
        outputs.forEach((output) => zip.file(output.filename, output.blob));
        const zipBlob = await zip.generateAsync({ type: "blob" });
        downloadBlob(zipBlob, "flipped-rotated-images.zip");
      }

      setStatus(
        outputs.length === 1
          ? "Transformed image downloaded."
          : `${outputs.length} images exported in a ZIP.`,
      );
    } catch (err) {
      console.error("Transform failed:", err);
      setError("Could not transform the selected images.");
    } finally {
      setIsProcessing(false);
      setProgress({ done: 0, total: 0 });
    }
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(items, settings));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-12 pt-8 text-(--foreground)">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="heading">Image Flip & Rotate Tool</h1>
        <p className="description mt-3 text-balance">
          Rotate, mirror, straighten, preview, and export images locally with
          batch processing, format controls, and ZIP downloads.
        </p>
      </div>

      <section className="mt-7 rounded-lg border border-(--border) bg-(--section-highlight) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_330px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <RotateCw className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">
                Orientation Fix Workspace
              </h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Flip selfies, rotate scans, straighten tilted images, and export
                clean files without server uploads.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Active transform
            </p>
            <p className="mt-2 text-2xl font-bold text-(--primary)">
              {activeTransform || "Original"}
            </p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {settings.expandCanvas ? "Canvas expands to fit rotation" : "Output keeps original canvas"}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 2xl:grid-cols-[400px_minmax(0,1fr)]">
        <div className="space-y-5">
          <div
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed bg-(--background) p-6 text-center transition ${
              isDragging
                ? "border-(--primary) bg-(--section-highlight)"
                : "border-(--border) hover:border-(--primary)"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(event) => addFiles(event.target.files)}
            />
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-(--foreground)">
              Drop images here
            </h2>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              Supports JPG, PNG, WebP, AVIF, and browser-readable GIF first frames.
            </p>
            <button
              type="button"
              className="btn-primary mt-5"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
            >
              <ImagePlus className="h-4 w-4" />
              Choose Images
            </button>
          </div>

          {items.length > 0 && (
            <div className="rounded-lg border border-(--border) bg-(--card) p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-(--foreground)">Image Queue</h2>
                <button type="button" className="btn-secondary" onClick={resetTool}>
                  <Trash2 className="h-4 w-4" />
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedId(item.id);
                      clearPreview();
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedId(item.id);
                        clearPreview();
                      }
                    }}
                    className={`w-full rounded-lg border p-3 text-left transition ${
                      selectedItem?.id === item.id
                        ? "border-(--primary) bg-(--section-highlight)"
                        : "border-(--border) bg-(--background)"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-(--foreground)">
                          {item.file.name}
                        </p>
                        <p className="mt-1 text-xs text-(--muted-foreground)">
                          {item.width} x {item.height}px • {formatBytes(item.file.size)}
                        </p>
                      </div>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          removeItem(item.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.stopPropagation();
                            removeItem(item.id);
                          }
                        }}
                        className="rounded-md p-1 text-(--muted-foreground) hover:bg-red-500/10 hover:text-red-600"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
                <SlidersHorizontal className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-(--foreground)">Transform Settings</h2>
            </div>

            <div className="tool-form-grid mt-5">
              {QUICK_ACTIONS.map(({ id, label, detail, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => applyQuickAction(id)}
                  className="rounded-lg border border-(--border) bg-(--background) p-3 text-left transition hover:border-(--primary)"
                >
                  <span className="flex items-center gap-2 font-semibold text-(--foreground)">
                    <Icon className="h-4 w-4 text-(--primary)" />
                    {label}
                  </span>
                  <span className="mt-1 block text-sm text-(--muted-foreground)">
                    {detail}
                  </span>
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-(--foreground)">
                Custom Angle
                <span className="rounded-md bg-(--section-highlight) px-2 py-1 text-(--primary)">
                  {normalizeDegrees(settings.rotation)}°
                </span>
              </span>
              <input
                type="range"
                min="-180"
                max="180"
                step="1"
                value={settings.rotation}
                onChange={(event) =>
                  updateSetting("rotation", normalizeDegrees(event.target.value))
                }
                className="w-full accent-[var(--primary)]"
              />
              <input
                type="number"
                min="-180"
                max="180"
                value={settings.rotation}
                onChange={(event) =>
                  updateSetting("rotation", normalizeDegrees(event.target.value))
                }
                className="mt-3 w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
              />
            </label>

            <div className="mt-5 grid gap-3">
              {[
                ["flipHorizontal", "Mirror horizontally"],
                ["flipVertical", "Flip vertically"],
                ["expandCanvas", "Expand canvas to fit rotation"],
                ["transparentBackground", "Transparent background when possible"],
              ].map(([key, label]) => (
                <label
                  key={key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-(--border) bg-(--background) px-3 py-3"
                >
                  <span className="text-sm font-medium text-(--foreground)">{label}</span>
                  <input
                    type="checkbox"
                    checked={settings[key]}
                    onChange={(event) => updateSetting(key, event.target.checked)}
                    className="h-5 w-5 accent-[var(--primary)]"
                  />
                </label>
              ))}
            </div>

            <div className="tool-form-grid mt-5">
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  Output Format
                </span>
                <select
                  value={settings.format}
                  onChange={(event) => updateSetting("format", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {Object.entries(FORMAT_OPTIONS).map(([value, option]) => (
                    <option key={value} value={value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                  Background
                </span>
                <input
                  type="color"
                  value={settings.background}
                  onChange={(event) => updateSetting("background", event.target.value)}
                  className="h-10 w-full rounded-lg border border-(--border) bg-(--background) p-1"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 flex items-center justify-between gap-3 text-sm font-semibold text-(--foreground)">
                Quality
                <span className="rounded-md bg-(--section-highlight) px-2 py-1 text-(--primary)">
                  {Math.round(settings.quality * 100)}%
                </span>
              </span>
              <input
                type="range"
                min="0.4"
                max="1"
                step="0.01"
                value={settings.quality}
                onChange={(event) => updateSetting("quality", Number(event.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-(--foreground)">
                Filename Suffix
              </span>
              <input
                value={settings.filenameSuffix}
                onChange={(event) => updateSetting("filenameSuffix", event.target.value)}
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={downloadImages}
                disabled={!items.length || isProcessing}
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                {isProcessing ? "Processing..." : "Download"}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={generatePreview}
                disabled={!selectedItem || isProcessing}
              >
                <MoveDiagonal className="h-4 w-4" />
                Preview
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={copySummary}
                disabled={!items.length}
              >
                <Clipboard className="h-4 w-4" />
                {copied ? "Copied" : "Copy Summary"}
              </button>
              <button type="button" className="btn-secondary" onClick={resetTool}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {status && (
            <div className="flex items-center gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
              {isProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <p className="font-medium">{status}</p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-600">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="tool-card-grid">
            <StatCard icon={FileImage} label="Images" value={items.length} detail={formatBytes(totalSourceSize)} />
            <StatCard icon={RotateCw} label="Rotation" value={`${normalizeDegrees(settings.rotation)}°`} detail={settings.expandCanvas ? "Expanded canvas" : "Original canvas"} />
            <StatCard icon={FlipHorizontal2} label="Flip" value={settings.flipHorizontal || settings.flipVertical ? "Active" : "None"} detail={`${settings.flipHorizontal ? "H" : "-"} / ${settings.flipVertical ? "V" : "-"}`} />
            <StatCard icon={Archive} label="Export" value={items.length > 1 ? "ZIP" : "File"} detail={outputFormat.label} />
          </div>

          {progress.total > 0 && (
            <div className="rounded-lg border border-(--border) bg-(--card) p-4">
              <div className="mb-2 flex justify-between text-xs font-medium text-(--muted-foreground)">
                <span>Processing progress</span>
                <span>{progress.done}/{progress.total}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-(--background)">
                <div
                  className="h-full rounded-full bg-(--primary) transition-all"
                  style={{
                    width: `${Math.round((progress.done / progress.total) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          <section className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Before / After Preview</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Select an image and render the transformed output before downloading.
                </p>
              </div>
              <span className="rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--muted-foreground)">
                {estimatedCanvas.width ? `${estimatedCanvas.width} x ${estimatedCanvas.height}px` : "No image"}
              </span>
            </div>

            <div className="grid gap-4 2xl:grid-cols-2">
              <div className="rounded-lg border border-(--border) bg-(--background) p-3">
                <p className="mb-3 text-sm font-semibold text-(--foreground)">Original</p>
                {selectedItem ? (
                  <div className="flex min-h-[300px] items-center justify-center overflow-auto rounded-lg bg-(--card) p-4">
                    <img
                      src={selectedItem.previewUrl}
                      alt="Original preview"
                      className="max-h-[420px] max-w-full rounded-md"
                    />
                  </div>
                ) : (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-(--muted-foreground)">
                    <ImageIcon className="mb-3 h-10 w-10" />
                    <p className="font-medium">Upload an image to preview.</p>
                  </div>
                )}
              </div>

              <div className="rounded-lg border border-(--border) bg-(--background) p-3">
                <p className="mb-3 text-sm font-semibold text-(--foreground)">Transformed</p>
                {preview ? (
                  <div>
                    <div className="flex min-h-[300px] items-center justify-center overflow-auto rounded-lg bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-4">
                      <img
                        src={preview.url}
                        alt="Transformed preview"
                        className="max-h-[420px] max-w-full rounded-md"
                      />
                    </div>
                    <div className="tool-compact-grid mt-4 text-sm">
                      <div className="rounded-lg bg-(--card) p-3">
                        <p className="text-(--muted-foreground)">Original</p>
                        <p className="font-semibold text-(--foreground)">
                          {preview.sourceWidth} x {preview.sourceHeight}
                        </p>
                      </div>
                      <div className="rounded-lg bg-(--card) p-3">
                        <p className="text-(--muted-foreground)">Output</p>
                        <p className="font-semibold text-(--foreground)">
                          {preview.width} x {preview.height}
                        </p>
                      </div>
                      <div className="rounded-lg bg-(--card) p-3">
                        <p className="text-(--muted-foreground)">Size</p>
                        <p className="font-semibold text-(--foreground)">
                          {formatBytes(preview.blob.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-(--muted-foreground)">
                    <MoveDiagonal className="mb-3 h-10 w-10" />
                    <p className="font-medium">
                      {selectedItem ? "Click Preview to render output." : "Upload an image first."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
            <Lock className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Transforming uses browser canvas locally. Metadata is stripped
              during export, and animated GIFs export the browser-decoded still frame.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
