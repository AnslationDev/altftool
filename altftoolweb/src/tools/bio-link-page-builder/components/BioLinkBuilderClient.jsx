"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { QRCodeCanvas } from "qrcode.react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Briefcase,
  Check,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Github,
  Globe,
  GripVertical,
  ImagePlus,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Palette,
  Plus,
  RotateCcw,
  Share2,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  Twitter,
  Type,
  User,
  Youtube,
} from "lucide-react";

const STORAGE_KEY = "altf.bioLinkBuilder.v3";
const BIO_LIMIT = 180;

const platformOptions = [
  { key: "website", label: "Website", icon: Globe, color: "#38bdf8" },
  { key: "instagram", label: "Instagram", icon: Instagram, color: "#e1306c" },
  { key: "youtube", label: "YouTube", icon: Youtube, color: "#ff0033" },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin, color: "#0a66c2" },
  { key: "x", label: "X / Twitter", icon: Twitter, color: "#111827" },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "#25d366" },
  { key: "github", label: "GitHub", icon: Github, color: "#6b7280" },
  { key: "portfolio", label: "Portfolio", icon: Briefcase, color: "#a78bfa" },
  { key: "store", label: "Store", icon: ShoppingBag, color: "#fb7185" },
  { key: "contact", label: "Contact", icon: Mail, color: "#22c55e" },
  { key: "custom", label: "Custom", icon: Star, color: "#facc15" },
];

const themePresets = [
  {
    key: "aurora",
    name: "Aurora Glass",
    bg: "linear-gradient(145deg, #0f172a 0%, #11335b 48%, #5b2148 100%)",
    accent: "#38bdf8",
    text: "#f8fafc",
  },
  {
    key: "mint",
    name: "Mint Studio",
    bg: "linear-gradient(145deg, #06281f 0%, #155e75 54%, #f59e0b 130%)",
    accent: "#34d399",
    text: "#ecfeff",
  },
  {
    key: "mono",
    name: "Graphite Pro",
    bg: "linear-gradient(145deg, #030712 0%, #1f2937 58%, #64748b 130%)",
    accent: "#e5e7eb",
    text: "#f9fafb",
  },
  {
    key: "sunset",
    name: "Sunset Neon",
    bg: "linear-gradient(145deg, #190019 0%, #7c2d12 48%, #0e7490 120%)",
    accent: "#fb7185",
    text: "#fff7ed",
  },
];

const fontOptions = [
  { key: "manrope", label: "Manrope", className: "font-secondary" },
  { key: "serif", label: "Editorial", className: "font-serif" },
  { key: "mono", label: "Mono", className: "font-mono" },
];

const buttonStyles = [
  { key: "glass", label: "Glass" },
  { key: "solid", label: "Solid" },
  { key: "outline", label: "Outline" },
];

const starterProject = {
  profile: {
    fullName: "",
    username: "",
    tagline: "",
    bio: "",
    contact: "",
    image: "",
  },
  links: [],
  theme: {
    preset: "aurora",
    accent: "#38bdf8",
    buttonStyle: "glass",
    font: "manrope",
    radius: 22,
    showBranding: true,
  },
};

function normalizeUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || /^tel:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(value) {
  const normalized = normalizeUrl(value);
  if (!normalized) return false;
  try {
    const url = new URL(normalized);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function getPlatform(key) {
  return platformOptions.find((item) => item.key === key) || platformOptions[0];
}

function safeSlug(value) {
  return (value || "creator")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);
}

export default function BioLinkBuilderClient() {
  const { theme } = useTheme();
  const [project, setProject] = useState(() => {
    if (typeof window === "undefined") return starterProject;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...starterProject, ...JSON.parse(saved) } : starterProject;
    } catch {
      return starterProject;
    }
  });
  const [activePanel, setActivePanel] = useState("profile");
  const [notice, setNotice] = useState("Autosaved locally");
  const [previewMode, setPreviewMode] = useState(false);
  const [draft, setDraft] = useState({
    label: "",
    url: "",
    platform: "website",
    description: "",
    featured: false,
  });
  const fileRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      console.warn("Bio Link Builder project could not be saved.");
    }
  }, [project]);

  const preset = useMemo(
    () => themePresets.find((item) => item.key === project.theme.preset) || themePresets[0],
    [project.theme.preset]
  );
  const publicUrl = project.profile.username ? `https://altftool.com/bio/${safeSlug(project.profile.username)}` : "";
  const validLinks = project.links.filter((link) => link.label.trim() && isValidUrl(link.url));
  const errors = useMemo(
    () =>
      project.links.reduce((items, link) => {
        if (!link.label.trim() || !link.url.trim()) items[link.id] = "Label and URL are required.";
        else if (!isValidUrl(link.url)) items[link.id] = "Enter a valid URL.";
        return items;
      }, {}),
    [project.links]
  );

  const updateProfile = (field, value) => {
    setProject((current) => ({
      ...current,
      profile: { ...current.profile, [field]: field === "bio" ? value.slice(0, BIO_LIMIT) : value },
    }));
  };

  const updateTheme = (field, value) => {
    setProject((current) => ({
      ...current,
      theme: { ...current.theme, [field]: value },
    }));
  };

  const choosePreset = (nextPreset) => {
    const selected = themePresets.find((item) => item.key === nextPreset);
    setProject((current) => ({
      ...current,
      theme: { ...current.theme, preset: nextPreset, accent: selected?.accent || current.theme.accent },
    }));
  };

  const updateLink = (id, field, value) => {
    setProject((current) => ({
      ...current,
      links: current.links.map((link) => (link.id === id ? { ...link, [field]: value } : link)),
    }));
  };

  const addLink = () => {
    if (!draft.label.trim() || !draft.url.trim() || !isValidUrl(draft.url)) {
      setNotice("Add a link label and valid URL first.");
      return;
    }

    setProject((current) => ({
      ...current,
      links: [
        ...current.links,
        {
          ...draft,
          id: `${Date.now()}`,
          label: draft.label.trim(),
          url: normalizeUrl(draft.url),
          description: draft.description.trim(),
        },
      ],
    }));
    setDraft({ label: "", url: "", platform: "website", description: "", featured: false });
    setNotice("Link added");
  };

  const duplicateLink = (link) => {
    setProject((current) => ({
      ...current,
      links: [...current.links, { ...link, id: `${Date.now()}`, label: `${link.label} copy` }],
    }));
  };

  const deleteLink = (id) => {
    setProject((current) => ({
      ...current,
      links: current.links.filter((link) => link.id !== id),
    }));
  };

  const onDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setProject((current) => {
      const oldIndex = current.links.findIndex((link) => link.id === active.id);
      const newIndex = current.links.findIndex((link) => link.id === over.id);
      return { ...current, links: arrayMove(current.links, oldIndex, newIndex) };
    });
  };

  const handleImage = (file) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setNotice("Use PNG, JPG, or WEBP for the profile image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => updateProfile("image", reader.result);
    reader.readAsDataURL(file);
  };

  const exportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${safeSlug(project.profile.username)}-bio-link-page.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("Export downloaded");
  };

  const copyShareLink = async () => {
    if (!publicUrl) {
      setNotice("Add a username before copying a profile link.");
      return;
    }
    try {
      await navigator.clipboard.writeText(publicUrl);
      setNotice("Profile link copied");
    } catch {
      setNotice(publicUrl);
    }
  };

  const resetProject = () => {
    setProject(starterProject);
    setNotice("Builder reset to starter page");
  };

  const pageBg =
    theme === "dark"
      ? "bg-[#07111f] text-gray-100 border-white/10"
      : "bg-[#f7fbff] text-gray-900 border-slate-200";
  const panelBg =
    theme === "dark"
      ? "bg-white/[0.07] border-white/10 shadow-black/30"
      : "bg-white/90 border-white shadow-slate-200/80";
  const subtleText = theme === "dark" ? "text-slate-300" : "text-slate-600";

  return (
    <main className={`relative w-full max-w-[880px] mx-auto rounded-[1.75rem] border ${pageBg} transition-colors duration-300 overflow-hidden`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(56,189,248,0.20),transparent_30%),radial-gradient(circle_at_92%_10%,rgba(251,113,133,0.14),transparent_28%),linear-gradient(135deg,rgba(37,99,235,0.06),transparent_45%)] pointer-events-none" />
      <section className="relative border-b border-white/30 dark:border-white/10 bg-white/55 dark:bg-gray-950/35 backdrop-blur-2xl">
        <div className="relative px-4 sm:px-5 lg:px-6 py-6">
          <div className="flex flex-col items-center text-center gap-6">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-500 dark:text-cyan-300 text-xs font-black uppercase tracking-widest mb-5">
                <Sparkles className="h-4 w-4" />
                Creator tool
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1e3a8a] dark:text-blue-400">
                Bio Link Page Builder
              </h1>
              <p className={`mt-3 text-base leading-relaxed ${subtleText}`}>
                Build a polished link-in-bio page with profile branding, sortable links, saved edits, QR sharing, and an accurate phone preview.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <button onClick={copyShareLink} className="btn-primary px-4 py-3 inline-flex items-center gap-2 shadow-lg shadow-blue-600/20">
                <Copy className="h-4 w-4" />
                Copy Link
              </button>
              <button onClick={exportProject} className="btn-secondary px-4 py-3 inline-flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              ["Links", project.links.length, ExternalLink],
              ["Ready", validLinks.length, Check],
              ["Theme", preset.name, Palette],
            ].map(([label, value, Icon]) => (
              <div key={label} className="rounded-2xl border border-white/50 dark:border-white/10 bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl p-4 shadow-sm min-w-0">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="h-10 w-10 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-cyan-300 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">{label}</p>
                    <p className="text-lg font-black leading-snug text-gray-950 dark:text-white break-words">{value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 sm:px-5 lg:px-6 py-5 sm:py-6">
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-7 items-start">
          <div className="2xl:col-span-6 space-y-6 min-w-0">
            <div className={`rounded-3xl border ${panelBg} backdrop-blur-2xl p-2.5 transition-all`}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  ["profile", User, "Profile"],
                  ["links", ExternalLink, "Links"],
                  ["theme", Palette, "Theme"],
                  ["share", Share2, "Share"],
                ].map(([key, Icon, label]) => (
                  <button
                    key={key}
                    onClick={() => setActivePanel(key)}
                    className={`h-12 px-3 rounded-2xl inline-flex items-center justify-center gap-2 text-sm font-extrabold transition-all ${
                      activePanel === key
                        ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-600/25"
                        : "bg-white/65 dark:bg-white/[0.06] text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {activePanel === "profile" && (
              <EditorPanel title="Profile Setup" icon={User} panelBg={panelBg} subtitle={`${project.profile.bio.length}/${BIO_LIMIT} bio characters`}>
                <div className="grid md:grid-cols-[150px_1fr] gap-5">
                  <div className="space-y-3 flex md:block justify-center">
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="group w-32 h-32 sm:w-36 sm:h-36 rounded-3xl border border-white/30 bg-white/70 dark:bg-white/10 overflow-hidden relative flex items-center justify-center shadow-inner shrink-0"
                    >
                      {project.profile.image ? (
                        <img src={project.profile.image} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-500 dark:text-gray-300">
                          <ImagePlus className="h-8 w-8 mx-auto mb-2" />
                          <span className="text-xs font-bold">Upload image</span>
                        </div>
                      )}
                      <span className="absolute inset-x-0 bottom-0 py-2 text-xs font-black text-white bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity">
                        Change
                      </span>
                    </button>
                    <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleImage(event.target.files?.[0])} className="hidden" />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 min-w-0">
                    <Field label="Full name" value={project.profile.fullName} onChange={(value) => updateProfile("fullName", value)} />
                    <Field label="Username" value={project.profile.username} onChange={(value) => updateProfile("username", value.replace(/\s/g, ""))} prefix="@" />
                    <Field label="Tagline" value={project.profile.tagline} onChange={(value) => updateProfile("tagline", value)} className="sm:col-span-2" />
                    <Field label="Contact" value={project.profile.contact} onChange={(value) => updateProfile("contact", value)} className="sm:col-span-2" />
                    <label className="sm:col-span-2 block min-w-0">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Bio</span>
                      <textarea
                        rows={4}
                        value={project.profile.bio}
                        onChange={(event) => updateProfile("bio", event.target.value)}
                        className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400 resize-none"
                      />
                    </label>
                  </div>
                </div>
              </EditorPanel>
            )}

            {activePanel === "links" && (
              <EditorPanel title="Bio Link Builder" icon={ExternalLink} panelBg={panelBg} subtitle={`${validLinks.length}/${project.links.length} publish-ready links`}>
                <div className="rounded-3xl border border-dashed border-cyan-400/30 bg-cyan-400/5 p-4 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Button label" value={draft.label} onChange={(value) => setDraft((current) => ({ ...current, label: value }))} />
                    <Field label="URL" value={draft.url} onChange={(value) => setDraft((current) => ({ ...current, url: value }))} placeholder="https://..." />
                    <label className="block min-w-0">
                      <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Icon</span>
                      <select
                        value={draft.platform}
                        onChange={(event) => setDraft((current) => ({ ...current, platform: event.target.value }))}
                        className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-cyan-400"
                      >
                        {platformOptions.map((item) => (
                          <option key={item.key} value={item.key}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Field label="Description" value={draft.description} onChange={(value) => setDraft((current) => ({ ...current, description: value }))} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <input type="checkbox" checked={draft.featured} onChange={(event) => setDraft((current) => ({ ...current, featured: event.target.checked }))} />
                      Feature this link
                    </label>
                    <button onClick={addLink} className="btn-primary px-4 py-2.5 inline-flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Link
                    </button>
                  </div>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={project.links.map((link) => link.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                      {project.links.map((link) => (
                        <SortableLinkCard
                          key={link.id}
                          link={link}
                          error={errors[link.id]}
                          onChange={updateLink}
                          onDuplicate={duplicateLink}
                          onDelete={deleteLink}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </EditorPanel>
            )}

            {activePanel === "theme" && (
              <EditorPanel title="Theme & Branding" icon={Palette} panelBg={panelBg} subtitle={preset.name}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {themePresets.map((item) => (
                    <button
                      key={item.key}
                      onClick={() => choosePreset(item.key)}
                      className={`text-left rounded-3xl border p-4 transition-all hover:-translate-y-0.5 ${
                        project.theme.preset === item.key ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/20 dark:border-white/10"
                      }`}
                      style={{ background: item.bg }}
                    >
                      <div className="flex items-center justify-between text-white">
                        <span className="font-black">{item.name}</span>
                        {project.theme.preset === item.key && <Check className="h-5 w-5" />}
                      </div>
                      <div className="mt-8 h-2 rounded-full" style={{ backgroundColor: item.accent }} />
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Accent color</span>
                    <input value={project.theme.accent} onChange={(event) => updateTheme("accent", event.target.value)} type="color" className="mt-2 h-12 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-transparent p-1" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Border radius</span>
                    <input value={project.theme.radius} onChange={(event) => updateTheme("radius", Number(event.target.value))} type="range" min="8" max="32" className="mt-5 w-full" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Button style</span>
                    <select value={project.theme.buttonStyle} onChange={(event) => updateTheme("buttonStyle", event.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 px-4 py-3 text-sm outline-none">
                      {buttonStyles.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Typography</span>
                    <select value={project.theme.font} onChange={(event) => updateTheme("font", event.target.value)} className="mt-2 w-full rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 px-4 py-3 text-sm outline-none">
                      {fontOptions.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </EditorPanel>
            )}

            {activePanel === "share" && (
              <EditorPanel title="Saved Project & Share" icon={Share2} panelBg={panelBg} subtitle={notice}>
                <div className="grid md:grid-cols-[1fr_180px] gap-5">
                  <div className="rounded-3xl bg-white/70 dark:bg-white/5 border border-white/30 dark:border-white/10 p-5 min-w-0">
                    <p className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">Simulated public URL</p>
                    <p className="mt-3 text-lg font-black break-all text-gray-950 dark:text-white">
                      {publicUrl || "Add a username to generate your profile link."}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button onClick={copyShareLink} className="btn-primary px-4 py-2.5 inline-flex items-center gap-2">
                        <Copy className="h-4 w-4" />
                        Copy profile link
                      </button>
                      <button onClick={() => setPreviewMode(true)} className="btn-secondary px-4 py-2.5 inline-flex items-center gap-2">
                        <Eye className="h-4 w-4" />
                        Preview mode
                      </button>
                      <button onClick={resetProject} className="btn-secondary px-4 py-2.5 inline-flex items-center gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Reset
                      </button>
                    </div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 flex items-center justify-center min-h-[180px]">
                    {publicUrl ? (
                      <QRCodeCanvas value={publicUrl} size={148} bgColor="#ffffff" fgColor="#0f172a" level="H" />
                    ) : (
                      <span className="text-center text-xs font-black uppercase tracking-widest text-slate-400">QR appears after username</span>
                    )}
                  </div>
                </div>
              </EditorPanel>
            )}
          </div>

          <aside className="2xl:col-span-6 2xl:sticky 2xl:top-24 min-w-0">
            <div className={`rounded-[2rem] border ${panelBg} backdrop-blur-2xl p-4 sm:p-6 ring-1 ring-cyan-400/10`}>
              <PreviewPhone project={project} preset={preset} publicUrl={publicUrl} />
            </div>
          </aside>
        </div>
      </section>

      {previewMode && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl p-4 overflow-y-auto">
          <button onClick={() => setPreviewMode(false)} className="fixed right-4 top-4 z-10 btn-primary px-4 py-2">
            Close
          </button>
          <div className="min-h-full flex items-center justify-center py-10">
            <div className="w-full max-w-sm">
              <PreviewPhone project={project} preset={preset} publicUrl={publicUrl} unframed />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function EditorPanel({ title, subtitle, icon: Icon, panelBg, children }) {
  return (
    <section className={`rounded-[1.75rem] border ${panelBg} backdrop-blur-2xl p-4 sm:p-5 space-y-5 animate-[fadeIn_0.28s_ease-out] ring-1 ring-white/30 dark:ring-white/5`}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl font-black leading-tight text-gray-950 dark:text-white flex items-start gap-2">
            <span className="h-9 w-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-cyan-300 flex items-center justify-center shrink-0">
              <Icon className="h-5 w-5" />
            </span>
            <span className="break-words">{title}</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, className = "", prefix = "", placeholder = "" }) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
      <div className="mt-2 flex items-center rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 focus-within:ring-2 focus-within:ring-cyan-400 overflow-hidden min-w-0">
        {prefix && <span className="pl-4 text-gray-400 font-bold">{prefix}</span>}
        <input
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-w-0 bg-transparent px-4 py-3 text-sm outline-none text-gray-950 dark:text-white placeholder:text-gray-400"
        />
      </div>
    </label>
  );
}

function SortableLinkCard({ link, error, onChange, onDuplicate, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const PlatformIcon = getPlatform(link.platform).icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-3xl border bg-white/75 dark:bg-white/[0.05] p-4 shadow-sm transition-all min-w-0 overflow-hidden ${
        isDragging ? "border-cyan-400 shadow-xl shadow-cyan-400/20 scale-[1.01]" : "border-white/40 dark:border-white/10"
      }`}
    >
      <div className="grid sm:grid-cols-[36px_1fr] gap-3 min-w-0">
        <button {...attributes} {...listeners} className="h-10 w-10 rounded-2xl bg-gray-100 dark:bg-white/10 flex items-center justify-center cursor-grab active:cursor-grabbing shrink-0">
          <GripVertical className="h-5 w-5 text-gray-500" />
        </button>
        <div className="grid sm:grid-cols-2 gap-3 min-w-0">
          <Field label="Label" value={link.label} onChange={(value) => onChange(link.id, "label", value)} />
          <Field label="URL" value={link.url} onChange={(value) => onChange(link.id, "url", value)} />
          <label className="block min-w-0">
            <span className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">Icon</span>
            <div className="mt-2 flex items-center gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/20 px-3 min-w-0 overflow-hidden">
              <PlatformIcon className="h-4 w-4 shrink-0" style={{ color: getPlatform(link.platform).color }} />
              <select value={link.platform} onChange={(event) => onChange(link.id, "platform", event.target.value)} className="w-full min-w-0 bg-transparent py-3 text-sm outline-none">
                {platformOptions.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </label>
          <Field label="Description" value={link.description} onChange={(value) => onChange(link.id, "description", value)} />
        </div>
      </div>
      <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center sm:justify-between gap-3 pl-0 sm:pl-12 min-w-0">
        <div className="min-w-0">
          {error ? (
            <p className="text-xs font-bold text-rose-500 break-words">{error}</p>
          ) : (
            <p className="text-xs font-bold text-emerald-500 inline-flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              Ready for preview
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2 min-w-0">
          <label className="inline-flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-white/10 px-3 py-2 text-xs font-bold min-w-0">
            <input type="checkbox" checked={link.featured} onChange={(event) => onChange(link.id, "featured", event.target.checked)} />
            Featured
          </label>
          <button onClick={() => onDuplicate(link)} className="rounded-xl bg-gray-100 dark:bg-white/10 px-3 py-2 text-xs font-bold hover:bg-blue-500 hover:text-white transition-colors">
            Duplicate
          </button>
          <button onClick={() => onDelete(link.id)} className="rounded-xl bg-rose-500/10 text-rose-500 px-3 py-2 text-xs font-bold hover:bg-rose-500 hover:text-white transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PreviewPhone({ project, preset, publicUrl, unframed = false }) {
  const fontClass = fontOptions.find((item) => item.key === project.theme.font)?.className || "font-secondary";

  return (
    <div className={unframed ? "" : "mx-auto w-full max-w-[420px] rounded-[2.2rem] bg-slate-950 p-2.5 sm:p-3 shadow-2xl shadow-cyan-950/30"}>
      <div
        className={`relative overflow-hidden ${fontClass} ${
          unframed ? "min-h-[760px] rounded-[2rem]" : "h-[min(660px,calc(100vw*1.32))] min-h-[500px] max-h-[700px] rounded-[1.75rem]"
        } border border-white/15`}
        style={{ background: preset.bg, color: preset.text }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.24),transparent_18%),radial-gradient(circle_at_88%_8%,rgba(255,255,255,0.16),transparent_22%)] pointer-events-none" />
        {!unframed && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1.5 w-24 rounded-full bg-white/35 z-10" />
        )}

        <div className="relative z-10 h-full overflow-y-auto no-scrollbar px-4 py-9 sm:px-6">
          <div className="text-center min-w-0">
            <div className="mx-auto h-20 w-20 sm:h-24 sm:w-24 rounded-[2rem] border border-white/30 bg-white/15 backdrop-blur-xl overflow-hidden flex items-center justify-center shadow-xl">
              {project.profile.image ? (
                <img src={project.profile.image} alt={project.profile.fullName || "Profile"} className="h-full w-full object-cover" />
              ) : (
                <User className="h-10 w-10 text-white/80" />
              )}
            </div>
            {project.profile.fullName && (
              <h3 className="mt-4 text-xl sm:text-2xl font-black leading-tight break-words">{project.profile.fullName}</h3>
            )}
            {project.profile.username && (
              <p className="mt-1 text-sm font-bold text-white/75 break-all">@{project.profile.username}</p>
            )}
            {project.profile.tagline && (
              <p className="mt-3 text-sm font-extrabold leading-snug break-words" style={{ color: project.theme.accent }}>
                {project.profile.tagline}
              </p>
            )}
            {project.profile.bio && (
              <p className="mt-3 text-sm leading-relaxed text-white/82 break-words whitespace-pre-wrap">
                {project.profile.bio}
              </p>
            )}
            {project.profile.contact && (
              <p className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-bold text-white/85">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="break-all">{project.profile.contact}</span>
              </p>
            )}
          </div>

          {publicUrl && (
            <div className="mt-7 rounded-3xl border border-white/15 bg-black/20 p-4 backdrop-blur-xl">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-widest text-white/55">Share Card</p>
                  <p className="text-sm font-black break-all">{publicUrl}</p>
                </div>
                <div className="rounded-2xl bg-white p-2 shrink-0">
                  <QRCodeCanvas value={publicUrl} size={58} bgColor="#ffffff" fgColor="#0f172a" />
                </div>
              </div>
            </div>
          )}

          {project.theme.showBranding && (
            <div className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-white/45">
              <Type className="h-3.5 w-3.5" />
              Built with AltFTool
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
