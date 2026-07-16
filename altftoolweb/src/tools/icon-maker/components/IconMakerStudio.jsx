"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  Copy,
  Download,
  Eraser,
  FileArchive,
  Heart,
  Home,
  ImagePlus,
  RotateCcw,
  Search,
  Settings,
  User,
  Camera,
} from "lucide-react";
import Header from "./Header";
import {
  ANDROID_SIZES,
  FAVICON_SIZES,
  MULTI_SIZES,
  PWA_SIZES,
  buildSvg,
  canvasToBlob,
  createDefaultState,
  createIcoBlob,
  downloadBlob,
  presets,
  renderIconToCanvas,
} from "../utils/iconEngine";

const STORAGE_KEY = "altf_icon_maker_project";
const HISTORY_KEY = "altf_icon_maker_history";
const GRADIENTS_KEY = "altf_icon_maker_gradients";

const iconOptions = [
  { id: "text", label: "Text" },
  { id: "library", label: "Library" },
  { id: "upload", label: "Upload" },
];

const libraryIcons = [
  { id: "home", label: "Home", Icon: Home },
  { id: "user", label: "User", Icon: User },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "search", label: "Search", Icon: Search },
  { id: "camera", label: "Camera", Icon: Camera },
  { id: "heart", label: "Heart", Icon: Heart },
];

const shapes = [
  "circle",
  "square",
  "rounded",
  "rectangle",
  "pill",
  "squircle",
  "hexagon",
  "octagon",
  "diamond",
  "triangle",
  "star",
  "shield",
  "app tile",
];

function Panel({ title, children, className = "" }) {
  return (
    <section className={`relative w-full overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all duration-300 hover:border-blue-500/30 md:p-6 min-w-0 ${className}`}>
      <h2 className="mb-4 border-b border-[var(--border)] pb-3 text-base font-bold text-[var(--foreground)] md:text-lg">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold text-[var(--foreground)] min-w-0">
      <span className="text-xs uppercase tracking-[0.12em] text-[var(--muted-foreground)]">{label}</span>
      {children}
    </label>
  );
}

function Button({ children, onClick, active = false, disabled = false, title = "" }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-center text-sm font-bold leading-snug transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 ${
        active
          ? "border-blue-600 bg-blue-600 text-white shadow-md"
          : "border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-blue-500/30 hover:bg-[var(--card)]"
      }`}
    >
      {children}
    </button>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={`min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500 ${props.className || ""}`}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className="min-h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-blue-500"
    />
  );
}

function Features() {
  const features = [
    {
      title: "Live Canvas Preview",
      description: "Design app icons, favicons, and launcher assets with instant browser rendering.",
    },
    {
      title: "Text, Library & Upload",
      description: "Start from short text, built-in symbols, or your own PNG, JPG, SVG, and WEBP artwork.",
    },
    {
      title: "Production Exports",
      description: "Download PNG, SVG, favicon.ico, Android packs, PWA icons, and multi-size ZIP bundles.",
    },
    {
      title: "Precise Styling",
      description: "Tune shape, colors, gradients, radius, borders, glow, rotation, and icon scale.",
    },
    {
      title: "Local History",
      description: "Recent exported and copied icon designs stay available in your browser for quick reuse.",
    },
    {
      title: "Privacy First",
      description: "All icon rendering and file handling happens locally in your browser session.",
    },
  ];

  return (
    <div className="mt-12 border-t border-[var(--border)] py-16">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-2xl font-extrabold text-[var(--foreground)] sm:text-3xl">
          Icon Studio Features
        </h2>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-[var(--muted-foreground)]">
          A fast, browser-based workflow for creating polished icon assets
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 transition-all hover:border-blue-500/30 hover:shadow-md"
          >
            <h3 className="mb-2 text-lg font-bold text-[var(--foreground)]">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-[var(--muted-foreground)]">{feature.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default function IconMakerStudio() {
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const imageRef = useRef(null);
  const [state, setState] = useState(createDefaultState);
  const [history, setHistory] = useState([]);
  const [gradients, setGradients] = useState([]);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [notice, setNotice] = useState("");

  const update = useCallback((patch) => {
    setState((current) => ({ ...current, ...patch }));
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      const savedGradients = JSON.parse(localStorage.getItem(GRADIENTS_KEY) || "[]");
      if (saved) setState({ ...createDefaultState(), ...saved });
      setHistory(Array.isArray(savedHistory) ? savedHistory : []);
      setGradients(Array.isArray(savedGradients) ? savedGradients : []);
    } catch {
      setState(createDefaultState());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const draw = useCallback(() => {
    if (!canvasRef.current) return;
    renderIconToCanvas(canvasRef.current, state, state.size, imageRef.current);
    if (previewRef.current) {
      renderIconToCanvas(previewRef.current, state, 512, imageRef.current);
    }
  }, [state]);

  useEffect(() => {
    const img = new Image();
    imageRef.current = img;
    if (!state.uploadSrc) return;
    img.onload = () => draw();
    img.src = state.uploadSrc;
  }, [draw, state.uploadSrc]);

  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  const stats = useMemo(() => {
    const pixels = state.size * state.size;
    const estimated = Math.max(2, Math.round((pixels * 4 * 0.38) / 1024));
    return {
      resolution: `${state.size} x ${state.size}`,
      background: state.transparent ? "Transparent" : state.backgroundMode,
      estimate: `${estimated} KB`,
      format: state.exportFormat.toUpperCase(),
    };
  }, [state]);

  const pushHistory = useCallback(() => {
    const item = {
      id: Date.now(),
      title: state.iconType === "text" ? state.text || "Text icon" : state.iconType,
      state,
    };
    setHistory((current) => {
      const next = [item, ...current].slice(0, 8);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, [state]);

  const exportPng = async (size = state.size, filename = `icon-${size}.png`) => {
    const temp = document.createElement("canvas");
    renderIconToCanvas(temp, state, size, imageRef.current);
    const blob = await canvasToBlob(temp, "image/png");
    downloadBlob(blob, filename);
    pushHistory();
  };

  const exportSvg = () => {
    const blob = new Blob([buildSvg(state, state.size)], { type: "image/svg+xml" });
    downloadBlob(blob, `icon-${state.size}.svg`);
    pushHistory();
  };

  const exportIco = async () => {
    const temp = document.createElement("canvas");
    renderIconToCanvas(temp, state, 512, imageRef.current);
    downloadBlob(await createIcoBlob(temp), "favicon.ico");
    pushHistory();
  };

  const exportZip = async (sizes, label) => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const size of sizes) {
      const temp = document.createElement("canvas");
      renderIconToCanvas(temp, state, size, imageRef.current);
      const blob = await canvasToBlob(temp, "image/png");
      zip.file(`${label}-${size}x${size}.png`, blob);
    }
    if (label === "pwa") {
      zip.file("manifest-icons.json", JSON.stringify({
        icons: sizes.map((size) => ({ src: `${label}-${size}x${size}.png`, sizes: `${size}x${size}`, type: "image/png" })),
      }, null, 2));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    downloadBlob(blob, `${label}-icons.zip`);
    pushHistory();
  };

  const copyImage = async () => {
    if (!canvasRef.current || !navigator.clipboard || !window.ClipboardItem) return;
    const blob = await canvasToBlob(canvasRef.current, "image/png");
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
    pushHistory();
  };

  const handleUpload = (file) => {
    if (!file || !/image\/(png|jpeg|jpg|webp|svg\+xml)/.test(file.type)) {
      setNotice("Upload PNG, JPG, SVG, or WEBP.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => update({ uploadSrc: reader.result, uploadName: file.name, iconType: "upload" });
    reader.readAsDataURL(file);
  };

  const handlePointer = (event) => {
    if (!dragging) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * state.size;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * state.size;
    update({ offsetX: Math.round(x), offsetY: Math.round(y) });
  };

  const reset = () => update(createDefaultState());

  const saveGradient = () => {
    const item = {
      id: Date.now(),
      title: `Gradient ${gradients.length + 1}`,
      gradientType: state.gradientType,
      gradientFrom: state.gradientFrom,
      gradientMiddle: state.gradientMiddle,
      gradientTo: state.gradientTo,
      gradientAngle: state.gradientAngle,
    };
    setGradients((current) => {
      const next = [item, ...current].slice(0, 8);
      localStorage.setItem(GRADIENTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const applyGradient = (gradient) => {
    update({
      backgroundMode: "gradient",
      gradientType: gradient.gradientType,
      gradientFrom: gradient.gradientFrom,
      gradientMiddle: gradient.gradientMiddle,
      gradientTo: gradient.gradientTo,
      gradientAngle: gradient.gradientAngle,
    });
  };

  return (
    <div className="icon-maker-studio w-full overflow-x-hidden px-1 py-6 sm:px-2">
      <Header />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
        <Panel title="Live preview">
            <div className={`grid gap-4 overflow-visible rounded-2xl p-3 sm:p-4 ${state.previewSurface === "dark" ? "bg-slate-950" : "bg-slate-100"}`}>
              <div
                className="mx-auto aspect-square w-full max-w-[360px] touch-none select-none rounded-xl border border-white/10 p-2 sm:p-3"
                onPointerDown={() => setDragging(true)}
                onPointerUp={() => setDragging(false)}
                onPointerLeave={() => setDragging(false)}
                onPointerMove={handlePointer}
              >
                <canvas ref={previewRef} className="h-full w-full rounded-2xl object-contain" />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button active={state.previewSurface === "dark"} onClick={() => update({ previewSurface: "dark" })}>Dark</Button>
                <Button active={state.previewSurface === "light"} onClick={() => update({ previewSurface: "light" })}>Light</Button>
                <Button onClick={() => update({ offsetX: 0, offsetY: 0 })}><RotateCcw size={16} /> Center</Button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
        </Panel>

        <Panel title="Icon type & source">
          <div className="grid gap-4 min-w-0">
            <div className="grid grid-cols-3 gap-2">
              {iconOptions.map((item) => (
                <Button key={item.id} active={state.iconType === item.id} onClick={() => update({ iconType: item.id })}>
                  {item.label}
                </Button>
              ))}
            </div>

            {state.iconType === "text" && (
              <Field label="Text">
                <Input maxLength={4} value={state.text} onChange={(e) => update({ text: e.target.value.toUpperCase() })} />
              </Field>
            )}

            {state.iconType === "library" && (
              <div className="grid grid-cols-3 gap-2">
                {libraryIcons.map(({ id, label, Icon }) => (
                  <Button key={id} title={label} active={state.libraryIcon === id} onClick={() => update({ libraryIcon: id })}>
                    <Icon size={18} />
                  </Button>
                ))}
              </div>
            )}

            <div
              onDrop={(e) => {
                e.preventDefault();
                handleUpload(e.dataTransfer.files?.[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-xl border border-dashed border-blue-500/40 bg-[var(--background)] p-4 text-center"
            >
              <ImagePlus className="mx-auto mb-2 text-blue-500" size={24} />
              <p className="text-sm font-semibold text-[var(--foreground)] break-words">
                {state.uploadName || "Drop an image or choose a file"}
              </p>
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={(e) => handleUpload(e.target.files?.[0])}
                className="mt-3 w-full text-xs text-[var(--muted-foreground)]"
              />
              {notice && <p className="mt-2 text-xs text-red-500">{notice}</p>}
            </div>
          </div>
        </Panel>

        <Panel title="Style controls">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Shape">
                <Select value={state.shape} onChange={(e) => update({ shape: e.target.value })}>
                  {shapes.map((shape) => <option key={shape}>{shape}</option>)}
                </Select>
              </Field>
              <Field label="Size">
                <Select value={state.size} onChange={(e) => update({ size: Number(e.target.value) })}>
                  {MULTI_SIZES.map((size) => <option key={size} value={size}>{size}px</option>)}
                </Select>
              </Field>
              <Field label="Background">
                <Select value={state.backgroundMode} onChange={(e) => update({ backgroundMode: e.target.value })}>
                  <option value="solid">solid</option>
                  <option value="gradient">gradient</option>
                </Select>
              </Field>
              <Field label="Gradient type">
                <Select value={state.gradientType} onChange={(e) => update({ gradientType: e.target.value, backgroundMode: "gradient" })}>
                  <option value="linear">linear</option>
                  <option value="radial">radial</option>
                </Select>
              </Field>
              <Field label="Solid color">
                <Input type="color" value={state.backgroundColor} onChange={(e) => update({ backgroundColor: e.target.value })} />
              </Field>
              <Field label="Gradient from">
                <Input type="color" value={state.gradientFrom} onChange={(e) => update({ gradientFrom: e.target.value, backgroundMode: "gradient" })} />
              </Field>
              <Field label="Gradient middle">
                <Input type="color" value={state.gradientMiddle} onChange={(e) => update({ gradientMiddle: e.target.value, backgroundMode: "gradient" })} />
              </Field>
              <Field label="Gradient to">
                <Input type="color" value={state.gradientTo} onChange={(e) => update({ gradientTo: e.target.value, backgroundMode: "gradient" })} />
              </Field>
              <Field label="Text color">
                <Input type="color" value={state.textColor} onChange={(e) => update({ textColor: e.target.value, iconColor: e.target.value })} />
              </Field>
              <Field label="Border color">
                <Input type="color" value={state.borderColor} onChange={(e) => update({ borderColor: e.target.value })} />
              </Field>
            </div>
        </Panel>

        <Panel title="Canvas editing">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Scale", "iconScale", 20, 100],
                ["Radius", "radius", 0, 100],
                ["Border", "borderWidth", 0, 36],
                ["Glow blur", "blur", 0, 60],
                ["Rotate", "rotation", -180, 180],
                ["Gradient angle", "gradientAngle", 0, 360],
              ].map(([label, key, min, max]) => (
                <Field key={key} label={`${label}: ${state[key]}`}>
                  <Input type="range" min={min} max={max} value={state[key]} onChange={(e) => update({ [key]: Number(e.target.value) })} />
                </Field>
              ))}
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-sm font-semibold">
                <input type="checkbox" checked={state.transparent} onChange={(e) => update({ transparent: e.target.checked })} />
                Transparent background
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-sm font-semibold">
                <input type="checkbox" checked={state.glow} onChange={(e) => update({ glow: e.target.checked })} />
                Neon glow
              </label>
              <label className="flex items-center gap-2 rounded-xl border border-[var(--border)] p-3 text-sm font-semibold">
                <input type="checkbox" checked={state.shadow} onChange={(e) => update({ shadow: e.target.checked })} />
                Soft shadow
              </label>
            </div>
        </Panel>

        <Panel title="Presets">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {presets.map((preset) => (
              <Button key={preset.name} onClick={() => update(preset.patch)}>{preset.name}</Button>
            ))}
          </div>
        </Panel>

        <Panel title="Custom gradients">
          <div className="grid gap-3">
            <div
              className="h-16 rounded-xl border border-[var(--border)]"
              style={{
                background: state.gradientType === "radial"
                  ? `radial-gradient(circle at 32% 28%, ${state.gradientFrom}, ${state.gradientMiddle} 52%, ${state.gradientTo})`
                  : `linear-gradient(${state.gradientAngle}deg, ${state.gradientFrom}, ${state.gradientMiddle} 52%, ${state.gradientTo})`,
              }}
            />
            <Button onClick={saveGradient}>Save current gradient</Button>
            <div className="grid gap-2">
              {gradients.length === 0 && (
                <p className="text-sm text-[var(--muted-foreground)]">Saved gradients appear here.</p>
              )}
              {gradients.map((gradient) => (
                <button
                  key={gradient.id}
                  type="button"
                  onClick={() => applyGradient(gradient)}
                  className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] p-2 text-left transition hover:border-blue-500/30"
                >
                  <span
                    className="h-8 w-14 shrink-0 rounded-lg border border-[var(--border)]"
                    style={{
                      background: gradient.gradientType === "radial"
                        ? `radial-gradient(circle at 32% 28%, ${gradient.gradientFrom}, ${gradient.gradientMiddle} 52%, ${gradient.gradientTo})`
                        : `linear-gradient(${gradient.gradientAngle}deg, ${gradient.gradientFrom}, ${gradient.gradientMiddle} 52%, ${gradient.gradientTo})`,
                    }}
                  />
                  <span className="text-sm font-bold text-[var(--foreground)]">{gradient.title}</span>
                </button>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Export">
            <div className="grid gap-2">
              <Button onClick={() => exportPng()}><Download size={16} /> PNG</Button>
              <Button onClick={exportSvg} disabled={state.iconType === "upload"}><Download size={16} /> SVG</Button>
              <Button onClick={exportIco}><Download size={16} /> favicon.ico</Button>
              <Button onClick={() => exportZip(ANDROID_SIZES, "android")}><FileArchive size={16} /> Android ZIP</Button>
              <Button onClick={() => exportZip(PWA_SIZES, "pwa")}><FileArchive size={16} /> PWA ZIP</Button>
              <Button onClick={() => exportZip(MULTI_SIZES, "multi-size")}><FileArchive size={16} /> Multi-size ZIP</Button>
              <Button onClick={copyImage}>{copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy image"}</Button>
              <Button onClick={reset}><Eraser size={16} /> Reset</Button>
              {state.uploadSrc && <Button onClick={() => update({ uploadSrc: "", uploadName: "", iconType: "text" })}>Clear upload</Button>}
            </div>
        </Panel>

        <Panel title="Statistics">
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2 2xl:grid-cols-1">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="rounded-xl bg-[var(--background)] p-3 min-w-0">
                  <p className="text-xs uppercase tracking-[0.1em] text-[var(--muted-foreground)]">{key}</p>
                  <p className="font-bold text-[var(--foreground)] break-words">{value}</p>
                </div>
              ))}
            </div>
        </Panel>

        <Panel title="History">
            <div className="grid gap-2">
              {history.length === 0 && <p className="text-sm text-[var(--muted-foreground)]">Exports and copied icons appear here.</p>}
              {history.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => update(item.state)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-3 text-left text-sm transition hover:border-blue-500/30"
                >
                  <span className="block font-bold text-[var(--foreground)] break-words">{item.title}</span>
                  <span className="text-xs text-[var(--muted-foreground)]">{new Date(item.id).toLocaleTimeString()}</span>
                </button>
              ))}
            </div>
        </Panel>
      </div>

      <div className="mx-auto w-full max-w-7xl">
        <Features />
      </div>
    </div>
  );
}
