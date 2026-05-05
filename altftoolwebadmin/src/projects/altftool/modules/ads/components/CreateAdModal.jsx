"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PLACEMENTS } from "@/config/placements";
import { serverTimestamp } from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { createAdWithId } from "../services/ads.service";
import {
  X, UploadCloud, AlertCircle, CheckCircle2,
  ExternalLink, Image as ImageIcon, Type, Link2,
  Loader2, Trash2, Info, Tag, ChevronDown, Check, Crosshair, Globe,
} from "lucide-react";


/* ── Field wrapper ── */
function Field({ label, hint, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

/* ── Input ── */
function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
        }`}
    />
  );
}

/* ── Progress bar ── */
function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full transition-all duration-200"
        style={{ width: `${value}%` }} />
    </div>
  );
}

/* ── Multi-select Categories Dropdown ── */
function CategorySelect({ availableCategories, value, onChange, error, disabled }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filtered = availableCategories.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // "All" is always shown when search is empty or matches "all"
  const showAllOption = "all".includes(search.toLowerCase());

  const toggle = (cat) => {
    onChange(value.includes(cat) ? value.filter((c) => c !== cat) : [...value, cat]);
  };

  const removeTag = (cat, e) => {
    e.stopPropagation();
    onChange(value.filter((c) => c !== cat));
  };

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* div instead of button — avoids nested <button> hydration error */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => { if (!disabled) setOpen((p) => !p); }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((p) => !p);
          }
        }}
        className={`w-full min-h-[42px] text-sm px-3 py-2 rounded-xl border bg-white text-left
          flex items-center gap-2 flex-wrap focus:outline-none focus:ring-2 transition select-none
          ${error
            ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
            : open
              ? "border-blue-400 ring-2 ring-blue-400/30"
              : "border-gray-200 hover:border-gray-300"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {value.length === 0 ? (
          <span className="text-gray-400 flex-1">Select categories…</span>
        ) : (
          <span className="flex flex-wrap gap-1.5 flex-1">
            {value.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-semibold px-2 py-0.5 rounded-lg"
              >
                {cat}
                <button
                  type="button"
                  onClick={(e) => removeTag(cat, e)}
                  disabled={disabled}
                  className="text-indigo-400 hover:text-indigo-700 transition disabled:pointer-events-none"
                  tabIndex={-1}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1.5">
            {/* ── Hardcoded "All" option — always first ── */}
            {showAllOption && (
              <li>
                <button
                  type="button"
                  onClick={() => toggle("All")}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                    ${value.includes("All") ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors
                    ${value.includes("All") ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"}`}>
                    {value.includes("All") && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className="font-medium">All</span>
                </button>
              </li>
            )}

            {availableCategories.length === 0 ? (
              !search && <li className="px-4 py-3 text-xs text-gray-400 text-center">No categories configured</li>
            ) : filtered.length === 0 && !showAllOption ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">No categories found</li>
            ) : (
              filtered.map((cat) => {
                const isSelected = value.includes(cat);
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => toggle(cat)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                        ${isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors
                        ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className="font-medium">{cat}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {value.length > 0 && (
            <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                <span className="font-semibold text-indigo-600">{value.length}</span> selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-red-500 hover:text-red-600 font-medium transition"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Single-select Target Dropdown ── */
function TargetSelect({ availableTargets, value, onChange, disabled, isLoading }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  const filtered = (availableTargets || []).filter((s) =>
    s.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isDisabled = disabled || isLoading;
  const displayValue = value || null;

  return (
    <div ref={containerRef} className="relative">
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        tabIndex={isDisabled ? -1 : 0}
        onClick={() => { if (!isDisabled) setOpen((p) => !p); }}
        onKeyDown={(e) => {
          if (!isDisabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((p) => !p);
          }
        }}
        className={`w-full min-h-[42px] text-sm px-3 py-2 rounded-xl border bg-white
          flex items-center gap-2 focus:outline-none focus:ring-2 transition select-none
          ${open
            ? "border-blue-400 ring-2 ring-blue-400/30"
            : "border-gray-200 hover:border-gray-300"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 text-gray-400 flex-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading targets…
          </span>
        ) : displayValue ? (
          <span className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-lg truncate max-w-full">
              {displayValue}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              disabled={isDisabled}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition disabled:pointer-events-none ml-auto"
              tabIndex={-1}
              title="Clear target"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ) : (
          <>
            <span className="text-gray-400 flex-1">All pages (no specific target)</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </>
        )}
        {!isLoading && displayValue && (
          <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        )}
      </div>

      {open && !isLoading && (
        <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-gray-100">
            <input
              autoFocus
              type="text"
              placeholder="Search by slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-gray-50
                focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 placeholder:text-gray-400"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1.5">
            <li>
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                  ${!value ? "bg-gray-50 text-gray-500 font-medium" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors
                  ${!value ? "bg-gray-600 border-gray-600" : "border-gray-300 bg-white"}`}>
                  {!value && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                </span>
                <span className="italic">All pages (no target)</span>
              </button>
            </li>

            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-gray-400 text-center">No slugs found</li>
            ) : (
              filtered.map((slug) => {
                const isSelected = value === slug;
                return (
                  <li key={slug}>
                    <button
                      type="button"
                      onClick={() => { onChange(slug); setOpen(false); setSearch(""); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                        ${isSelected ? "bg-indigo-50 text-indigo-700" : "text-gray-700 hover:bg-gray-50"}`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors
                        ${isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300 bg-white"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                      </span>
                      <span className="font-mono text-xs truncate">{slug}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="px-3 py-2 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              {(availableTargets || []).length} blog{(availableTargets || []).length !== 1 ? "s" : ""} available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function CreateAdModal({
  placementKey,
  existingAds,
  availableCategories = [],
  availableTargets = null,
  targetsLoading = false,
  onClose,
}) {
  const placement = PLACEMENTS[placementKey];

  const [title, setTitle] = useState("");
  const [redirect, setRedirect] = useState("");
  const [categories, setCategories] = useState([]);
  const [target, setTarget] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [imageMode, setImageMode] = useState("upload");
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrlValid, setImageUrlValid] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState("idle");

  const fileInputRef = useRef(null);

  const generateId = () => {
    const numbers = existingAds
      .map((ad) => Number(ad.id?.split("_").pop()))
      .filter((n) => !isNaN(n));
    const next = numbers.length ? Math.max(...numbers) + 1 : 1;
    return `${placementKey}_${next}`;
  };

  const processFile = useCallback((selected) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, file: "Only image files are allowed (JPG, PNG, WebP)" }));
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, file: "File size must be under 2MB" }));
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrors((p) => ({ ...p, file: undefined }));
  }, [preview]);

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };

  const removeImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearImageUrl = () => {
    setImageUrl("");
    setImageUrlValid(null);
    setErrors((p) => ({ ...p, file: undefined }));
  };

  const switchMode = (mode) => {
    setImageMode(mode);
    setErrors((p) => ({ ...p, file: undefined }));
    if (mode === "url") { removeImage(); }
    else { clearImageUrl(); }
  };

  const validateImageUrl = (url) => {
    if (!url.trim()) { setImageUrlValid(null); return; }
    try { new URL(url); } catch { setImageUrlValid(false); return; }
    const img = new Image();
    img.onload = () => setImageUrlValid(true);
    img.onerror = () => setImageUrlValid(false);
    img.src = url;
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Ad title is required";
    if (!redirect.trim()) {
      e.redirect = "Redirect URL is required";
    } else {
      try { new URL(redirect); } catch { e.redirect = "Enter a valid URL (include https://)"; }
    }

    const hasCategories  = availableCategories.length > 0;
    const hasTargets     = availableTargets !== null;
    const pickedCategory = categories.length > 0;
    const pickedTarget   = !!target;

    if (hasCategories && hasTargets) {
      if (!pickedCategory && !pickedTarget) {
        e.categories = "Select at least one category or choose a target page";
        e.target     = "Select at least one category or choose a target page";
      }
    } else if (hasCategories && !pickedCategory) {
      e.categories = "Select at least one category";
    }

    if (imageMode === "upload") {
      if (!file) e.file = "Banner image is required";
    } else {
      if (!imageUrl.trim()) e.file = "Image URL is required";
      else if (imageUrlValid === false) e.file = "URL doesn't point to a valid image";
      else { try { new URL(imageUrl); } catch { e.file = "Enter a valid image URL (include https://)"; } }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createAd = async () => {
    if (!validate()) return;

    const user = getAuth().currentUser;
    if (!user) {
      emitAlert({ type: "error", message: "Session expired. Please log in again." });
      return;
    }

    setLoading(true);

    try {
      const newId = generateId();
      let bannerUrl;

      if (imageMode === "upload") {
        setStep("uploading");
        const ext = file.name.split(".").pop();
        const storageRef = ref(storage, `ads/${placementKey}/${newId}.${ext}`);
        bannerUrl = await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file);
          task.on("state_changed",
            (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            async () => { try { resolve(await getDownloadURL(task.snapshot.ref)); } catch (e) { reject(e); } }
          );
        });
      } else {
        bannerUrl = imageUrl.trim();
      }

      setStep("saving");
      await createAdWithId(newId, {
        id: newId,
        title: title.trim(),
        status: "active",
        placements: [placementKey],
        categories,
        target: target || null,
        content: { bannerUrl, redirect: redirect.trim() },
        impressions: 0,
        clicks: 0,
        createdAt: serverTimestamp(),
      });

      logAuditEvent({
        module: "ads",
        action: "ADS_CREATE",
        entityType: "ad",
        entityId: newId,
        summary: `Created ad "${title.trim()}"`,
        changes: { id: newId, placementKey, status: "active", categories, target: target || null },
        route: "/ads",
      });

      setStep("done");
      emitAlert({ type: "success", message: "Ad created successfully" });
      setTimeout(onClose, 600);

    } catch (err) {
      console.error("CreateAd error:", err);
      setStep("idle");
      setUploadProgress(0);
      emitAlert({ type: "error", message: err?.message || "Failed to create ad. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = {
    idle: "Create Ad",
    uploading: `Uploading… ${uploadProgress}%`,
    saving: "Saving…",
    done: "Done!",
  }[step] ?? "Create Ad";

  const fmtSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create New Ad</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Placement: <span className="font-semibold text-indigo-600 capitalize">{placementKey?.replaceAll("_", " ")}</span>
              {placement?.label && <> · {placement.label}</>}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Banner requirements */}
          <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-0.5">
              <p className="font-bold">Banner Requirements</p>
              <p>Recommended size: <span className="font-semibold">{placement?.recommended?.width ?? "—"} × {placement?.recommended?.height ?? "—"}px</span></p>
              <p>Max file size: <span className="font-semibold">2MB</span> · Formats: <span className="font-semibold">JPG, PNG, WebP</span></p>
              {placement?.description && <p className="mt-1 text-blue-600">{placement.description}</p>}
            </div>
          </div>

          {/* Title */}
          <Field label="Ad Title" icon={<Type className="w-3.5 h-3.5" />}
            hint="Used for internal identification and search." error={errors.title}>
            <Input
              placeholder="e.g. Summer Sale Banner"
              value={title}
              onChange={(e) => { setTitle(e.target.value); if (errors.title) setErrors((p) => ({ ...p, title: undefined })); }}
              error={errors.title}
              disabled={loading}
            />
          </Field>

          {/* Redirect URL */}
          <Field label="Redirect URL" icon={<Link2 className="w-3.5 h-3.5" />}
            hint="Users are sent here when they click the ad." error={errors.redirect}>
            <div className="relative">
              <Input
                placeholder="https://example.com/landing-page"
                value={redirect}
                onChange={(e) => { setRedirect(e.target.value); if (errors.redirect) setErrors((p) => ({ ...p, redirect: undefined })); }}
                error={errors.redirect}
                disabled={loading}
              />
              {redirect && (() => { try { new URL(redirect); return true; } catch { return false; } })() && (
                <a href={redirect} target="_blank" rel="noreferrer"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500 transition">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </Field>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <Field
              label="Categories"
              icon={<Tag className="w-3.5 h-3.5" />}
              hint="Select all categories that apply to this ad."
              error={errors.categories}
            >
              <CategorySelect
                availableCategories={availableCategories}
                value={categories}
                onChange={(val) => {
                  setCategories(val);
                  if (errors.categories || errors.target)
                    setErrors((p) => ({ ...p, categories: undefined, target: undefined }));
                }}
                error={errors.categories}
                disabled={loading}
              />
            </Field>
          )}

          {/* Target */}
          {availableTargets !== null && (
            <Field
              label="Target Page"
              icon={<Crosshair className="w-3.5 h-3.5" />}
              hint={
                target
                  ? "Ad will only show on the selected page."
                  : "Optional — leave blank to show this ad on all pages in this placement."
              }
              error={errors.target}
            >
              <TargetSelect
                availableTargets={availableTargets}
                value={target}
                onChange={(val) => {
                  setTarget(val);
                  if (errors.target || errors.categories)
                    setErrors((p) => ({ ...p, target: undefined, categories: undefined }));
                }}
                disabled={loading}
                isLoading={targetsLoading}
              />
            </Field>
          )}

          {/* Banner Image */}
          <Field label="Banner Image" icon={<ImageIcon className="w-3.5 h-3.5" />} error={errors.file}>

            <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-2">
              <button
                type="button"
                onClick={() => switchMode("upload")}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${imageMode === "upload"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  } disabled:opacity-50`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                Upload File
              </button>
              <button
                type="button"
                onClick={() => switchMode("url")}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${imageMode === "url"
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                  } disabled:opacity-50`}
              >
                <Globe className="w-3.5 h-3.5" />
                Paste URL
              </button>
            </div>

            {imageMode === "upload" && (
              <>
                {!preview ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => !loading && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer
                      ${dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : errors.file ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}
                      ${loading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
                      <UploadCloud className={`w-6 h-6 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">Drop banner here or <span className="text-blue-500">browse</span></p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 2MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                    <div className="relative group">
                      <img src={preview} alt="Banner preview" className="w-full max-h-52 object-contain bg-gray-100" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onClick={removeImage} disabled={loading}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-white">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                          <ImageIcon className="w-3.5 h-3.5 text-indigo-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{fmtSize(file.size)}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </>
            )}

            {imageMode === "url" && (
              <div className="space-y-3">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    type="url"
                    placeholder="https://example.com/banner.jpg"
                    value={imageUrl}
                    disabled={loading}
                    onChange={(e) => {
                      const val = e.target.value;
                      setImageUrl(val);
                      setImageUrlValid(null);
                      if (errors.file) setErrors((p) => ({ ...p, file: undefined }));
                    }}
                    onBlur={(e) => validateImageUrl(e.target.value)}
                    className={`w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
                      focus:outline-none focus:ring-2 transition
                      ${errors.file
                        ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                        : imageUrlValid === true
                          ? "border-green-300 focus:ring-green-400/30 focus:border-green-400"
                          : imageUrlValid === false
                            ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                            : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
                      }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {imageUrl && imageUrlValid === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    {imageUrl && imageUrlValid === false && <AlertCircle className="w-4 h-4 text-red-400" />}
                    {imageUrl && imageUrlValid === null && (
                      <button
                        type="button"
                        onClick={clearImageUrl}
                        className="text-gray-400 hover:text-gray-600 transition"
                        tabIndex={-1}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                </div>

                {imageUrl && imageUrlValid === true && (
                  <div className="rounded-xl border border-green-100 overflow-hidden bg-gray-50">
                    <div className="relative group">
                      <img
                        src={imageUrl}
                        alt="URL preview"
                        className="w-full max-h-52 object-contain bg-gray-100"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={clearImageUrl}
                          disabled={loading}
                          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-green-100 bg-white">
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <p className="text-xs font-medium text-gray-600 truncate flex-1">{imageUrl}</p>
                      <a href={imageUrl} target="_blank" rel="noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {imageUrl && imageUrlValid === false && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Could not load image from this URL. Check the address and try again.
                  </p>
                )}
              </div>
            )}

          </Field>

          {step === "uploading" && imageMode === "upload" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading banner…</span>
                <span className="font-semibold tabular-nums">{uploadProgress}%</span>
              </div>
              <ProgressBar value={uploadProgress} />
            </div>
          )}

          {step === "saving" && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              Saving to database…
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Ad created successfully!
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">Ad will be set to <span className="font-semibold text-green-600">Active</span> immediately after creation.</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={createAd} disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm">
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