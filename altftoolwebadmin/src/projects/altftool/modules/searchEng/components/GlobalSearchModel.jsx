"use client";

import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";
import { createData, updateData } from "../service/data.service";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { storage } from "@/lib/firebaseStorage";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  X, AlertCircle, CheckCircle2,
  Type, Loader2, Info, Link2, DollarSign,
  Layers, ImageIcon, UploadCloud, Trash2
} from "lucide-react";

/* ── Field wrapper ── */
function Field({ label, hint, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-muted uppercase tracking-wider">
        {icon && <span className="text-muted">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-danger font-medium">
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
      className={`w-full rounded-md border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-danger focus:border-danger focus:ring-danger/30"
          : "border-border focus:ring-primary/30 focus:border-primary"
        }`}
    />
  );
}

/* ── Textarea ── */
function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full resize-none rounded-md border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-danger focus:border-danger focus:ring-danger/30"
          : "border-border focus:ring-primary/30 focus:border-primary"
        }`}
    />
  );
}

/* ── Select ── */
function Select({ error, options, ...props }) {
  return (
    <select
      {...props}
      className={`w-full cursor-pointer appearance-none rounded-md border bg-surface px-3 py-2.5 text-sm text-foreground
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-danger focus:border-danger focus:ring-danger/30"
          : "border-border focus:ring-primary/30 focus:border-primary"
        }`}
    >
      <option value="">Select an option</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function GlobalSearchModel({ data, categories = [], onClose }) {
  const isEdit = !!data;

  /* ── Fields ── */
  const [type, setType] = useState(data?.type || "");
  const [title, setTitle] = useState(data?.title || "");
  const [description, setDescription] = useState(data?.description || "");
  const [redirectUrl, setRedirectUrl] = useState(data?.redirect_url || "");
  const [price, setPrice] = useState(data?.price || "");
  const [extraTags, setExtraTags] = useState(data?.extraTags?.join(", ") || "");

  /* ── File Upload State ── */
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(data?.image_url || null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);

  /* ── Shared state ── */
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");

  useEffect(() => {
    if (!preview?.startsWith("blob:")) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [loading, onClose]);

  const typeOptions = categories.map((c) => ({
    label: c.name,
    value: c.slug,
  }));

  /* ── Keyword Generator Logic ── */
  const generateKeywords = (titleStr, descStr, tagsStr) => {
    const combined = `${titleStr} ${descStr} ${tagsStr}`;
    const cleanStr = combined.toLowerCase()
      .replace(/,/g, " ")
      .replace(/[^a-z0-9\s]/g, "");
    const words = cleanStr.split(/\s+/);
    const uniqueWords = [...new Set(words)];
    return uniqueWords.filter(word => word.length > 0);
  };

  /* ── Upload helper: uploads a single file, calls onProgress(0-100) ── */
  const uploadFile = (fileObj, path, onProgress) =>
    new Promise((resolve, reject) => {
      const ref = storageRef(storage, path);
      const task = uploadBytesResumable(ref, fileObj);
      task.on(
        "state_changed",
        (snap) => onProgress(snap.bytesTransferred / snap.totalBytes),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });

  const fmtSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  const selectImage = (nextFile) => {
    if (!nextFile) return;

    const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!acceptedTypes.has(nextFile.type)) {
      setErrors((current) => ({ ...current, image: "Choose a JPG, PNG, or WebP image." }));
      return;
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, image: "Image must be 5 MB or smaller." }));
      return;
    }

    setErrors((current) => ({ ...current, image: undefined }));
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const clearImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!type) e.type = "Type is required";
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";
    if (!redirectUrl.trim()) e.redirectUrl = "Redirect URL is required";
    if (redirectUrl.trim() && !redirectUrl.trim().startsWith("/")) {
      try {
        const parsedUrl = new URL(redirectUrl.trim());
        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          e.redirectUrl = "Use an internal path or an HTTP(S) URL";
        }
      } catch {
        e.redirectUrl = "Use an internal path or a valid HTTP(S) URL";
      }
    }
    if (!file && !preview) e.image = "Image is required";

    if ((type.includes("product") || type.includes("movie")) && !price.trim()) {
      e.price = "Price is required for this type";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Submit ── */
  const handleSave = async () => {
    if (!validate()) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      emitAlert({ type: "error", message: "Session expired. Please log in again." });
      return;
    }

    setLoading(true);
    setStep("saving");

    try {
      let finalImageUrl = preview;

      if (file) {
        setStep("uploading");
        setUploadProgress(0);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
        const path = `search-thumbnails/${Date.now()}_${safeName}`;
        finalImageUrl = await uploadFile(file, path, (p) => setUploadProgress(p * 100));
      }

      const ts = Date.now();
      const id = isEdit ? data.id : `gs_${ts}`;

      const searchKeywords = generateKeywords(title, description, extraTags);
      const tagsArray = extraTags.split(",").map(t => t.trim()).filter(t => t.length > 0);

      const payload = {
        title: title.trim(),
        description: description.trim(),
        type,
        redirect_url: redirectUrl.trim(),
        image_url: finalImageUrl,
        searchKeywords,
        extraTags: tagsArray,
        status: isEdit ? (data.status || "active") : "active",
        creatorUid: user.uid,
        creatorEmail: user.email,
      };

      if (type.includes("product") || type.includes("movie")) {
        payload.price = price.trim();
      } else {
        payload.price = ""; // Clear if type changed
      }

      /* ─ Write to Firestore ─ */
      if (isEdit) {
        await updateData(data.id, payload);
        emitAlert({ type: "success", message: "Item updated successfully" });
        logAuditEvent({
          module: "globalSearch",
          action: "GS_UPDATE",
          entityType: "globalSearch",
          entityId: data.id,
          summary: `Updated global search item "${payload.title}"`,
          changes: payload,
          route: "/searchEng",
        });
      } else {
        await createData(id, payload);
        emitAlert({ type: "success", message: "Item created successfully" });
        logAuditEvent({
          module: "globalSearch",
          action: "GS_CREATE",
          entityType: "globalSearch",
          entityId: id,
          summary: `Created global search item "${payload.title}"`,
          changes: payload,
          route: "/searchEng",
        });
      }

      setStep("done");
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error("[GlobalSearchModel] save error:", err);
      emitAlert({ type: "error", message: err.message || "Something went wrong." });
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-[620px] flex-col overflow-hidden rounded-xl bg-surface shadow-lg" role="dialog" aria-modal="true" aria-labelledby="search-result-title">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-5 py-5 sm:px-8 sm:py-6 shrink-0">
          <div>
            <h2 id="search-result-title" className="text-xl font-bold text-foreground">
              {isEdit ? "Edit Global Search Item" : "Create Global Search Item"}
            </h2>
            <p className="text-sm text-muted mt-0.5">
              Fill in the details below to index content for global search
            </p>
          </div>
          <button type="button" onClick={onClose} disabled={loading} aria-label="Close search result dialog"
            className="p-2 rounded-xl text-muted hover:bg-surface-soft transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6">

          {/* Info banner */}
          <div className="flex gap-3 bg-primary-soft border border-primary rounded-lg p-4">
            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div className="text-sm text-primary">
              <p className="font-bold">Requirements</p>
              <p>Title, Description and Extra Tags will be used to generate search keywords automatically.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Title */}
            <Field label="Title" icon={<Type size={14} />} error={errors.title}>
              <Input
                placeholder="e.g. Acme Pro"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                error={errors.title}
                disabled={loading}
              />
            </Field>

            {/* Type Select */}
            <Field label="Type" icon={<Layers size={14} />} error={errors.type}>
              <div className="relative">
                <Select
                  options={typeOptions}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  error={errors.type}
                  disabled={loading}
                />
              </div>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" icon={<Type size={14} />} error={errors.description}>
            <Textarea
              placeholder="Detailed description of the content..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              disabled={loading}
            />
          </Field>

          {/* Extra Tags */}
          <Field label="Extra Tags" icon={<Type size={14} />}>
            <Input
              placeholder="e.g. fashion, tshirt, nike"
              value={extraTags}
              onChange={(e) => setExtraTags(e.target.value)}
              disabled={loading}
            />
          </Field>

          {/* File Upload Zone */}
          <Field label="Image Upload" icon={<ImageIcon size={14} />} error={errors.image}>
            {!preview ? (
              <button
                type="button"
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  selectImage(e.dataTransfer.files?.[0]);
                }}
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`flex w-full cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed p-8 transition-all
                  ${dragOver ? "border-primary bg-primary-soft scale-[1.01]" : errors.image ? "border-danger bg-danger-soft" : "border-border hover:border-primary hover:bg-surface-soft"}
                  ${loading ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${dragOver ? "bg-primary-soft" : "bg-surface-soft"}`}>
                  <UploadCloud className={`w-6 h-6 transition-colors ${dragOver ? "text-primary" : "text-muted"}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">Drop image here or <span className="text-primary">browse</span></p>
                  <p className="text-xs text-muted mt-1">JPG, PNG, or WebP up to 5 MB</p>
                </div>
              </button>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden bg-surface-soft">
                <div className="relative group">
                  <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-surface-soft" />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button type="button" onClick={clearImage} disabled={loading}
                      className="flex h-10 items-center gap-1.5 rounded-md border border-danger bg-surface px-3 text-xs font-semibold text-danger transition hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger disabled:opacity-50">
                      <Trash2 className="w-3.5 h-3.5" />Remove
                    </button>
                  </div>
                </div>
                {file && (
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-surface">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                        <ImageIcon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[10px] text-muted">{fmtSize(file.size)}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  </div>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {
              selectImage(e.target.files?.[0]);
            }} className="hidden" />
          </Field>

          {/* Redirect URL */}
          <Field label="Redirect URL" icon={<Link2 size={14} />} error={errors.redirectUrl}>
            <Input
              placeholder="https://example.com/landing-page"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              error={errors.redirectUrl}
              disabled={loading}
            />
          </Field>

          {/* Price (Conditional) */}
          {(type.includes("product") || type.includes("movie")) && (
            <Field label="Price" icon={<DollarSign size={14} />} error={errors.price}>
              <Input
                placeholder="e.g. 19.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
                disabled={loading}
              />
            </Field>
          )}

          {/* Progress Tracking */}
          {loading && (
            <div className="space-y-2" role="status" aria-live="polite">
              <div className="flex items-center gap-2 text-sm text-primary font-bold">
                <Loader2 size={14} className="animate-spin" />
                {step === "uploading" ? `Uploading image... ${Math.round(uploadProgress)}%` : "Saving item..."}
              </div>
              {step === "uploading" && (
                <div className="w-full bg-surface-soft rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex shrink-0 flex-col gap-3 border-t border-border bg-surface-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-5">
          <p className="text-xs text-muted">
            {step === "done" ? (
              <span className="text-success font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Successfully Saved
              </span>
            ) : (
              <>Item will be set to <span className="font-bold text-success uppercase">Active</span></>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="h-10 rounded-md border border-border bg-surface px-5 text-sm font-semibold text-foreground transition hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading || step === "done"}
              className="flex h-10 items-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {step === "done" ? "Saved!" : isEdit ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
