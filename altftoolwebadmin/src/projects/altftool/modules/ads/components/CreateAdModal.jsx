"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { PLACEMENTS } from "@/config/placements";
import { serverTimestamp } from "firebase/firestore";
import { storage } from "@/lib/firebaseStorage";
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
      <label className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
        {icon && <span className="text-[var(--muted)]">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[var(--danger-text)] font-medium">
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
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)]
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]"
          : "border-[var(--border)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
        }`}
    />
  );
}

/* ── Progress bar ── */
function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-[var(--surface-soft)] rounded-full overflow-hidden">
      <div className="h-full bg-[var(--primary)] rounded-full transition-all duration-200"
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
        className={`w-full min-h-[42px] text-sm px-3 py-2 rounded-xl border bg-[var(--surface)] text-left
          flex items-center gap-2 flex-wrap focus:outline-none focus:ring-2 transition select-none
          ${error
            ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]"
            : open
              ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
              : "border-[var(--border)] hover:border-[var(--border-strong)]"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {value.length === 0 ? (
          <span className="text-[var(--muted)] flex-1">Select categories…</span>
        ) : (
          <span className="flex flex-wrap gap-1.5 flex-1">
            {value.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)] text-xs font-semibold px-2 py-0.5 rounded-lg"
              >
                {cat}
                <button
                  type="button"
                  onClick={(e) => removeTag(cat, e)}
                  disabled={disabled}
                  className="text-[var(--primary)] hover:text-[var(--primary-hover)] transition disabled:pointer-events-none"
                  tabIndex={-1}
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            ))}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 text-[var(--muted)] shrink-0 ml-auto transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1.5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <input
              autoFocus
              type="text"
              placeholder="Search categories…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] placeholder:text-[var(--muted)]"
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
                    ${value.includes("All") ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"}`}
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors
                    ${value.includes("All") ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                    {value.includes("All") && <Check className="w-2.5 h-2.5 text-[var(--primary-foreground)]" strokeWidth={3} />}
                  </span>
                  <span className="font-medium">All</span>
                </button>
              </li>
            )}

            {availableCategories.length === 0 ? (
              !search && <li className="px-4 py-3 text-xs text-[var(--muted)] text-center">No categories configured</li>
            ) : filtered.length === 0 && !showAllOption ? (
              <li className="px-4 py-3 text-xs text-[var(--muted)] text-center">No categories found</li>
            ) : (
              filtered.map((cat) => {
                const isSelected = value.includes(cat);
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => toggle(cat)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                        ${isSelected ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"}`}
                    >
                      <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors
                        ${isSelected ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-[var(--primary-foreground)]" strokeWidth={3} />}
                      </span>
                      <span className="font-medium">{cat}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          {value.length > 0 && (
            <div className="px-3 py-2 border-t border-[var(--border)] flex items-center justify-between">
              <span className="text-xs text-[var(--muted-soft)]">
                <span className="font-semibold text-[var(--primary)]">{value.length}</span> selected
              </span>
              <button
                type="button"
                onClick={() => onChange([])}
                className="text-xs text-[var(--danger-text)] hover:opacity-80 font-medium transition"
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
        className={`w-full min-h-[42px] text-sm px-3 py-2 rounded-xl border bg-[var(--surface)]
          flex items-center gap-2 focus:outline-none focus:ring-2 transition select-none
          ${open
            ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/30"
            : "border-[var(--border)] hover:border-[var(--border-strong)]"
          }
          ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isLoading ? (
          <span className="flex items-center gap-2 text-[var(--muted)] flex-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading targets…
          </span>
        ) : displayValue ? (
          <span className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xs font-mono bg-[var(--primary-soft)] text-[var(--primary)] border border-[var(--border)] px-2 py-0.5 rounded-lg truncate max-w-full">
              {displayValue}
            </span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(""); }}
              disabled={isDisabled}
              className="shrink-0 text-[var(--muted)] hover:text-[var(--foreground)] transition disabled:pointer-events-none ml-auto"
              tabIndex={-1}
              title="Clear target"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ) : (
          <>
            <span className="text-[var(--muted)] flex-1">All pages (no specific target)</span>
            <ChevronDown className={`w-4 h-4 text-[var(--muted)] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </>
        )}
        {!isLoading && displayValue && (
          <ChevronDown className={`w-4 h-4 text-[var(--muted)] shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        )}
      </div>

      {open && !isLoading && (
        <div className="absolute z-50 mt-1.5 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <input
              autoFocus
              type="text"
              placeholder="Search by slug…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] placeholder:text-[var(--muted)]"
            />
          </div>

          <ul className="max-h-52 overflow-y-auto py-1.5">
            <li>
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); setSearch(""); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                  ${!value ? "bg-[var(--surface-soft)] text-[var(--muted-soft)] font-medium" : "text-[var(--muted-soft)] hover:bg-[var(--surface-soft)]"}`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors
                  ${!value ? "bg-[var(--foreground)] border-[var(--foreground)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                  {!value && <Check className="w-2.5 h-2.5 text-[var(--background)]" strokeWidth={3} />}
                </span>
                <span className="italic">All pages (no target)</span>
              </button>
            </li>

            {filtered.length === 0 ? (
              <li className="px-4 py-3 text-xs text-[var(--muted)] text-center">No slugs found</li>
            ) : (
              filtered.map((slug) => {
                const isSelected = value === slug;
                return (
                  <li key={slug}>
                    <button
                      type="button"
                      onClick={() => { onChange(slug); setOpen(false); setSearch(""); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left transition-colors
                        ${isSelected ? "bg-[var(--primary-soft)] text-[var(--primary)]" : "text-[var(--foreground)] hover:bg-[var(--surface-soft)]"}`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border transition-colors
                        ${isSelected ? "bg-[var(--primary)] border-[var(--primary)]" : "border-[var(--border)] bg-[var(--surface)]"}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 text-[var(--primary-foreground)]" strokeWidth={3} />}
                      </span>
                      <span className="font-mono text-xs truncate">{slug}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="px-3 py-2 border-t border-[var(--border)]">
            <span className="text-xs text-[var(--muted)]">
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

  // Revoke the current blob URL on unmount (e.g. closing the modal via the
  // header X or Cancel button while a local file preview is still active),
  // so an abandoned upload doesn't leak a blob URL for the page's lifetime.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

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
        // Write a complete record so the web normalizer never hides the ad:
        // `devices` defaults to false on the web when absent, and `layout`
        // mirrors the placement config used by the mock/sample ads.
        layout: placement?.layout ?? null,
        devices: { desktop: true, mobile: true },
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
    <div
      className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-ad-modal-title"
    >
      <div className="bg-[var(--surface)] rounded-2xl shadow-lg w-full max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 id="create-ad-modal-title" className="text-base font-bold text-[var(--foreground)]">Create New Ad</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Placement: <span className="font-semibold text-[var(--primary)] capitalize">{placementKey?.replaceAll("_", " ")}</span>
              {placement?.label && <> · {placement.label}</>}
            </p>
          </div>
          <button onClick={onClose} disabled={loading} aria-label="Close"
            className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Banner requirements */}
          <div className="flex gap-3 bg-[var(--primary-soft)] border border-[var(--primary)] rounded-xl p-4">
            <Info className="w-4 h-4 text-[var(--primary)] shrink-0 mt-0.5" />
            <div className="text-xs text-[var(--primary)] space-y-0.5">
              <p className="font-bold">Banner Requirements</p>
              <p>Recommended size: <span className="font-semibold">{placement?.recommended?.width ?? "—"} × {placement?.recommended?.height ?? "—"}px</span></p>
              <p>Max file size: <span className="font-semibold">2MB</span> · Formats: <span className="font-semibold">JPG, PNG, WebP</span></p>
              {placement?.description && <p className="mt-1 text-[var(--primary)]">{placement.description}</p>}
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--primary)] transition">
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

            <div className="flex gap-1 p-1 bg-[var(--surface-soft)] rounded-xl w-fit mb-2">
              <button
                type="button"
                onClick={() => switchMode("upload")}
                disabled={loading}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                  ${imageMode === "upload"
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
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
                    ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--foreground)]"
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
                      ${dragOver ? "border-[var(--primary)] bg-[var(--primary-soft)] scale-[1.01]" : errors.file ? "border-[var(--danger)]/40 bg-[var(--danger-soft)]" : "border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-[var(--surface-soft)]"}
                      ${loading ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-[var(--primary-soft)]" : "bg-[var(--surface-soft)]"}`}>
                      <UploadCloud className={`w-6 h-6 transition-colors ${dragOver ? "text-[var(--primary)]" : "text-[var(--muted)]"}`} />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-[var(--foreground)]">Drop banner here or <span className="text-[var(--primary)]">browse</span></p>
                      <p className="text-xs text-[var(--muted)] mt-1">JPG, PNG, WebP · Max 2MB</p>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-[var(--border)] overflow-hidden bg-[var(--surface-soft)]">
                    <div className="relative group">
                      <img src={preview} alt="Banner preview" className="w-full max-h-52 object-contain bg-[var(--surface-soft)]" />
                      <div className="absolute inset-0 bg-[var(--overlay)]/0 group-hover:bg-[var(--overlay)]/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button onClick={removeImage} disabled={loading}
                          className="flex items-center gap-1.5 bg-[var(--danger)] hover:opacity-90 text-[var(--danger-foreground)] text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                          <Trash2 className="w-3.5 h-3.5" />Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between px-4 py-2.5 border-t border-[var(--border)] bg-[var(--surface)]">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-[var(--primary-soft)] flex items-center justify-center shrink-0">
                          <ImageIcon className="w-3.5 h-3.5 text-[var(--primary)]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium text-[var(--foreground)] truncate">{file.name}</p>
                          <p className="text-[10px] text-[var(--muted)]">{fmtSize(file.size)}</p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                    </div>
                  </div>
                )}
                <input ref={fileInputRef} id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </>
            )}

            {imageMode === "url" && (
              <div className="space-y-3">
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)] pointer-events-none" />
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
                    className={`w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)]
                      focus:outline-none focus:ring-2 transition
                      ${errors.file
                        ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]"
                        : imageUrlValid === true
                          ? "border-[var(--success)]/40 focus:ring-[var(--success)]/30 focus:border-[var(--success)]"
                          : imageUrlValid === false
                            ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]"
                            : "border-[var(--border)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                      }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    {imageUrl && imageUrlValid === true && <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />}
                    {imageUrl && imageUrlValid === false && <AlertCircle className="w-4 h-4 text-[var(--danger)]" />}
                    {imageUrl && imageUrlValid === null && (
                      <button
                        type="button"
                        onClick={clearImageUrl}
                        className="text-[var(--muted)] hover:text-[var(--foreground)] transition"
                        tabIndex={-1}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                </div>

                {imageUrl && imageUrlValid === true && (
                  <div className="rounded-xl border border-[var(--success)]/30 overflow-hidden bg-[var(--surface-soft)]">
                    <div className="relative group">
                      <img
                        src={imageUrl}
                        alt="URL preview"
                        className="w-full max-h-52 object-contain bg-[var(--surface-soft)]"
                      />
                      <div className="absolute inset-0 bg-[var(--overlay)]/0 group-hover:bg-[var(--overlay)]/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={clearImageUrl}
                          disabled={loading}
                          className="flex items-center gap-1.5 bg-[var(--danger)] hover:opacity-90 text-[var(--danger-foreground)] text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />Remove
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-[var(--success)]/30 bg-[var(--surface)]">
                      <CheckCircle2 className="w-4 h-4 text-[var(--success)] shrink-0" />
                      <p className="text-xs font-medium text-[var(--muted)] truncate flex-1">{imageUrl}</p>
                      <a href={imageUrl} target="_blank" rel="noreferrer"
                        className="text-[var(--muted)] hover:text-[var(--primary)] transition shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                )}

                {imageUrl && imageUrlValid === false && (
                  <p className="text-xs text-[var(--danger-text)] flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    Could not load image from this URL. Check the address and try again.
                  </p>
                )}
              </div>
            )}

          </Field>

          {step === "uploading" && imageMode === "upload" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-[var(--muted)]">
                <span>Uploading banner…</span>
                <span className="font-semibold tabular-nums">{uploadProgress}%</span>
              </div>
              <ProgressBar value={uploadProgress} />
            </div>
          )}

          {step === "saving" && (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[var(--primary)]" />
              Saving to database…
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-[var(--success-text)] font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Ad created successfully!
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-soft)]">
          <p className="text-xs text-[var(--muted)]">Ad will be set to <span className="font-semibold text-[var(--success-text)]">Active</span> immediately after creation.</p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={createAd} disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-[var(--foreground)] hover:opacity-90 disabled:opacity-60 text-[var(--background)] font-semibold rounded-xl transition shadow-sm">
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
