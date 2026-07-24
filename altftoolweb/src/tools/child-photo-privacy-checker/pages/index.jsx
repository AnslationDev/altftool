"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  EyeOff,
  FileImage,
  Info,
  LockKeyhole,
  MapPin,
  MousePointer2,
  Plus,
  RotateCcw,
  ScanSearch,
  ShieldCheck,
  Tag,
  Trash2,
  Undo2,
  Upload,
  X,
} from "lucide-react";
import {
  MASK_MODES,
  REVIEW_AREAS,
  createDefaultRegion,
  formatFileSize,
  inspectImageMetadata,
  normaliseRegion,
  rectangleFromPoints,
  regionToPixels,
} from "../lib/photoPrivacy.mjs";

const ACCEPTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_FILE_BYTES = 40 * 1024 * 1024;

const CONTROL_CLASS =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition-colors focus:border-primary focus:ring-[3px] focus:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

const MASK_OPTIONS = [
  {
    id: "solid",
    label: "Solid cover",
    help: "Strongest option for identifiers and private details.",
  },
  {
    id: "pixelate",
    label: "Pixelate",
    help: "Obscures details but may retain shapes and context.",
  },
  {
    id: "blur",
    label: "Blur",
    help: "Softens details; avoid it for high-risk identifiers.",
  },
];

function ActionButton({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  primary = false,
  danger = false,
  className = "",
}) {
  let variant =
    "border border-border bg-surface text-foreground hover:border-primary hover:text-primary";
  if (primary) {
    variant = "border border-primary bg-primary text-primary-foreground hover:bg-primary-hover";
  }
  if (danger) {
    variant = "border border-danger bg-surface text-danger hover:bg-danger-soft";
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 ${variant} ${className}`}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

function NumberField({ label, value, onChange, max }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-muted-foreground">
        {label} (%)
      </span>
      <input
        type="number"
        min={0}
        max={max}
        step={0.5}
        value={Number(value.toFixed(1))}
        onChange={(event) => onChange(Number(event.target.value))}
        className={CONTROL_CLASS}
      />
    </label>
  );
}

function MetadataCard({ metadata, loading }) {
  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-surface-soft p-4 text-sm text-muted-foreground">
        Inspecting supported metadata markers locally…
      </div>
    );
  }

  if (!metadata) return null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-surface-soft p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ScanSearch className="h-5 w-5 text-primary" aria-hidden="true" />
          <h3 className="text-sm font-bold text-foreground">Embedded metadata review</h3>
        </div>
        <span className="rounded-pill border border-border bg-surface px-3 py-1 text-xs font-bold uppercase text-muted-foreground">
          {metadata.format}
        </span>
      </div>

      {metadata.markers.length ? (
        <ul className="grid gap-2 sm:grid-cols-2" aria-label="Metadata markers found">
          {metadata.markers.map((marker) => (
            <li
              key={marker.id}
              className="flex items-start gap-2 rounded-md border border-warning bg-warning-soft p-3 text-sm text-foreground"
            >
              {marker.id === "gps" ? (
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              ) : (
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
              )}
              <span>
                <span className="block font-bold">{marker.label}</span>
                {marker.value ? (
                  <span className="mt-1 block break-all text-xs text-muted-foreground">
                    {marker.value}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex items-start gap-2 rounded-md border border-border bg-surface p-3 text-sm text-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" aria-hidden="true" />
          <p>
            No supported metadata markers were detected. This is not proof that the file
            contains no metadata.
          </p>
        </div>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        The checker reads common JPEG, PNG, and WebP metadata structures. It does not send
        the file anywhere. Export creates a new flattened image and does not copy the
        original metadata.
      </p>
    </div>
  );
}

function MaskPreview({ mode, selected }) {
  let style = "border-foreground bg-foreground/90";
  if (mode === "pixelate") {
    style = "border-primary bg-primary-soft/90 backdrop-blur-sm";
  } else if (mode === "blur") {
    style = "border-primary bg-surface/35 backdrop-blur-md";
  }

  return `${style} ${
    selected ? "ring-[3px] ring-primary/40" : ""
  } absolute overflow-hidden rounded-sm border-2`;
}

export default function ChildPhotoPrivacyChecker() {
  const [ownershipConfirmed, setOwnershipConfirmed] = useState(false);
  const [file, setFile] = useState(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageInfo, setImageInfo] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [regions, setRegions] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [newMode, setNewMode] = useState("solid");
  const [newReviewArea, setNewReviewArea] = useState("school-id");
  const [draft, setDraft] = useState(null);
  const [reviewedAreas, setReviewedAreas] = useState([]);
  const [finalReviewConfirmed, setFinalReviewConfirmed] = useState(false);
  const [format, setFormat] = useState("image/png");
  const [jpegQuality, setJpegQuality] = useState(92);
  const [outputUrl, setOutputUrl] = useState("");
  const [outputSize, setOutputSize] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const imageRef = useRef(null);
  const drawingStartRef = useRef(null);
  const sourceUrlRef = useRef("");
  const outputUrlRef = useRef("");
  const maskIdRef = useRef(0);

  const selectedRegion = regions.find((region) => region.id === selectedId) || null;
  const allAreasReviewed = REVIEW_AREAS.every((area) => reviewedAreas.includes(area.id));
  const canExport =
    Boolean(imageInfo) &&
    ownershipConfirmed &&
    allAreasReviewed &&
    finalReviewConfirmed &&
    !isExporting;

  const maskCounts = useMemo(
    () =>
      REVIEW_AREAS.reduce((counts, area) => {
        counts[area.id] = regions.filter((region) => region.reviewArea === area.id).length;
        return counts;
      }, {}),
    [regions],
  );

  useEffect(() => {
    return () => {
      if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    };
  }, []);

  const clearOutput = () => {
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    outputUrlRef.current = "";
    setOutputUrl("");
    setOutputSize(0);
  };

  const invalidateFinalReview = () => {
    setFinalReviewConfirmed(false);
    clearOutput();
  };

  const resetWorkspace = () => {
    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    sourceUrlRef.current = "";
    clearOutput();
    setFile(null);
    setSourceUrl("");
    setImageInfo(null);
    setMetadata(null);
    setMetadataLoading(false);
    setRegions([]);
    setHistory([]);
    setSelectedId("");
    setDraft(null);
    setReviewedAreas([]);
    setFinalReviewConfirmed(false);
    setMessage("");
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const makeRegionId = () => {
    maskIdRef.current += 1;
    return typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `mask-${maskIdRef.current}`;
  };

  const loadFile = async (nextFile) => {
    setError("");
    setMessage("");

    if (!ownershipConfirmed) {
      setError("Confirm that you are authorised to edit this photo first.");
      return;
    }
    if (!nextFile || !ACCEPTED_TYPES.has(nextFile.type)) {
      setError("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (nextFile.size > MAX_FILE_BYTES) {
      setError("Choose an image smaller than 40 MB so it can be processed safely.");
      return;
    }

    if (sourceUrlRef.current) URL.revokeObjectURL(sourceUrlRef.current);
    clearOutput();
    const url = URL.createObjectURL(nextFile);
    sourceUrlRef.current = url;
    setFile(nextFile);
    setSourceUrl(url);
    setImageInfo(null);
    setMetadata(null);
    setRegions([]);
    setHistory([]);
    setSelectedId("");
    setDraft(null);
    setReviewedAreas([]);
    setFinalReviewConfirmed(false);
    setMetadataLoading(true);
    setMessage("Photo loaded locally. Inspecting supported metadata markers…");

    try {
      const buffer = await nextFile.arrayBuffer();
      setMetadata(inspectImageMetadata(buffer));
      setMessage("Photo ready. Review the image manually and draw masks where needed.");
    } catch {
      setMetadata({
        format: "unknown",
        markers: [],
        exifFound: false,
        gpsFound: false,
      });
      setMessage("Photo ready. Metadata inspection was unavailable for this file.");
    } finally {
      setMetadataLoading(false);
    }
  };

  const commitRegions = (nextRegions) => {
    setHistory((current) => [...current.slice(-24), regions]);
    setRegions(nextRegions);
    invalidateFinalReview();
  };

  const addCentreMask = () => {
    if (!imageInfo) return;
    const mask = createDefaultRegion({
      id: makeRegionId(),
      mode: newMode,
      reviewArea: newReviewArea,
    });
    commitRegions([...regions, mask]);
    setSelectedId(mask.id);
    setMessage("Mask added. Adjust its position and size in the inspector.");
  };

  const pointFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    return {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
  };

  const startDrawing = (event) => {
    if (!imageInfo || event.button !== 0) return;
    const point = pointFromPointer(event);
    drawingStartRef.current = point;
    setDraft({ x: point.x, y: point.y, width: 0, height: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  const continueDrawing = (event) => {
    if (!drawingStartRef.current) return;
    const rectangle = rectangleFromPoints(drawingStartRef.current, pointFromPointer(event), 0);
    if (rectangle) setDraft(rectangle);
  };

  const finishDrawing = (event) => {
    if (!drawingStartRef.current) return;
    const rectangle = rectangleFromPoints(
      drawingStartRef.current,
      pointFromPointer(event),
      1,
    );
    drawingStartRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    setDraft(null);
    if (!rectangle) return;

    const mask = normaliseRegion({
      id: makeRegionId(),
      ...rectangle,
      mode: newMode,
      reviewArea: newReviewArea,
    });
    commitRegions([...regions, mask]);
    setSelectedId(mask.id);
    setMessage("Manual mask added.");
  };

  const changeSelectedRegion = (patch) => {
    if (!selectedRegion) return;
    commitRegions(
      regions.map((region) =>
        region.id === selectedRegion.id ? normaliseRegion({ ...region, ...patch }) : region,
      ),
    );
  };

  const removeRegion = (id) => {
    const next = regions.filter((region) => region.id !== id);
    commitRegions(next);
    if (selectedId === id) setSelectedId(next[0]?.id || "");
    setMessage("Mask removed. Use Undo to restore it.");
  };

  const undoRegions = () => {
    if (!history.length) return;
    const previous = history[history.length - 1];
    setRegions(previous);
    setHistory((current) => current.slice(0, -1));
    if (!previous.some((region) => region.id === selectedId)) {
      setSelectedId(previous[0]?.id || "");
    }
    invalidateFinalReview();
    setMessage("Last mask change undone.");
  };

  const toggleAreaReviewed = (areaId) => {
    setReviewedAreas((current) =>
      current.includes(areaId)
        ? current.filter((item) => item !== areaId)
        : [...current, areaId],
    );
    invalidateFinalReview();
  };

  const drawMask = (context, image, region, scratchCanvas, solidColour) => {
    const rectangle = regionToPixels(region, context.canvas.width, context.canvas.height);
    if (!rectangle.width || !rectangle.height) return;

    if (region.mode === "solid") {
      context.save();
      context.fillStyle = solidColour;
      context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      context.restore();
      return;
    }

    if (region.mode === "blur") {
      const blurRadius = Math.max(
        10,
        Math.round(Math.min(rectangle.width, rectangle.height) / 10),
      );
      context.save();
      context.beginPath();
      context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      context.clip();
      context.filter = `blur(${blurRadius}px)`;
      context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
      context.restore();
      return;
    }

    const sampleWidth = Math.max(1, Math.round(rectangle.width / 18));
    const sampleHeight = Math.max(1, Math.round(rectangle.height / 18));
    scratchCanvas.width = sampleWidth;
    scratchCanvas.height = sampleHeight;
    const scratch = scratchCanvas.getContext("2d");
    scratch.imageSmoothingEnabled = true;
    scratch.drawImage(
      image,
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
      0,
      0,
      sampleWidth,
      sampleHeight,
    );
    context.save();
    context.imageSmoothingEnabled = false;
    context.drawImage(
      scratchCanvas,
      0,
      0,
      sampleWidth,
      sampleHeight,
      rectangle.x,
      rectangle.y,
      rectangle.width,
      rectangle.height,
    );
    context.restore();
  };

  const exportImage = async () => {
    const image = imageRef.current;
    if (!canExport || !image) return;
    setError("");
    setMessage("");
    setIsExporting(true);
    clearOutput();

    try {
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is unavailable.");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const scratchCanvas = document.createElement("canvas");
      const tokenColour =
        getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() ||
        "CanvasText";
      regions.forEach((region) =>
        drawMask(context, image, region, scratchCanvas, tokenColour),
      );

      const blob = await new Promise((resolve) =>
        canvas.toBlob(
          resolve,
          format,
          format === "image/jpeg" ? jpegQuality / 100 : undefined,
        ),
      );
      if (!blob) throw new Error("The browser could not create the output image.");

      const url = URL.createObjectURL(blob);
      outputUrlRef.current = url;
      setOutputUrl(url);
      setOutputSize(blob.size);
      setMessage(
        "Flattened copy created locally. Open it at full size for one last visual check before sharing.",
      );
    } catch (exportError) {
      setError(exportError.message || "The browser could not export this image.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="mx-auto max-w-4xl text-center">
          <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-pill border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-bold text-primary">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              Local manual privacy review
            </span>
            <span className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1 text-xs font-bold text-foreground">
              <LockKeyhole className="h-4 w-4 text-primary" aria-hidden="true" />
              No upload
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Child Photo Privacy Checker
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Manually inspect a photo you are authorised to edit, cover privacy-sensitive
            details, and export a new flattened copy without carrying over the original
            metadata.
          </p>
        </header>

        <section className="rounded-lg border border-warning bg-warning-soft p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" aria-hidden="true" />
            <div className="space-y-1">
              <h2 className="font-bold text-foreground">This is a manual aid, not a safety guarantee</h2>
              <p className="text-sm leading-relaxed text-foreground">
                It does not identify children, faces, ages, schools, homes, or locations.
                It does not analyse image pixels for you. You choose every review result
                and mask. Hidden context may still reveal identity or location, so review
                the exported copy yourself before sharing.
              </p>
            </div>
          </div>
        </section>

        <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-sm transition-colors hover:border-primary">
          <input
            type="checkbox"
            checked={ownershipConfirmed}
            onChange={(event) => {
              setOwnershipConfirmed(event.target.checked);
              if (!event.target.checked && file) resetWorkspace();
            }}
            className="mt-1 h-5 w-5 rounded-sm border-border accent-primary focus-visible:ring-[3px] focus-visible:ring-primary/35"
          />
          <span>
            <span className="block font-bold text-foreground">Authorisation confirmation</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              I am the parent, guardian, owner, or otherwise have clear permission to edit
              this photo and create a privacy-safe copy.
            </span>
          </span>
        </label>

        {error ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-danger bg-danger-soft p-4 text-sm text-danger"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            className="flex items-start gap-3 rounded-lg border border-info bg-info-soft p-4 text-sm text-foreground"
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-info" aria-hidden="true" />
            <span>{message}</span>
          </div>
        ) : null}

        {!file ? (
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <button
              type="button"
              disabled={!ownershipConfirmed}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                loadFile(event.dataTransfer.files?.[0]);
              }}
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface-soft p-8 text-center transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-circle bg-primary-soft text-primary">
                <Upload className="h-7 w-7" aria-hidden="true" />
              </span>
              <span className="text-lg font-bold text-foreground">Choose a photo</span>
              <span className="mt-2 text-sm text-muted-foreground">
                JPEG, PNG, or WebP · up to 40 MB · stays in this browser
              </span>
              {!ownershipConfirmed ? (
                <span className="mt-3 text-sm font-bold text-warning">
                  Confirm authorisation above to continue.
                </span>
              ) : null}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => loadFile(event.target.files?.[0])}
            />
          </section>
        ) : (
          <>
            <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                      <MousePointer2 className="h-5 w-5 text-primary" aria-hidden="true" />
                      Draw privacy masks
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Drag over a detail, or use Add centre mask for keyboard editing.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ActionButton
                      icon={Undo2}
                      onClick={undoRegions}
                      disabled={!history.length}
                    >
                      Undo
                    </ActionButton>
                    <ActionButton icon={RotateCcw} onClick={resetWorkspace}>
                      New photo
                    </ActionButton>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <label>
                    <span className="mb-2 block text-xs font-bold text-muted-foreground">
                      Mask purpose
                    </span>
                    <select
                      value={newReviewArea}
                      onChange={(event) => setNewReviewArea(event.target.value)}
                      className={CONTROL_CLASS}
                    >
                      {REVIEW_AREAS.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.shortLabel}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="mb-2 block text-xs font-bold text-muted-foreground">
                      Mask style
                    </span>
                    <select
                      value={newMode}
                      onChange={(event) => setNewMode(event.target.value)}
                      className={CONTROL_CLASS}
                    >
                      {MASK_OPTIONS.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="self-end">
                    <ActionButton
                      icon={Plus}
                      onClick={addCentreMask}
                      primary
                      className="w-full"
                    >
                      Add centre mask
                    </ActionButton>
                  </div>
                </div>

                {newMode !== "solid" ? (
                  <div className="flex items-start gap-2 rounded-md border border-warning bg-warning-soft p-3 text-sm text-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
                    <span>
                      Solid cover is safer for names, faces, addresses, codes, plates, and
                      other high-risk identifiers.
                    </span>
                  </div>
                ) : null}

                <div className="flex min-h-64 items-center justify-center overflow-auto rounded-lg border border-border bg-surface-soft p-3">
                  <div className="relative inline-flex max-w-full select-none">
                    {/* A local object URL cannot be passed through Next Image optimisation. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={imageRef}
                      src={sourceUrl}
                      alt="Uploaded photo for manual privacy masking"
                      draggable={false}
                      onLoad={(event) => {
                        setImageInfo({
                          width: event.currentTarget.naturalWidth,
                          height: event.currentTarget.naturalHeight,
                        });
                      }}
                      onError={() => setError("This browser could not decode the selected image.")}
                      className="block max-h-[44rem] max-w-full object-contain"
                    />
                    <div
                      role="application"
                      aria-label="Photo masking canvas. Drag to create a mask."
                      onPointerDown={startDrawing}
                      onPointerMove={continueDrawing}
                      onPointerUp={finishDrawing}
                      onPointerCancel={() => {
                        drawingStartRef.current = null;
                        setDraft(null);
                      }}
                      className="absolute inset-0 cursor-crosshair touch-none"
                    >
                      {regions.map((region, index) => {
                        const area = REVIEW_AREAS.find(
                          (item) => item.id === region.reviewArea,
                        );
                        return (
                          <button
                            key={region.id}
                            type="button"
                            aria-label={`Select mask ${index + 1}: ${area?.shortLabel || "Privacy detail"}`}
                            onPointerDown={(event) => event.stopPropagation()}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedId(region.id);
                            }}
                            className={MaskPreview(region.mode, selectedId === region.id)}
                            style={{
                              left: `${region.x}%`,
                              top: `${region.y}%`,
                              width: `${region.width}%`,
                              height: `${region.height}%`,
                            }}
                          >
                            <span className="sr-only">{area?.label}</span>
                          </button>
                        );
                      })}
                      {draft ? (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute rounded-sm border-2 border-dashed border-primary bg-primary-soft/60"
                          style={{
                            left: `${draft.x}%`,
                            top: `${draft.y}%`,
                            width: `${draft.width}%`,
                            height: `${draft.height}%`,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="break-all">
                    {file.name} · {formatFileSize(file.size)}
                  </span>
                  {imageInfo ? (
                    <span>
                      {imageInfo.width} × {imageInfo.height} pixels
                    </span>
                  ) : (
                    <span>Reading dimensions…</span>
                  )}
                </div>
              </div>

              <aside className="space-y-4">
                <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-sm font-bold text-foreground">
                      Mask inspector
                    </h2>
                    <span className="rounded-pill bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                      {regions.length} {regions.length === 1 ? "mask" : "masks"}
                    </span>
                  </div>

                  {selectedRegion ? (
                    <div className="mt-4 space-y-4">
                      <label>
                        <span className="mb-2 block text-xs font-bold text-muted-foreground">
                          Purpose
                        </span>
                        <select
                          value={selectedRegion.reviewArea}
                          onChange={(event) =>
                            changeSelectedRegion({ reviewArea: event.target.value })
                          }
                          className={CONTROL_CLASS}
                        >
                          {REVIEW_AREAS.map((area) => (
                            <option key={area.id} value={area.id}>
                              {area.shortLabel}
                            </option>
                          ))}
                        </select>
                      </label>

                      <div>
                        <span className="mb-2 block text-xs font-bold text-muted-foreground">
                          Style
                        </span>
                        <div className="grid gap-2">
                          {MASK_OPTIONS.map((option) => (
                            <button
                              key={option.id}
                              type="button"
                              aria-pressed={selectedRegion.mode === option.id}
                              onClick={() => changeSelectedRegion({ mode: option.id })}
                              className={`rounded-md border p-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35 ${
                                selectedRegion.mode === option.id
                                  ? "border-primary bg-primary-soft text-foreground"
                                  : "border-border bg-surface text-foreground hover:border-primary"
                              }`}
                            >
                              <span className="block font-bold">{option.label}</span>
                              <span className="mt-1 block text-xs text-muted-foreground">
                                {option.help}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <NumberField
                          label="Left"
                          value={selectedRegion.x}
                          max={99}
                          onChange={(value) => changeSelectedRegion({ x: value })}
                        />
                        <NumberField
                          label="Top"
                          value={selectedRegion.y}
                          max={99}
                          onChange={(value) => changeSelectedRegion({ y: value })}
                        />
                        <NumberField
                          label="Width"
                          value={selectedRegion.width}
                          max={100 - selectedRegion.x}
                          onChange={(value) => changeSelectedRegion({ width: value })}
                        />
                        <NumberField
                          label="Height"
                          value={selectedRegion.height}
                          max={100 - selectedRegion.y}
                          onChange={(value) => changeSelectedRegion({ height: value })}
                        />
                      </div>

                      <ActionButton
                        icon={Trash2}
                        danger
                        onClick={() => removeRegion(selectedRegion.id)}
                        className="w-full"
                      >
                        Remove mask
                      </ActionButton>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-md border border-dashed border-border bg-surface-soft p-4 text-center">
                      <EyeOff className="mx-auto h-6 w-6 text-muted-foreground" aria-hidden="true" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        Draw a mask or choose Add centre mask. Select a mask to edit it.
                      </p>
                    </div>
                  )}
                </section>

                <MetadataCard metadata={metadata} loading={metadataLoading} />
              </aside>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                    Manual privacy checklist
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Check an item only after inspecting the entire photo for that risk.
                    A zero count can be correct if no mask was needed.
                  </p>
                </div>
                <span className="rounded-pill border border-border bg-surface-soft px-3 py-1 text-xs font-bold text-muted-foreground">
                  {reviewedAreas.length} / {REVIEW_AREAS.length} reviewed
                </span>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {REVIEW_AREAS.map((area) => {
                  const reviewed = reviewedAreas.includes(area.id);
                  return (
                    <label
                      key={area.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                        reviewed
                          ? "border-success bg-success-soft"
                          : "border-border bg-surface-soft hover:border-primary"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={reviewed}
                        onChange={() => toggleAreaReviewed(area.id)}
                        className="mt-1 h-5 w-5 rounded-sm border-border accent-primary focus-visible:ring-[3px] focus-visible:ring-primary/35"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-bold text-foreground">{area.label}</span>
                          <span className="rounded-pill border border-border bg-surface px-2 py-1 text-xs font-bold text-muted-foreground">
                            {maskCounts[area.id]} {maskCounts[area.id] === 1 ? "mask" : "masks"}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                          {area.help}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
                <div>
                  <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
                    <Download className="h-5 w-5 text-primary" aria-hidden="true" />
                    Flatten and export
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    The export contains rendered pixels only: masks cannot be toggled off
                    and the original metadata is not copied. Keep the original private.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="mb-2 block text-xs font-bold text-muted-foreground">
                        Output format
                      </span>
                      <select
                        value={format}
                        onChange={(event) => {
                          setFormat(event.target.value);
                          clearOutput();
                        }}
                        className={CONTROL_CLASS}
                      >
                        <option value="image/png">PNG (lossless)</option>
                        <option value="image/jpeg">JPEG (smaller)</option>
                      </select>
                    </label>
                    <label>
                      <span className="mb-2 block text-xs font-bold text-muted-foreground">
                        JPEG quality ({jpegQuality}%)
                      </span>
                      <input
                        type="range"
                        min={60}
                        max={100}
                        step={1}
                        value={jpegQuality}
                        disabled={format !== "image/jpeg"}
                        onChange={(event) => {
                          setJpegQuality(Number(event.target.value));
                          clearOutput();
                        }}
                        className="min-h-11 w-full accent-primary disabled:opacity-60"
                      />
                    </label>
                  </div>

                  <label
                    className={`mt-4 flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      finalReviewConfirmed
                        ? "border-success bg-success-soft"
                        : "border-border bg-surface-soft"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={finalReviewConfirmed}
                      disabled={!allAreasReviewed}
                      onChange={(event) => {
                        setFinalReviewConfirmed(event.target.checked);
                        clearOutput();
                      }}
                      className="mt-1 h-5 w-5 rounded-sm border-border accent-primary focus-visible:ring-[3px] focus-visible:ring-primary/35 disabled:opacity-60"
                    />
                    <span>
                      <span className="block font-bold text-foreground">
                        Final review confirmation
                      </span>
                      <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                        I inspected the full image, including edges, reflections, readable
                        text, and background context; each required mask fully covers its
                        target; and I understand this tool cannot guarantee safe sharing.
                      </span>
                    </span>
                  </label>
                </div>

                <div className="flex flex-col justify-end gap-3 rounded-lg border border-border bg-surface-soft p-4">
                  {!allAreasReviewed ? (
                    <p className="text-sm text-muted-foreground">
                      Complete all six manual review areas to enable final confirmation.
                    </p>
                  ) : !finalReviewConfirmed ? (
                    <p className="text-sm text-muted-foreground">
                      Confirm the final visual review before creating the export.
                    </p>
                  ) : (
                    <p className="flex items-start gap-2 text-sm text-success">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      Review gate complete. The export will be created in this browser.
                    </p>
                  )}

                  <ActionButton
                    icon={Download}
                    primary
                    disabled={!canExport}
                    onClick={exportImage}
                    className="w-full"
                  >
                    {isExporting ? "Creating copy…" : "Create flattened copy"}
                  </ActionButton>
                </div>
              </div>
            </section>

            {outputUrl ? (
              <section className="rounded-lg border border-success bg-success-soft p-5 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <FileImage className="mt-0.5 h-6 w-6 shrink-0 text-success" aria-hidden="true" />
                    <div>
                      <h2 className="font-bold text-foreground">Flattened copy ready</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {format === "image/png" ? "PNG" : "JPEG"} · {formatFileSize(outputSize)}.
                        Open the result at full size and check every mask before sharing.
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={outputUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-bold text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                    >
                      <ScanSearch className="h-4 w-4" aria-hidden="true" />
                      Open full size
                    </a>
                    <a
                      href={outputUrl}
                      download={`child-photo-private-copy.${format === "image/png" ? "png" : "jpg"}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-4 text-sm font-bold text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary/35"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download copy
                    </a>
                  </div>
                </div>
              </section>
            ) : null}
          </>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <LockKeyhole className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-bold text-foreground">Local processing</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The photo is opened with a temporary browser URL. The tool makes no upload
              or remote analysis request.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <MousePointer2 className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-bold text-foreground">Manual, not biometric</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              There is no face detection, age estimation, identity matching, school
              recognition, or location inference.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <X className="h-5 w-5 text-primary" aria-hidden="true" />
            <h2 className="mt-3 font-bold text-foreground">Know the limit</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              A masked photo can still reveal relationships, routines, places, events, or
              identity through context. Share only when necessary.
            </p>
          </article>
        </section>
      </div>
    </main>
  );
}
