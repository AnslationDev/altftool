"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Clipboard,
  Download,
  Eye,
  FileJson,
  History,
  Pipette,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import Header from "../components/Header";
import Panel from "../components/Panel";
import IconButton from "../components/IconButton";
import EmptyState from "../components/EmptyState";
import Features from "../components/Features";
import {
  HISTORY_LIMIT,
  STORAGE_KEY,
  convertColor,
  downloadText,
  safeReadState,
} from "../utils/colorUtils";

const OUTPUT_FORMATS = ["HEX", "RGBA_HEX", "RGB", "RGBA", "HSL", "HSLA", "CMYK"];

export default function ToolHome() {
  const savedState = useMemo(() => safeReadState(), []);
  const [input, setInput] = useState(savedState.input || "#22D3EE");
  const [history, setHistory] = useState(Array.isArray(savedState.history) ? savedState.history : []);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [samplePoint, setSamplePoint] = useState(null);
  const canvasRef = useRef(null);

  const result = useMemo(() => convertColor(input), [input]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ input, history }));
  }, [input, history]);

  useEffect(() => {
    if (!result.ok) return;
    const timer = window.setTimeout(() => {
      const item = {
        id: `${result.values.HEX}-${Date.now()}`,
        createdAt: new Date().toISOString(),
        format: result.format,
        value: result.values.HEX,
        rgba: result.values.RGBA,
      };
      setHistory((current) =>
        [item, ...current.filter((entry) => entry.value !== item.value)].slice(0, HISTORY_LIMIT)
      );
    }, 350);
    return () => window.clearTimeout(timer);
  }, [result.ok, result.values?.HEX, result.values?.RGBA, result.format]);

  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 1700);
  };

  const copyValue = async (label, value) => {
    if (!value) return flash("Nothing to copy yet.");
    await navigator.clipboard.writeText(value);
    setCopied(label);
    flash(`${label} copied.`);
    window.setTimeout(() => setCopied(""), 1100);
  };

  const copyAll = async () => {
    if (!result.ok) return flash("Enter a valid color first.");
    await navigator.clipboard.writeText(
      OUTPUT_FORMATS.map((key) => `${key}: ${result.values[key]}`).join("\n")
    );
    flash("All formats copied.");
  };

  const exportJson = () => {
    if (!result.ok) return flash("Enter a valid color first.");
    downloadText(
      "color-conversion.json",
      JSON.stringify(
        {
          detectedFormat: result.format,
          rgba: result.rgba,
          hsl: result.hsl,
          cmyk: result.cmyk,
          values: result.values,
        },
        null,
        2
      )
    );
    flash("Color data exported.");
  };

  const resetAll = () => {
    setInput("");
    flash("Workspace cleared.");
  };

  const loadImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      flash("Please upload an image or screenshot.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(String(reader.result || ""));
      setSamplePoint(null);
      flash("Image ready. Click anywhere on it to sample color.");
    };
    reader.readAsDataURL(file);
  };

  const prepareImageCanvas = (event) => {
    const img = event.currentTarget;
    const canvas = canvasRef.current;
    if (!canvas || !img.naturalWidth || !img.naturalHeight) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0);
  };

  const sampleImageColor = (event) => {
    const img = event.currentTarget;
    const canvas = canvasRef.current;
    if (!canvas || !img.naturalWidth || !img.naturalHeight) {
      flash("Image is still loading. Please try again.");
      return;
    }

    if (!canvas.width || !canvas.height) {
      prepareImageCanvas(event);
    }

    const rect = img.getBoundingClientRect();
    const naturalX = Math.min(
      img.naturalWidth - 1,
      Math.max(0, Math.floor(((event.clientX - rect.left) / rect.width) * img.naturalWidth))
    );
    const naturalY = Math.min(
      img.naturalHeight - 1,
      Math.max(0, Math.floor(((event.clientY - rect.top) / rect.height) * img.naturalHeight))
    );
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return flash("Color sampling is not available in this browser.");
    const [r, g, b, a] = context.getImageData(naturalX, naturalY, 1, 1).data;
    const alpha = Number((a / 255).toFixed(3));
    const sampled = alpha < 1 ? `rgba(${r}, ${g}, ${b}, ${alpha})` : `rgb(${r}, ${g}, ${b})`;
    setInput(sampled);
    setSamplePoint({
      x: ((event.clientX - rect.left) / rect.width) * 100,
      y: ((event.clientY - rect.top) / rect.height) * 100,
    });
    flash("Screenshot color sampled.");
  };

  const previewTextColor = result.ok && result.hsl?.l > 58 ? "#111827" : "#ffffff";

  return (
    <main className="min-h-screen max-w-full overflow-hidden rounded-[2rem] bg-[var(--background)] text-[var(--foreground)]">
      <div className="relative isolate px-3 py-4 sm:px-5 lg:px-6">
        <div className="absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_82%_12%,rgba(236,72,153,0.16),transparent_30%),radial-gradient(circle_at_55%_0%,rgba(250,204,21,0.12),transparent_24%)]" />

        <section className="mx-auto max-w-7xl space-y-4">
          <Header result={result} historyCount={history.length} />

          {notice && (
            <div className="fixed right-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-emerald-400/40 bg-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-xl">
              <span className="break-words [overflow-wrap:anywhere]">{notice}</span>
            </div>
          )}

          <section className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,430px)]">
            <div className="min-w-0 space-y-4">
              <div className="grid min-w-0 gap-4 2xl:grid-cols-2">
                <Panel title="Color Input Panel" icon={Wand2}>
                  <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder="#FF5733, rgb(255,87,51), hsl(9,100%,60%), cmyk(0%, 66%, 80%, 0%)"
                      className="min-h-12 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-semibold outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/30 [overflow-wrap:anywhere]"
                    />
                    <label className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-bold transition hover:border-[var(--primary)]">
                      <Pipette className="h-4 w-4 text-cyan-500" />
                      <span className="sr-only">Pick color</span>
                      <input
                        type="color"
                        value={result.ok ? result.picker : "#22D3EE"}
                        onChange={(event) => setInput(event.target.value)}
                        className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                        title="Pick color"
                      />
                    </label>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <p className={`min-w-0 break-words text-xs ${result.ok ? "text-emerald-500" : "text-red-500"} [overflow-wrap:anywhere]`}>
                      {result.ok ? `Detected ${result.format}. Outputs are live and copy-ready.` : result.error}
                    </p>
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <IconButton icon={RotateCcw} label="Clear" onClick={resetAll} disabled={!input} />
                      <IconButton icon={Clipboard} label="Copy all" onClick={copyAll} disabled={!result.ok} />
                      <IconButton icon={FileJson} label="JSON" onClick={exportJson} disabled={!result.ok} />
                    </div>
                  </div>
                </Panel>

                <Panel title="Screenshot Color Picker" icon={Pipette}>
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--background)]/70 p-3">
                    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg text-center text-sm font-semibold text-[var(--muted-foreground)] transition hover:bg-[var(--card)]">
                      <Pipette className="h-5 w-5 text-cyan-500" />
                      <span className="break-words [overflow-wrap:anywhere]">
                        Upload a screenshot, then click any pixel to detect its color code.
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) => loadImageFile(event.target.files?.[0])}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  {imagePreview && (
                    <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-2">
                      <div className="relative max-h-72 min-w-0 overflow-auto rounded-lg">
                        <img
                          src={imagePreview}
                          alt="Uploaded screenshot for color sampling"
                          onLoad={prepareImageCanvas}
                          onClick={sampleImageColor}
                          className="block max-h-72 w-full cursor-crosshair object-contain"
                        />
                        <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
                        {samplePoint && (
                          <span
                            className="pointer-events-none absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.65)]"
                            style={{ left: `${samplePoint.x}%`, top: `${samplePoint.y}%` }}
                          />
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <IconButton
                          icon={RotateCcw}
                          label="Remove image"
                          onClick={() => {
                            setImagePreview("");
                            setSamplePoint(null);
                          }}
                        />
                      </div>
                    </div>
                  )}
                </Panel>

                <Panel title="Auto Detection Status" icon={Sparkles}>
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/80 p-3">
                    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
                      <div className="min-w-[12rem] flex-1">
                        <p className="text-xs uppercase text-[var(--muted-foreground)]">Format</p>
                        <h2 className="mt-1 break-words text-2xl font-black leading-tight [overflow-wrap:anywhere]">
                          {result.format}
                        </h2>
                      </div>
                      <div className={`shrink-0 rounded-full border p-3 ${result.ok ? "border-emerald-400/30 bg-emerald-500/10" : "border-red-400/30 bg-red-500/10"}`}>
                        <Check className={`h-5 w-5 ${result.ok ? "text-emerald-500" : "text-red-500"}`} />
                      </div>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--muted)]">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${result.ok ? "bg-emerald-500" : "bg-red-500"}`}
                        style={{ width: result.ok ? "100%" : input.trim() ? "35%" : "8%" }}
                      />
                    </div>
                  </div>
                </Panel>

                <div className="2xl:col-span-2">
                  <Panel title="Multi-Format Output Panel" icon={Clipboard}>
                    <div className="grid min-w-0 gap-3 lg:grid-cols-2">
                      {OUTPUT_FORMATS.map((key) => (
                        <div key={key} className="min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3">
                          <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
                            <span className="min-w-0 truncate text-[11px] font-black uppercase text-[var(--muted-foreground)]">{key}</span>
                            <button
                              onClick={() => copyValue(key, result.values[key])}
                              disabled={!result.ok}
                              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] transition hover:border-[var(--primary)] disabled:opacity-40"
                              title={`Copy ${key}`}
                            >
                              {copied === key ? <Check className="h-4 w-4 text-emerald-500" /> : <Clipboard className="h-4 w-4" />}
                            </button>
                          </div>
                          <input
                            value={result.ok ? result.values[key] : ""}
                            onChange={(event) => setInput(event.target.value)}
                            placeholder={key}
                            className="w-full min-w-0 rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-sm font-semibold outline-none transition focus:border-[var(--primary)] [overflow-wrap:anywhere]"
                          />
                        </div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>
            </div>

            <aside className="min-w-0 space-y-4">
              <Panel title="Live Color Preview" icon={Eye}>
                <div
                  className="min-h-60 overflow-hidden rounded-2xl border border-[var(--border)] p-4 shadow-inner transition-colors duration-300"
                  style={{ background: result.ok ? result.preview : "var(--background)", color: previewTextColor }}
                >
                  {result.ok ? (
                    <div className="flex h-full min-w-0 flex-col justify-between gap-10">
                      <div className="inline-flex w-fit max-w-full rounded-full border border-white/30 bg-black/20 px-3 py-1 text-xs font-bold backdrop-blur">
                        <span className="break-words [overflow-wrap:anywhere]">{result.values.HEX}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs uppercase opacity-80">Preview</p>
                        <p className="mt-1 break-words text-3xl font-black leading-tight [overflow-wrap:anywhere]">
                          {result.values.RGBA}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <EmptyState text="Valid colors render here instantly." />
                  )}
                </div>
              </Panel>

              <Panel title="History" icon={History}>
                <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                  {history.length ? (
                    history.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setInput(item.value)}
                        className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]/70 p-3 text-left transition hover:border-[var(--primary)]"
                      >
                        <span className="h-10 w-10 shrink-0 rounded-xl border border-[var(--border)]" style={{ background: item.rgba }} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[11px] font-bold uppercase text-[var(--muted-foreground)]">{item.format}</span>
                          <span className="block break-words text-sm font-black [overflow-wrap:anywhere]">{item.value}</span>
                        </span>
                      </button>
                    ))
                  ) : (
                    <EmptyState text="Recent valid colors will appear here." />
                  )}
                </div>
                {history.length > 0 && (
                  <button
                    onClick={() => {
                      setHistory([]);
                      flash("History cleared.");
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-400/30 px-3 py-2 text-sm font-semibold text-red-500 transition hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear history
                  </button>
                )}
              </Panel>

              <Panel title="Save Palette Entry" icon={Save} compact>
                <div className="flex min-w-0 flex-wrap gap-2">
                  <IconButton icon={Clipboard} label="Copy all" onClick={copyAll} disabled={!result.ok} />
                  <IconButton icon={Download} label="Export JSON" onClick={exportJson} disabled={!result.ok} />
                </div>
              </Panel>
            </aside>
          </section>

          <Features />
        </section>
      </div>
    </main>
  );
}
