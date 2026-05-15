"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import {
  AlertTriangle,
  Archive,
  CheckCircle,
  Clipboard,
  Crop,
  Download,
  FileImage,
  Image as ImageIcon,
  ImagePlus,
  Loader2,
  Lock,
  Maximize2,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  UploadCloud,
} from "lucide-react";

const PRESET_GROUPS = [
  {
    group: "Custom",
    items: [
      { id: "custom", label: "Custom Size", width: 1080, height: 1080, platform: "Custom" },
      { id: "half", label: "50% Scale", width: 50, height: 50, platform: "Scale", percent: true },
    ],
  },
  {
    group: "Instagram / TikTok",
    items: [
      { id: "instagram-square", label: "Instagram Square", width: 1080, height: 1080, platform: "Instagram" },
      { id: "instagram-portrait", label: "Instagram Portrait", width: 1080, height: 1350, platform: "Instagram" },
      { id: "instagram-story", label: "Instagram Story / Reel", width: 1080, height: 1920, platform: "Instagram" },
      { id: "tiktok-video", label: "TikTok Video", width: 1080, height: 1920, platform: "TikTok" },
    ],
  },
  {
    group: "Video / Social",
    items: [
      { id: "youtube-thumbnail", label: "YouTube Thumbnail", width: 1280, height: 720, platform: "YouTube" },
      { id: "x-post", label: "X / Twitter Post", width: 1600, height: 900, platform: "X" },
      { id: "linkedin-post", label: "LinkedIn Post", width: 1200, height: 1200, platform: "LinkedIn" },
      { id: "facebook-cover", label: "Facebook Cover", width: 1640, height: 624, platform: "Facebook" },
      { id: "pinterest-pin", label: "Pinterest Pin", width: 1000, height: 1500, platform: "Pinterest" },
    ],
  },
  {
    group: "Web / Store",
    items: [
      { id: "web-banner", label: "Website Banner", width: 1920, height: 640, platform: "Web" },
      { id: "blog-card", label: "Blog Card", width: 1200, height: 630, platform: "Web" },
      { id: "product-square", label: "Product Square", width: 1000, height: 1000, platform: "Store" },
      { id: "marketplace", label: "Marketplace Main", width: 2000, height: 2000, platform: "Store" },
    ],
  },
];

const ALL_PRESETS = PRESET_GROUPS.flatMap((group) => group.items);

const FORMAT_OPTIONS = {
  original: { label: "Keep Source", mime: null, ext: null },
  jpeg: { label: "JPEG", mime: "image/jpeg", ext: "jpg" },
  png: { label: "PNG", mime: "image/png", ext: "png" },
  webp: { label: "WebP", mime: "image/webp", ext: "webp" },
};

const MODE_OPTIONS = {
  contain: {
    label: "Fit",
    detail: "Keep full image and add background padding",
  },
  cover: {
    label: "Fill Crop",
    detail: "Fill exact canvas and crop overflow",
  },
  stretch: {
    label: "Stretch",
    detail: "Force exact dimensions without preserving ratio",
  },
};

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
      .slice(0, 70) || "resized-image"
  );
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
        reject(new Error("This browser could not export the resized image."));
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
    image.src = url;
    await image.decode();
    return {
      image,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  } finally {
    URL.revokeObjectURL(url);
  }
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

function calculateTargetDimensions(settings, source) {
  if (settings.percentMode) {
    const scale = Math.max(1, settings.scalePercent) / 100;
    return {
      width: Math.max(1, Math.round(source.width * scale)),
      height: Math.max(1, Math.round(source.height * scale)),
    };
  }

  const multiplier = settings.retina ? 2 : 1;
  return {
    width: Math.max(1, Math.round(settings.width * multiplier)),
    height: Math.max(1, Math.round(settings.height * multiplier)),
  };
}

function computeDrawRect(mode, source, target, avoidUpscale) {
  if (mode === "stretch") {
    return { sx: 0, sy: 0, sw: source.width, sh: source.height, dx: 0, dy: 0, dw: target.width, dh: target.height };
  }

  const scale =
    mode === "cover"
      ? Math.max(target.width / source.width, target.height / source.height)
      : Math.min(target.width / source.width, target.height / source.height);
  const finalScale = avoidUpscale ? Math.min(1, scale) : scale;
  const dw = Math.round(source.width * finalScale);
  const dh = Math.round(source.height * finalScale);

  return {
    sx: 0,
    sy: 0,
    sw: source.width,
    sh: source.height,
    dx: Math.round((target.width - dw) / 2),
    dy: Math.round((target.height - dh) / 2),
    dw,
    dh,
  };
}

function fillCanvasBackground(ctx, target, background, transparent, mime) {
  if (transparent && mime !== "image/jpeg") {
    ctx.clearRect(0, 0, target.width, target.height);
    return;
  }
  ctx.fillStyle = mime === "image/jpeg" && transparent ? "#ffffff" : background;
  ctx.fillRect(0, 0, target.width, target.height);
}

async function resizeImage(file, settings) {
  const source = await loadImage(file);
  const outputFormat = getOutputFormat(settings.format, file);
  const target = calculateTargetDimensions(settings, source);
  const canvas = document.createElement("canvas");
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext("2d", {
    alpha: outputFormat.mime !== "image/jpeg",
  });

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = settings.smoothing;
  fillCanvasBackground(
    ctx,
    target,
    settings.background,
    settings.transparentBackground,
    outputFormat.mime,
  );

  const rect = computeDrawRect(settings.mode, source, target, settings.avoidUpscale);
  ctx.drawImage(
    source.image,
    rect.sx,
    rect.sy,
    rect.sw,
    rect.sh,
    rect.dx,
    rect.dy,
    rect.dw,
    rect.dh,
  );

  const blob = await canvasToBlob(canvas, outputFormat.mime, settings.quality);
  const dataUrl = canvas.toDataURL(outputFormat.mime, settings.quality);

  return {
    blob,
    dataUrl,
    width: target.width,
    height: target.height,
    sourceWidth: source.width,
    sourceHeight: source.height,
    ext: outputFormat.ext,
    mime: outputFormat.mime,
  };
}

function buildOutputName(file, result, preset, suffix) {
  return `${sanitizeFileName(file.name)}-${suffix || preset.id}-${result.width}x${result.height}.${result.ext}`;
}

function buildSummary(items, settings, preset) {
  return [
    "Image Resizer Summary",
    `Preset: ${preset.label}`,
    `Target: ${settings.percentMode ? `${settings.scalePercent}%` : `${settings.width}x${settings.height}`}`,
    `Mode: ${MODE_OPTIONS[settings.mode].label}`,
    `Format: ${FORMAT_OPTIONS[settings.format].label}`,
    `Images: ${items.length}`,
    ...items.map((item, index) => `${index + 1}. ${item.file.name} - ${item.width}x${item.height} - ${formatBytes(item.file.size)}`),
  ].join("\n");
}

function StatCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-lg border border-(--border) bg-(--background) p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-(--muted-foreground)">
            {label}
          </p>
          <p className="break-words text-lg font-bold leading-tight text-(--foreground)">{value}</p>
          {detail && <p className="text-sm text-(--muted-foreground)">{detail}</p>}
        </div>
      </div>
    </div>
  );
}

export default function MainComponent() {
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [presetId, setPresetId] = useState("instagram-square");
  const [settings, setSettings] = useState({
    width: 1080,
    height: 1080,
    scalePercent: 50,
    percentMode: false,
    lockAspect: true,
    mode: "contain",
    format: "original",
    quality: 0.92,
    background: "#ffffff",
    transparentBackground: false,
    avoidUpscale: false,
    retina: false,
    smoothing: "high",
    filenameSuffix: "",
  });
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef(null);

  const selectedItem = items.find((item) => item.id === selectedId) || items[0];
  const activePreset = ALL_PRESETS.find((preset) => preset.id === presetId) || ALL_PRESETS[0];
  const outputFormat = selectedItem ? getOutputFormat(settings.format, selectedItem.file) : FORMAT_OPTIONS.png;
  const estimatedTarget = selectedItem
    ? calculateTargetDimensions(settings, selectedItem)
    : { width: settings.width, height: settings.height };

  const totalSourceSize = useMemo(
    () => items.reduce((sum, item) => sum + item.file.size, 0),
    [items],
  );

  const updateSetting = (key, value) => {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setPreview(null);
  };

  const updateDimensions = (key, value) => {
    const nextValue = Math.max(1, Number(value) || 1);
    setSettings((previous) => {
      if (!previous.lockAspect || !previous.width || !previous.height) {
        return { ...previous, [key]: nextValue, percentMode: false };
      }

      const ratio = previous.height / previous.width;
      if (key === "height") {
        return {
          ...previous,
          width: Math.max(1, Math.round(nextValue / ratio)),
          height: nextValue,
          percentMode: false,
        };
      }

      return {
        ...previous,
        width: nextValue,
        height: Math.max(1, Math.round(nextValue * ratio)),
        percentMode: false,
      };
    });
    setPreview(null);
  };

  const applyPreset = (preset) => {
    setPresetId(preset.id);
    setSettings((previous) => ({
      ...previous,
      width: preset.percent ? previous.width : preset.width,
      height: preset.percent ? previous.height : preset.height,
      scalePercent: preset.percent ? preset.width : previous.scalePercent,
      percentMode: Boolean(preset.percent),
      filenameSuffix: preset.id,
    }));
    setPreview(null);
  };

  const addFiles = async (fileList) => {
    const nextFiles = Array.from(fileList || []).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (!nextFiles.length) {
      setError("Please upload JPG, PNG, WebP, AVIF, or another browser-readable image.");
      return;
    }

    setError("");
    setStatus("Reading image dimensions...");

    const loadedItems = [];
    for (const file of nextFiles) {
      try {
        const source = await loadImage(file);
        loadedItems.push({
          id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID?.() || Math.random()}`,
          file,
          width: source.width,
          height: source.height,
          type: file.type || "image",
        });
      } catch {
        setError(`Could not read ${file.name}. Try another image format.`);
      }
    }

    if (!loadedItems.length) {
      setStatus("");
      return;
    }

    setItems((previous) => [...previous, ...loadedItems]);
    setSelectedId((previous) => previous || loadedItems[0].id);
    setStatus(`${loadedItems.length} image${loadedItems.length === 1 ? "" : "s"} added.`);
    setPreview(null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  };

  const removeItem = (id) => {
    setItems((previous) => previous.filter((item) => item.id !== id));
    if (selectedId === id) {
      const remaining = items.filter((item) => item.id !== id);
      setSelectedId(remaining[0]?.id || "");
    }
    setPreview(null);
  };

  const resetTool = () => {
    setItems([]);
    setSelectedId("");
    setPreview(null);
    setStatus("");
    setError("");
    setCopied(false);
    setProgress({ done: 0, total: 0 });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const generatePreview = async () => {
    if (!selectedItem) {
      setError("Upload an image first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Generating resized preview...");
    try {
      const result = await resizeImage(selectedItem.file, settings);
      setPreview(result);
      setStatus("Preview generated.");
    } catch (err) {
      console.error("Preview failed:", err);
      setError("Could not generate preview for this image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResized = async () => {
    if (!items.length) {
      setError("Upload at least one image first.");
      return;
    }

    setIsProcessing(true);
    setError("");
    setStatus("Resizing images...");
    setProgress({ done: 0, total: items.length });

    try {
      const outputs = [];
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index];
        const result = await resizeImage(item.file, settings);
        outputs.push({
          filename: buildOutputName(
            item.file,
            result,
            activePreset,
            settings.filenameSuffix || activePreset.id,
          ),
          blob: result.blob,
        });
        setProgress({ done: index + 1, total: items.length });
      }

      if (outputs.length === 1) {
        downloadBlob(outputs[0].blob, outputs[0].filename);
      } else {
        setStatus("Packaging resized images into ZIP...");
        const zip = new JSZip();
        outputs.forEach((output) => zip.file(output.filename, output.blob));
        zip.file("resize-summary.txt", buildSummary(items, settings, activePreset));
        const zipBlob = await zip.generateAsync({
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 6 },
        });
        downloadBlob(zipBlob, "resized-images.zip");
      }

      setStatus(
        outputs.length === 1
          ? "Resized image downloaded."
          : `${outputs.length} resized images exported in a ZIP.`,
      );
    } catch (err) {
      console.error("Resize failed:", err);
      setError("Could not resize the selected images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copySummary = async () => {
    await navigator.clipboard?.writeText(buildSummary(items, settings, activePreset));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <main className="mx-auto max-w-[1180px] px-4 pb-12 pt-8 text-(--foreground)">
      <div className="mx-auto max-w-4xl text-center">
        <h1 className="heading">Image Resizer</h1>
        <p className="description mt-3 text-balance">
          Resize images with exact dimensions, social media presets, crop/fit
          modes, format export, previews, and batch ZIP downloads.
        </p>
      </div>

      <section className="mt-7 rounded-lg border border-(--border) bg-(--section-highlight) p-5 sm:p-6">
        <div className="grid gap-6 2xl:grid-cols-[minmax(0,1fr)_330px] 2xl:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-(--section-highlight) text-(--primary)">
              <Maximize2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-(--foreground)">Social and Custom Image Sizing</h2>
              <p className="mt-2 text-sm leading-6 text-(--muted-foreground)">
                Use platform presets or exact dimensions, then export optimized
                images locally from your browser.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-(--border) bg-(--background) p-4">
            <p className="text-xs font-semibold uppercase text-(--muted-foreground)">
              Active preset
            </p>
            <p className="mt-2 text-2xl font-bold text-(--primary)">{activePreset.label}</p>
            <p className="mt-2 text-sm text-(--muted-foreground)">
              {settings.percentMode
                ? `${settings.scalePercent}% of source size`
                : `${estimatedTarget.width} x ${estimatedTarget.height}px`}
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
              data-testid="image-resizer-file-input"
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
              Supports browser-readable images like JPG, PNG, WebP, AVIF, and GIF first frames.
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
                      setPreview(null);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        setSelectedId(item.id);
                        setPreview(null);
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
                        <p className="truncate font-semibold text-(--foreground)">{item.file.name}</p>
                        <p className="mt-1 text-xs text-(--muted-foreground)">
                          {item.width} x {item.height}px • {formatBytes(item.file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="rounded-md p-1 text-(--muted-foreground) hover:bg-red-500/10 hover:text-red-600"
                        aria-label={`Remove ${item.file.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              <h2 className="font-semibold text-(--foreground)">Resize Settings</h2>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-(--foreground)">Preset</span>
              <select
                value={presetId}
                onChange={(event) => applyPreset(ALL_PRESETS.find((preset) => preset.id === event.target.value))}
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
              >
                {PRESET_GROUPS.map((group) => (
                  <optgroup key={group.group} label={group.group}>
                    {group.items.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label} {preset.percent ? `(${preset.width}%)` : `(${preset.width}x${preset.height})`}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>

            <div className="tool-form-grid mt-5">
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Width</span>
                <input
                  type="number"
                  min="1"
                  value={settings.width}
                  onChange={(event) => updateDimensions("width", event.target.value)}
                  disabled={settings.percentMode}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary) disabled:opacity-50"
                />
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Height</span>
                <input
                  type="number"
                  min="1"
                  value={settings.height}
                  onChange={(event) => updateDimensions("height", event.target.value)}
                  disabled={settings.percentMode}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary) disabled:opacity-50"
                />
              </label>
            </div>

            {settings.percentMode && (
              <label className="mt-5 block">
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Scale Percent</span>
                <input
                  type="range"
                  min="1"
                  max="300"
                  value={settings.scalePercent}
                  onChange={(event) => updateSetting("scalePercent", Number(event.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <div className="mt-1 text-sm text-(--muted-foreground)">
                  {settings.scalePercent}% of original dimensions
                </div>
              </label>
            )}

            <div className="mt-5 grid gap-3">
              {Object.entries(MODE_OPTIONS).map(([value, option]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateSetting("mode", value)}
                  className={`rounded-lg border p-3 text-left transition ${
                    settings.mode === value
                      ? "border-(--primary) bg-(--section-highlight)"
                      : "border-(--border) bg-(--background)"
                  }`}
                >
                  <span className="block font-semibold text-(--foreground)">{option.label}</span>
                  <span className="mt-1 block text-sm text-(--muted-foreground)">
                    {option.detail}
                  </span>
                </button>
              ))}
            </div>

            <div className="tool-form-grid mt-5">
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Output Format</span>
                <select
                  value={settings.format}
                  onChange={(event) => updateSetting("format", event.target.value)}
                  className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
                >
                  {Object.entries(FORMAT_OPTIONS).map(([value, option]) => (
                    <option key={value} value={value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-2 block text-sm font-semibold text-(--foreground)">Background</span>
                <input
                  type="color"
                  value={settings.background}
                  onChange={(event) => updateSetting("background", event.target.value)}
                  className="h-10 w-full rounded-lg border border-(--border) bg-(--background) p-1"
                />
              </label>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-(--foreground)">Quality</span>
              <input
                type="range"
                min="0.4"
                max="1"
                step="0.01"
                value={settings.quality}
                onChange={(event) => updateSetting("quality", Number(event.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="mt-1 text-sm text-(--muted-foreground)">
                {Math.round(settings.quality * 100)}% for JPEG/WebP output
              </div>
            </label>

            <div className="mt-5 grid gap-3">
              {[
                ["lockAspect", "Lock aspect ratio"],
                ["transparentBackground", "Transparent background when possible"],
                ["avoidUpscale", "Avoid upscaling source pixels"],
                ["retina", "Export 2x retina dimensions"],
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

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-(--foreground)">Filename Suffix</span>
              <input
                value={settings.filenameSuffix}
                onChange={(event) => updateSetting("filenameSuffix", event.target.value)}
                placeholder={activePreset.id}
                className="w-full rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-(--foreground) outline-none focus:border-(--primary)"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="btn-primary"
                onClick={downloadResized}
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
                <Crop className="h-4 w-4" />
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
            <StatCard icon={Maximize2} label="Target" value={`${estimatedTarget.width}x${estimatedTarget.height}`} detail="Output pixels" />
            <StatCard icon={ImageIcon} label="Format" value={outputFormat.label} detail={`${Math.round(settings.quality * 100)}% quality`} />
            <StatCard icon={Archive} label="Export" value={items.length > 1 ? "ZIP" : "File"} detail="Browser-side" />
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

          <section data-testid="tool-output" className="rounded-lg border border-(--border) bg-(--card) p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-semibold text-(--foreground)">Output Preview</h2>
                <p className="mt-1 text-sm text-(--muted-foreground)">
                  Preview the selected image before downloading.
                </p>
              </div>
              <span className="rounded-lg border border-(--border) bg-(--background) px-3 py-2 text-sm text-(--muted-foreground)">
                {MODE_OPTIONS[settings.mode].label}
              </span>
            </div>

            <div className="rounded-lg border border-(--border) bg-(--background) p-3">
              {preview ? (
                <div>
                  <div className="flex min-h-[320px] items-center justify-center overflow-auto rounded-lg bg-[linear-gradient(45deg,#e5e7eb_25%,transparent_25%),linear-gradient(-45deg,#e5e7eb_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#e5e7eb_75%),linear-gradient(-45deg,transparent_75%,#e5e7eb_75%)] bg-[length:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0px] p-4">
                    <img
                      src={preview.dataUrl}
                      alt="Resized preview"
                      className="max-h-[520px] max-w-full rounded-md shadow-lg"
                    />
                  </div>
                  <div className="tool-compact-grid mt-4 text-sm">
                    <div className="rounded-lg bg-(--background) p-3">
                      <p className="text-(--muted-foreground)">Original</p>
                      <p className="font-semibold text-(--foreground)">
                        {preview.sourceWidth} x {preview.sourceHeight}
                      </p>
                    </div>
                    <div className="rounded-lg bg-(--background) p-3">
                      <p className="text-(--muted-foreground)">Output</p>
                      <p className="font-semibold text-(--foreground)">
                        {preview.width} x {preview.height}
                      </p>
                    </div>
                    <div className="rounded-lg bg-(--background) p-3">
                      <p className="text-(--muted-foreground)">Size</p>
                      <p className="font-semibold text-(--foreground)">
                        {formatBytes(preview.blob.size)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[320px] flex-col items-center justify-center text-center text-(--muted-foreground)">
                  <FileImage className="mb-3 h-10 w-10" />
                  <p className="font-medium">
                    {selectedItem ? "Click Preview to render the resized output." : "Upload an image to preview output."}
                  </p>
                </div>
              )}
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-lg border border-(--border) bg-(--section-highlight) p-4 text-(--primary)">
            <Lock className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="text-sm">
              Resizing uses browser canvas locally. Animated GIFs export the
              browser-decoded still frame; metadata is stripped during canvas export.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
