"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { storage } from "@/lib/firebase";
import { serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  createExtension,
  updateExtension,
} from "../services/extensions.service";
import {
  X, Type, Hash, Tag, AlignLeft, Zap, Link2, Star,
  UploadCloud, Trash2, Plus, AlertCircle, CheckCircle2,
  Loader2, GripVertical, Lock,
} from "lucide-react";

/* ── Field wrapper ── */
function Field({ label, hint, error, icon, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400 font-bold">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
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
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}
        ${props.readOnly ? "bg-gray-50 text-gray-500 cursor-not-allowed" : ""}
        ${className}`}
    />
  );
}

/* ── Textarea ── */
function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition resize-none
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`}
    />
  );
}

/* ── Star rating picker ── */
function RatingPicker({ value, onChange, error }) {
  const [hovered, setHovered] = useState(null);
  const num = parseFloat(value) || 0;
  const display = hovered ?? num;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onChange(star)}
              className="p-0.5 transition-transform hover:scale-110">
              <svg viewBox="0 0 24 24" className={`w-6 h-6 transition-colors ${display >= star ? "text-yellow-400" : "text-gray-200"}`}
                fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input
            type="number" step="0.1" min="0" max="5"
            value={value} onChange={(e) => onChange(e.target.value)}
            error={error}
            className="w-20 text-center"
            placeholder="0.0"
          />
          {value > 0 && (
            <button type="button" onClick={() => onChange("")}
              className="text-xs text-gray-400 hover:text-gray-600 transition">
              Clear
            </button>
          )}
        </div>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

/* ── Progress bar ── */
function ProgressBar({ value }) {
  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full transition-all duration-200" style={{ width: `${value}%` }} />
    </div>
  );
}

/* ── Section divider ── */
function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function ExtensionModal({ extension, onClose, refresh }) {
  const isEdit = !!extension;

  const [name, setName] = useState(extension?.name || "");
  const [slug, setSlug] = useState(extension?.slug || "");
  const [category, setCategory] = useState(extension?.category || "");
  const [description, setDescription] = useState(extension?.description || "");
  const [rating, setRating] = useState(extension?.rating || "");
  const [chromeUrl, setChromeUrl] = useState(extension?.chromeUrl || "");
  const [icon, setIcon] = useState(extension?.icon || "");
  const [features, setFeatures] = useState(extension?.features?.length ? extension.features : [""]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(extension?.image || null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState("idle"); // idle | uploading | saving | done

  const fileInputRef = useRef(null);

  /* ── Auto-generate slug from name ── */
  useEffect(() => {
    if (isEdit) return;
    setSlug(name.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, "-").trim());
  }, [name, isEdit]);

  /* ── File handling ── */
  const processFile = useCallback((selected) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setErrors((p) => ({ ...p, image: "Only image files are allowed (JPG, PNG, WebP)" }));
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setErrors((p) => ({ ...p, image: "File size must be under 2MB" }));
      return;
    }
    if (preview && file) URL.revokeObjectURL(preview);
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setErrors((p) => ({ ...p, image: undefined }));
  }, [preview, file]);

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); };

  const removeImage = () => {
    if (preview && file) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ── Feature helpers ── */
  const addFeature = () => setFeatures((p) => [...p, ""]);
  const updateFeature = (i, val) => setFeatures((p) => p.map((f, idx) => idx === i ? val : f));
  const removeFeature = (i) => setFeatures((p) => p.filter((_, idx) => idx !== i));
  const clearField = (setter, errKey) => { setter(""); setErrors((p) => ({ ...p, [errKey]: undefined })); };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Extension name is required";
    if (!slug.trim()) e.slug = "Slug is required";
    if (!category.trim()) e.category = "Category is required";
    if (!description.trim()) e.description = "Description is required";
    if (!icon.trim()) e.icon = "Icon name is required";
    if (chromeUrl) { try { new URL(chromeUrl); } catch { e.chromeUrl = "Enter a valid URL (include https://)"; } }
    if (rating !== "" && (parseFloat(rating) < 0 || parseFloat(rating) > 5)) e.rating = "Rating must be 0–5";
    if (features.some((f) => !f.trim())) e.features = "All feature entries must have text";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Save ── */
  const saveExtension = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      let imageUrl = extension?.image || "";

      if (file) {
        setStep("uploading");
        const storageRef = ref(storage, `extensions/${slug}`);
        imageUrl = await new Promise((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, file);
          task.on("state_changed",
            (snap) => setUploadProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
            reject,
            async () => { try { resolve(await getDownloadURL(task.snapshot.ref)); } catch (e) { reject(e); } }
          );
        });
      }

      setStep("saving");

      const payload = {
        name: name.trim(), slug, category: category.trim(),
        description: description.trim(), icon: icon.trim(),
        chromeUrl: chromeUrl.trim(), rating: Number(rating) || 0,
        features: features.filter((f) => f.trim()),
        image: imageUrl,
        hasChromeStore: !!(chromeUrl.trim()),
        updatedAt: serverTimestamp(),
      };

      if (isEdit) {
        await updateExtension(extension.id, payload);
      } else {
        await createExtension(slug, { ...payload, createdAt: serverTimestamp() });
      }

      logAuditEvent({
        module: "extensions",
        action: isEdit ? "EXTENSION_UPDATE" : "EXTENSION_CREATE",
        entityType: "extension",
        entityId: isEdit ? extension.id : slug,
        summary: `${isEdit ? "Updated" : "Created"} extension "${name.trim()}"`,
        changes: { slug, category: category.trim(), hasChromeStore: !!chromeUrl.trim() },
        route: "/extensions",
      });

      setStep("done");
      emitAlert({ type: "success", message: isEdit ? "Extension updated" : "Extension created" });
      refresh();
      setTimeout(onClose, 600);

    } catch (err) {
      console.error(err);
      setStep("idle");
      setUploadProgress(0);
      emitAlert({ type: "error", message: err?.message || "Failed to save extension" });
    } finally {
      setLoading(false);
    }
  };

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const stepLabel = { idle: isEdit ? "Update Extension" : "Create Extension", uploading: `Uploading… ${uploadProgress}%`, saving: "Saving…", done: "Done!" }[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Extension" : "New Extension"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? <>Editing <span className="font-semibold text-gray-700">{extension.name}</span></>
                : "Configure extension details, features, and preview image."}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* BASIC INFO */}
          <Section title="Basic Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Extension Name" icon={<Type className="w-3.5 h-3.5" />} required error={errors.name}
                hint="The public-facing name of the extension.">
                <Input placeholder="e.g. BMI Calculator" value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                  error={errors.name} disabled={loading} />
              </Field>

              <Field label="Slug" icon={<Hash className="w-3.5 h-3.5" />} required error={errors.slug}
                hint={isEdit ? "Slug cannot be changed after creation." : "Auto-generated from name."}>
                <div className="relative">
                  <Input value={slug}
                    onChange={(e) => { setSlug(e.target.value); setErrors((p) => ({ ...p, slug: undefined })); }}
                    readOnly={isEdit} error={errors.slug} disabled={loading} />
                  {isEdit && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />}
                </div>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category" icon={<Tag className="w-3.5 h-3.5" />} required error={errors.category}
                hint="e.g. Utilities & Calculators">
                <Input placeholder="Utilities & Calculators" value={category}
                  onChange={(e) => { setCategory(e.target.value); setErrors((p) => ({ ...p, category: undefined })); }}
                  error={errors.category} disabled={loading} />
              </Field>

              <Field label="Icon (lucide-react)" icon={<Zap className="w-3.5 h-3.5" />} required error={errors.icon}
                hint="Component name, e.g. Calculator">
                <Input placeholder="Calculator" value={icon}
                  onChange={(e) => { setIcon(e.target.value); setErrors((p) => ({ ...p, icon: undefined })); }}
                  error={errors.icon} disabled={loading} />
              </Field>
            </div>

            <Field label="Description" icon={<AlignLeft className="w-3.5 h-3.5" />} required error={errors.description}>
              <Textarea rows={3} placeholder="Describe what this extension does…"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
                error={errors.description} disabled={loading} />
            </Field>
          </Section>

          {/* STORE & RATING */}
          <Section title="Store & Rating">
            <Field label="Chrome Web Store URL" icon={<Link2 className="w-3.5 h-3.5" />} error={errors.chromeUrl}
              hint="Leave blank if not listed on the Chrome Store.">
              <Input placeholder="https://chromewebstore.google.com/detail/…"
                value={chromeUrl}
                onChange={(e) => { setChromeUrl(e.target.value); setErrors((p) => ({ ...p, chromeUrl: undefined })); }}
                error={errors.chromeUrl} disabled={loading} />
            </Field>

            <Field label="Rating" icon={<Star className="w-3.5 h-3.5" />}
              hint="Click a star or type a value between 0.0 and 5.0.">
              <RatingPicker value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: undefined })); }} error={errors.rating} />
            </Field>
          </Section>

          {/* FEATURES */}
          <Section title="Features">
            <div className="space-y-2">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="text-gray-300 cursor-grab shrink-0">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="flex-1 relative">
                    <Input value={f}
                      onChange={(e) => { updateFeature(i, e.target.value); setErrors((p) => ({ ...p, features: undefined })); }}
                      placeholder={`Feature ${i + 1}`}
                      error={errors.features && !f.trim() ? true : undefined}
                      disabled={loading} />
                  </div>
                  <button type="button" onClick={() => removeFeature(i)} disabled={features.length === 1 || loading}
                    className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-30 shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {errors.features && (
                <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                  <AlertCircle className="w-3 h-3" />{errors.features}
                </p>
              )}
              <button type="button" onClick={addFeature} disabled={loading}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-40">
                <Plus className="w-3.5 h-3.5" />Add Feature
              </button>
            </div>
          </Section>

          {/* IMAGE */}
          <Section title="Preview Image">
            {!preview ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !loading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer
                  ${dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : errors.image ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}
                  ${loading ? "pointer-events-none opacity-50" : ""}`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
                  <UploadCloud className={`w-6 h-6 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700">Drop image here or <span className="text-blue-500">browse</span></p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 2MB</p>
                </div>
                {errors.image && (
                  <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
                    <AlertCircle className="w-3 h-3" />{errors.image}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                <div className="relative group">
                  <img src={preview} alt="Preview" className="w-full max-h-52 object-contain bg-white" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button onClick={removeImage} disabled={loading}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition">
                      <Trash2 className="w-3.5 h-3.5" />Remove
                    </button>
                  </div>
                </div>
                {file && (
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-gray-200 bg-white">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                        <UploadCloud className="w-3.5 h-3.5 text-indigo-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-gray-400">{fmtSize(file.size)}</p>
                      </div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  </div>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
          </Section>

          {/* Upload progress */}
          {step === "uploading" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading image…</span>
                <span className="font-semibold tabular-nums">{uploadProgress}%</span>
              </div>
              <ProgressBar value={uploadProgress} />
            </div>
          )}
          {step === "saving" && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />Saving to database…
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />{isEdit ? "Extension updated!" : "Extension created!"}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">
            {isEdit
              ? "Changes will update the extension immediately."
              : <><span className="font-semibold text-gray-600">hasChromeStore</span> is set automatically from the Chrome URL.</>}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={saveExtension} disabled={loading || step === "done"}
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