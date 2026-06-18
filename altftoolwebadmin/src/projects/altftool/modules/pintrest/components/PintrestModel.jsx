"use client";

import { useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { storage } from "@/lib/firebase";
import { createData, updateData } from "../service/data.service";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  X, UploadCloud, AlertCircle, CheckCircle2,
  Image as ImageIcon, Type, Loader2,
  Trash2, Info, Globe, Percent, DollarSign, Link2,
  Layers, Plus, FileImage, Heart, Video as VideoIcon
} from "lucide-react";
import { compressVideo, getVideoMetadata } from "../service/videoCompressionService";

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

/* ── Select ── */
function Select({ error, options, ...props }) {
  return (
    <select
      {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white appearance-none cursor-pointer
        focus:outline-none focus:ring-2 transition
        ${error
          ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
          : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
        }`}
    >
      <option value="">Select a category</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>{opt.name}</option>
      ))}
    </select>
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
function ImageField({ label, icon, imageMode, imageUrl, imageUrlValid,
  preview, file, dragOver, loading, error,
  onSwitchMode, onFileChange, onDrop, onDragOver, onDragLeave,
  onRemoveFile, onUrlChange, onUrlBlur, fileInputRef }) {

  const fmtSize = (bytes) => bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(1)} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <Field label={label} icon={icon} error={error}>
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
          </div>
        </div>
      )}
    </Field>
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function DataModal({ data, onClose, categories = [] }) {
  const isEdit = !!data;

  /* ── Fields ── */
  const [title, setTitle] = useState(data?.title || "");
  const [description, setDescription] = useState(data?.description || "");
  const [categoryId, setCategoryId] = useState(data?.categoryId || "");
  const [redirect, setRedirect] = useState(data?.redirect || "");
  const [keywords, setKeywords] = useState(data?.keywords ?? "");
  const [collection, setCollection] = useState(data?.collection ?? "");
  const [likes, setLikes] = useState(data?.likes || 0);

  /* ── Logo image ── */
  const [logoMode, setLogoMode] = useState("upload");
  const [logoUrl, setLogoUrl] = useState(isEdit ? data.logo || "" : "");
  const [logoUrlValid] = useState(isEdit && data?.logo ? true : null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(isEdit ? data?.logo || null : null);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const logoRef = useRef(null);

  /* ── Gallery images ── */
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [existingGallery, setExistingGallery] = useState(data?.gallery || []);
  const galleryRef = useRef(null);

  /* ── Shared state ── */
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [compressionState, setCompressionState] = useState({ active: false, progress: 0, fileName: "" });

  /* ── File helpers ── */
  const handleLogoChange = (file) => {
    if (file && file.size < 2 * 1024 * 1024) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setErrors((p) => ({ ...p, logo: undefined }));
    } else {
      setErrors((p) => ({ ...p, logo: "File too large (>2MB)" }));
    }
  };

  const handleGalleryChange = async (files) => {
    if (!files) return;
    const newItems = await Promise.all(Array.from(files).map(async file => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type === "video/mp4";
      
      if (!isImage && !isVideo) return null;

      let metadata = {};
      if (isVideo) {
        metadata = await getVideoMetadata(file);
      }

      return {
        file,
        preview: isImage ? URL.createObjectURL(file) : null,
        type: isImage ? "image" : "video",
        metadata
      };
    }));

    setGalleryFiles(prev => [...prev, ...newItems.filter(item => item !== null)]);
  };

  const removeGalleryFile = (index, isExisting = false) => {
    if (isExisting) {
      setExistingGallery(prev => prev.filter((_, i) => i !== index));
    } else {
      setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    }
  };

  /* ── Validation ── */
  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = "Title is required";
    if (!description.trim()) e.description = "Description is required";
    if (!categoryId) e.category = "Category is required";
    if (logoMode === "upload" && !logoFile && !logoPreview) e.logo = "Logo is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── Upload helper: uploads a single file, calls onProgress(0-100) ── */
  const uploadFile = (file, path, onProgress) =>
    new Promise((resolve, reject) => {
      const ref = storageRef(storage, path);
      const task = uploadBytesResumable(ref, file);
      task.on(
        "state_changed",
        (snap) => onProgress(snap.bytesTransferred / snap.totalBytes),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref))
      );
    });

  /* ── Submit – real Firebase Storage + Firestore ── */
  const handleSave = async () => {
    if (!validate()) return;

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      emitAlert({ type: "error", message: "Session expired. Please log in again." });
      return;
    }

    setLoading(true);
    setStep("uploading");
    setUploadProgress(0);

    try {
      const ts = Date.now();

      /* ─ 1. Upload logo (counts for 0→60% of progress bar) ─ */
      let logoFinalUrl =
        logoMode === "url"
          ? logoUrl.trim()
          : logoPreview && !logoFile
            ? logoPreview          // already a remote URL from edit mode
            : "";

      if (logoMode === "upload" && logoFile) {
        logoFinalUrl = await uploadFile(
          logoFile,
          `projects/altftool/pintrest/logos/${ts}_${logoFile.name}`,
          (frac) => setUploadProgress(Math.round(frac * 60))
        );
      } else {
        setUploadProgress(60);
      }

      /* ─ 2. Upload new gallery files (counts for 60→95%) ─ */
      const resolvedCategory =
        categories.find((c) => c.id === categoryId)?.name || "";
      const galleryUrls = [...existingGallery];
      const totalNew = galleryFiles.length;
      
      for (let i = 0; i < totalNew; i++) {
        const item = galleryFiles[i];
        let fileToUpload = item.file;
        let metadata = {
          type: item.type,
          originalSize: item.file.size,
          mimeType: item.file.type,
          ...item.metadata
        };

        if (item.type === "video") {
          setStep("compressing");
          setCompressionState({ active: true, progress: 0, fileName: item.file.name });
          
          fileToUpload = await compressVideo(item.file, (prog) => {
            setCompressionState(prev => ({ ...prev, progress: prog }));
          });
          
          metadata.compressedSize = fileToUpload.size;
          setCompressionState({ active: false, progress: 100, fileName: "" });
          setStep("uploading");
        }

        const url = await uploadFile(
          fileToUpload,
          `projects/altftool/pintrest/gallery/${ts}_${i}_${item.file.name}${item.type === "video" ? ".mp4" : ""}`,
          (frac) =>
            setUploadProgress(
              Math.round(60 + ((i + frac) / (totalNew || 1)) * 35)
            )
        );
        
        galleryUrls.push({
          mediaUrl: url,
          ...metadata,
          category: resolvedCategory,
          board: data?.Board || "",
          createdAt: new Date().toISOString()
        });
      }
      setUploadProgress(95);

      /* ─ 3. Build payload ─ */
      setStep("saving");
      const id = isEdit ? data.id : `pin_${ts}`;
      const payload = {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        Category: resolvedCategory,   // denormalised for table display
        Board: data?.Board || "",     // preserved; no board system yet
        redirect: redirect.trim(),
        keywords: keywords.trim(),
        collection: collection.trim(),
        logo: logoFinalUrl,
        img: logoFinalUrl,            // mirror for img column in table
        gallery: galleryUrls,
        save: isEdit ? (data.save ?? 0) : 0,
        likes: Number(likes) || 0,
        status: isEdit ? (data.status || "active") : "active",
        creatorUid: user.uid,
        creatorEmail: user.email,
      };

      /* ─ 5. Write to Firestore ─ */
      if (isEdit) {
        await updateData(data.id, payload);
        emitAlert({ type: "success", message: "Pin updated successfully" });
        logAuditEvent({
          module: "pintrest",
          action: "PIN_UPDATE",
          entityType: "pin",
          entityId: data.id,
          summary: `Updated pin "${payload.title}"`,
          changes: payload,
          route: "/pintrest",
        });
      } else {
        await createData(id, payload);
        emitAlert({ type: "success", message: "Pin created successfully" });
        logAuditEvent({
          module: "pintrest",
          action: "PIN_CREATE",
          entityType: "pin",
          entityId: id,
          summary: `Created pin "${payload.title}"`,
          changes: payload,
          route: "/pintrest",
        });
      }

      setUploadProgress(100);
      setStep("done");
      setTimeout(onClose, 1000);
    } catch (err) {
      console.error("[PintrestModel] save error:", err);
      const msg =
        err.code === "storage/unauthorized"
          ? "Storage permission denied. Check Firebase Storage rules."
          : err.code === "permission-denied"
            ? "Firestore permission denied. Check security rules."
            : err.code === "storage/canceled"
              ? "Upload was cancelled. Please try again."
              : err.message || "Something went wrong. Please try again.";
      emitAlert({ type: "error", message: msg });
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[620px] max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-8 py-6 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {isEdit ? "Edit Data Item" : "Create Data Item"}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Fill in the details below to add a new item
            </p>
          </div>
          <button onClick={onClose} disabled={loading}
            className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

          {/* Info banner */}
          <div className="flex gap-3 bg-blue-50/80 border border-blue-100 rounded-2xl p-4">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-bold">Requirements</p>
              <p>Select a category and provide basic details. You can now add multiple gallery images.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

            {/* Category Select */}
            <Field label="Category" icon={<Layers size={14} />} error={errors.category}>
              <div className="relative">
                <Select
                  options={categories}
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  error={errors.category}
                  disabled={loading}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Plus size={14} />
                </div>
              </div>
            </Field>
          </div>

          {/* Description */}
          <Field label="Description" icon={<Type size={14} />} error={errors.description}>
            <Textarea
              placeholder="The best tool for managing your workflow…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              error={errors.description}
              disabled={loading}
            />
          </Field>

          {/* Redirect URL */}
          <Field label="Redirect URL" icon={<Link2 size={14} />} error={errors.redirect}>
            <Input
              placeholder="https://example.com/landing-page"
              value={redirect}
              onChange={(e) => setRedirect(e.target.value)}
              error={errors.redirect}
              disabled={loading}
            />
          </Field>

          {/* keywords + collections */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Keywords">
              <Input
                type="text"
                placeholder="e.g. Ai images, productivity, etc."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                disabled={loading}
              />
            </Field>
            <Field label="Collection">
              <Input
                type="text"
                placeholder="e.g. wallpapers, icons, etc."
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                disabled={loading}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Likes" icon={<Heart size={14} />}>
              <Input
                type="number"
                placeholder="0"
                value={likes}
                onChange={(e) => setLikes(e.target.value)}
                disabled={loading}
              />
            </Field>
          </div>

          {/* Logo Field */}
          <ImageField
            label="Main Logo"
            icon={<ImageIcon size={14} />}
            imageMode={logoMode}
            imageUrl={logoUrl}
            imageUrlValid={logoUrlValid}
            preview={logoPreview}
            file={logoFile}
            dragOver={logoDragOver}
            loading={loading}
            error={errors.logo}
            onSwitchMode={setLogoMode}
            onFileChange={(e) => handleLogoChange(e.target.files[0])}
            onDrop={(e) => {
              e.preventDefault();
              setLogoDragOver(false);
              handleLogoChange(e.dataTransfer.files[0]);
            }}
            onDragOver={(e) => { e.preventDefault(); setLogoDragOver(true); }}
            onDragLeave={() => setLogoDragOver(false)}
            onRemoveFile={() => { setLogoFile(null); setLogoPreview(null); }}
            onUrlChange={(e) => setLogoUrl(e.target.value)}
            fileInputRef={logoRef}
          />

          {/* Gallery Images (Multiple) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
                <FileImage size={14} className="text-gray-400" />
                Gallery Images
              </label>
              <span className="text-[10px] text-gray-400 uppercase font-bold">
                {galleryFiles.length + existingGallery.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Existing Images */}
              {existingGallery.map((item, i) => {
                const isObject = typeof item === "object" && item !== null;
                const mediaUrl = isObject ? item.mediaUrl || item.url : item;
                const type = isObject ? item.type : "image";

                return (
                  <div key={`exist-${i}`} className="aspect-square rounded-2xl border border-gray-200 overflow-hidden relative group bg-gray-50">
                    {type === "video" ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-500">
                        <VideoIcon size={32} />
                        <span className="text-[10px] font-bold uppercase">Video</span>
                      </div>
                    ) : (
                      <img src={mediaUrl} className="w-full h-full object-cover" />
                    )}
                    <button
                      onClick={() => removeGalleryFile(i, true)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="text-white w-5 h-5" />
                    </button>
                  </div>
                );
              })}

              {/* New Files */}
              {galleryFiles.map((item, i) => (
                <div key={`new-${i}`} className="aspect-square rounded-2xl border border-blue-200 overflow-hidden relative group bg-gray-100">
                  {item.type === "image" ? (
                    <img src={item.preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-blue-500">
                      <VideoIcon size={32} />
                      <span className="text-[10px] font-bold uppercase truncate px-2 w-full text-center">{item.file.name}</span>
                    </div>
                  )}
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">NEW</div>
                  <button
                    onClick={() => removeGalleryFile(i)}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="text-white w-5 h-5" />
                  </button>
                </div>
              ))}

              {/* Add Button */}
              <button
                type="button"
                onClick={() => galleryRef.current?.click()}
                disabled={loading}
                className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-all bg-gray-50/50"
              >
                <Plus size={24} />
                <span className="text-[10px] font-bold uppercase">Add More</span>
              </button>
            </div>
            <input
              ref={galleryRef}
              type="file"
              multiple
              accept="image/*,video/mp4"
              className="hidden"
              onChange={(e) => handleGalleryChange(e.target.files)}
            />
          </div>

          {/* Progress Tracking */}
          {loading && (
            <div className="space-y-3">
              {compressionState.active ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-blue-600 font-bold">
                    <span className="flex items-center gap-2">
                      <Loader2 size={12} className="animate-spin" />
                      Compressing: {compressionState.fileName}
                    </span>
                    <span>{compressionState.progress}%</span>
                  </div>
                  <ProgressBar value={compressionState.progress} />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>
                      {step === "uploading" ? "Uploading assets..." : 
                       step === "saving" ? "Finalizing details..." : "Processing..."}
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <ProgressBar value={uploadProgress} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
          <p className="text-xs text-gray-400">
            {step === "done" ? (
              <span className="text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Successfully Saved
              </span>
            ) : (
              <>Item will be set to <span className="font-bold text-green-600 uppercase">Active</span></>
            )}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={onClose} disabled={loading}
              className="px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-white border border-gray-200 rounded-2xl transition">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || step === "done"}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-2xl hover:bg-slate-800 transition shadow-lg shadow-slate-200 disabled:opacity-50 flex items-center gap-2"
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
