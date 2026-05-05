"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import Features from "./Features";

// ─── Load pdf-lib via <script> tag (Turbopack-safe) ───

function loadPdfLib() {
  return new Promise((resolve, reject) => {
    if (window.PDFLib) return resolve(window.PDFLib);
    const existing = document.getElementById("pdf-lib-script");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.PDFLib));
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "pdf-lib-script";
    script.src = "https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js";
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Failed to load pdf-lib"));
    document.head.appendChild(script);
  });
}

// ─── PDF Processing ─────
async function applyWatermarkToPdf(file, options) {
  const PDFLib = await loadPdfLib();
  const { PDFDocument, rgb, degrees } = PDFLib;

  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPages();

  const { text, fontSize, opacity, color, rotation, position, repeat } = options;

  const r = parseInt(color.slice(1, 3), 16) / 255;
  const g = parseInt(color.slice(3, 5), 16) / 255;
  const b = parseInt(color.slice(5, 7), 16) / 255;
  const colorRgb = rgb(r, g, b);

  for (const page of pages) {
    const { width, height } = page.getSize();

    const draw = (x, y) =>
      page.drawText(text, { x, y, size: fontSize, color: colorRgb, opacity, rotate: degrees(rotation) });

    if (repeat) {
      const stepX = Math.max(width / 3, 150);
      const stepY = Math.max(height / 4, 100);
      for (let x = 0; x < width; x += stepX)
        for (let y = 0; y < height; y += stepY)
          draw(x, y);
    } else {
      const pos = {
        center:         { x: width / 2 - (text.length * fontSize) / 4, y: height / 2 },
        "top-left":     { x: 40, y: height - 60 },
        "top-right":    { x: width - text.length * fontSize * 0.6 - 40, y: height - 60 },
        "bottom-left":  { x: 40, y: 40 },
        "bottom-right": { x: width - text.length * fontSize * 0.6 - 40, y: 40 },
        diagonal:       { x: width / 4, y: height / 3 },
      }[position] || { x: width / 2, y: height / 2 };
      draw(pos.x, pos.y);
    }
  }

  return await pdfDoc.save();
}

// ─── Slider ───

function Slider({ label, min, max, step = 1, value, onChange, unit = "" }) {
  return (
    <div className="mb-5">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
          {label}
        </span>
        <span className="text-xs font-bold tabular-nums" style={{ color: "var(--primary)", fontFamily: "var(--font-secondary)" }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{ accentColor: "var(--primary)", height: 4 }}
      />
    </div>
  );
}

// ─── Select ──────

function Select({ label, value, options, onChange }) {
  return (
    <div className="mb-5">
      <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer appearance-none transition-all"
        style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-secondary)" }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: "var(--card)", color: "var(--card-foreground)" }}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Toggle ──

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <button
        type="button" onClick={() => onChange(!checked)}
        className="relative rounded-full focus:outline-none shrink-0"
        style={{ width: 44, height: 24, background: checked ? "var(--primary)" : "var(--border)", transition: "background 0.25s", border: "none", cursor: "pointer" }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white shadow"
          style={{ width: 20, height: 20, left: checked ? 22 : 2, transition: "left 0.25s" }}
        />
      </button>
    </div>
  );
}

// ─── Settings Panel (shared desktop + mobile drawer) 

function SettingsPanel({ text, setText, fontSize, setFontSize, opacity, setOpacity, rotation, setRotation, color, setColor, position, setPosition, repeat, setRepeat }) {
  const presets = ["#2563eb", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#111827"];
  return (
    <div>
      {/* Text */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
          Watermark Text
        </label>
        <input
          type="text" value={text} maxLength={60}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. CONFIDENTIAL"
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--background)", border: "1.5px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-secondary)" }}
        />
      </div>

      <Slider label="Font Size" min={12} max={120} value={fontSize} onChange={setFontSize} unit="px" />
      <Slider label="Opacity"   min={0.05} max={1} step={0.05} value={opacity} onChange={setOpacity} />
      <Slider label="Rotation"  min={-180} max={180} value={rotation} onChange={setRotation} unit="°" />

      {/* Color */}
      <div className="mb-5">
        <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "var(--muted-foreground)" }}>
          Color
        </label>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="color" value={color}
            onChange={(e) => setColor(e.target.value)}
            className="cursor-pointer rounded-lg"
            style={{ width: 38, height: 38, padding: 2, background: "var(--muted)", border: "1.5px solid var(--border)" }}
          />
          {presets.map((c) => (
            <button
              key={c} onClick={() => setColor(c)}
              className="rounded-lg transition-all"
              style={{ width: 28, height: 28, background: c, cursor: "pointer", border: color === c ? "2.5px solid var(--foreground)" : "2px solid transparent", outline: "none" }}
            />
          ))}
        </div>
      </div>

      <Select 
        label="Position" value={position} onChange={setPosition}
        options={[
          { value: "diagonal",      label: "Diagonal" },
          { value: "center",        label: "Center" },
          { value: "top-left",      label: "Top Left" },
          { value: "top-right",     label: "Top Right" },
          { value: "bottom-left",   label: "Bottom Left" },
          { value: "bottom-right",  label: "Bottom Right" },
        ]}
      />

      <Toggle label="Repeat / Tile" checked={repeat} onChange={setRepeat} />

      <div className="rounded-xl px-4 py-3 text-xs leading-relaxed" style={{ background: "var(--background)", color: "var(--muted-foreground)" }}>
        💡 <strong style={{ color: "var(--foreground)" }}>Tip:</strong> Tiled watermarks at 20–30% opacity give the best balance of visibility and readability.
      </div>
    </div>
  );
}

// ─── Main ────

export default function Main() {
  const [file, setFile]               = useState(null);
  const [dragging, setDragging]       = useState(false);
  const [processing, setProcessing]   = useState(false);
  const [error, setError]             = useState("");
  const [done, setDone]               = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [text, setText]         = useState("CONFIDENTIAL");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity]   = useState(0.25);
  const [color, setColor]       = useState("#2563eb");
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState("diagonal");
  const [repeat, setRepeat]     = useState(true);

  const fileInputRef = useRef();

  // Preload pdf-lib on mount so first click is instant
  useEffect(() => { loadPdfLib().catch(() => {}); }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = settingsOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [settingsOpen]);

  const handleFile = useCallback((f) => {
    setError(""); setDone(false);
    if (!f || f.type !== "application/pdf") { setError("Please upload a valid PDF file."); return; }
    if (f.size > 50 * 1024 * 1024) { setError("File size must be under 50MB."); return; }
    setFile(f);
  }, []);

  const onDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const handleApply = async () => {
    if (!file || !text.trim()) return;
    setProcessing(true); setError(""); setDone(false);
    try {
      const bytes = await applyWatermarkToPdf(file, { text: text.trim(), fontSize, opacity, color, rotation, position, repeat });
      const blob  = new Blob([bytes], { type: "application/pdf" });
      const url   = URL.createObjectURL(blob);
      const a     = document.createElement("a");
      a.href = url; a.download = `${file.name.replace(/\.pdf$/i, "")}_watermarked.pdf`;
      a.click(); URL.revokeObjectURL(url);
      setDone(true);
    } catch (err) {
      console.error(err);
      setError("Failed to process PDF. The file may be encrypted or corrupted.");
    } finally {
      setProcessing(false);
    }
  };

  const canApply = !!file && !!text.trim() && !processing;
  const sp = { text, setText, fontSize, setFontSize, opacity, setOpacity, rotation, setRotation, color, setColor, position, setPosition, repeat, setRepeat };

  return (
    <>
      <style>{`
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        .pdf-drop { transition: border-color 0.2s, background 0.2s; }
        .pdf-drop:hover { border-color: var(--primary) !important; background: var(--muted) !important; }
        .pdf-btn  { transition: opacity 0.15s, transform 0.15s; }
        .pdf-btn:hover:not(:disabled) { opacity:0.86; transform:translateY(-1px); }
        .pdf-btn:active:not(:disabled){ transform:translateY(0); }
      `}</style>

      <div className=" py-10 px-4 sm:px-6" style={{ background: "var(--background)", animation: "fadeUp 0.5s ease" }}>

        {/* ── Header ── */}
        <div className="text-center mb-10 section-container">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--muted-foreground)" }}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--primary)", display: "inline-block" }} />
            PDF Watermark Tool
          </div>
          <h1 className="heading mb-3">
            Protect Your <span className="text-gradient-hero">Documents</span>
          </h1>
          <p className="description mx-auto" style={{ maxWidth: 440 }}>
            Add professional watermarks to any PDF — instantly, privately, 100% in your browser.
          </p>
        </div>

        {/* ── Body grid: 1 col mobile → 2 col desktop ── */}
        <div
          className="section-container"
          style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 24, alignItems: "start" }}
        >
          {/* Override to 2-col on large screens via inline media trick */}
          <style>{`@media(min-width:1024px){ .pdf-grid{ grid-template-columns: 1fr 340px !important; } }`}</style>
          <div className="pdf-grid section-container" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 44, alignItems: "start", padding: 0, maxWidth: "100%" }}>

            {/* ── Left ── */}
            <div>
              {/* Drop zone */}
              <div
                className="pdf-drop rounded-2xl text-center cursor-pointer mb-4"
                style={{
                  border: `2px dashed ${dragging ? "var(--primary)" : file ? "#10b981" : "var(--border)"}`,
                  background: dragging ? "var(--muted)" : "transparent",
                  padding: "clamp(24px,6vw,52px) 20px",
                }}
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
              >
                <input ref={fileInputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                <div className="text-4xl mb-3">{file ? "✅" : "📄"}</div>
                {file ? (
                  <>
                    <p className="font-semibold text-sm sm:text-base mb-1 break-all" style={{ color: "#10b981" }}>{file.name}</p>
                    <p className="text-xs sm:text-sm" style={{ color: "var(--muted-foreground)" }}>{(file.size / 1024).toFixed(1)} KB · Tap to replace</p>
                  </>
                ) : (
                  <>
                    <p className="subheading mb-1">Drop your PDF here</p>
                    <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>or tap to browse · Max 50MB</p>
                  </>
                )}
              </div>

              {/* Live preview */}
              {file && (
                <div
                  className="rounded-2xl p-4 sm:p-5 mb-4"
                  style={{ background: "var(--card)", border: "1px solid var(--border)", animation: "fadeUp 0.35s ease" }}
                >
                  <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--muted-foreground)" }}>
                    Live Preview
                  </p>
                  <div className="rounded-xl relative overflow-hidden flex items-center justify-center" style={{ background: "#ffffff", height: 180 }}>
                    {[35, 68, 101, 134, 163].map((top) => (
                      <div key={top} style={{ position: "absolute", left: "10%", right: "10%", top, height: 1, background: "#e5e7eb" }} />
                    ))}
                    <span style={{
                      position: "absolute",
                      fontSize: Math.max(fontSize * 0.4, 12),
                      fontWeight: 800, color, opacity,
                      transform: `rotate(-${rotation}deg)`,
                      whiteSpace: "nowrap", userSelect: "none",
                      fontFamily: "var(--font-primary)", letterSpacing: "0.04em",
                    }}>
                      {text || "WATERMARK"}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile-only: open settings drawer */}
              <button
                className="pdf-btn w-full py-3 rounded-2xl font-semibold text-sm mb-3 flex items-center justify-center gap-2 lg:hidden"
                onClick={() => setSettingsOpen(true)}
                style={{ background: "var(--muted)", border: "1.5px solid var(--border)", color: "var(--foreground)", fontFamily: "var(--font-secondary)", cursor: "pointer" }}
              >
                ⚙️ Watermark Settings
                <span style={{ color: "var(--muted-foreground)", fontSize: 11, fontWeight: 400 }}>
                  · {text.slice(0, 10)}{text.length > 10 ? "…" : ""}, {Math.round(opacity * 100)}% opacity
                </span>
              </button>

              {/* Alerts */}
              {error && (
                <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626" }}>
                  ⚠️ {error}
                </div>
              )}
              {done && (
                <div className="rounded-xl px-4 py-3 text-sm mb-4" style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#16a34a" }}>
                  ✅ Watermarked PDF downloaded successfully!
                </div>
              )}

              {/* CTA */}
              <button
                className="pdf-btn w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3"
                onClick={handleApply}
                disabled={!canApply}
                style={{
                  background: "var(--primary)", color: "var(--primary-foreground)",
                  fontFamily: "var(--font-primary)", opacity: canApply ? 1 : 0.4,
                  cursor: canApply ? "pointer" : "not-allowed", border: "none", letterSpacing: "0.02em",
                }}
              >
                {processing ? (
                  <>
                    <span style={{ display: "inline-block", width: 18, height: 18, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.75s linear infinite" }} />
                    Processing…
                  </>
                ) : "⬇ Apply Watermark & Download"}
              </button>

              <p className="text-center text-xs mt-3" style={{ color: "var(--muted-foreground)" }}>
                🔒 100% client-side — your PDF never leaves your device
              </p>
            </div>

            {/* ── Right: Settings panel (desktop only) ── */}
            <div
              className="rounded-2xl p-6 hidden lg:block"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: "var(--muted-foreground)" }}>
                Watermark Settings
              </p>
              <SettingsPanel {...sp} />
            </div>
          </div>
        </div>
         <Features/>
      </div>

      {/* ── Mobile Drawer ── */}
      {settingsOpen && (
        <>
          {/* Overlay */}
          <div
            className="lg:hidden"
            onClick={() => setSettingsOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40, backdropFilter: "blur(3px)" }}
          />
          {/* Drawer */}
          <div
            className="lg:hidden"
            style={{
              position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 50,
              borderRadius: "20px 20px 0 0",
              maxHeight: "88vh", overflowY: "auto",
              background: "var(--card)",
              animation: "slideUp 0.3s ease",
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--border)" }} />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
              <p className="font-semibold text-sm" style={{ color: "var(--foreground)", fontFamily: "var(--font-primary)" }}>
                Watermark Settings
              </p>
              <button
                onClick={() => setSettingsOpen(false)}
                style={{ background: "var(--muted)", border: "none", color: "var(--muted-foreground)", borderRadius: 10, padding: "4px 14px", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-secondary)" }}
              >
                Done
              </button>
            </div>
            {/* Content */}
            <div className="px-5 pt-5 pb-10">
              <SettingsPanel {...sp} />
            </div>
          </div>
        </>
      )}
    </>
  );
}