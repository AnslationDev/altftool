"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X, ZoomIn, Grid as GridIcon } from "lucide-react";

import { uploadPranxImage } from "../service/pranx.service";

const labelCls = "mb-1.5 block text-xs font-semibold tracking-wide text-[var(--muted)]";
const inputCls =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color:var(--primary)]/20";

const MAIN_SITE_URL = process.env.NEXT_PUBLIC_MAIN_SITE_URL || "http://localhost:3002";

export function getImageUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  if (path.startsWith("/")) {
    return `${MAIN_SITE_URL}${path}`;
  }
  return path;
}

export const GENERAL_ASSETS = [
  { name: "PranxHub Logo", path: "/pranx-assets/pranxhub-logo.svg" },
  { name: "Mascot Avatar", path: "/pranx-assets/download-6.png" },
  { name: "F11 Fullscreen Instructions", path: "/pranx-assets/download.jpg" },
  { name: "Sprite Sheet", path: "/pranx-assets/download-3.png" },
  { name: "Generic Download Icon", path: "/pranx-assets/download.png" },
];

export const SLIDER_BACKGROUNDS = [
  { name: "Slide 1: Office Mischief", path: "/pranx-assets/slider/download.jpg" },
  { name: "Slide 2: Computer Demos", path: "/pranx-assets/slider/download-1.jpg" },
  { name: "Slide 3: Just Pranx", path: "/pranx-assets/slider/download-2.jpg" },
];

export const THUMBNAILS = [
  { name: "Default Thumbnail", path: "/pranx-assets/thumbs/download-3.jpg" },
  { name: "Apple Update", path: "/pranx-assets/thumbs/apple-update.jpg" },
  { name: "BIOS Setup", path: "/pranx-assets/thumbs/bios.jpg" },
  { name: "Thumb download-2", path: "/pranx-assets/thumbs/download-2.jpg" },
  { name: "Thumb download-4", path: "/pranx-assets/thumbs/download-4.jpg" },
  { name: "Thumb download-5", path: "/pranx-assets/thumbs/download-5.jpg" },
  { name: "Thumb download-6", path: "/pranx-assets/thumbs/download-6.jpg" },
  { name: "Thumb download-7", path: "/pranx-assets/thumbs/download-7.jpg" },
  { name: "Thumb download-8", path: "/pranx-assets/thumbs/download-8.jpg" },
  { name: "Thumb download-9", path: "/pranx-assets/thumbs/download-9.jpg" },
  { name: "Thumb download-10", path: "/pranx-assets/thumbs/download-10.jpg" },
  { name: "Thumb download-11", path: "/pranx-assets/thumbs/download-11.jpg" },
  { name: "Thumb download-12", path: "/pranx-assets/thumbs/download-12.jpg" },
  { name: "Thumb download-13", path: "/pranx-assets/thumbs/download-13.jpg" },
  { name: "Thumb download-14", path: "/pranx-assets/thumbs/download-14.jpg" },
  { name: "Thumb download-15", path: "/pranx-assets/thumbs/download-15.jpg" },
  { name: "Thumb download-16", path: "/pranx-assets/thumbs/download-16.jpg" },
  { name: "Thumb download-17", path: "/pranx-assets/thumbs/download-17.jpg" },
  { name: "Thumb download-18", path: "/pranx-assets/thumbs/download-18.jpg" },
  { name: "Thumb download-19", path: "/pranx-assets/thumbs/download-19.jpg" },
  { name: "Thumb download-20", path: "/pranx-assets/thumbs/download-20.jpg" },
  { name: "Thumb download-21", path: "/pranx-assets/thumbs/download-21.jpg" },
  { name: "Thumb download-22", path: "/pranx-assets/thumbs/download-22.jpg" },
  { name: "Thumb download-23", path: "/pranx-assets/thumbs/download-23.jpg" },
  { name: "Thumb download-24", path: "/pranx-assets/thumbs/download-24.jpg" },
  { name: "Thumb download-25", path: "/pranx-assets/thumbs/download-25.jpg" },
  { name: "Thumb download-26", path: "/pranx-assets/thumbs/download-26.jpg" },
  { name: "Thumb download-27", path: "/pranx-assets/thumbs/download-27.jpg" },
  { name: "Thumb download-28", path: "/pranx-assets/thumbs/download-28.jpg" },
];

export function ImageLightbox({ src, onClose }) {
  if (!src) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-[1000] flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
        >
          <X size={20} />
        </button>
        <img
          src={getImageUrl(src)}
          alt="Full size preview"
          className="max-h-[85vh] max-w-[85vw] object-contain mx-auto block p-2"
        />
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-semibold text-slate-350 bg-black/45 py-1 px-3 w-fit mx-auto rounded-full text-slate-200">
          {src}
        </div>
      </div>
    </div>
  );
}

export function extractImagesFromContent(obj, found = new Set()) {
  if (!obj) return [];

  const scan = (item) => {
    if (!item) return;
    if (typeof item === "string") {
      const trimmed = item.trim();
      const isUrl = trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/");
      const hasImageExt = /\.(png|jpg|jpeg|svg|webp|gif)/i.test(trimmed);
      if (isUrl && hasImageExt) {
        found.add(trimmed);
      }
    } else if (Array.isArray(item)) {
      for (const val of item) scan(val);
    } else if (typeof item === "object") {
      for (const key of Object.keys(item)) scan(item[key]);
    }
  };

  scan(obj);
  return Array.from(found).map(path => {
    const parts = path.split("/");
    const filename = parts[parts.length - 1] || "Image";
    return { name: filename, path };
  });
}

export function ImageGalleryModal({ isOpen, onClose, onSelect, content }) {
  const dynamicImages = content ? extractImagesFromContent(content) : [];
  const defaultTab = dynamicImages.length > 0 ? "active-site" : "general";
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isOpen) return null;

  const categories = [];
  if (dynamicImages.length > 0) {
    categories.push({ id: "active-site", label: "Active on Site", items: dynamicImages });
  }
  categories.push(
    { id: "general", label: "General Assets", items: GENERAL_ASSETS },
    { id: "slider", label: "Sliders", items: SLIDER_BACKGROUNDS },
    { id: "thumbs", label: "Thumbnails", items: THUMBNAILS }
  );

  const currentCategory = categories.find((cat) => cat.id === activeTab) || categories[0];

  return (
    <div className="fixed inset-0 z-[990] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex h-[80vh] w-full max-w-3xl flex-col rounded-3xl border border-[var(--border)] bg-[var(--background)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-soft)] px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
              <GridIcon size={18} className="text-[var(--primary)]" /> Select Local Asset
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Choose from active site images or available pre-packaged visual assets.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-[var(--border)] bg-[var(--surface)] px-6 py-2 gap-1 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveTab(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${activeTab === cat.id
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
                }`}
            >
              {cat.label} ({cat.items.length})
            </button>
          ))}
        </div>

        {/* Grid Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentCategory.items.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--muted)]">
              No images found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {currentCategory.items.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    onSelect(item.path);
                    onClose();
                  }}
                  className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--primary)] transition hover:shadow-md text-left"
                >
                  <div className="relative aspect-[4/3] w-full bg-slate-900 overflow-hidden border-b border-[var(--border)]">
                    <img
                      src={getImageUrl(item.path)}
                      alt={item.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-bold text-[var(--foreground)]">{item.name}</p>
                    <p className="truncate text-[10px] text-[var(--muted)] mt-0.5" title={item.path}>{item.path}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-6 py-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface-soft)] transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export function Grid({ children }) {
  return <div className="grid gap-x-4 sm:grid-cols-2">{children}</div>;
}

export function Field({ label, value, onChange, placeholder }) {
  return (
    <label className="mb-4 block">
      <span className={labelCls}>{label}</span>
      <input
        className={inputCls}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder }) {
  return (
    <label className="mb-4 block">
      <span className={labelCls}>{label}</span>
      <textarea
        className={`${inputCls} resize-y leading-relaxed`}
        rows={rows}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function ToggleField({ label, value, onChange, desc }) {
  return (
    <div className="mb-4 flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
      <div className="min-w-0 pr-4">
        <span className="block text-sm font-bold text-[var(--foreground)]">{label}</span>
        {desc && <span className="mt-0.5 block text-xs text-[var(--muted)]">{desc}</span>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`h-8 w-16 shrink-0 rounded-full p-1 transition ${value ? "bg-[var(--primary)]" : "bg-slate-300"
          }`}
      >
        <span
          className={`block h-6 w-6 rounded-full bg-white shadow transition ${value ? "ml-8" : ""
            }`}
        />
      </button>
    </div>
  );
}

export function ImageField({ label, value, onChange, content, fallbackUrl }) {
  const [uploading, setUploading] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);

  const displayUrl = value || fallbackUrl;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPranxImage(file);
      onChange(url);
    } catch (err) {
      alert("Image upload failed: " + (err?.message || "unknown error"));
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="mb-4">
      <span className={labelCls}>{label}</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {displayUrl ? (
          <div
            onClick={() => setLightboxOpen(true)}
            className="relative h-20 w-28 flex-shrink-0 cursor-zoom-in rounded-lg border border-[var(--border)] overflow-hidden bg-slate-900 group"
            title="Click to expand full size"
          >
            <img
              src={getImageUrl(displayUrl)}
              alt="preview"
              className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="h-5 w-5 text-white" />
            </div>
            {!value && fallbackUrl && (
              <div className="absolute bottom-1 left-1 bg-blue-500/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase leading-none scale-90 origin-bottom-left z-10">
                Default
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-20 w-28 flex-shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-[var(--muted)]">
            <ImagePlus size={20} />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <input
            className={inputCls}
            value={value ?? ""}
            placeholder="Image URL or upload a file"
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <label
              className={`inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--primary)]/30 bg-[color:var(--primary)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/15 ${uploading ? "cursor-wait opacity-70" : "cursor-pointer"
                }`}
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
              {uploading ? "Uploading…" : "Upload image"}
              <input type="file" accept="image/*" hidden onChange={handleFile} disabled={uploading} />
            </label>

            <button
              type="button"
              onClick={() => setGalleryOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)]"
            >
              <GridIcon size={14} /> Browse Gallery
            </button>
          </div>
        </div>
        {/* Inside ImageField component, after the Upload and Gallery buttons */}
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100"
          >
            <Trash2 size={14} /> Remove
          </button>
        )}
      </div>

      {lightboxOpen && (
        <ImageLightbox src={displayUrl} onClose={() => setLightboxOpen(false)} />
      )}

      {galleryOpen && (
        <ImageGalleryModal
          isOpen={galleryOpen}
          onClose={() => setGalleryOpen(false)}
          onSelect={onChange}
          content={content}
        />
      )}
    </div>
  );
}

export function ListEditor({ title, items, onChange, renderItem, makeEmpty, itemLabel = "Item" }) {
  const list = items || [];

  const updateItem = (index, nextItem) => {
    const next = list.slice();
    next[index] = nextItem;
    onChange(next);
  };
  const removeItem = (index) => onChange(list.filter((_, i) => i !== index));
  const addItem = () => onChange([...list, makeEmpty()]);

  return (
    <div className="mb-2">
      {title ? (
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-sm font-bold text-[var(--foreground)]">{title}</h4>
          <span className="rounded-full bg-[var(--surface-soft)] px-2 py-0.5 text-xs font-medium text-[var(--muted)]">
            {list.length}
          </span>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        {list.map((item, index) => (
          <div
            key={index}
            className="relative rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {itemLabel} {index + 1}
              </span>
              <button
                type="button"
                onClick={() => removeItem(index)}
                title="Remove"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--muted)] transition hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {renderItem(item, (nextItem) => updateItem(index, nextItem))}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[color:var(--primary)]/40 bg-[color:var(--primary)]/5 px-3.5 py-2 text-sm font-semibold text-[var(--primary)] transition hover:bg-[color:var(--primary)]/10"
      >
        <Plus size={15} /> Add {itemLabel.toLowerCase()}
      </button>
    </div>
  );
}

const svgThumb = (accent, art, background = "#102033", wash = "#2f7080") => {
  const svg = `
    <svg width="600" height="400" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${background}" />
          <stop offset="0.58" stop-color="#152236" />
          <stop offset="1" stop-color="${wash}" />
        </linearGradient>
        <radialGradient id="halo" cx="72%" cy="24%" r="68%">
          <stop offset="0" stop-color="${accent}" stop-opacity="0.32" />
          <stop offset="0.52" stop-color="${accent}" stop-opacity="0.08" />
          <stop offset="1" stop-color="#020617" stop-opacity="0" />
        </radialGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="14" stdDeviation="13" flood-color="#020617" flood-opacity="0.42" />
        </filter>
      </defs>
      <rect width="600" height="400" rx="22" fill="url(#bg)" />
      <rect width="600" height="400" rx="22" fill="url(#halo)" />
      <circle cx="112" cy="330" r="170" fill="#ffffff" opacity="0.045" />
      <circle cx="486" cy="88" r="132" fill="#ffffff" opacity="0.055" />
      ${art}
    </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const windowDots = `
  <circle cx="0" cy="0" r="7" fill="#ff5f57" />
  <circle cx="24" cy="0" r="7" fill="#ffbd2e" />
  <circle cx="48" cy="0" r="7" fill="#28c840" />
`;

const terminalArt = (accent = "#54e88f") => `
  <g filter="url(#shadow)">
    <rect x="94" y="82" width="412" height="236" rx="22" fill="#07111f" stroke="${accent}" stroke-opacity="0.42" stroke-width="3" />
    <g transform="translate(126 115)">${windowDots}</g>
    <text x="128" y="178" fill="#ffd166" font-size="24" font-family="monospace" font-weight="800">&gt; prank --safe</text>
    <rect x="128" y="205" width="94" height="9" rx="4" fill="${accent}" />
    <rect x="128" y="232" width="185" height="9" rx="4" fill="${accent}" opacity="0.9" />
    <rect x="128" y="232" width="185" height="9" rx="4" fill="${accent}" opacity="0.9" />
    <rect x="128" y="259" width="278" height="9" rx="4" fill="${accent}" opacity="0.82" />
    <rect x="128" y="286" width="148" height="9" rx="4" fill="${accent}" opacity="0.72" />
  </g>
`;

const updateArt = (accent = "#4ade80") => `
  <g filter="url(#shadow)">
    <rect x="96" y="88" width="408" height="224" rx="22" fill="#0b1628" stroke="#f8fafc" stroke-opacity="0.1" stroke-width="3" />
    <g transform="translate(126 120)">${windowDots}</g>
    <g transform="translate(300 184)">
      <circle r="39" fill="none" stroke="#94a3b8" stroke-width="16" stroke-dasharray="74 44" />
      <circle r="39" fill="none" stroke="#e2e8f0" stroke-width="16" stroke-dasharray="34 84" transform="rotate(70)" />
    </g>
    <rect x="188" y="254" width="224" height="18" rx="9" fill="#1e293b" />
    <rect x="188" y="254" width="138" height="18" rx="9" fill="${accent}" />
    <rect x="222" y="292" width="156" height="16" rx="8" fill="${accent}" opacity="0.62" />
  </g>
`;

const thumbArt = {
  soundboard: `
    <g filter="url(#shadow)">
      <rect x="98" y="86" width="404" height="228" rx="22" fill="#091527" stroke="#76e4f7" stroke-opacity="0.24" stroke-width="3" />
      <g transform="translate(128 120)">${windowDots}</g>
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((bar) => `<rect x="${142 + bar * 33}" y="${230 - ((bar * 37) % 118)}" width="18" height="${78 + ((bar * 29) % 92)}" rx="9" fill="${bar % 2 ? "#38bdf8" : "#4ade80"}" />`).join("")}
      <path d="M292 198 L354 160 L354 286 L292 248 L262 248 L262 198 Z" fill="#f8fafc" />
    </g>
  `,
  hacker: terminalArt("#4ade80"),
  "google-terminal": terminalArt("#38bdf8"),
  "fake-dos": `
    <g filter="url(#shadow)">
      <rect x="82" y="74" width="436" height="252" rx="10" fill="#050505" stroke="#facc15" stroke-opacity="0.52" stroke-width="3" />
      <text x="118" y="130" fill="#facc15" font-size="26" font-family="monospace" font-weight="800">C:\\PRANX&gt; DIR</text>
      <text x="118" y="176" fill="#34d399" font-size="22" font-family="monospace">MATRIX.BAT</text>
      <text x="118" y="214" fill="#34d399" font-size="22" font-family="monospace">SAFE.COM</text>
      <text x="118" y="252" fill="#34d399" font-size="22" font-family="monospace">SYSTEM32_OK</text>
      <rect x="118" y="284" width="160" height="10" fill="#facc15" />
    </g>
  `,
  bios: `
    <g filter="url(#shadow)">
      <rect x="78" y="62" width="444" height="276" rx="8" fill="#102a5c" stroke="#bfdbfe" stroke-width="4" />
      <rect x="78" y="62" width="444" height="44" fill="#bfdbfe" opacity="0.16" />
      <text x="102" y="94" fill="#e0f2fe" font-size="22" font-family="monospace" font-weight="800">BIOS SETUP UTILITY</text>
      <rect x="106" y="136" width="178" height="150" fill="#0f172a" opacity="0.45" />
      <rect x="316" y="136" width="178" height="150" fill="#0f172a" opacity="0.45" />
      <rect x="124" y="160" width="118" height="9" fill="#93c5fd" />
      <rect x="124" y="194" width="138" height="9" fill="#facc15" />
      <rect x="334" y="160" width="126" height="9" fill="#93c5fd" />
      <rect x="334" y="194" width="88" height="9" fill="#93c5fd" />
      <rect x="334" y="228" width="144" height="9" fill="#93c5fd" />
    </g>
  `,
  "norton-commander": `
    <g filter="url(#shadow)">
      <rect x="74" y="70" width="452" height="260" rx="10" fill="#04131f" stroke="#38bdf8" stroke-width="3" />
      <rect x="94" y="104" width="194" height="176" fill="#123b69" />
      <rect x="312" y="104" width="194" height="176" fill="#123b69" />
      ${[0, 1, 2, 3, 4].map((row) => `<rect x="112" y="${126 + row * 28}" width="${112 + row * 12}" height="9" fill="${row === 1 ? "#fde047" : "#dbeafe"}" /><rect x="330" y="${126 + row * 28}" width="${132 - row * 8}" height="9" fill="${row === 2 ? "#fde047" : "#dbeafe"}" />`).join("")}
      <rect x="94" y="296" width="412" height="18" fill="#0f172a" />
    </g>
  `,
  winxp: `
    <g filter="url(#shadow)">
      <rect x="90" y="72" width="420" height="256" rx="16" fill="#0b63ce" />
      <path d="M90 236 C184 130 282 156 510 86 L510 328 L90 328 Z" fill="#34d399" />
      <path d="M90 284 C190 206 322 220 510 170 L510 328 L90 328 Z" fill="#1d4ed8" opacity="0.68" />
      <rect x="90" y="292" width="420" height="36" fill="#0756b8" />
      <rect x="108" y="299" width="92" height="22" rx="11" fill="#22c55e" />
      <rect x="340" y="106" width="118" height="82" rx="10" fill="#f8fafc" opacity="0.88" />
    </g>
  `,
  "jurassic-park": `
    <g filter="url(#shadow)">
      <rect x="88" y="76" width="424" height="248" rx="18" fill="#15210f" stroke="#84cc16" stroke-width="3" />
      <path d="M150 274 C190 156 278 152 326 92 C384 160 430 206 456 278" fill="none" stroke="#facc15" stroke-width="8" stroke-linecap="round" />
      <path d="M132 256 L470 138" stroke="#22c55e" stroke-width="5" stroke-dasharray="14 14" />
      <path d="M168 126 L472 282" stroke="#22c55e" stroke-width="5" stroke-dasharray="14 14" />
      <circle cx="326" cy="92" r="14" fill="#ef4444" />
      <circle cx="150" cy="274" r="12" fill="#facc15" />
      <circle cx="456" cy="278" r="12" fill="#facc15" />
    </g>
  `,
  "jurassic-park/console": terminalArt("#84cc16"),
  "fake-virus": `
    <g filter="url(#shadow)">
      <rect x="88" y="82" width="424" height="236" rx="22" fill="#170a15" stroke="#ef4444" stroke-opacity="0.62" stroke-width="3" />
      <g transform="translate(126 116)">${windowDots}</g>
      <path d="M300 136 L392 282 H208 Z" fill="#facc15" stroke="#7f1d1d" stroke-width="8" />
      <rect x="292" y="184" width="16" height="54" rx="8" fill="#7f1d1d" />
      <circle cx="300" cy="258" r="9" fill="#7f1d1d" />
    </g>
  `,
  "fbi-warning": `
    <g filter="url(#shadow)">
      <rect x="80" y="70" width="440" height="260" rx="16" fill="#13070a" stroke="#dc2626" stroke-width="4" />
      <circle cx="300" cy="194" r="78" fill="#7f1d1d" stroke="#fca5a5" stroke-width="6" />
      <path d="M300 124 L320 172 L372 176 L332 208 L346 260 L300 232 L254 260 L268 208 L228 176 L280 172 Z" fill="#facc15" />
      <rect x="214" y="286" width="172" height="18" rx="9" fill="#fca5a5" />
    </g>
  `,
  bsod: `
    <g filter="url(#shadow)">
      <rect x="92" y="82" width="416" height="236" rx="14" fill="#1d62dc" />
      <text x="132" y="154" fill="#f8fafc" font-size="58" font-family="Arial, sans-serif">:(</text>
      <rect x="132" y="204" width="290" height="12" rx="6" fill="#bfdbfe" />
      <rect x="132" y="242" width="218" height="12" rx="6" fill="#bfdbfe" />
      <rect x="132" y="280" width="122" height="12" rx="6" fill="#bfdbfe" />
    </g>
  `,
  pipes: `
    <g filter="url(#shadow)" fill="none" stroke-linecap="round" stroke-linejoin="round">
      <path d="M112 282 H230 V190 H318 V116 H468" stroke="#14b8a6" stroke-width="34" />
      <path d="M158 116 H240 V222 H366 V302" stroke="#86efac" stroke-width="30" />
      <path d="M112 282 H230 V190 H318 V116 H468" stroke="#083344" stroke-width="10" opacity="0.36" />
      <path d="M158 116 H240 V222 H366 V302" stroke="#064e3b" stroke-width="9" opacity="0.32" />
    </g>
  `,
  "dvd-bounce": `
    <g filter="url(#shadow)">
      <rect x="96" y="88" width="408" height="224" rx="22" fill="#091527" stroke="#38bdf8" stroke-width="3" />
      <path d="M204 182 L300 116 L396 182 L300 248 Z" fill="#f472b6" />
      <path d="M228 244 H372 L330 286 H270 Z" fill="#67e8f9" />
      <text x="250" y="206" fill="#0f172a" font-size="48" font-family="Arial, sans-serif" font-weight="900">DVD</text>
    </g>
  `,
  "matrix-code-rain": `
    <g filter="url(#shadow)">
      <rect x="82" y="64" width="436" height="272" rx="18" fill="#03110b" stroke="#22c55e" stroke-opacity="0.4" stroke-width="3" />
      ${Array.from({ length: 13 }, (_, col) => Array.from({ length: 7 }, (_, row) => `<text x="${112 + col * 32}" y="${104 + row * 33}" fill="#4ade80" opacity="${0.35 + ((col + row) % 5) * 0.12}" font-size="21" font-family="monospace">${(col * 7 + row) % 2 ? "1" : "0"}</text>`).join("")).join("")}
      <rect x="156" y="210" width="288" height="10" rx="5" fill="#86efac" />
      <rect x="188" y="250" width="224" height="10" rx="5" fill="#22c55e" />
    </g>
  `,
  "static-tv": `
    <g filter="url(#shadow)">
      <rect x="88" y="82" width="424" height="236" rx="24" fill="#0f172a" stroke="#94a3b8" stroke-opacity="0.2" stroke-width="3" />
      ${Array.from({ length: 72 }, (_, i) => `<rect x="${104 + ((i * 53) % 380)}" y="${104 + ((i * 31) % 172)}" width="${8 + (i % 5) * 6}" height="3" fill="${["#f8fafc", "#38bdf8", "#f472b6", "#22c55e"][i % 4]}" opacity="${0.35 + (i % 4) * 0.13}" />`).join("")}
      <rect x="118" y="126" width="364" height="16" fill="#64748b" opacity="0.18" />
      <rect x="118" y="246" width="364" height="14" fill="#64748b" opacity="0.16" />
    </g>
  `,
  "fake-update": updateArt("#a78bfa"),
  "windows-update": updateArt("#22c55e"),
  "mac-update": `
    <g filter="url(#shadow)">
      <rect x="122" y="76" width="356" height="248" rx="28" fill="#f8fafc" />
      <rect x="162" y="126" width="276" height="18" rx="9" fill="#dbeafe" />
      <rect x="162" y="176" width="232" height="18" rx="9" fill="#bbf7d0" />
      <rect x="162" y="226" width="260" height="18" rx="9" fill="#fde68a" />
      <circle cx="204" cy="284" r="11" fill="#94a3b8" />
      <circle cx="244" cy="284" r="11" fill="#94a3b8" />
      <circle cx="284" cy="284" r="11" fill="#94a3b8" />
    </g>
  `,
  minesweeper: `
    <g filter="url(#shadow)">
      <rect x="110" y="70" width="380" height="260" rx="18" fill="#102033" stroke="#67e8f9" stroke-opacity="0.22" stroke-width="3" />
      ${Array.from({ length: 8 }, (_, row) => Array.from({ length: 10 }, (_, col) => `<rect x="${144 + col * 30}" y="${104 + row * 24}" width="20" height="18" rx="3" fill="${["#22c55e", "#38bdf8", "#f59e0b", "#ef4444", "#e2e8f0"][(row + col) % 5]}" />`).join("")).join("")}
      <circle cx="422" cy="286" r="18" fill="#38bdf8" />
      <circle cx="384" cy="286" r="18" fill="#f59e0b" />
    </g>
  `,
  tetris: `
    <g filter="url(#shadow)">
      <rect x="142" y="54" width="316" height="292" rx="16" fill="#08111f" stroke="#94a3b8" stroke-opacity="0.18" stroke-width="3" />
      ${[
      [204, 92, "#f97316"], [236, 92, "#f97316"], [268, 92, "#f97316"], [268, 124, "#f97316"],
      [332, 108, "#22c55e"], [364, 108, "#22c55e"], [300, 140, "#22c55e"], [332, 140, "#22c55e"],
      [204, 188, "#38bdf8"], [236, 188, "#38bdf8"], [204, 220, "#38bdf8"], [236, 220, "#38bdf8"],
      [300, 236, "#a78bfa"], [332, 236, "#a78bfa"], [364, 236, "#a78bfa"], [332, 268, "#a78bfa"]
    ].map(([x, y, fill]) => `<rect x="${x}" y="${y}" width="30" height="30" rx="5" fill="${fill}" />`).join("")}
    </g>
  `,
  maze: `
    <g filter="url(#shadow)">
      <rect x="86" y="70" width="428" height="260" rx="18" fill="#0f172a" />
      <path d="M128 116 H274 V166 H190 V218 H348 V128 H474 V284 H128 Z" fill="none" stroke="#e2e8f0" stroke-width="18" stroke-linejoin="round" />
      <path d="M164 282 H254 V250 H430" fill="none" stroke="#38bdf8" stroke-width="12" stroke-linecap="round" />
      <circle cx="134" cy="284" r="18" fill="#f59e0b" />
      <circle cx="470" cy="284" r="18" fill="#38bdf8" />
    </g>
  `,
  "chat-screenshot-generator": `
    <g filter="url(#shadow)">
      <rect x="134" y="66" width="332" height="268" rx="30" fill="#f8fafc" />
      <rect x="178" y="116" width="160" height="22" rx="11" fill="#dbeafe" />
      <rect x="236" y="172" width="178" height="22" rx="11" fill="#bbf7d0" />
      <rect x="178" y="228" width="222" height="22" rx="11" fill="#fde68a" />
      <circle cx="210" cy="292" r="11" fill="#94a3b8" />
      <circle cx="250" cy="292" r="11" fill="#94a3b8" />
      <circle cx="290" cy="292" r="11" fill="#94a3b8" />
    </g>
  `,
  trollface: `
    <g filter="url(#shadow)">
      <circle cx="300" cy="198" r="112" fill="#f8fafc" stroke="#0f172a" stroke-width="8" />
      <circle cx="258" cy="164" r="13" fill="#0f172a" />
      <circle cx="342" cy="164" r="13" fill="#0f172a" />
      <path d="M218 224 C252 286 360 286 394 224" fill="none" stroke="#0f172a" stroke-width="15" stroke-linecap="round" />
      <path d="M238 238 H362" stroke="#0f172a" stroke-width="8" />
    </g>
  `,
};

const makeThumb = (key, accent = "#67e8f9", background = "#102033", wash = "#2f7080") => (
  svgThumb(accent, thumbArt[key] || terminalArt(accent), background, wash)
);

export const prankImages = {
  hacker: makeThumb("hacker", "#4ade80", "#08111f", "#166534"),
  "matrix-code-rain": makeThumb("matrix-code-rain", "#22c55e", "#03110b", "#064e3b"),
  bsod: makeThumb("bsod", "#60a5fa", "#102a5c", "#1d4ed8"),
  pipes: makeThumb("pipes", "#14b8a6", "#102033", "#0f766e"),
  "dvd-bounce": makeThumb("dvd-bounce", "#f472b6", "#111827", "#0891b2"),
  "fake-virus": makeThumb("fake-virus", "#ef4444", "#170a15", "#7f1d1d"),
  "fbi-warning": makeThumb("fbi-warning", "#facc15", "#13070a", "#450a0a"),
  "google-terminal": makeThumb("google-terminal", "#38bdf8", "#07111f", "#075985"),
  "fake-dos": makeThumb("fake-dos", "#facc15", "#050505", "#365314"),
  bios: makeThumb("bios", "#93c5fd", "#0b1f4d", "#1d4ed8"),
  "norton-commander": makeThumb("norton-commander", "#38bdf8", "#04131f", "#1e3a8a"),
  winxp: makeThumb("winxp", "#22c55e", "#0b63ce", "#15803d"),
  "jurassic-park": makeThumb("jurassic-park", "#84cc16", "#101909", "#3f6212"),
  "jurassic-park/console": makeThumb("jurassic-park/console", "#84cc16", "#08111f", "#365314"),
  "fake-update": makeThumb("fake-update", "#a78bfa", "#111827", "#4c1d95"),
  "windows-update": makeThumb("windows-update", "#22c55e", "#0f172a", "#075985"),
  "mac-update": makeThumb("mac-update", "#fde68a", "#334155", "#0f766e"),
  minesweeper: makeThumb("minesweeper", "#38bdf8", "#102033", "#0f766e"),
  tetris: makeThumb("tetris", "#a78bfa", "#111827", "#4c1d95"),
  maze: makeThumb("maze", "#f59e0b", "#0f172a", "#0e7490"),
  soundboard: makeThumb("soundboard", "#76e4f7", "#170a15", "#7f1d1d"),
  "chat-screenshot-generator": makeThumb("chat-screenshot-generator", "#bbf7d0", "#334155", "#0f766e"),
  "static-tv": makeThumb("static-tv", "#f472b6", "#0f172a", "#312e81"),
  trollface: makeThumb("trollface", "#f8fafc", "#111827", "#475569"),
};

export function getPrankDefaultImage(slug) {
  return prankImages[slug] || "/pranx-assets/thumbs/download-3.jpg";
}

