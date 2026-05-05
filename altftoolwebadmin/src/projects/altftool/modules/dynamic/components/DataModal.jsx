"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { createData, updateData } from "../service/data.service";
import {
  X, UploadCloud, AlertCircle, CheckCircle2,
  ExternalLink, Image as ImageIcon, Type, Loader2,
  Trash2, Info, Globe, Percent, DollarSign,
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

/* ── Textarea ── */
function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition resize-none
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
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-200"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/* ── Image Field (upload + url toggle) ── */
function ImageField({ label, icon, fieldKey, imageMode, imageUrl, imageUrlValid,
  preview, file, dragOver, loading, error,
  onSwitchMode, onFileChange, onDrop, onDragOver, onDragLeave,
  onRemoveFile, onUrlChange, onUrlBlur, onClearUrl, fileInputRef }) {

  const fmtSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <Field label={label} icon={icon} error={error}>
      {/* Mode toggle */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-2">
        {["upload", "url"].map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => onSwitchMode(mode)}
            disabled={loading}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
              ${imageMode === mode ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"}
              disabled:opacity-50`}
          >
            {mode === "upload" ? <><UploadCloud className="w-3.5 h-3.5" />Upload File</> : <><Globe className="w-3.5 h-3.5" />Paste URL</>}
          </button>
        ))}
      </div>

      {/* Upload mode */}
      {imageMode === "upload" && (
        <>
          {!preview ? (
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer
                ${dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]" : error ? "border-red-300 bg-red-50/30" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}
                ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
                <UploadCloud className={`w-6 h-6 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Drop image here or <span className="text-blue-500">browse</span></p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 2MB</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
              <div className="relative group">
                <img src={preview} alt="Preview" className="w-full max-h-48 object-contain bg-gray-100" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button onClick={onRemoveFile} disabled={loading}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" />Remove
                  </button>
                </div>
              </div>
              {/* ✅ Only render file info bar when a file object exists (not when preview is from an existing URL) */}
              {file && (
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
              )}
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        </>
      )}

      {/* URL mode */}
      {imageMode === "url" && (
        <div className="space-y-3">
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              disabled={loading}
              onChange={onUrlChange}
              onBlur={onUrlBlur}
              className={`w-full text-sm pl-9 pr-10 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
                focus:outline-none focus:ring-2 transition
                ${error ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                  : imageUrlValid === true ? "border-green-300 focus:ring-green-400/30 focus:border-green-400"
                  : imageUrlValid === false ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                  : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              {imageUrl && imageUrlValid === true && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              {imageUrl && imageUrlValid === false && <AlertCircle className="w-4 h-4 text-red-400" />}
              {imageUrl && imageUrlValid === null && (
                <button type="button" onClick={onClearUrl} className="text-gray-400 hover:text-gray-600 transition" tabIndex={-1}>
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          </div>

          {imageUrl && imageUrlValid === true && (
            <div className="rounded-xl border border-green-100 overflow-hidden bg-gray-50">
              <div className="relative group">
                <img src={imageUrl} alt="URL preview" className="w-full max-h-48 object-contain bg-gray-100" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button type="button" onClick={onClearUrl} disabled={loading}
                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition disabled:opacity-50">
                    <Trash2 className="w-3.5 h-3.5" />Remove
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-green-100 bg-white">
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-xs font-medium text-gray-600 truncate flex-1">{imageUrl}</p>
                <a href={imageUrl} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-blue-500 transition shrink-0">
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
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function DataModal({ data, existingItems = [], onClose, refresh }) {
  const isEdit = !!data;

  /* ── Text fields ── */
  const [title, setTitle] = useState(data?.title || "");
  const [description, setDescription] = useState(data?.description || "");
  const [cashback, setCashback] = useState(data?.cashback ?? "");
  const [discount, setDiscount] = useState(data?.discount ?? "");

  /* ── Logo image state ── */
  const [logoMode, setLogoMode] = useState("upload");
  const [logoUrl, setLogoUrl] = useState(isEdit ? data.logo || "" : "");
  const [logoUrlValid, setLogoUrlValid] = useState(isEdit && data?.logo ? true : null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(isEdit ? data?.logo || null : null);
  const [logoDrag, setLogoDrag] = useState(false);
  const [logoProgress, setLogoProgress] = useState(0);
  const logoRef = useRef(null);

  /* ── Banner image state ── */
  const [bannerMode, setBannerMode] = useState("upload");
  const [bannerUrl, setBannerUrl] = useState(isEdit ? data.banner || "" : "");
  const [bannerUrlValid, setBannerUrlValid] = useState(isEdit && data?.banner ? true : null);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(isEdit ? data?.banner || null : null);
  const [bannerDrag, setBannerDrag] = useState(false);
  const [bannerProgress, setBannerProgress] = useState(0);
  const bannerRef = useRef(null);

  /* ── Shared state ── */
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");

  /* Init edit mode: detect URL vs upload */
  useEffect(() => {
    if (isEdit) {
      if (data.logo) setLogoMode("url");
      if (data.banner) setBannerMode("url");
    }
  }, []); // eslint-disable-line

  /* ── File helpers ── */
  const processFile = useCallback((selected, setFile, setPreview, setError) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      setError("Only image files are allowed (JPG, PNG, WebP)");
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      setError("File size must be under 2MB");
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setError(undefined);
  }, []);

  const removeFile = (setFile, setPreview, fileRef) => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const validateUrl = (url, setValid) => {
    if (!url.trim()) { setValid(null); return; }
    try { new URL(url); } catch { setValid(false); return; }
    const img = new Image();
    img.onload = () => setValid(true);
    img.onerror = () => setValid(false);
    img.src = url;
  };

  /* ── Upload helper ── */
  const uploadImage = (file, path, onProgress) =>
    new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      task.on("state_changed",
        (snap) => onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        reject,
        async () => { try { resolve(await getDownloadURL(task.snapshot.ref)); } catch (e) { reject(e); } }
      );
    });

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";

    const cb = cashback !== "" ? Number(cashback) : null;
    const dc = discount !== "" ? Number(discount) : null;
    if (cb === null && dc === null) {
      e.cashback = "At least one of cashback or discount is required";
      e.discount = "At least one of cashback or discount is required";
    }
    if (cashback !== "" && (isNaN(cb) || cb < 0)) e.cashback = "Enter a valid non-negative number";
    if (discount !== "" && (isNaN(dc) || dc < 0)) e.discount = "Enter a valid non-negative number";

    /* Logo */
    if (logoMode === "upload") {
      if (!logoFile && !logoPreview) e.logo = "Logo image is required";
    } else {
      if (!logoUrl.trim()) e.logo = "Logo URL is required";
      else if (logoUrlValid === false) e.logo = "URL doesn't point to a valid image";
      else { try { new URL(logoUrl); } catch { e.logo = "Enter a valid image URL (include https://)"; } }
    }

    /* Banner */
    if (bannerMode === "upload") {
      if (!bannerFile && !bannerPreview) e.banner = "Banner image is required";
    } else {
      if (!bannerUrl.trim()) e.banner = "Banner URL is required";
      else if (bannerUrlValid === false) e.banner = "URL doesn't point to a valid image";
      else { try { new URL(bannerUrl); } catch { e.banner = "Enter a valid image URL (include https://)"; } }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── ID generator ── */
  const generateId = () => {
    const nums = existingItems
      .map((item) => Number(item.id?.split("_").pop()))
      .filter((n) => !isNaN(n));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `data_${next}`;
  };

  /* ── Submit ── */
  const handleSave = async () => {
    if (!validate()) return;

    const user = getAuth().currentUser;
    if (!user) {
      emitAlert({ type: "error", message: "Session expired. Please log in again." });
      return;
    }

    setLoading(true);
    try {
      const id = isEdit ? data.id : generateId();

      /* Resolve logo URL */
      let resolvedLogo;
      if (logoMode === "upload" && logoFile) {
        setStep("uploading_logo");
        resolvedLogo = await uploadImage(logoFile, `data/${id}/logo`, setLogoProgress);
      } else {
        resolvedLogo = logoMode === "url" ? logoUrl.trim() : logoPreview;
      }

      /* Resolve banner URL */
      let resolvedBanner;
      if (bannerMode === "upload" && bannerFile) {
        setStep("uploading_banner");
        resolvedBanner = await uploadImage(bannerFile, `data/${id}/banner`, setBannerProgress);
      } else {
        resolvedBanner = bannerMode === "url" ? bannerUrl.trim() : bannerPreview;
      }

      setStep("saving");

      const payload = {
        title: title.trim(),
        description: description.trim(),
        logo: resolvedLogo,
        banner: resolvedBanner,
        cashback: cashback !== "" ? Number(cashback) : null,
        discount: discount !== "" ? Number(discount) : null,
        status: isEdit ? data.status : "active",
      };

      if (isEdit) {
        await updateData(id, payload);
      } else {
        await createData(id, { ...payload, id });
      }

      logAuditEvent({
        module: "data",
        action: isEdit ? "DATA_UPDATE" : "DATA_CREATE",
        entityType: "data",
        entityId: id,
        summary: `${isEdit ? "Updated" : "Created"} data item "${title.trim()}"`,
        changes: payload,
        route: "/data",
      });

      emitAlert({ type: "success", message: `Data item ${isEdit ? "updated" : "created"} successfully` });
      setStep("done");
      refresh?.();
      setTimeout(onClose, 600);
    } catch (err) {
      console.error("DataModal error:", err);
      setStep("idle");
      setLogoProgress(0);
      setBannerProgress(0);
      emitAlert({ type: "error", message: err?.message || "Failed to save. Try again." });
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = {
    idle: isEdit ? "Save Changes" : "Create Item",
    uploading_logo: `Uploading logo… ${logoProgress}%`,
    uploading_banner: `Uploading banner… ${bannerProgress}%`,
    saving: "Saving…",
    done: "Done!",
  }[step] ?? (isEdit ? "Save Changes" : "Create Item");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Data Item" : "Create Data Item"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit ? `Editing: ${data.title}` : "Fill in the details below to add a new item"}
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Info banner */}
          <div className="flex gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700 space-y-0.5">
              <p className="font-bold">Requirements</p>
              <p>Title, description, logo, and banner are required. At least one of <span className="font-semibold">cashback</span> or <span className="font-semibold">discount</span> must be provided.</p>
            </div>
          </div>

          {/* Title */}
          <Field label="Title" icon={<Type className="w-3.5 h-3.5" />}
            hint="Display name for this item." error={errors.title}>
            <Input
              placeholder="e.g. Acme Pro"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })); }}
              error={errors.title}
              disabled={loading}
            />
          </Field>

          {/* Description */}
          <Field label="Description" icon={<Type className="w-3.5 h-3.5" />}
            hint="Short description shown below the title." error={errors.description}>
            <Textarea
              placeholder="e.g. The best tool for managing your workflow…"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
              error={errors.description}
              disabled={loading}
            />
          </Field>

          {/* Cashback + Discount side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cashback %" icon={<Percent className="w-3.5 h-3.5" />}
              hint="Optional. e.g. 10 for 10%" error={errors.cashback}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 10"
                value={cashback}
                onChange={(e) => {
                  setCashback(e.target.value);
                  setErrors((p) => ({ ...p, cashback: undefined, discount: undefined }));
                }}
                error={errors.cashback}
                disabled={loading}
              />
            </Field>
            <Field label="Discount %" icon={<DollarSign className="w-3.5 h-3.5" />}
              hint="Optional. e.g. 20 for 20%" error={errors.discount}>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 20"
                value={discount}
                onChange={(e) => {
                  setDiscount(e.target.value);
                  setErrors((p) => ({ ...p, discount: undefined, cashback: undefined }));
                }}
                error={errors.discount}
                disabled={loading}
              />
            </Field>
          </div>

          {/* Logo */}
          <ImageField
            label="Logo"
            icon={<ImageIcon className="w-3.5 h-3.5" />}
            fieldKey="logo"
            imageMode={logoMode}
            imageUrl={logoUrl}
            imageUrlValid={logoUrlValid}
            preview={logoPreview}
            file={logoFile}
            dragOver={logoDrag}
            loading={loading}
            error={errors.logo}
            onSwitchMode={(mode) => {
              setLogoMode(mode);
              setErrors((p) => ({ ...p, logo: undefined }));
              if (mode === "url") removeFile(setLogoFile, setLogoPreview, logoRef);
              else { setLogoUrl(""); setLogoUrlValid(null); }
            }}
            onFileChange={(e) => processFile(
              e.target.files[0], setLogoFile, setLogoPreview,
              (msg) => setErrors((p) => ({ ...p, logo: msg }))
            )}
            onDrop={(e) => {
              e.preventDefault(); setLogoDrag(false);
              processFile(e.dataTransfer.files[0], setLogoFile, setLogoPreview,
                (msg) => setErrors((p) => ({ ...p, logo: msg })));
            }}
            onDragOver={(e) => { e.preventDefault(); setLogoDrag(true); }}
            onDragLeave={() => setLogoDrag(false)}
            onRemoveFile={() => removeFile(setLogoFile, setLogoPreview, logoRef)}
            onUrlChange={(e) => {
              setLogoUrl(e.target.value);
              setLogoUrlValid(null);
              setErrors((p) => ({ ...p, logo: undefined }));
            }}
            onUrlBlur={(e) => validateUrl(e.target.value, setLogoUrlValid)}
            onClearUrl={() => { setLogoUrl(""); setLogoUrlValid(null); setErrors((p) => ({ ...p, logo: undefined })); }}
            fileInputRef={logoRef}
          />

          {/* Logo upload progress */}
          {step === "uploading_logo" && logoMode === "upload" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading logo…</span>
                <span className="font-semibold tabular-nums">{logoProgress}%</span>
              </div>
              <ProgressBar value={logoProgress} />
            </div>
          )}

          {/* Banner */}
          <ImageField
            label="Banner"
            icon={<ImageIcon className="w-3.5 h-3.5" />}
            fieldKey="banner"
            imageMode={bannerMode}
            imageUrl={bannerUrl}
            imageUrlValid={bannerUrlValid}
            preview={bannerPreview}
            file={bannerFile}
            dragOver={bannerDrag}
            loading={loading}
            error={errors.banner}
            onSwitchMode={(mode) => {
              setBannerMode(mode);
              setErrors((p) => ({ ...p, banner: undefined }));
              if (mode === "url") removeFile(setBannerFile, setBannerPreview, bannerRef);
              else { setBannerUrl(""); setBannerUrlValid(null); }
            }}
            onFileChange={(e) => processFile(
              e.target.files[0], setBannerFile, setBannerPreview,
              (msg) => setErrors((p) => ({ ...p, banner: msg }))
            )}
            onDrop={(e) => {
              e.preventDefault(); setBannerDrag(false);
              processFile(e.dataTransfer.files[0], setBannerFile, setBannerPreview,
                (msg) => setErrors((p) => ({ ...p, banner: msg })));
            }}
            onDragOver={(e) => { e.preventDefault(); setBannerDrag(true); }}
            onDragLeave={() => setBannerDrag(false)}
            onRemoveFile={() => removeFile(setBannerFile, setBannerPreview, bannerRef)}
            onUrlChange={(e) => {
              setBannerUrl(e.target.value);
              setBannerUrlValid(null);
              setErrors((p) => ({ ...p, banner: undefined }));
            }}
            onUrlBlur={(e) => validateUrl(e.target.value, setBannerUrlValid)}
            onClearUrl={() => { setBannerUrl(""); setBannerUrlValid(null); setErrors((p) => ({ ...p, banner: undefined })); }}
            fileInputRef={bannerRef}
          />

          {/* Banner upload progress */}
          {step === "uploading_banner" && bannerMode === "upload" && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Uploading banner…</span>
                <span className="font-semibold tabular-nums">{bannerProgress}%</span>
              </div>
              <ProgressBar value={bannerProgress} />
            </div>
          )}

          {/* Saving indicator */}
          {step === "saving" && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              Saving to database…
            </div>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {isEdit ? "Item updated successfully!" : "Item created successfully!"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">
            {isEdit
              ? "Changes will be applied immediately."
              : <>Item will be set to <span className="font-semibold text-green-600">Active</span> after creation.</>}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading || step === "done"}
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