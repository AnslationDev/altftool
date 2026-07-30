"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ImageUploader from "../../_shared/components/ImageUploader";
import ErrorCard from "../../_shared/components/ErrorCard";
import { useObjectDetection } from "../../_shared/hooks/useObjectDetection";
import { loadImage, getCanvasBlob } from "../../_shared/utils/imageProcessing";
import { downloadBlob } from "../../_shared/utils/download";
import {
  Sparkles,
  UploadCloud,
  RefreshCw,
  Trash2,
  Minus,
  Plus,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Search,
  ChevronDown,
  Eye,
  Clock,
  Cpu,
  Monitor,
  PieChart,
  TrendingUp,
  Boxes,
  Download,
  FileText,
  Share2,
  Copy,
  Check,
  SlidersHorizontal,
  CheckCircle2,
  Car,
  Truck,
  Bus,
  Bike,
  User,
  Dog,
  Cat,
  Box,
  Image as ImageIcon,
} from "lucide-react";

const COCO_COLORS = [
  "#3b82f6", "#8b5cf6", "#22c55e", "#f59e0b", "#ef4444",
  "#14b8a6", "#ec4899", "#06b6d4", "#84cc16", "#f97316",
  "#6366f1", "#d946ef", "#0ea5e9", "#10b981", "#eab308",
];
const CLASS_COLORS = {};
function getClassColor(cls) {
  if (!CLASS_COLORS[cls]) CLASS_COLORS[cls] = COCO_COLORS[Object.keys(CLASS_COLORS).length % COCO_COLORS.length];
  return CLASS_COLORS[cls];
}

const CLASS_ICONS = {
  car: Car, truck: Truck, bus: Bus, bicycle: Bike, motorcycle: Bike,
  person: User, dog: Dog, cat: Cat,
};
const classIcon = (cls) => CLASS_ICONS[cls] || Box;
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// derive a filtered result set from the raw (low-threshold) detections
function deriveResult(raw, minConf) {
  if (!raw) return null;
  const dets = raw.detections.filter((d) => d.score >= minConf);
  const cats = {};
  dets.forEach((d) => {
    if (!cats[d.class]) cats[d.class] = { count: 0, scores: [] };
    cats[d.class].count++;
    cats[d.class].scores.push(d.score);
  });
  const categories = Object.entries(cats)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgConfidence: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
    }))
    .sort((a, b) => b.count - a.count);
  const avg = dets.length ? Math.round(dets.reduce((a, d) => a + d.score, 0) / dets.length) : 0;
  return { total: dets.length, categories, detections: dets, avg, detectionTime: raw.detectionTime };
}

function ExportActionButton({ disabled, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center gap-2.5 rounded-xl border border-(--border) px-3 py-2.5 text-left text-[13px] font-medium text-(--foreground) transition-colors hover:bg-(--muted)/60 disabled:opacity-40"
    >
      <Icon className="h-4 w-4 text-(--muted-foreground)" />
      {label}
    </button>
  );
}

export default function AIObjectCounter() {
  const [image, setImage] = useState(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [rawResult, setRawResult] = useState(null);
  const [thumbs, setThumbs] = useState({});
  const [processedImage, setProcessedImage] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const [minConfidence, setMinConfidence] = useState(40);
  const [showLabels, setShowLabels] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [sortBy, setSortBy] = useState("confidence");
  const [activeFilter, setActiveFilter] = useState("all");
  const [showAllBreakdown, setShowAllBreakdown] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [copied, setCopied] = useState(false);

  const baseCanvasRef = useRef(null);
  const annotatedCanvasRef = useRef(null);

  const { error: modelError, modelReady, modelLoadingState, loadModel, detect, reset: resetDetection } = useObjectDetection();

  const result = useMemo(() => deriveResult(rawResult, minConfidence), [rawResult, minConfidence]);

  /* --------------------------- image + detection --------------------------- */
  const handleImage = useCallback(
    async ({ src, file, img }) => {
      setImage({ src, file, img });
      setRawResult(null);
      setProcessedImage(null);
      setThumbs({});
      setSelectedId(null);
      resetDetection();
      if (!modelReady) await loadModel();
    },
    [modelReady, loadModel, resetDetection],
  );

  const runDetection = useCallback(async () => {
    if (!image) return;
    setDetecting(true);
    try {
      const img = await loadImage(image.src);
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setDims({ w, h });

      const base = document.createElement("canvas");
      base.width = w;
      base.height = h;
      base.getContext("2d").drawImage(img, 0, 0);
      baseCanvasRef.current = base;

      // run the model ONCE at a low threshold; the confidence slider filters client-side.
      const raw = await detect(img, 0.2);
      if (raw) {
        setRawResult(raw);
        // per-detection thumbnails cropped from the clean image
        const map = {};
        raw.detections.forEach((d) => {
          const tc = document.createElement("canvas");
          tc.width = 96;
          tc.height = 72;
          const tctx = tc.getContext("2d");
          tctx.fillStyle = "#0000";
          tctx.drawImage(base, d.x, d.y, Math.max(d.width, 1), Math.max(d.height, 1), 0, 0, 96, 72);
          map[d.id] = tc.toDataURL("image/jpeg", 0.7);
        });
        setThumbs(map);
      }
    } catch (err) {
      console.error("Detection error:", err);
    } finally {
      setDetecting(false);
    }
  }, [image, detect]);

  useEffect(() => {
    if (modelReady && image && !rawResult && !detecting) runDetection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modelReady, image]);

  /* ------------------------- redraw annotated image ------------------------ */
  useEffect(() => {
    const base = baseCanvasRef.current;
    if (!base || !result) return;
    const canvas = document.createElement("canvas");
    canvas.width = base.width;
    canvas.height = base.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(base, 0, 0);
    const scale = Math.max(base.width / 900, 1);

    result.detections.forEach((d, i) => {
      const color = getClassColor(d.class);
      const emphasized = selectedId === null || selectedId === d.id;
      ctx.globalAlpha = emphasized ? 1 : 0.25;
      ctx.strokeStyle = color;
      ctx.lineWidth = (selectedId === d.id ? 5 : 3) * scale;
      ctx.strokeRect(d.x, d.y, d.width, d.height);

      // number badge
      const badge = `${i + 1}`;
      ctx.font = `bold ${13 * scale}px system-ui`;
      const bw = (showLabels ? ctx.measureText(`${badge}  ${cap(d.class)}`).width : ctx.measureText(badge).width) + 14 * scale;
      const bh = 22 * scale;
      ctx.fillStyle = color;
      ctx.fillRect(d.x, Math.max(d.y - bh, 0), bw, bh);
      ctx.fillStyle = "#fff";
      ctx.fillText(showLabels ? `${badge}  ${cap(d.class)}` : badge, d.x + 6 * scale, Math.max(d.y - bh, 0) + 15 * scale);
    });
    ctx.globalAlpha = 1;
    annotatedCanvasRef.current = canvas;
    setProcessedImage(canvas.toDataURL());
  }, [result, showLabels, selectedId]);

  /* -------------------------------- exports -------------------------------- */
  const downloadAnnotated = async () => {
    if (!annotatedCanvasRef.current) return;
    const blob = await getCanvasBlob(annotatedCanvasRef.current);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "object-detection.png";
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadOriginal = () => {
    if (!image) return;
    const a = document.createElement("a");
    a.href = image.src;
    a.download = image.file?.name || "original-image.png";
    a.click();
  };
  const exportJSON = () => {
    if (!result) return;
    downloadBlob(new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }), "object-detection.json");
  };
  const exportCSV = () => {
    if (!result) return;
    const rows = [["#", "Object", "Confidence", "Width", "Height", "X", "Y"]];
    result.detections.forEach((d, i) =>
      rows.push([i + 1, d.class, `${d.score}%`, Math.round(d.width), Math.round(d.height), Math.round(d.x), Math.round(d.y)]),
    );
    downloadBlob(new Blob([rows.map((r) => r.join(",")).join("\n")], { type: "text/csv" }), "object-detection.csv");
  };
  const exportPDF = () => {
    if (!result) return;
    const w = window.open("", "_blank");
    if (!w) return;
    const rows = result.categories
      .map((c) => `<tr><td>${cap(c.name)}</td><td>${c.count}</td><td>${Math.round((c.count / result.total) * 100)}%</td><td>${c.avgConfidence}%</td></tr>`)
      .join("");
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Object Detection Report</title><style>
        body{font-family:ui-sans-serif,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#0f172a}
        h1{font-size:22px;margin:0 0 4px} .sub{color:#64748b;margin:0 0 20px;font-size:13px}
        img{width:100%;border:1px solid #e2e8f0;border-radius:10px;margin:12px 0}
        table{width:100%;border-collapse:collapse;font-size:13px} th,td{border:1px solid #e2e8f0;padding:8px;text-align:left} th{background:#f8fafc}
      </style></head><body>
      <h1>AI Object Counter — Report</h1>
      <p class="sub">${result.total} objects · ${result.categories.length} categories · ${result.avg}% avg confidence · ${dims.w}×${dims.h}</p>
      <img src="${processedImage}" alt="Detected objects" />
      <table><thead><tr><th>Object</th><th>Count</th><th>Share</th><th>Avg Confidence</th></tr></thead><tbody>${rows}</tbody></table>
      <scr`+`ipt>window.onload=function(){setTimeout(function(){window.print()},300)}</scr`+`ipt>
      </body></html>`,
    );
    w.document.close();
  };
  const shareLink = () => {
    navigator.clipboard?.writeText(typeof window !== "undefined" ? window.location.href : "");
    setCopied("share");
    setTimeout(() => setCopied(false), 1600);
  };
  const copyResults = () => {
    if (!result) return;
    navigator.clipboard?.writeText(JSON.stringify(result, null, 2));
    setCopied("results");
    setTimeout(() => setCopied(false), 1600);
  };
  const removeImage = () => {
    setImage(null);
    setRawResult(null);
    setProcessedImage(null);
    setThumbs({});
    resetDetection();
  };

  /* ------------------------------- derived UI ------------------------------ */
  const sortedDetections = useMemo(() => {
    if (!result) return [];
    let list = result.detections.map((d, i) => ({ ...d, num: i + 1 }));
    if (activeFilter !== "all") list = list.filter((d) => d.class === activeFilter);
    if (sortBy === "confidence") list = [...list].sort((a, b) => b.score - a.score);
    else if (sortBy === "size") list = [...list].sort((a, b) => b.width * b.height - a.width * a.height);
    return list;
  }, [result, sortBy, activeFilter]);

  const quality = result ? Math.min(100, Math.round(result.avg * 0.7 + (dims.w >= 1280 ? 20 : dims.w >= 640 ? 12 : 6) + (result.total > 0 ? 10 : 0))) : 0;
  const topShare = result && result.total ? Math.round((result.categories[0]?.count / result.total) * 100) : 0;
  const busy = modelLoadingState || detecting;

  const card = "rounded-2xl border border-(--border) bg-(--card)";
  const softBtn = "inline-flex items-center gap-1.5 rounded-lg border border-(--border) px-3 py-1.5 text-[12px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors";

  /* ------------------------------ empty state ------------------------------ */
  if (!image) {
    return (
      <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
        <div className="mx-auto max-w-2xl px-4 py-16 text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/20">
            <Sparkles className="w-6 h-6" />
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">AI Object Counter</h1>
          <p className="mt-2 text-[14px] text-(--muted-foreground)">
            Upload any image and let AI detect, count and analyze every object in seconds.
          </p>
          <div className="mt-8 text-left">
            <ImageUploader onImage={handleImage} />
          </div>
          <p className="mt-4 text-[12px] text-(--muted-foreground)">Supports PNG, JPG, JPEG, WEBP · Max 20MB · Runs 100% in your browser</p>
        </div>
      </div>
    );
  }

  /* ------------------------------- dashboard ------------------------------- */
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
      <div className="mx-auto max-w-[1400px] px-3 py-6 sm:px-5">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
          {/* ============ LEFT: settings ============ */}
          <aside className="space-y-4 xl:col-span-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h1 className="text-lg font-bold tracking-tight">AI Object Counter</h1>
              </div>
              <p className="mt-2 text-[13px] leading-relaxed text-(--muted-foreground)">
                Upload any image and let AI detect, count and analyze every object in seconds.
              </p>
            </div>

            <div className={card + " p-2"}>
              <ImageUploader onImage={handleImage} />
            </div>

            <div className={card + " p-4"}>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-(--muted-foreground)" />
                <h3 className="text-[14px] font-semibold">Detection Settings</h3>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-[12px] font-medium text-(--muted-foreground)">Model</label>
                  <div className="flex items-center justify-between rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13px] font-medium">
                    <span className="inline-flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-(--primary)" /> COCO-SSD</span>
                    <span className="text-[11px] text-(--muted-foreground)">High Accuracy</span>
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex items-center justify-between text-[12px]">
                    <span className="font-medium text-(--muted-foreground)">Confidence Threshold</span>
                    <span className="font-semibold text-(--foreground)">{minConfidence}%</span>
                  </div>
                  <input type="range" min="10" max="95" step="5" value={minConfidence} onChange={(e) => setMinConfidence(Number(e.target.value))} className="w-full accent-(--primary)" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium">Show labels</span>
                  <button
                    onClick={() => setShowLabels((v) => !v)}
                    role="switch"
                    aria-checked={showLabels}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${showLabels ? "bg-(--primary)" : "bg-(--border)"}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${showLabels ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                </div>
              </div>
            </div>

            {modelError && <ErrorCard message={modelError} onRetry={loadModel} />}
          </aside>

          {/* ============ CENTER: image + detected objects ============ */}
          <main className="space-y-4 xl:col-span-6">
            <div className={card + " p-4"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[15px] font-bold">Image Analysis</h2>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${busy ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                    {busy ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                    {busy ? "Analyzing" : "Completed"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className={softBtn + " cursor-pointer"}>
                    <RefreshCw className="w-3.5 h-3.5" /> Replace Image
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { const img = new Image(); const url = URL.createObjectURL(f); img.onload = () => handleImage({ src: url, file: f, img }); img.src = url; } }} />
                  </label>
                  <button onClick={removeImage} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-[12px] font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>

              {/* viewer */}
              <div className="relative mt-4 overflow-hidden rounded-xl border border-(--border) bg-(--muted)/30">
                <div className="absolute left-3 top-3 z-10 flex gap-2">
                  <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">{dims.w} × {dims.h}</span>
                  {image.file?.size && <span className="rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">{(image.file.size / 1048576).toFixed(1)}MB</span>}
                </div>
                <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-lg bg-black/60 px-1.5 py-1">
                  <button onClick={() => setZoom((z) => Math.max(50, z - 25))} className="grid h-6 w-6 place-items-center rounded text-white hover:bg-white/20"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-10 text-center text-[11px] font-medium text-white">{zoom}%</span>
                  <button onClick={() => setZoom((z) => Math.min(300, z + 25))} className="grid h-6 w-6 place-items-center rounded text-white hover:bg-white/20"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <div className="relative flex max-h-[440px] items-center justify-center overflow-auto p-2">
                  <img src={processedImage || image.src} alt="Detection result" style={{ width: `${zoom}%` }} className="h-auto max-w-none rounded-md object-contain transition-[width] duration-200" />
                  {busy && (
                    <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center">
                      <span className="inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1.5 text-[12px] font-medium text-white backdrop-blur">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                        {modelLoadingState ? "Loading AI model…" : "Detecting objects…"}
                      </span>
                    </div>
                  )}
                  {modelError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-(--card)/80 backdrop-blur-sm">
                      <p className="max-w-xs text-center text-[13px] text-(--muted-foreground)">{modelError}</p>
                      <button onClick={() => { loadModel(); runDetection(); }} className="inline-flex items-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2 text-[13px] font-semibold text-white hover:bg-(--primary)/90">
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                      </button>
                    </div>
                  )}
                </div>
                {/* zoom toolbar */}
                <div className="flex items-center gap-2 border-t border-(--border) bg-(--card) px-3 py-2">
                  <button onClick={() => setZoom(100)} className="grid h-7 w-7 place-items-center rounded-lg text-(--muted-foreground) hover:bg-(--muted)/60"><Maximize2 className="w-3.5 h-3.5" /></button>
                  <ZoomOut className="w-3.5 h-3.5 text-(--muted-foreground)" />
                  <input type="range" min="50" max="300" step="25" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-40 accent-(--primary)" />
                  <ZoomIn className="w-3.5 h-3.5 text-(--muted-foreground)" />
                  {selectedId !== null && (
                    <button onClick={() => setSelectedId(null)} className="ml-auto text-[11px] font-medium text-(--primary)">Clear highlight</button>
                  )}
                </div>
              </div>
            </div>

            {/* detected objects list */}
            <div className={card + " p-4"}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-[15px] font-bold">Detected Objects <span className="text-(--muted-foreground)">({result?.total || 0})</span></h2>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-(--muted-foreground)">Sort by</span>
                  <div className="relative">
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="appearance-none rounded-lg border border-(--border) bg-(--background) py-1.5 pl-2.5 pr-7 text-[12px] font-medium focus:outline-none">
                      <option value="confidence">Confidence</option>
                      <option value="size">Size</option>
                      <option value="order">Order</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-2 top-1/2 w-3.5 h-3.5 -translate-y-1/2 text-(--muted-foreground)" />
                  </div>
                </div>
              </div>

              {/* filter chips */}
              <div className="apo-scroll mt-3 flex items-center gap-1.5 overflow-x-auto pb-1">
                <button onClick={() => setActiveFilter("all")} className={`shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors ${activeFilter === "all" ? "bg-(--primary) text-white" : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)"}`}>
                  All ({result?.total || 0})
                </button>
                {(result?.categories || []).slice(0, 5).map((c) => {
                  const Icon = classIcon(c.name);
                  return (
                    <button key={c.name} onClick={() => setActiveFilter(c.name)} className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium capitalize transition-colors ${activeFilter === c.name ? "bg-(--primary) text-white" : "border border-(--border) text-(--muted-foreground) hover:text-(--foreground)"}`}>
                      <Icon className="w-3.5 h-3.5" /> {c.name}
                    </button>
                  );
                })}
              </div>

              <div className="apo-scroll mt-3 max-h-96 space-y-1.5 overflow-y-auto">
                {sortedDetections.length === 0 && (
                  <p className="py-8 text-center text-[13px] text-(--muted-foreground)">No objects at this confidence level.</p>
                )}
                {sortedDetections.map((d) => (
                  <div key={d.id} className={`flex items-center gap-3 rounded-xl border p-2 transition-colors ${selectedId === d.id ? "border-(--primary) bg-(--primary)/5" : "border-(--border) hover:bg-(--muted)/40"}`}>
                    <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-(--border) bg-(--muted)/50">
                      {thumbs[d.id] ? <img src={thumbs[d.id]} alt={d.class} className="h-full w-full object-cover" /> : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-(--muted-foreground)">#{d.num}</span>
                        <span className="truncate text-[13px] font-semibold capitalize">{d.class}</span>
                        <span className="inline-block h-2 w-2 rounded-full" style={{ background: getClassColor(d.class) }} />
                      </div>
                      <p className="mt-0.5 text-[11px] text-(--muted-foreground)">{Math.round(d.width)}×{Math.round(d.height)} · ({Math.round(d.x)}, {Math.round(d.y)})</p>
                    </div>
                    <span className="text-[14px] font-bold text-(--foreground)">{d.score}%</span>
                    <button onClick={() => setSelectedId(selectedId === d.id ? null : d.id)} aria-label="Highlight" className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${selectedId === d.id ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted-foreground) hover:bg-(--muted)/60"}`}>
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </main>

          {/* ============ RIGHT: stats + breakdown + insights + export ============ */}
          <aside className="space-y-4 xl:col-span-3">
            {/* stat tiles */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Objects", value: result?.total ?? "—", icon: Boxes, accent: "text-violet-500" },
                { label: "Categories", value: result?.categories.length ?? "—", icon: PieChart, accent: "text-blue-500" },
                { label: "Avg Confidence", value: result ? `${result.avg}%` : "—", icon: TrendingUp, accent: "text-emerald-500" },
                { label: "Processing", value: result ? `${(result.detectionTime / 1000).toFixed(2)}s` : "—", icon: Clock, accent: "text-amber-500" },
                { label: "Model", value: "COCO-SSD", icon: Cpu, accent: "text-indigo-500", small: true },
                { label: "Resolution", value: dims.w ? `${dims.w}×${dims.h}` : "—", icon: Monitor, accent: "text-sky-500", small: true },
              ].map((s) => (
                <div key={s.label} className={card + " p-3"}>
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-medium text-(--muted-foreground)">{s.label}</p>
                    <s.icon className={`w-3.5 h-3.5 ${s.accent}`} />
                  </div>
                  <p className={`mt-1.5 font-bold text-(--foreground) ${s.small ? "text-[13px]" : "text-xl"}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* object breakdown */}
            <div className={card + " p-4"}>
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-bold">Object Breakdown</h3>
                {result && result.categories.length > 6 && (
                  <button onClick={() => setShowAllBreakdown((v) => !v)} className="text-[12px] font-medium text-(--primary)">{showAllBreakdown ? "Show Less" : "View All"}</button>
                )}
              </div>
              <div className="mt-3 space-y-3">
                {(result?.categories || []).slice(0, showAllBreakdown ? 100 : 6).map((c) => {
                  const Icon = classIcon(c.name);
                  const color = getClassColor(c.name);
                  const pct = result.total ? Math.round((c.count / result.total) * 100) : 0;
                  return (
                    <div key={c.name}>
                      <div className="flex items-center gap-2 text-[12px]">
                        <Icon className="w-4 h-4 shrink-0" style={{ color }} />
                        <span className="flex-1 font-medium capitalize">{c.name}</span>
                        <span className="font-semibold">{c.count}</span>
                        <span className="w-10 text-right text-(--muted-foreground)">{pct}%</span>
                        <span className="w-12 text-right text-(--muted-foreground)">{c.avgConfidence}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-(--muted)/60">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
                      </div>
                    </div>
                  );
                })}
                {(!result || result.categories.length === 0) && <p className="text-[12px] text-(--muted-foreground)">No objects detected.</p>}
              </div>
            </div>

            {/* AI insights */}
            <div className={card + " p-4"}>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-(--primary)" />
                <h3 className="text-[14px] font-bold">AI Insights</h3>
              </div>
              {result && result.total > 0 ? (
                <>
                  <p className="mt-3 text-[13px] leading-relaxed text-(--muted-foreground)">
                    Detected <span className="font-semibold text-(--foreground)">{result.total}</span> objects across <span className="font-semibold text-(--foreground)">{result.categories.length}</span> categories. <span className="capitalize">{result.categories[0]?.name}</span> {result.categories[0]?.count === 1 ? "is" : "are"} the most common at <span className="font-semibold text-(--foreground)">{topShare}%</span>. Overall detection confidence is {result.avg >= 85 ? "excellent" : result.avg >= 70 ? "good" : "moderate"}.
                  </p>
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[12px]">
                      <span className="font-medium text-(--muted-foreground)">Quality Score</span>
                      <span className="font-bold text-(--foreground)">{quality}<span className="text-(--muted-foreground)">/100</span></span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-(--muted)/60">
                      <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-600" style={{ width: `${quality}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    {[
                      result.avg >= 85 ? "Excellent detection confidence" : "Reasonable detection confidence",
                      dims.w >= 1280 ? "High-resolution image" : "Standard-resolution image",
                      "Objects clearly visible",
                      result.total > 20 ? "Dense scene analyzed" : "Clean, uncluttered scene",
                    ].map((t) => (
                      <div key={t} className="flex items-center gap-2 text-[12px] text-(--muted-foreground)">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {t}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="mt-3 text-[13px] text-(--muted-foreground)">{busy ? "Analyzing image…" : "No objects detected at this confidence level."}</p>
              )}
            </div>

            {/* export */}
            <div className={card + " p-4"}>
              <h3 className="text-[14px] font-bold">Export Results</h3>
              <div className="mt-3 space-y-1.5">
                <ExportActionButton
                  disabled={!result}
                  icon={Download}
                  label="Download Annotated Image"
                  onClick={downloadAnnotated}
                />
                <ExportActionButton
                  disabled={!result}
                  icon={ImageIcon}
                  label="Download Original Image"
                  onClick={downloadOriginal}
                />
                <ExportActionButton
                  disabled={!result}
                  icon={FileText}
                  label="Export CSV"
                  onClick={exportCSV}
                />
                <ExportActionButton
                  disabled={!result}
                  icon={FileText}
                  label="Export JSON"
                  onClick={exportJSON}
                />
                <ExportActionButton
                  disabled={!result}
                  icon={FileText}
                  label="Export PDF Report"
                  onClick={exportPDF}
                />
                <ExportActionButton
                  disabled={!result}
                  icon={Share2}
                  label={copied === "share" ? "Link copied!" : "Share Link"}
                  onClick={shareLink}
                />
                <ExportActionButton
                  disabled={!result}
                  icon={copied === "results" ? Check : Copy}
                  label={copied === "results" ? "Copied!" : "Copy Results"}
                  onClick={copyResults}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      ` }} />
    </div>
  );
}
