"use client";

import { useState, useEffect, useRef } from "react";
import {
  X, Loader2, CheckCircle2, UploadCloud, Globe,
  Trash2, AlertCircle, Layout,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { upsertDynamicRoute } from "../service/dynamic.service";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import DynamicPreview from "./DynamicPreview";

/* ── Field wrapper ── */
function Field({ label, error, hint, children, required }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-400 text-xs">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-slate-400 leading-relaxed">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ── Text input ── */
function Input({ error, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-slate-300
        focus:outline-none focus:ring-2 transition-all duration-150
        ${error
          ? "border-rose-300 focus:ring-rose-400/20 focus:border-rose-400"
          : "border-slate-200 focus:ring-blue-400/20 focus:border-blue-400 hover:border-slate-300"
        } ${className}`}
    />
  );
}

/* ── Toggle switch ── */
function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:ring-offset-1
        disabled:opacity-40 disabled:cursor-not-allowed
        ${checked ? "bg-emerald-500" : "bg-slate-200"}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0
          transition-transform duration-200
          ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

/* ── Upload/URL mode toggle ── */
function ModeToggle({ value, onChange, disabled }) {
  return (
    <div className="flex gap-0.5 p-1 bg-slate-100 rounded-xl w-fit">
      {["upload", "url"].map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          disabled={disabled}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150
            ${value === mode
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
            } disabled:opacity-40`}
        >
          {mode === "upload"
            ? <><UploadCloud className="w-3 h-3" />Upload</>
            : <><Globe className="w-3 h-3" />URL</>}
        </button>
      ))}
    </div>
  );
}

/* ── Image input (upload or URL) ── */
function ImageInput({ value, mode, onModeChange, onUpload, onChange, onRemove,
  uploading, uploadProgress, fileInputRef,
  placeholder = "https://example.com/image.jpg",
  previewHeight = "h-40", disabled }) {
  return (
    <div className="space-y-2.5">
      <ModeToggle value={mode} onChange={onModeChange} disabled={disabled} />

      {mode !== "url" ? (
        <>
          {!value ? (
            <div
              onClick={() => !disabled && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all duration-150
                ${disabled
                  ? "opacity-50 pointer-events-none"
                  : "hover:border-blue-300 hover:bg-blue-50/30 border-slate-200 bg-slate-50/50 cursor-pointer"}`}
            >
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center">
                <UploadCloud className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600">
                  Drop or <span className="text-blue-500">browse</span>
                </p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP · Max 2MB</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
              <div className="relative group">
                <img src={value} className={`w-full ${previewHeight} object-cover`} alt="Preview" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={onRemove}
                    disabled={disabled}
                    className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  Uploading…
                </span>
                <span className="font-semibold tabular-nums">{uploadProgress}%</span>
              </div>
              <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              type="url"
              placeholder={placeholder}
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white
                placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                hover:border-slate-300 transition-all duration-150 disabled:opacity-50"
            />
          </div>
          {value && (
            <div className="rounded-xl overflow-hidden border border-slate-200 relative group">
              <img src={value} className={`w-full ${previewHeight} object-cover`} alt="URL preview" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={onRemove}
                  disabled={disabled}
                  className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />Remove
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Section card ── */
function SectionCard({ section, index, onUpdate, uploadImage, slug, loading }) {
  const [collapsed, setCollapsed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const hasContent = section.title || section.tagline || section.image;

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all duration-200
      ${hasContent ? "border-slate-200 shadow-sm" : "border-dashed border-slate-200"}`}>
      {/* Card header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100/80 transition-colors duration-150 text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black
            ${hasContent ? "bg-slate-800 text-white" : "bg-slate-200 text-slate-500"}`}>
            {index + 1}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-700">
              {section.title || `Section ${index + 1}`}
            </p>
            {section.tagline && (
              <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{section.tagline}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasContent && (
            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Has content
            </span>
          )}
          {collapsed
            ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            : <ChevronUp className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {/* Card body */}
      {!collapsed && (
        <div className="p-4 space-y-4 bg-white">
          <Field label="Section Title" hint="Main heading displayed in this section">
            <Input
              value={section.title}
              placeholder={`e.g. Feature ${index + 1}`}
              onChange={(e) => onUpdate(index, "title", e.target.value)}
              disabled={loading}
            />
          </Field>

          <Field label="Tagline" hint="Short supporting text shown below the title">
            <Input
              value={section.tagline}
              placeholder="e.g. Supercharge your workflow…"
              onChange={(e) => onUpdate(index, "tagline", e.target.value)}
              disabled={loading}
            />
          </Field>

          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Section Image</p>
            <ImageInput
              value={section.image}
              mode={section.mode || "upload"}
              onModeChange={(mode) => onUpdate(index, "mode", mode)}
              onUpload={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                  emitAlert({ type: "error", message: "Max size 2MB" });
                  return;
                }
                setUploading(true);
                try {
                  const url = await uploadImage(file, `dynamic/${slug}/section-${index}`, setProgress);
                  onUpdate(index, "image", url);
                } finally {
                  setUploading(false);
                  setProgress(0);
                }
              }}
              onChange={(val) => onUpdate(index, "image", val)}
              onRemove={() => onUpdate(index, "image", "")}
              uploading={uploading}
              uploadProgress={progress}
              fileInputRef={fileRef}
              previewHeight="h-32"
              disabled={loading}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function DynamicConfigModal({ data, onClose, refresh }) {
  const isEdit = !!data;

  const [name, setName] = useState(data?.name || "");
  const [slug, setSlug] = useState(data?.slug || "");
  const [enabled, setEnabled] = useState(data?.enabled || false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [step, setStep] = useState("idle");
  const [slugTouched, setSlugTouched] = useState(false);

  const [sections, setSections] = useState(
    data?.sections || [
      { title: "", tagline: "", image: "", mode: "upload" },
      { title: "", tagline: "", image: "", mode: "upload" },
      { title: "", tagline: "", image: "", mode: "upload" },
    ],
  );

  const [hero, setHero] = useState(
    data?.hero || { title: "", banner: "", mode: "upload" },
  );

  const [heroBannerUploading, setHeroBannerUploading] = useState(false);
  const [heroBannerProgress, setHeroBannerProgress] = useState(0);
  const heroFileRef = useRef(null);

  /* ── Auto-slug from name ── */
  useEffect(() => {
    if (slugTouched) return;
    setSlug(
      name.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-").trim(),
    );
  }, [name, slugTouched]);

  /* ── Upload helper ── */
  const uploadImage = (file, path, onProgress) =>
    new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      task.on(
        "state_changed",
        (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => {
          try { resolve(await getDownloadURL(task.snapshot.ref)); }
          catch (e) { reject(e); }
        },
      );
    });

  /* ── Section updater ── */
  const updateSection = (index, field, value) =>
    setSections((prev) =>
      prev.map((sec, i) => (i === index ? { ...sec, [field]: value } : sec)),
    );

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required";
    if (!slug.trim()) e.slug = "Slug is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Save — payload includes enabled, sections, hero untouched ── */
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      setStep("saving");
      const payload = { name: name.trim(), slug, enabled, sections, hero };
      await upsertDynamicRoute(payload);
      logAuditEvent({
        module: "navigation",
        action: "DYNAMIC_ROUTE_UPDATE",
        entityType: "route",
        entityId: "dynamic",
        summary: `Updated dynamic route "${name}"`,
        changes: payload,
        route: "/dynamic",
      });
      emitAlert({ type: "success", message: "Dynamic route updated" });
      setStep("done");
      refresh?.();
      setTimeout(onClose, 600);
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to save" });
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const stepLabel =
    step === "saving" ? "Saving…"
    : step === "done" ? "Saved!"
    : isEdit ? "Save Changes" : "Create Route";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1100px] max-h-[92vh] flex flex-col overflow-hidden border border-slate-200/50">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center shrink-0">
              <Layout className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Configure Route</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEdit ? `Editing: ${data.name}` : "Set up a dynamic header route"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex overflow-hidden min-h-0">

          {/* Left: Form */}
          <div className="w-1/2 overflow-y-auto px-6 py-5 space-y-6 border-r border-slate-100">

            {/* Route identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Route Identity</p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Enable Route — toggle switch wired to `enabled` state saved to Firestore */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50">
                <div>
                  <p className="text-sm font-semibold text-slate-700">Enable Route</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    When enabled, this route appears in the website header.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0 ml-4">
                  <span className={`text-xs font-semibold transition-colors ${enabled ? "text-emerald-600" : "text-slate-400"}`}>
                    {enabled ? "On" : "Off"}
                  </span>
                  <ToggleSwitch
                    checked={enabled}
                    onChange={setEnabled}
                    disabled={loading}
                  />
                </div>
              </div>

              <Field label="Route Name" error={errors.name} hint="Displayed as the nav label in the website header." required>
                <Input
                  value={name}
                  placeholder="e.g. Products"
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrors((p) => ({ ...p, name: undefined }));
                  }}
                  disabled={loading}
                />
              </Field>

              <Field label="Slug" error={errors.slug} hint="Auto-generated from name. Edit manually if needed." required>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono select-none">/</span>
                  <Input
                    value={slug}
                    placeholder="products"
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugTouched(true);
                      setErrors((p) => ({ ...p, slug: undefined }));
                    }}
                    error={errors.slug}
                    disabled={loading}
                    className="pl-6"
                  />
                </div>
              </Field>
            </div>

            {/* Hero section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hero Section</p>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <div className="border border-slate-200 rounded-2xl p-4 space-y-4 bg-slate-50/30">
                <Field label="Hero Title" error={errors.heroTitle} hint="Main heading shown at the top of the page">
                  <Input
                    value={hero.title}
                    placeholder="e.g. Discover Our Products"
                    onChange={(e) => setHero((p) => ({ ...p, title: e.target.value }))}
                    disabled={loading}
                  />
                </Field>

                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hero Banner</p>
                  <ImageInput
                    value={hero.banner}
                    mode={hero.mode || "upload"}
                    onModeChange={(mode) => setHero((p) => ({ ...p, mode }))}
                    onUpload={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      if (file.size > 2 * 1024 * 1024) {
                        emitAlert({ type: "error", message: "Max size 2MB" });
                        return;
                      }
                      setHeroBannerUploading(true);
                      try {
                        const url = await uploadImage(file, `dynamic/${slug}/hero`, setHeroBannerProgress);
                        setHero((p) => ({ ...p, banner: url }));
                      } finally {
                        setHeroBannerUploading(false);
                        setHeroBannerProgress(0);
                      }
                    }}
                    onChange={(val) => setHero((p) => ({ ...p, banner: val }))}
                    onRemove={() => setHero((p) => ({ ...p, banner: "" }))}
                    uploading={heroBannerUploading}
                    uploadProgress={heroBannerProgress}
                    fileInputRef={heroFileRef}
                    previewHeight="h-44"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Sections</p>
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {sections.length} total
                </span>
              </div>

              <div className="space-y-3">
                {sections.map((section, index) => (
                  <SectionCard
                    key={index}
                    section={section}
                    index={index}
                    onUpdate={updateSection}
                    uploadImage={uploadImage}
                    slug={slug}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right: Preview */}
          <div className="w-1/2 bg-slate-50/60 p-5 overflow-y-auto">
            <DynamicPreview hero={hero} sections={sections} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-white">
          <p className="text-xs text-slate-400">
            {isEdit
              ? "Changes apply immediately after saving."
              : <>Route will be <span className={`font-semibold ${enabled ? "text-emerald-600" : "text-slate-500"}`}>{enabled ? "enabled" : "disabled"}</span> after creation.</>}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-slate-900 hover:bg-slate-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm"
            >
              {loading && step !== "done" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {step === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {stepLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}