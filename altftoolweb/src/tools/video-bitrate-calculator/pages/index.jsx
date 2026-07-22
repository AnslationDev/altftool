"use client";

import React, { useState } from "react";
import { Monitor, Calculator, Info, Copy, Check } from "lucide-react";

const RESOLUTIONS = [
  { label: "4K UHD", w: 3840, h: 2160 },
  { label: "1440p QHD", w: 2560, h: 1440 },
  { label: "1080p Full HD", w: 1920, h: 1080 },
  { label: "720p HD", w: 1280, h: 720 },
  { label: "480p SD", w: 854, h: 480 },
  { label: "360p", w: 640, h: 360 },
];

const FPS = [23.976, 24, 25, 29.97, 30, 50, 60];
const COLORS = [8, 10, 12];
const COMPRESSION = [
  { label: "Uncompressed", ratio: 1, desc: "Maximum quality, huge file size" },
  { label: "ProRes 4444", ratio: 5, desc: "High-quality intermediate" },
  { label: "ProRes 422", ratio: 8, desc: "Broadcast professional" },
  { label: "DNxHR HQ", ratio: 10, desc: "Post-production standard" },
  { label: "HEVC/H.265", ratio: 50, desc: "Efficient modern codec" },
  { label: "H.264", ratio: 35, desc: "Compatible standard" },
  { label: "VP9", ratio: 55, desc: "Web-optimized" },
  { label: "AV1", ratio: 70, desc: "Next-gen efficient" },
];

export default function ToolHome() {
  const [resolution, setResolution] = useState(RESOLUTIONS[2]);
  const [fps, setFps] = useState(30);
  const [bitDepth, setBitDepth] = useState(8);
  const [compression, setCompression] = useState(COMPRESSION[4]);
  const [duration, setDuration] = useState(60);
  const [copied, setCopied] = useState(false);

  const pixelsPerFrame = resolution.w * resolution.h;
  const bitsPerFrame = pixelsPerFrame * bitDepth;

  const rawBitrate = bitsPerFrame * fps;
  const rawMbps = rawBitrate / 1_000_000;

  const compressedBitrate = rawBitrate / compression.ratio;
  const compressedKbps = compressedBitrate / 1000;
  const compressedMbps = compressedBitrate / 1_000_000;

  const rawSizeMB = (rawBitrate * duration) / 8 / 1024 / 1024;
  const compressedSizeMB = (compressedBitrate * duration) / 8 / 1024 / 1024;

  const copyResult = () => {
    const text = [
      `Resolution: ${resolution.w}×${resolution.h}`,
      `FPS: ${fps}`,
      `Bit Depth: ${bitDepth}-bit`,
      `Codec: ${compression.label}`,
      `Duration: ${duration}s`,
      `---`,
      `Raw Bitrate: ${rawMbps.toFixed(2)} Mbps`,
      `Compressed Bitrate: ${compressedMbps.toFixed(2)} Mbps`,
      `Raw Size: ${rawSizeMB.toFixed(2)} MB`,
      `Compressed Size: ${compressedSizeMB.toFixed(2)} MB`,
    ].join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto space-y-6">

        {/* Header Card */}
        <section className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-sm group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-soft group-hover:bg-primary/10 transition-colors">
              <Monitor className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-foreground leading-none">Video Bitrate Calculator</h1>
                <span className="inline-flex rounded-md border border-border bg-background px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Video Tools</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Calculate video bitrates and file sizes for any resolution, codec, and duration.</p>
            </div>
          </div>
        </section>

        {/* Controls */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-5">

          {/* Resolution */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Resolution</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {RESOLUTIONS.map(r => (
                <button key={r.label} onClick={() => setResolution(r)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${resolution.w === r.w ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                  {r.label}
                  <span className="block text-[10px] font-normal text-muted mt-0.5">{r.w}×{r.h}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Frame Rate (FPS)</label>
              <select value={fps} onChange={e => setFps(parseFloat(e.target.value))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary">
                {FPS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Bit Depth</label>
              <div className="flex gap-2">
                {COLORS.map(b => (
                  <button key={b} onClick={() => setBitDepth(b)}
                    className={`flex-1 rounded-lg border py-2 text-xs font-bold transition-colors ${bitDepth === b ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                    {b}-bit
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Duration (seconds)</label>
              <input type="number" min={1} max={86400} value={duration}
                onChange={e => setDuration(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono font-bold text-foreground outline-none focus:border-primary" />
            </div>
          </div>

          {/* Codec */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">Compression / Codec</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {COMPRESSION.map(c => (
                <button key={c.label} onClick={() => setCompression(c)}
                  className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition-colors ${compression.label === c.label ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground hover:bg-surface-soft"}`}>
                  {c.label}
                  <span className="block text-[10px] font-normal text-muted mt-0.5">{c.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Calculation Results</span>
            </div>
            <button onClick={copyResult}
              className="rounded-lg border border-border px-3 py-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-soft transition-colors flex items-center gap-1.5">
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              ["Raw Bitrate", `${rawMbps.toFixed(2)} Mbps`],
              ["Compressed Bitrate", `${compressedMbps.toFixed(2)} Mbps`],
              ["Raw Size", `${rawSizeMB.toFixed(2)} MB`],
              ["Compressed Size", `${compressedSizeMB.toFixed(2)} MB`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-background p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{label}</div>
                <div className="text-lg font-bold font-mono text-primary">{value}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border text-[10px] text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3 w-3 shrink-0 mt-0.5" />
            <span>Compression ratio is estimated. Actual bitrate varies by content complexity, encoder settings, and motion level.</span>
          </div>
        </div>

      </div>
    </div>
  );
}
