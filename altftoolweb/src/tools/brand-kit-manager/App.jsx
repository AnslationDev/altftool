"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Badge,
  BookOpen,
  Check,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  Link,
  Palette,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
  SwatchBook,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "altftools:brand-kit-manager:v1";
const supportedTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];

const footerCards = [
  {
    title: "Uses",
    description:
      "Store brand profiles, logo assets, color palettes, typography, social links, and creative guidelines in one reusable workspace.",
    icon: SwatchBook,
  },
  {
    title: "How It Works",
    description:
      "Update your kit fields and the live preview, validation, export summary, and saved browser data stay in sync automatically.",
    icon: BookOpen,
  },
];

const blankKit = () => ({
  id: createId(),
  name: "Nova Studio",
  tagline: "Create Better",
  description: "A modern creative studio focused on clean digital brand systems.",
  industry: "Creative Studio",
  website: "https://novastudio.example",
  contact: "hello@novastudio.example",
  ownerNotes: "Keep the identity minimal, confident, and product-focused.",
  assets: [
    { id: createId(), label: "Primary logo", role: "Primary logo", dataUrl: "", type: "" },
    { id: createId(), label: "Secondary logo", role: "Secondary logo", dataUrl: "", type: "" },
    { id: createId(), label: "Icon mark", role: "Icon logo", dataUrl: "", type: "" },
    { id: createId(), label: "Watermark", role: "Watermark", dataUrl: "", type: "" },
  ],
  colors: [
    { id: createId(), name: "Primary", value: "#3B82F6" },
    { id: createId(), name: "Secondary", value: "#111827" },
    { id: createId(), name: "Accent", value: "#8B5CF6" },
    { id: createId(), name: "Background", value: "#F8FAFC" },
  ],
  typography: {
    heading: "Montserrat",
    body: "Poppins",
    hierarchy: "H1 48/56 bold, H2 32/40 semibold, body 16/26 regular.",
    notes: "Use generous spacing, strong headlines, and readable paragraph rhythm.",
  },
  links: [
    { id: createId(), label: "Website", url: "https://novastudio.example" },
    { id: createId(), label: "Instagram", url: "https://instagram.com/novastudio" },
    { id: createId(), label: "LinkedIn", url: "https://linkedin.com/company/novastudio" },
  ],
  guidelines: {
    voice: "Clear, premium, calm, and direct.",
    messaging: "Lead with outcomes, then support with craft and credibility.",
    designRules: "Use strong contrast, restrained gradients, and consistent logo spacing.",
    content: "Avoid generic hype. Prefer crisp benefits and practical proof.",
    reminders: "Always check contrast and logo padding before publishing.",
    visualNotes: "Primary blue carries actions. Violet is reserved for highlights.",
  },
  updatedAt: new Date().toISOString(),
});

function createId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isHex(value) {
  return /^#[0-9A-F]{6}$/i.test(value.trim());
}

function normalizeHex(value) {
  const text = value.trim();
  return text.startsWith("#") ? text.toUpperCase() : `#${text}`.toUpperCase();
}

function validUrl(value) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function readableDate(value) {
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return "Today";
  }
}

function cleanFilename(value) {
  return (value || "brand-kit").trim().replace(/[^a-z0-9-]+/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase();
}

function downloadText(filename, text, type = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

const Field = ({ label, value, onChange, placeholder, multiline = false, error, type = "text" }) => (
  <label className="block min-w-0">
    <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
      {label}
    </span>
    {multiline ? (
      <textarea
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full resize-y rounded-xl border bg-(--background) px-4 py-3 text-sm leading-relaxed text-(--foreground) outline-none transition-colors placeholder:text-(--muted-foreground) ${
          error ? "border-red-500/60" : "border-(--border) focus:border-(--primary)"
        }`}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border bg-(--background) px-4 py-3 text-sm text-(--foreground) outline-none transition-colors placeholder:text-(--muted-foreground) ${
          error ? "border-red-500/60" : "border-(--border) focus:border-(--primary)"
        }`}
      />
    )}
    {error && <span className="mt-1 block text-[11px] font-semibold text-red-500">{error}</span>}
  </label>
);

const GlassCard = ({ title, icon: Icon, children, className = "", action }) => (
  <motion.section
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className={`min-w-0 overflow-hidden rounded-2xl border border-(--border) bg-(--card) p-4 shadow-md transition-colors hover:border-(--primary) md:p-5 ${className}`}
  >
    {title && (
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-(--border) pb-3">
        <div className="flex min-w-[150px] flex-1 items-center gap-3">
          <div className="shrink-0 rounded-xl bg-(--muted) p-2.5 text-(--primary)">
            {Icon && <Icon size={18} />}
          </div>
          <h3 className="min-w-0 break-words text-base font-black leading-snug tracking-tight text-(--foreground)">
            {title}
          </h3>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    )}
    {children}
  </motion.section>
);

function FooterCards() {
  return (
    <section className="mt-8 grid gap-6 sm:grid-cols-2">
      {footerCards.map((card) => (
        <div
          key={card.title}
          className="min-w-0 rounded-2xl border border-(--border) bg-(--card) p-6 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-(--muted) text-(--primary)">
            <card.icon className="h-5 w-5" />
          </div>
          <h3 className="break-words text-lg font-bold text-(--foreground)">{card.title}</h3>
          <p className="mt-3 break-words text-sm leading-relaxed text-(--muted-foreground)">
            {card.description}
          </p>
        </div>
      ))}
    </section>
  );
}

export default function BrandKitManagerApp() {
  const [kits, setKits] = useState(() => {
    if (typeof window === "undefined") return [blankKit()];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [blankKit()];
    } catch {
      return [blankKit()];
    }
  });
  const [activeId, setActiveId] = useState(() => kits[0]?.id || "");
  const [notice, setNotice] = useState("");
  const [newColor, setNewColor] = useState("#22C55E");
  const [newColorName, setNewColorName] = useState("Success");
  const [newLinkLabel, setNewLinkLabel] = useState("Portfolio");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const fileRefs = useRef({});

  const activeKit = useMemo(
    () => kits.find((kit) => kit.id === activeId) || kits[0],
    [activeId, kits],
  );

  const stats = useMemo(() => {
    const assets = kits.reduce((sum, kit) => sum + kit.assets.filter((asset) => asset.dataUrl).length, 0);
    const colors = kits.reduce((sum, kit) => sum + kit.colors.length, 0);
    const fonts = kits.reduce(
      (sum, kit) => sum + Number(Boolean(kit.typography.heading)) + Number(Boolean(kit.typography.body)),
      0,
    );
    return { kits: kits.length, assets, colors, fonts };
  }, [kits]);

  const errors = useMemo(() => {
    if (!activeKit) return {};
    const linkErrors = {};
    activeKit.links.forEach((linkItem) => {
      if (!validUrl(linkItem.url)) linkErrors[linkItem.id] = "Use a valid http, https, or mailto link.";
    });
    return {
      name: activeKit.name.trim() ? "" : "Brand name is required.",
      website: validUrl(activeKit.website) ? "" : "Use a valid website URL.",
      links: linkErrors,
    };
  }, [activeKit]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kits));
  }, [kits]);

  function flash(message) {
    setNotice(message);
    window.clearTimeout(flash.timer);
    flash.timer = window.setTimeout(() => setNotice(""), 2200);
  }

  function updateKit(patch) {
    setKits((prev) =>
      prev.map((kit) =>
        kit.id === activeKit.id ? { ...kit, ...patch, updatedAt: new Date().toISOString() } : kit,
      ),
    );
  }

  function updateNested(key, value) {
    updateKit({ [key]: { ...activeKit[key], ...value } });
  }

  function addKit() {
    const next = blankKit();
    next.name = `Brand Kit ${kits.length + 1}`;
    setKits((prev) => [next, ...prev]);
    setActiveId(next.id);
    flash("New brand kit created.");
  }

  function deleteKit(id) {
    if (kits.length === 1) {
      flash("Keep at least one brand kit.");
      return;
    }
    setKits((prev) => prev.filter((kit) => kit.id !== id));
    if (activeId === id) setActiveId(kits.find((kit) => kit.id !== id)?.id || "");
    flash("Brand kit deleted.");
  }

  function duplicateKit() {
    const copy = {
      ...activeKit,
      id: createId(),
      name: `${activeKit.name || "Brand Kit"} Copy`,
      assets: activeKit.assets.map((asset) => ({ ...asset, id: createId() })),
      colors: activeKit.colors.map((color) => ({ ...color, id: createId() })),
      links: activeKit.links.map((linkItem) => ({ ...linkItem, id: createId() })),
      updatedAt: new Date().toISOString(),
    };
    setKits((prev) => [copy, ...prev]);
    setActiveId(copy.id);
    flash("Brand kit duplicated.");
  }

  function resetActiveKit() {
    const fresh = blankKit();
    const replacement = { ...fresh, id: activeKit.id, name: activeKit.name || fresh.name };
    setKits((prev) => prev.map((kit) => (kit.id === activeKit.id ? replacement : kit)));
    flash("Current kit reset.");
  }

  function updateAsset(assetId, patch) {
    updateKit({
      assets: activeKit.assets.map((asset) => (asset.id === assetId ? { ...asset, ...patch } : asset)),
    });
  }

  function uploadAsset(assetId, file) {
    if (!file) return;
    if (!supportedTypes.includes(file.type)) {
      flash("Upload PNG, JPG, SVG, or WEBP only.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      updateAsset(assetId, {
        dataUrl: event.target.result,
        type: file.type,
        fileName: file.name,
        size: file.size,
      });
      flash("Asset uploaded.");
    };
    reader.readAsDataURL(file);
  }

  function addAssetSlot() {
    updateKit({
      assets: [
        ...activeKit.assets,
        { id: createId(), label: `Brand image ${activeKit.assets.length + 1}`, role: "Brand image", dataUrl: "", type: "" },
      ],
    });
    flash("Asset slot added.");
  }

  function removeAssetSlot(assetId) {
    updateKit({ assets: activeKit.assets.filter((asset) => asset.id !== assetId) });
    flash("Asset removed.");
  }

  function addColor() {
    const hex = normalizeHex(newColor);
    if (!isHex(hex)) {
      flash("Enter a valid 6-digit HEX color.");
      return;
    }
    updateKit({
      colors: [...activeKit.colors, { id: createId(), name: newColorName.trim() || "Custom", value: hex }],
    });
    setNewColorName("Custom");
    flash("Color added.");
  }

  function updateColor(id, patch) {
    updateKit({
      colors: activeKit.colors.map((color) => (color.id === id ? { ...color, ...patch } : color)),
    });
  }

  function addLink() {
    if (!newLinkLabel.trim()) {
      flash("Link label is required.");
      return;
    }
    if (!validUrl(newLinkUrl)) {
      flash("Enter a valid link.");
      return;
    }
    updateKit({
      links: [...activeKit.links, { id: createId(), label: newLinkLabel.trim(), url: newLinkUrl.trim() }],
    });
    setNewLinkLabel("Portfolio");
    setNewLinkUrl("");
    flash("Link added.");
  }

  function copySummary() {
    const text = [
      `${activeKit.name} Brand Kit`,
      activeKit.tagline,
      "",
      `Industry: ${activeKit.industry}`,
      `Website: ${activeKit.website}`,
      `Contact: ${activeKit.contact}`,
      "",
      "Colors:",
      ...activeKit.colors.map((color) => `- ${color.name}: ${color.value}`),
      "",
      `Heading font: ${activeKit.typography.heading}`,
      `Body font: ${activeKit.typography.body}`,
      "",
      "Guidelines:",
      activeKit.guidelines.voice,
      activeKit.guidelines.messaging,
      activeKit.guidelines.designRules,
    ].join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => flash("Brand summary copied."))
      .catch(() => {
        downloadText(`${cleanFilename(activeKit.name)}-summary.txt`, text);
        flash("Clipboard blocked. Summary downloaded.");
      });
  }

  function exportJson() {
    downloadText(`${cleanFilename(activeKit.name)}.json`, JSON.stringify(activeKit, null, 2), "application/json");
  }

  if (!activeKit) return null;

  const safeColors = activeKit.colors.filter((color) => isHex(color.value));
  const primary = safeColors[0]?.value || "#3B82F6";
  const secondary = safeColors[1]?.value || "#111827";
  const accent = safeColors[2]?.value || "#8B5CF6";
  const paletteGradient = safeColors.length
    ? `linear-gradient(90deg, ${safeColors.map((color) => color.value).join(", ")})`
    : "linear-gradient(90deg, #3B82F6, #8B5CF6)";
  const logo = activeKit.assets.find((asset) => asset.dataUrl)?.dataUrl;

  return (
    <div className="brand-kit-manager min-h-screen bg-(--background) px-4 py-10 font-secondary text-(--foreground) selection:bg-blue-500/25">
      <div className="mx-auto max-w-[1440px]">
        <motion.header initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-(--border) bg-(--card) px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-(--primary)">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-(--primary) opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-(--primary)" />
            </span>
            <span className="min-w-0 break-words">Brand System Workspace</span>
          </div>
          <h1 className="heading !text-4xl font-black tracking-tight md:!text-6xl">Brand Kit Manager</h1>
          <p className="description mx-auto mt-3 max-w-2xl text-sm opacity-80 md:text-base">
            Build live brand profiles with logos, palettes, typography, links, guidelines, and export-ready previews.
          </p>
        </motion.header>

        <AnimatePresence>
          {notice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed right-4 top-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-(--border) bg-(--card) px-4 py-3 text-sm font-bold text-(--foreground) shadow-xl"
            >
              {notice}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Brand kits", value: stats.kits, icon: Badge },
            { label: "Assets uploaded", value: stats.assets, icon: ImageIcon },
            { label: "Colors saved", value: stats.colors, icon: Palette },
            { label: "Fonts configured", value: stats.fonts, icon: Type },
          ].map((item) => (
            <GlassCard key={item.label} className="p-4">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-(--foreground)">{item.value}</p>
                </div>
                <div className="shrink-0 rounded-2xl bg-(--muted) p-2 text-(--primary)">
                  <item.icon size={18} />
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <aside className="contents">
            <GlassCard
              title="Saved Kits"
              icon={Layers}
              action={
                <button onClick={addKit} className="inline-flex min-w-0 items-center gap-1 rounded-xl bg-(--primary) px-3 py-2 text-xs font-black uppercase text-(--primary-foreground)">
                  <Plus size={14} /> New
                </button>
              }
            >
              <div className="max-h-[390px] space-y-2 overflow-y-auto pr-1">
                {kits.map((kit) => (
                  <button
                    key={kit.id}
                    onClick={() => setActiveId(kit.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition-all ${
                      kit.id === activeKit.id
                        ? "border-(--primary) bg-(--muted)"
                        : "border-(--border) bg-(--background) hover:border-(--primary)"
                    }`}
                  >
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-(--border) bg-(--background)">
                        {kit.assets.find((asset) => asset.dataUrl)?.dataUrl ? (
                          <img src={kit.assets.find((asset) => asset.dataUrl)?.dataUrl} alt="" className="h-full w-full object-contain p-1" />
                        ) : (
                          <Badge size={16} className="text-(--muted-foreground)" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-black leading-snug text-(--foreground)">{kit.name || "Untitled brand"}</p>
                        <p className="mt-1 break-words text-[11px] font-semibold text-muted-foreground">{kit.industry || "No industry"}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Export" icon={Download} className="p-4">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <button onClick={copySummary} className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--primary) px-2.5 py-2 text-[10px] font-black uppercase text-(--primary-foreground)">
                  <Copy size={12} /> Copy Summary
                </button>
                <button onClick={exportJson} className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-2.5 py-2 text-[10px] font-black uppercase text-(--foreground)">
                  <Download size={12} /> Export JSON
                </button>
                <button onClick={duplicateKit} className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-2.5 py-2 text-[10px] font-black uppercase text-(--foreground)">
                  <Copy size={12} /> Duplicate
                </button>
                <button onClick={() => window.print()} className="flex w-full min-w-0 items-center justify-center gap-1.5 rounded-xl border border-(--border) bg-(--background) px-2.5 py-2 text-[10px] font-black uppercase text-(--foreground)">
                  <Printer size={12} /> Print
                </button>
                <button onClick={resetActiveKit} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-2.5 py-2 text-[10px] font-black uppercase text-amber-600">
                  <RefreshCw size={12} /> Reset
                </button>
                <button onClick={() => deleteKit(activeKit.id)} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-2.5 py-2 text-[10px] font-black uppercase text-red-500">
                  <Trash2 size={12} /> Delete
                </button>
              </div>
            </GlassCard>
          </aside>

          <main className="contents">
            <GlassCard title="Brand Profile" icon={Sparkles}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Brand name" value={activeKit.name} onChange={(name) => updateKit({ name })} error={errors.name} />
                <Field label="Tagline" value={activeKit.tagline} onChange={(tagline) => updateKit({ tagline })} />
                <Field label="Industry" value={activeKit.industry} onChange={(industry) => updateKit({ industry })} />
                <Field label="Website" value={activeKit.website} onChange={(website) => updateKit({ website })} error={errors.website} />
                <Field label="Contact info" value={activeKit.contact} onChange={(contact) => updateKit({ contact })} />
                <Field label="Owner notes" value={activeKit.ownerNotes} onChange={(ownerNotes) => updateKit({ ownerNotes })} />
                <div className="md:col-span-2">
                  <Field label="Description" value={activeKit.description} onChange={(description) => updateKit({ description })} multiline />
                </div>
              </div>
            </GlassCard>

            <GlassCard
              title="Logo & Asset Manager"
              icon={Upload}
              action={
                <button onClick={addAssetSlot} className="inline-flex min-w-0 items-center gap-1 rounded-xl bg-(--primary) px-3 py-2 text-xs font-black uppercase text-(--primary-foreground)">
                  <Plus size={14} /> Asset
                </button>
              }
            >
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeKit.assets.map((asset) => (
                  <div key={asset.id} className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3">
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <input
                          value={asset.label}
                          onChange={(e) => updateAsset(asset.id, { label: e.target.value })}
                          className="w-full rounded-lg bg-transparent text-sm font-black text-(--foreground) outline-none"
                        />
                        <p className="break-words text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{asset.role}</p>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        {asset.dataUrl && (
                          <button onClick={() => updateAsset(asset.id, { dataUrl: "", fileName: "", type: "", size: 0 })} className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600" title="Clear upload">
                            <X size={14} />
                          </button>
                        )}
                        {asset.role === "Brand image" && (
                          <button onClick={() => removeAssetSlot(asset.id)} className="rounded-lg bg-red-500/10 p-1.5 text-red-500" title="Delete asset slot">
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-2xl border border-dashed border-(--border) bg-(--background)">
                      {asset.dataUrl ? (
                        <img src={asset.dataUrl} alt={asset.label} className="h-full w-full object-contain p-3" />
                      ) : (
                        <div className="text-center text-(--muted-foreground)">
                          <ImageIcon className="mx-auto mb-2" size={22} />
                          <p className="text-[11px] font-bold">No asset uploaded</p>
                        </div>
                      )}
                    </div>
                    <input
                      ref={(node) => {
                        fileRefs.current[asset.id] = node;
                      }}
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg,.webp,image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={(e) => {
                        uploadAsset(asset.id, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                      className="hidden"
                    />
                    <button onClick={() => fileRefs.current[asset.id]?.click()} className="flex w-full min-w-0 items-center justify-center gap-2 rounded-xl bg-(--primary) px-3 py-2.5 text-xs font-black uppercase text-(--primary-foreground)">
                      <Upload size={14} /> {asset.dataUrl ? "Replace" : "Upload"}
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Color Palette" icon={SwatchBook}>
              <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_150px_auto]">
                <Field label="Color name" value={newColorName} onChange={setNewColorName} />
                <label>
                  <span className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">HEX</span>
                  <div className="flex overflow-hidden rounded-2xl border border-(--border) bg-(--background)">
                    <input type="color" value={isHex(normalizeHex(newColor)) ? normalizeHex(newColor) : "#000000"} onChange={(e) => setNewColor(e.target.value)} className="h-12 w-12 shrink-0 border-0 bg-transparent" />
                    <input value={newColor} onChange={(e) => setNewColor(e.target.value)} className="min-w-0 flex-1 bg-transparent px-2 text-xs font-black uppercase outline-none" />
                  </div>
                </label>
                <button onClick={addColor} className="self-end rounded-xl bg-(--primary) px-4 py-3 text-xs font-black uppercase text-(--primary-foreground)">
                  Add
                </button>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {activeKit.colors.map((color) => (
                  <div key={color.id} className="min-w-0 rounded-2xl border border-(--border) bg-(--background) p-3">
                    <div
                      className="mb-3 h-20 rounded-2xl border border-black/10 shadow-inner"
                      style={{
                        background: isHex(color.value)
                          ? color.value
                          : "repeating-linear-gradient(45deg, #fee2e2, #fee2e2 8px, #fecaca 8px, #fecaca 16px)",
                      }}
                    />
                    <div className="flex min-w-0 flex-wrap gap-2">
                      <input value={color.name} onChange={(e) => updateColor(color.id, { name: e.target.value })} className="min-w-[120px] flex-1 rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-xs font-bold outline-none" />
                      <input
                        value={color.value}
                        onChange={(e) => {
                          const hex = normalizeHex(e.target.value);
                          updateColor(color.id, { value: hex });
                        }}
                        className={`min-w-[96px] flex-1 rounded-xl border px-3 py-2 text-xs font-black uppercase outline-none ${isHex(color.value) ? "border-(--border) bg-(--card)" : "border-red-500/60 bg-red-500/5"}`}
                      />
                      <button onClick={() => updateKit({ colors: activeKit.colors.filter((item) => item.id !== color.id) })} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Typography" icon={Type}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Heading font" value={activeKit.typography.heading} onChange={(heading) => updateNested("typography", { heading })} />
                <Field label="Body font" value={activeKit.typography.body} onChange={(body) => updateNested("typography", { body })} />
                <div className="md:col-span-2">
                  <Field label="Font hierarchy" value={activeKit.typography.hierarchy} onChange={(hierarchy) => updateNested("typography", { hierarchy })} multiline />
                </div>
                <div className="md:col-span-2">
                  <Field label="Typography notes" value={activeKit.typography.notes} onChange={(notes) => updateNested("typography", { notes })} multiline />
                </div>
              </div>
            </GlassCard>

            <GlassCard title="Social & Brand Links" icon={Link}>
              <div className="mb-4 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                <Field label="Label" value={newLinkLabel} onChange={setNewLinkLabel} />
                <Field label="URL" value={newLinkUrl} onChange={setNewLinkUrl} error={newLinkUrl && !validUrl(newLinkUrl) ? "Invalid URL." : ""} />
                <button onClick={addLink} className="self-end rounded-xl bg-(--primary) px-4 py-3 text-xs font-black uppercase text-(--primary-foreground)">
                  Add Link
                </button>
              </div>
              <div className="space-y-2">
                {activeKit.links.map((linkItem) => (
                  <div key={linkItem.id} className="grid grid-cols-1 gap-2 rounded-2xl border border-(--border) bg-(--background) p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]">
                    <input value={linkItem.label} onChange={(e) => updateKit({ links: activeKit.links.map((item) => (item.id === linkItem.id ? { ...item, label: e.target.value } : item)) })} className="min-w-0 rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-xs font-bold outline-none" />
                    <div>
                      <input value={linkItem.url} onChange={(e) => updateKit({ links: activeKit.links.map((item) => (item.id === linkItem.id ? { ...item, url: e.target.value } : item)) })} className={`w-full min-w-0 rounded-xl border px-3 py-2 text-xs outline-none ${errors.links[linkItem.id] ? "border-red-500/60 bg-red-500/5" : "border-(--border) bg-(--card)"}`} />
                      {errors.links[linkItem.id] && <p className="mt-1 text-[10px] font-bold text-red-500">{errors.links[linkItem.id]}</p>}
                    </div>
                    <button onClick={() => updateKit({ links: activeKit.links.filter((item) => item.id !== linkItem.id) })} className="rounded-xl bg-red-500/10 px-3 py-2 text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard title="Brand Guidelines" icon={BookOpen}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Voice & tone" value={activeKit.guidelines.voice} onChange={(voice) => updateNested("guidelines", { voice })} multiline />
                <Field label="Messaging guidelines" value={activeKit.guidelines.messaging} onChange={(messaging) => updateNested("guidelines", { messaging })} multiline />
                <Field label="Design rules" value={activeKit.guidelines.designRules} onChange={(designRules) => updateNested("guidelines", { designRules })} multiline />
                <Field label="Content instructions" value={activeKit.guidelines.content} onChange={(content) => updateNested("guidelines", { content })} multiline />
                <Field label="Brand reminders" value={activeKit.guidelines.reminders} onChange={(reminders) => updateNested("guidelines", { reminders })} multiline />
                <Field label="Visual notes" value={activeKit.guidelines.visualNotes} onChange={(visualNotes) => updateNested("guidelines", { visualNotes })} multiline />
              </div>
            </GlassCard>
          </main>

          <aside className="contents">
            <GlassCard title="Live Brand Preview" icon={Globe}>
              <div className="overflow-hidden rounded-2xl border border-(--border) bg-(--background) text-(--foreground) shadow-md">
                <div className="rounded-t-3xl p-4" style={{ background: `linear-gradient(135deg, ${primary}, ${accent})` }}>
                  <div className="flex min-w-0 flex-col items-start gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-(--border) bg-(--background) shadow-lg">
                      {logo ? <img src={logo} alt={activeKit.name} className="h-full w-full object-contain p-2" /> : <Badge className="text-(--muted-foreground)" size={22} />}
                    </div>
                    <div className="w-full min-w-0 text-white">
                      <h2 className="break-words text-xl font-black leading-tight" style={{ fontFamily: activeKit.typography.heading }}>
                        {activeKit.name || "Untitled brand"}
                      </h2>
                      <p className="mt-1 break-words text-xs font-semibold leading-snug opacity-90">{activeKit.tagline || "Brand tagline"}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 p-4">
                  <p className="break-words text-sm leading-relaxed text-(--muted-foreground)" style={{ fontFamily: activeKit.typography.body }}>
                    {activeKit.description || "Add a brand description to preview messaging."}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {safeColors.slice(0, 8).map((color) => (
                      <div key={color.id} className="min-w-0">
                        <div className="h-10 rounded-xl border border-black/10" style={{ background: color.value }} />
                        <p className="mt-1 break-words text-[8px] font-black uppercase leading-tight text-(--muted-foreground)">{color.name}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl border border-(--border) bg-(--card) p-4">
                    <p className="break-words text-lg font-black leading-tight" style={{ color: secondary, fontFamily: activeKit.typography.heading }}>
                      Typography Preview
                    </p>
                    <p className="mt-2 break-words text-xs leading-relaxed text-(--muted-foreground)" style={{ fontFamily: activeKit.typography.body }}>
                      {activeKit.typography.notes || "Typography notes appear here."}
                    </p>
                  </div>
                  <div className="space-y-2">
                    {activeKit.links.slice(0, 4).map((item) => (
                      <a key={item.id} href={validUrl(item.url) && item.url ? item.url : undefined} target="_blank" rel="noreferrer" className="flex min-w-0 items-center justify-between gap-2 rounded-xl border border-(--border) bg-(--card) px-3 py-2 text-xs font-bold text-(--foreground)">
                        <span className="min-w-0 break-words">{item.label}</span>
                        <ExternalLink size={12} className="shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border border-(--border) bg-(--background) p-4 text-xs text-muted-foreground">
                <p className="break-words">
                  Last updated: <span className="font-bold text-(--foreground)">{readableDate(activeKit.updatedAt)}</span>
                </p>
                <p className="mt-2 break-words">Validation: {errors.name || errors.website ? "Needs attention" : "Ready for export"}</p>
              </div>
            </GlassCard>

            <GlassCard title="Brand Sheet" icon={FileText}>
              <div className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                <p className="break-words"><strong className="text-(--foreground)">Voice:</strong> {activeKit.guidelines.voice || "Not set"}</p>
                <p className="break-words"><strong className="text-(--foreground)">Messaging:</strong> {activeKit.guidelines.messaging || "Not set"}</p>
                <p className="break-words"><strong className="text-(--foreground)">Design:</strong> {activeKit.guidelines.designRules || "Not set"}</p>
                <div className="rounded-2xl border border-(--border) bg-(--background) p-4">
                  <p className="mb-3 break-words text-[10px] font-black uppercase tracking-widest text-muted-foreground">Palette Gradient</p>
                  <div className="h-14 rounded-xl" style={{ background: paletteGradient }} />
                </div>
              </div>
            </GlassCard>
          </aside>
        </div>

        <FooterCards />
      </div>
      <style jsx global>{`
        .brand-kit-manager,
        .brand-kit-manager * {
          overflow-wrap: anywhere;
        }
        .brand-kit-manager input,
        .brand-kit-manager textarea,
        .brand-kit-manager select,
        .brand-kit-manager button {
          min-width: 0;
        }
      `}</style>
    </div>
  );
}
