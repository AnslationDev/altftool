"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Check,
  ClipboardPaste,
  Copy,
  Download,
  Eraser,
  File as FileIcon,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileJson,
  FileText,
  FileVideo,
  FileType,
  History,
  Layers,
  Link2,
  Lock,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
  Zap,
} from "lucide-react";

/* ---------------------------------------------------------------------------
   Decode + type detection
--------------------------------------------------------------------------- */

const SAMPLE =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

const TYPES = {
  png: { mime: "image/png", label: "PNG Image", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
  jpg: { mime: "image/jpeg", label: "JPEG Image", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
  gif: { mime: "image/gif", label: "GIF Image", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
  webp: { mime: "image/webp", label: "WebP Image", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
  bmp: { mime: "image/bmp", label: "BMP Image", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
  ico: { mime: "image/x-icon", label: "Icon", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
  svg: { mime: "image/svg+xml", label: "SVG Image", icon: FileCode, accent: "text-pink-500 bg-pink-500/10" },
  pdf: { mime: "application/pdf", label: "PDF Document", icon: FileText, accent: "text-red-500 bg-red-500/10" },
  zip: { mime: "application/zip", label: "ZIP Archive", icon: FileArchive, accent: "text-amber-500 bg-amber-500/10" },
  gz: { mime: "application/gzip", label: "GZip Archive", icon: FileArchive, accent: "text-amber-500 bg-amber-500/10" },
  mp3: { mime: "audio/mpeg", label: "MP3 Audio", icon: FileAudio, accent: "text-violet-500 bg-violet-500/10" },
  wav: { mime: "audio/wav", label: "WAV Audio", icon: FileAudio, accent: "text-violet-500 bg-violet-500/10" },
  ogg: { mime: "audio/ogg", label: "OGG Audio", icon: FileAudio, accent: "text-violet-500 bg-violet-500/10" },
  mp4: { mime: "video/mp4", label: "MP4 Video", icon: FileVideo, accent: "text-blue-500 bg-blue-500/10" },
  webm: { mime: "video/webm", label: "WebM Video", icon: FileVideo, accent: "text-blue-500 bg-blue-500/10" },
  json: { mime: "application/json", label: "JSON Data", icon: FileJson, accent: "text-amber-500 bg-amber-500/10" },
  xml: { mime: "application/xml", label: "XML Document", icon: FileCode, accent: "text-pink-500 bg-pink-500/10" },
  html: { mime: "text/html", label: "HTML Document", icon: FileCode, accent: "text-pink-500 bg-pink-500/10" },
  txt: { mime: "text/plain", label: "Text File", icon: FileText, accent: "text-sky-500 bg-sky-500/10" },
  bin: { mime: "application/octet-stream", label: "Binary File", icon: FileIcon, accent: "text-slate-500 bg-slate-500/10" },
};

const MANUAL_CHOICES = ["auto", "png", "jpg", "pdf", "zip", "mp3", "mp4", "json", "txt", "bin"];

const startsWith = (bytes, sig, offset = 0) => sig.every((b, i) => bytes[offset + i] === b);

function sniffType(bytes) {
  if (bytes.length >= 4) {
    if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) return "png";
    if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "jpg";
    if (startsWith(bytes, [0x47, 0x49, 0x46, 0x38])) return "gif";
    if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) return "pdf";
    if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) || startsWith(bytes, [0x50, 0x4b, 0x05, 0x06])) return "zip";
    if (startsWith(bytes, [0x1f, 0x8b])) return "gz";
    if (startsWith(bytes, [0x49, 0x44, 0x33]) || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) return "mp3";
    if (startsWith(bytes, [0x4f, 0x67, 0x67, 0x53])) return "ogg";
    if (startsWith(bytes, [0x42, 0x4d])) return "bmp";
    if (startsWith(bytes, [0x00, 0x00, 0x01, 0x00])) return "ico";
    if (startsWith(bytes, [0x1a, 0x45, 0xdf, 0xa3])) return "webm";
    if (bytes.length >= 12) {
      if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46])) {
        if (startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "webp";
        if (startsWith(bytes, [0x57, 0x41, 0x56, 0x45], 8)) return "wav";
      }
      if (startsWith(bytes, [0x66, 0x74, 0x79, 0x70], 4)) return "mp4";
    }
  }
  // text heuristics
  const slice = bytes.slice(0, 2048);
  let printable = 0;
  for (const b of slice) if (b === 9 || b === 10 || b === 13 || (b >= 32 && b < 127) || b >= 128) printable++;
  if (slice.length && printable / slice.length > 0.95) {
    try {
      const text = new TextDecoder("utf-8", { fatal: true }).decode(slice);
      const trimmed = text.trim();
      if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
        try { JSON.parse(new TextDecoder().decode(bytes)); return "json"; } catch { /* partial */ }
      }
      if (/^<svg[\s>]/i.test(trimmed) || (trimmed.startsWith("<?xml") && /<svg[\s>]/i.test(trimmed))) return "svg";
      if (trimmed.startsWith("<?xml")) return "xml";
      if (/^<!doctype html|^<html[\s>]/i.test(trimmed)) return "html";
      return "txt";
    } catch { /* not utf-8 */ }
  }
  return "bin";
}

function decodeBase64(raw) {
  if (!raw.trim()) return { empty: true };
  let input = raw.trim();
  let dataUrlMime = null;

  const dataUrlMatch = input.match(/^data:([^;,]+)?(;charset=[^;,]+)?(;base64)?,/i);
  if (dataUrlMatch) {
    dataUrlMime = dataUrlMatch[1] || null;
    input = input.slice(dataUrlMatch[0].length);
    if (!dataUrlMatch[3]) {
      // URL-encoded (not base64) data URL
      try {
        const text = decodeURIComponent(input);
        const bytes = new TextEncoder().encode(text);
        return { bytes, dataUrlMime };
      } catch {
        return { error: "This data URL is not base64-encoded and could not be decoded." };
      }
    }
  }

  // normalize: strip whitespace, convert URL-safe alphabet, fix padding
  input = input.replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (/[^A-Za-z0-9+/=]/.test(input)) {
    const bad = input.match(/[^A-Za-z0-9+/=]/)[0];
    return { error: `Invalid character "${bad}" found — this doesn't look like Base64.` };
  }
  const unpadded = input.replace(/=+$/, "");
  if (unpadded.length % 4 === 1) return { error: "Invalid Base64 length — the string appears truncated." };
  const padded = unpadded + "=".repeat((4 - (unpadded.length % 4)) % 4);

  try {
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return { bytes, dataUrlMime };
  } catch {
    return { error: "Could not decode — the Base64 string is malformed." };
  }
}

const prettyBytes = (n) =>
  n < 1024 ? `${n} B` : n < 1048576 ? `${(n / 1024).toFixed(1)} KB` : `${(n / 1048576).toFixed(2)} MB`;

const mimeToKey = (mime) => {
  if (!mime) return null;
  const found = Object.entries(TYPES).find(([, t]) => t.mime === mime.toLowerCase());
  if (found) return found[0];
  if (mime.startsWith("image/")) return "png";
  if (mime.startsWith("audio/")) return "mp3";
  if (mime.startsWith("video/")) return "mp4";
  if (mime.startsWith("text/")) return "txt";
  return "bin";
};

function toHexDump(bytes, max = 256) {
  const rows = [];
  const n = Math.min(bytes.length, max);
  for (let off = 0; off < n; off += 16) {
    const chunk = [...bytes.slice(off, off + 16)];
    const hex = chunk.map((b) => b.toString(16).padStart(2, "0")).join(" ");
    const ascii = chunk.map((b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : ".")).join("");
    rows.push(`${off.toString(16).padStart(6, "0")}  ${hex.padEnd(47)}  ${ascii}`);
  }
  return rows.join("\n");
}

/* ---------------------------------------------------------------------------
   Component
--------------------------------------------------------------------------- */

export default function ToolEntry() {
  const [raw, setRaw] = useState("");
  const [manualType, setManualType] = useState("auto");
  const [filename, setFilename] = useState("");
  const [copied, setCopied] = useState(false);
  const [historyList, setHistoryList] = useState([]);
  const [outTab, setOutTab] = useState("preview");
  const fileRef = useRef(null);

  /* ---- decode pipeline (pure, instant) ---- */
  const result = useMemo(() => {
    const decoded = decodeBase64(raw);
    if (decoded.empty || decoded.error) return decoded;
    const { bytes, dataUrlMime } = decoded;
    const detectedKey = manualType !== "auto" ? manualType : mimeToKey(dataUrlMime) || sniffType(bytes);
    const type = TYPES[detectedKey] || TYPES.bin;
    const autoKey = mimeToKey(dataUrlMime) || sniffType(bytes);
    return { bytes, key: detectedKey, autoKey, type, fromDataUrl: !!dataUrlMime };
  }, [raw, manualType]);

  const ok = result && result.bytes;
  const blobUrl = useMemo(() => {
    if (!ok) return null;
    return URL.createObjectURL(new Blob([result.bytes], { type: result.type.mime }));
  }, [ok, result]);

  // Revoke stale blob URLs (keep ones referenced by the history strip alive).
  const historyRef = useRef([]);
  useEffect(() => { historyRef.current = historyList; }, [historyList]);
  useEffect(() => {
    const url = blobUrl;
    return () => {
      if (url && !historyRef.current.some((h) => h.url === url)) URL.revokeObjectURL(url);
    };
  }, [blobUrl]);

  const outName = (filename.trim() || "converted-file") + "." + (ok ? result.key : "bin");
  const overhead = ok ? Math.max(0, ((raw.replace(/\s+/g, "").length - result.bytes.length) / Math.max(result.bytes.length, 1)) * 100) : 0;

  const textPreview = useMemo(() => {
    if (!ok) return "";
    if (!["txt", "json", "xml", "html", "svg"].includes(result.key)) return "";
    try {
      const text = new TextDecoder().decode(result.bytes.slice(0, 100_000));
      if (result.key === "json") {
        try { return JSON.stringify(JSON.parse(text), null, 2); } catch { return text; }
      }
      return text;
    } catch { return ""; }
  }, [ok, result]);

  /* ---- actions ---- */
  const download = () => {
    if (!blobUrl) return;
    const a = Object.assign(document.createElement("a"), { href: blobUrl, download: outName });
    a.click();
    setHistoryList((h) => [
      { id: Date.now(), name: outName, size: result.bytes.length, key: result.key, url: blobUrl },
      ...h.slice(0, 7),
    ]);
  };

  const copyDataUrl = async () => {
    if (!ok) return;
    // build data URL in chunks to avoid call-stack limits
    let binary = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < result.bytes.length; i += CHUNK) {
      binary += String.fromCharCode.apply(null, result.bytes.subarray(i, i + CHUNK));
    }
    await navigator.clipboard?.writeText(`data:${result.type.mime};base64,${btoa(binary)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const pasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setRaw(text);
    } catch { /* permission denied */ }
  };

  const loadTextFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => setRaw(String(reader.result || ""));
    reader.readAsText(file);
  };

  /* ---- UI helpers ---- */
  const card = "rounded-2xl border border-(--border) bg-(--card)";
  const softBtn =
    "inline-flex items-center gap-1.5 rounded-xl border border-(--border) px-3 py-2 text-[12px] font-medium text-(--foreground) hover:bg-(--muted)/60 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const TypeIcon = ok ? result.type.icon : FileIcon;
  const isImage = ok && ["png", "jpg", "gif", "webp", "bmp", "ico", "svg"].includes(result.key);
  const isAudio = ok && ["mp3", "wav", "ogg"].includes(result.key);
  const isVideo = ok && ["mp4", "webm"].includes(result.key);
  const isPdf = ok && result.key === "pdf";

  const STATS = [
    { label: "Input Length", value: raw ? `${raw.replace(/\s+/g, "").length.toLocaleString()}` : "—", sub: "base64 characters", icon: FileType, accent: "text-blue-500 bg-blue-500/10" },
    { label: "Decoded Size", value: ok ? prettyBytes(result.bytes.length) : "—", sub: "actual file size", icon: Layers, accent: "text-emerald-500 bg-emerald-500/10" },
    { label: "Detected Type", value: ok ? result.key.toUpperCase() : "—", sub: ok ? result.type.label : "waiting for input", icon: Wand2, accent: "text-violet-500 bg-violet-500/10" },
    { label: "Base64 Overhead", value: ok ? `+${overhead.toFixed(0)}%` : "—", sub: "vs binary size", icon: Zap, accent: "text-amber-500 bg-amber-500/10" },
  ];

  return (
    <div className="min-h-screen bg-(--background) px-3 py-6 text-(--foreground) antialiased sm:px-5 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-5">
        {/* ================= header ================= */}
        <header className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
              <Download className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Base64 to File</h1>
                <span className="inline-flex items-center gap-1 rounded-full border border-(--border) bg-(--card) px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> 100% local · nothing uploaded
                </span>
              </div>
              <p className="mt-0.5 text-[13px] text-(--muted-foreground)">
                Paste any Base64 string or data URL — get a real, downloadable file with automatic type detection.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/tools/all/file-to-base64" className={softBtn}>
              <Link2 className="h-3.5 w-3.5" /> File → Base64
            </Link>
            <Link href="/tools/all/base64-to-image" className={softBtn}>
              <FileImage className="h-3.5 w-3.5" /> Base64 → Image
            </Link>
          </div>
        </header>

        {/* ================= stat tiles ================= */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className={`${card} flex items-center gap-3 p-3.5`}>
              <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.accent}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-lg font-bold leading-none tabular-nums">{s.value}</p>
                <p className="mt-1 truncate text-[11px] text-(--muted-foreground)">{s.label} · {s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= main grid ================= */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* ---------- input ---------- */}
          <section className={`${card} flex flex-col overflow-hidden`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-(--border) px-4 py-3">
              <h2 className="text-[14px] font-bold">Base64 Input</h2>
              <div className="flex items-center gap-1.5">
                <button onClick={pasteClipboard} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-(--primary) hover:bg-(--primary)/10 transition-colors">
                  <ClipboardPaste className="h-3 w-3" /> Paste
                </button>
                <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-(--primary) hover:bg-(--primary)/10 transition-colors">
                  <Upload className="h-3 w-3" /> From .txt
                  <input ref={fileRef} type="file" accept=".txt,.b64,.base64,text/plain" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) loadTextFile(f); e.target.value = ""; }} />
                </label>
                <button onClick={() => setRaw(SAMPLE)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-(--primary) hover:bg-(--primary)/10 transition-colors">
                  <Sparkles className="h-3 w-3" /> Sample
                </button>
                <button onClick={() => { setRaw(""); setFilename(""); }} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12px] font-medium text-(--muted-foreground) hover:bg-(--muted)/60 hover:text-(--foreground) transition-colors">
                  <Eraser className="h-3 w-3" /> Clear
                </button>
              </div>
            </div>

            <textarea
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              spellCheck={false}
              placeholder={"Paste Base64 here…\n\nSupports:\n• Raw Base64 (with or without line breaks)\n• data:image/png;base64,… data URLs\n• URL-safe Base64 (-_ alphabet)"}
              className="apo-scroll h-64 w-full resize-y bg-transparent p-4 font-mono text-[12px] leading-relaxed text-(--foreground) outline-none placeholder:text-(--muted-foreground)"
            />

            {/* status strip */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-(--border) px-4 py-2.5 text-[11px]">
              {!raw.trim() && <span className="text-(--muted-foreground)">Waiting for input — conversion is instant.</span>}
              {raw.trim() && result.error && (
                <span className="inline-flex items-center gap-1.5 font-medium text-red-500">
                  <AlertTriangle className="h-3 w-3" /> {result.error}
                </span>
              )}
              {ok && (
                <>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <Check className="h-3 w-3" /> Valid Base64 {result.fromDataUrl && "(data URL)"}
                  </span>
                  <span className="text-(--muted-foreground)">{prettyBytes(result.bytes.length)} decoded</span>
                </>
              )}
            </div>

            {/* options */}
            <div className="grid grid-cols-1 gap-3 border-t border-(--border) p-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 flex items-center gap-1.5 text-[12px] font-medium text-(--muted-foreground)">
                  <Settings2 className="h-3 w-3" /> File type
                </label>
                <select
                  value={manualType}
                  onChange={(e) => setManualType(e.target.value)}
                  className="w-full rounded-xl border border-(--border) bg-(--background) px-3 py-2 text-[13px] font-medium text-(--foreground) outline-none focus:border-(--primary)"
                >
                  <option value="auto">Auto-detect {ok && result.autoKey ? `(${result.autoKey.toUpperCase()})` : ""}</option>
                  {MANUAL_CHOICES.filter((c) => c !== "auto").map((c) => (
                    <option key={c} value={c}>{c.toUpperCase()} — {TYPES[c].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-medium text-(--muted-foreground)">Filename (optional)</label>
                <div className="flex items-center gap-1.5">
                  <input
                    value={filename}
                    onChange={(e) => setFilename(e.target.value.replace(/[\\/:*?"<>|]/g, ""))}
                    placeholder="converted-file"
                    className="min-w-0 flex-1 rounded-xl border border-(--border) bg-(--background) px-3 py-2 font-mono text-[12px] text-(--foreground) outline-none focus:border-(--primary)"
                  />
                  <span className="shrink-0 rounded-lg bg-(--muted)/60 px-2 py-2 font-mono text-[12px] text-(--muted-foreground)">.{ok ? result.key : "…"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ---------- output ---------- */}
          <section className={`${card} flex flex-col overflow-hidden`}>
            <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
              <h2 className="text-[14px] font-bold">Your File</h2>
              {ok && (
                <div className="flex gap-1">
                  {["preview", "hex", ...(textPreview ? ["text"] : [])].map((t) => (
                    <button key={t} onClick={() => setOutTab(t)} className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors ${outTab === t ? "bg-(--primary)/10 text-(--primary)" : "text-(--muted-foreground) hover:text-(--foreground)"}`}>
                      {t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {!ok ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-(--muted)/60 text-(--muted-foreground)">
                  <FileIcon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold">No file yet</h3>
                <p className="mt-1 max-w-xs text-[13px] text-(--muted-foreground)">
                  Paste a Base64 string on the left — the file appears here instantly with a live preview.
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col p-4">
                {/* file card */}
                <div className="flex items-center gap-3 rounded-xl border border-(--border) bg-(--muted)/30 p-3">
                  <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${result.type.accent}`}>
                    <TypeIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-[13px] font-semibold">{outName}</p>
                    <p className="text-[11px] text-(--muted-foreground)">{result.type.label} · {result.type.mime} · {prettyBytes(result.bytes.length)}</p>
                  </div>
                  {manualType === "auto" && (
                    <span className="hidden shrink-0 items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-600 dark:text-violet-400 sm:inline-flex">
                      <Wand2 className="h-2.5 w-2.5" /> Auto-detected
                    </span>
                  )}
                </div>

                {/* preview area */}
                <div className="apo-scroll mt-3 flex max-h-72 min-h-40 flex-1 items-center justify-center overflow-auto rounded-xl border border-(--border) bg-(--muted)/20 p-3">
                  {outTab === "hex" ? (
                    <pre className="w-full self-start font-mono text-[10.5px] leading-relaxed text-(--muted-foreground)">{toHexDump(result.bytes)}{result.bytes.length > 256 ? `\n… ${prettyBytes(result.bytes.length - 256)} more` : ""}</pre>
                  ) : outTab === "text" && textPreview ? (
                    <pre className="w-full self-start whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-(--foreground)">{textPreview.slice(0, 8000)}{textPreview.length > 8000 ? "\n…" : ""}</pre>
                  ) : isImage ? (
                    <img src={blobUrl} alt="Decoded file preview" className="max-h-64 max-w-full rounded-lg object-contain" />
                  ) : isAudio ? (
                    <audio controls src={blobUrl} className="w-full" />
                  ) : isVideo ? (
                    <video controls src={blobUrl} className="max-h-64 max-w-full rounded-lg" />
                  ) : isPdf ? (
                    <iframe src={blobUrl} title="PDF preview" className="h-64 w-full rounded-lg border-0" />
                  ) : textPreview ? (
                    <pre className="w-full self-start whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-(--foreground)">{textPreview.slice(0, 8000)}</pre>
                  ) : (
                    <div className="text-center">
                      <Lock className="mx-auto h-6 w-6 text-(--muted-foreground)" />
                      <p className="mt-2 text-[12px] text-(--muted-foreground)">No visual preview for this type — check the Hex tab or download the file.</p>
                    </div>
                  )}
                </div>

                {/* actions */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <button onClick={download} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-(--primary) px-4 py-2.5 text-[13px] font-semibold text-white shadow-lg shadow-(--primary)/20 hover:bg-(--primary)/90 transition-colors">
                    <Download className="h-4 w-4" /> Download {outName}
                  </button>
                  <button onClick={copyDataUrl} className={softBtn + " justify-center"}>
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied!" : "Copy as Data URL"}
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ================= history ================= */}
        {historyList.length > 0 && (
          <section className={`${card} p-4`}>
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-(--muted-foreground)" />
              <h2 className="text-[14px] font-bold">Recent Downloads</h2>
              <span className="rounded-full bg-(--muted)/60 px-2 py-0.5 text-[11px] font-medium text-(--muted-foreground)">{historyList.length}</span>
              <button onClick={() => setHistoryList([])} className="ml-auto text-[11px] font-medium text-(--muted-foreground) hover:text-red-500 transition-colors">Clear</button>
            </div>
            <div className="apo-scroll mt-3 flex gap-2 overflow-x-auto pb-1">
              {historyList.map((h) => {
                const T = TYPES[h.key] || TYPES.bin;
                return (
                  <a key={h.id} href={h.url} download={h.name} className="flex shrink-0 items-center gap-2.5 rounded-xl border border-(--border) px-3 py-2 hover:border-(--primary)/40 hover:bg-(--muted)/40 transition-colors">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${T.accent}`}>
                      <T.icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block max-w-40 truncate font-mono text-[12px] font-semibold">{h.name}</span>
                      <span className="text-[10px] text-(--muted-foreground)">{prettyBytes(h.size)} · click to re-download</span>
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        )}

        {/* ================= features ================= */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Smart Type Detection", desc: "Magic-byte sniffing recognizes 20+ formats — PNG, PDF, MP3, ZIP, JSON and more.", icon: Wand2, accent: "text-violet-500 bg-violet-500/10" },
            { title: "Live Preview", desc: "See images, play audio & video, and read documents before downloading.", icon: FileImage, accent: "text-emerald-500 bg-emerald-500/10" },
            { title: "Data URL Support", desc: "Paste full data: URLs or URL-safe Base64 — prefixes and padding handled for you.", icon: Link2, accent: "text-blue-500 bg-blue-500/10" },
            { title: "Private by Design", desc: "Decoding happens entirely in your browser. Your data never leaves this page.", icon: ShieldCheck, accent: "text-amber-500 bg-amber-500/10" },
          ].map((f) => (
            <div key={f.title} className={`${card} p-4`}>
              <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${f.accent}`}>
                <f.icon className="h-4 w-4" />
              </span>
              <p className="mt-2.5 text-[13px] font-semibold">{f.title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-(--muted-foreground)">{f.desc}</p>
            </div>
          ))}
        </section>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .apo-scroll::-webkit-scrollbar { height: 6px; width: 6px }
        .apo-scroll::-webkit-scrollbar-thumb { background: color-mix(in oklab, currentColor 18%, transparent); border-radius: 9999px }
      ` }} />
    </div>
  );
}
