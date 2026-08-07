"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Globe,
  HardDrive,
  Info,
  Layers,
  MemoryStick,
  Monitor,
  ShieldCheck,
  XCircle,
  Zap,
} from "lucide-react";

export default function BrowserCapabilitiesScanner({
  onApplyDetectedSpecs,
}) {
  const [capabilities, setCapabilities] = useState(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const nav = window.navigator;
    const hasWebGpu = Boolean(nav.gpu);
    let hasWebGl2 = false;
    try {
      const canvas = document.createElement("canvas");
      hasWebGl2 = Boolean(canvas.getContext("webgl2"));
    } catch {
      hasWebGl2 = false;
    }

    const hasWasm = typeof WebAssembly === "object";
    const hasSab = typeof SharedArrayBuffer !== "undefined";
    const hasIndexedDb = Boolean(window.indexedDB);
    const hasServiceWorker = "serviceWorker" in nav;

    const cores = nav.hardwareConcurrency || 4;
    const memory = nav.deviceMemory || 8; // GB estimate in Chrome/Edge

    let platformOs = "Desktop / Web Browser";
    const ua = nav.userAgent || "";
    if (/Mac/i.test(ua)) platformOs = "macOS (Apple Silicon / Intel)";
    else if (/Win/i.test(ua)) platformOs = "Windows PC";
    else if (/Linux/i.test(ua)) platformOs = "Linux PC";
    else if (/Android/i.test(ua)) platformOs = "Android Mobile";
    else if (/iPhone|iPad/i.test(ua)) platformOs = "iOS Device";

    // Auto-detect acceleration recommendation (Metal on Mac, DirectML on Windows,
    // generic WebGPU label for other WebGPU-capable platforms like Linux/ChromeOS)
    let autoAcceleration = "none";
    if (/Mac/i.test(ua)) autoAcceleration = "metal";
    else if (/Win/i.test(ua) && hasWebGpu) autoAcceleration = "directml";
    else if (hasWebGpu) autoAcceleration = "webgpu";

    setCapabilities({
      platformOs,
      cores,
      memory,
      hasWebGpu,
      hasWebGl2,
      hasWasm,
      hasSab,
      hasIndexedDb,
      hasServiceWorker,
      autoAcceleration,
    });
  }, []);

  if (!capabilities) return null;

  const capsList = [
    {
      name: "WebGPU Acceleration",
      description: "Direct GPU compute pipeline for WebLLM and in-browser models",
      supported: capabilities.hasWebGpu,
      tag: capabilities.hasWebGpu ? "Supported" : "Experimental / Off",
    },
    {
      name: "WebGL 2 Compute",
      description: "Graphics & shader fallback for 3D and matrix operations",
      supported: capabilities.hasWebGl2,
      tag: capabilities.hasWebGl2 ? "Supported" : "Unsupported",
    },
    {
      name: "WebAssembly (Wasm)",
      description: "Near-native binary execution engine for llama.cpp & Wasm runtimes",
      supported: capabilities.hasWasm,
      tag: "Supported",
    },
    {
      name: "Multi-Threaded Wasm (SAB)",
      description: "SharedArrayBuffer support for multi-core Wasm model inference",
      supported: capabilities.hasSab,
      tag: capabilities.hasSab ? "Supported" : "Requires COOP/COEP Headers",
    },
    {
      name: "IndexedDB Model Cache",
      description: "Large local key-value storage for caching GGUF model weights",
      supported: capabilities.hasIndexedDb,
      tag: capabilities.hasIndexedDb ? "Supported" : "Unsupported",
    },
  ];

  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3.5">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--primary-soft)] text-[var(--primary)]">
            <Globe className="size-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[var(--foreground)] sm:text-lg">
              Live Browser Capabilities &amp; Hardware Auto-Detect
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Real-time client-side feature detection from your active browser session
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            onApplyDetectedSpecs({
              ramGb: capabilities.memory,
              logicalCores: capabilities.cores,
              vramGb: capabilities.hasWebGpu ? 6 : 0,
              freeDiskGb: 30,
              acceleration: capabilities.autoAcceleration,
            })
          }
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-xs font-bold text-[var(--primary-foreground)] shadow-xs transition-all hover:bg-[var(--primary-hover)]"
        >
          <Zap className="size-4" />
          <span>Apply Auto-Detected Specs</span>
        </button>
      </div>

      {/* Detected OS & Hardware Quick Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5">
          <span className="block text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Platform OS</span>
          <span className="mt-1 block truncate text-xs font-extrabold text-[var(--foreground)]">{capabilities.platformOs}</span>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5">
          <span className="block text-[11px] font-bold uppercase text-[var(--muted-foreground)]">CPU Cores</span>
          <span className="mt-1 block text-sm font-extrabold text-[var(--foreground)]">{capabilities.cores} Logical Cores</span>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5">
          <span className="block text-[11px] font-bold uppercase text-[var(--muted-foreground)]">Est. RAM Memory</span>
          <span className="mt-1 block text-sm font-extrabold text-[var(--foreground)]">~{capabilities.memory} GB</span>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3.5">
          <span className="block text-[11px] font-bold uppercase text-[var(--muted-foreground)]">GPU Acceleration</span>
          <span className="mt-1 block text-sm font-extrabold text-[var(--primary)]">{capabilities.hasWebGpu ? "WebGPU Ready" : "WebGL 2"}</span>
        </div>
      </div>

      {/* Capability Checklist Grid */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {capsList.map((item) => (
          <div
            key={item.name}
            className={`flex items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
              item.supported
                ? "border-[var(--success)]/30 bg-[var(--success-soft)]/20"
                : "border-[var(--border)] bg-[var(--surface-soft)]"
            }`}
          >
            <div>
              <span className="block text-xs font-extrabold text-[var(--foreground)]">
                {item.name}
              </span>
              <span className="mt-0.5 block text-[11px] font-medium leading-relaxed text-[var(--muted-foreground)]">
                {item.description}
              </span>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-extrabold shrink-0 ${
                item.supported
                  ? "bg-[var(--success-soft)] text-[var(--success)]"
                  : "bg-[var(--warning-soft)] text-[var(--warning)]"
              }`}
            >
              {item.supported ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
              {item.tag}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
