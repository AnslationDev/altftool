"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { storage } from "@/lib/firebase";
import { serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  X, Type, Hash, Tag, AlignLeft, Zap, Link2, Star,
  UploadCloud, Trash2, Plus, AlertCircle, CheckCircle2,
  Loader2, GripVertical, Lock,
  ChevronDown,
} from "lucide-react";
import {
  createAcademy,
  updateAcademy,
} from "../service/academyService";


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

/* ── ComboBox: typeable + dropdown ── */
function ComboBox({ value, onChange, options = [], placeholder, disabled, error, hint }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value || "");
  const wrapRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = query
    ? options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))
    : options;

  const handleInput = (e) => {
    setQuery(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (opt) => {
    setQuery(opt);
    onChange(opt);
    setOpen(false);
  };

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          className={`w-full text-sm px-3 py-2.5 pr-8 rounded-xl border bg-white placeholder:text-gray-400
            focus:outline-none focus:ring-2 transition
            ${error ? "border-red-300 focus:ring-red-400/30 focus:border-red-400"
                    : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}
            ${disabled ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "cursor-text"}`}
        />
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={() => !disabled && setOpen((p) => !p)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition"
        >
          <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {open && !disabled && (
        <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-2.5 text-xs text-gray-400 italic">
              {query ? `Press Enter to add "${query}"` : "No options"}
            </div>
          ) : (
            <>
              {options.length > 0 && (
                <div className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Suggestions
                </div>
              )}
              {filtered.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2
                    hover:bg-blue-50 hover:text-blue-700
                    ${value === opt ? "text-blue-600 font-semibold bg-blue-50/60" : "text-gray-700"}`}
                >
                  {value === opt && (
                    <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  <span>{opt}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

const CATEGORY_OPTIONS = [
  "Govt & Competitive Exams",
  "Tech & Coding",
  "Skills & Career Growth",
  "Higher Education",
  "School & Foundation",
  "Course Creation",
];

function CategoryDropdown({
  value,
  onChange,
  error,
  disabled,
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!ref.current?.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((p) => !p)}
        className={`w-full flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm
          bg-white
          ${error ? "border-red-500" : "border-neutral-300"}
          hover:border-neutral-400
          focus:outline-none`}
      >
        <span className={value ? "" : "text-neutral-400"}>
          {value || "Select category"}
        </span>

        <ChevronDown
          className={`w-4 h-4 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden animate-in fade-in zoom-in-95">
          {CATEGORY_OPTIONS.map((option) => {
            const selected = value === option;

            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm transition
                  ${
                    selected
                      ? "bg-neutral-100 font-medium"
                      : "hover:bg-neutral-50"
                  }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════
   Main Modal
════════════════════════════════════ */
export default function AcademyModal({ academy, academies = [], onClose, refresh }) {
  const isEdit = !!academy;

  const [name, setName] = useState(academy?.name || "");
  const [category, setCategory] = useState(academy?.category || "");
  const [description, setDescription] = useState(academy?.description || "");
  const [rating, setRating] = useState(academy?.rating || "");
  const [academyUrl, setAcademyUrl] = useState(academy?.academyUrl || "");

  const [features, setFeatures] = useState(academy?.features?.length ? academy.features : [""]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(academy?.image || null);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState("idle"); // idle | uploading | saving | done
  const [subCategory, setSubCategory] = useState(academy?.subCategory || "");
  const [price, setPrice] = useState(academy?.price || "");
  const [allAcademies, setAllAcademies] = useState([]);

  const categories = [...new Set(academies.map(a => a.category).filter(Boolean))];

  const subCategories = [
    ...new Set(
      academies
        .filter(a => a.category === category)
        .map(a => a.subCategory)
        .filter(Boolean)
    )
  ];

  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview && file) URL.revokeObjectURL(preview);
    };
  }, [preview, file]);

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

    if (!name.trim()) e.name = "Academy name is required";

    if (!category.trim()) e.category = "Category is required";

    if (!subCategory.trim()) e.subCategory = "Sub-category is required";

    if (!price || isNaN(price) || Number(price) < 0) {
      e.price = "Enter a valid price";
    }

    if (!description.trim()) e.description = "Description is required";

    if (rating !== "" && (parseFloat(rating) < 0 || parseFloat(rating) > 5)) {
      e.rating = "Rating must be between 0 and 5";
    }

    if (features.some((f) => !f.trim())) {
      e.features = "All features must have text";
    }

    if (academyUrl) {
      try {
        new URL(academyUrl);
      } catch {
        e.academyUrl = "Enter a valid URL (include https://)";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveAcademy = async () => {
  if (!validate()) return;

  setLoading(true);

  try {
    let imageUrl = preview || "";

    // upload image if new file exists
    if (file) {
      setStep("uploading");

      const storageRef = ref(storage, `academies/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
          },
          reject,
          async () => {
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }

    setStep("saving");

    const payload = {
      name: name.trim(),
      category: category.trim(),
      subCategory: subCategory.trim(),
      price: Number(price),
      description: description.trim(),
      rating: Number(rating) || 0,
      features: features.filter((f) => f.trim()),
      image: imageUrl,
      academyUrl: academyUrl.trim(),
    };

    if (isEdit) {
      await updateAcademy(academy.id, payload);
    } else {
      const id = Date.now().toString();
      await createAcademy(id, payload);
    }

    setStep("done");

    emitAlert({
      type: "success",
      message: isEdit
        ? "Academy updated successfully"
        : "Academy created successfully",
    });

    if (refresh) await refresh();

    setTimeout(onClose, 600);

  } catch (err) {
    console.error(err);
    emitAlert({ type: "error", message: "Failed to save academy" });
  } finally {
    setLoading(false);
  }
};

  const fmtSize = (b) => b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  const stepLabel = { idle: isEdit ? "Update Academy" : "Create Academy", uploading: `Uploading… ${uploadProgress}%`, saving: "Saving…", done: "Done!" }[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">
              {isEdit ? "Edit Academy" : "New Academy"}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isEdit
                ? <>Editing <span className="font-semibold text-gray-700">{academy.name}</span></>
                : "Configure academy details, features, and preview image."}
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
              <Field label="Academy Name" icon={<Type className="w-3.5 h-3.5" />} required error={errors.name}
                hint="The public-facing name of the academy.">
                <Input placeholder="e.g. Coursera" value={name}
                  onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
                  error={errors.name} disabled={loading} />
              </Field>

              <Field
  label="Category"
  icon={<Tag className="w-3.5 h-3.5" />}
  required
  error={errors.category}
  hint="Select new category"
>
  <CategoryDropdown
    value={category}
    onChange={(v) => {
      setCategory(v);
      setSubCategory("");
      setErrors((p) => ({ ...p, category: undefined }));
    }}
    disabled={loading}
    error={errors.category}
  />
</Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Sub-Category" icon={<Tag className="w-3.5 h-3.5" />} required error={errors.subCategory} hint="Select or type a sub-category">
  <ComboBox
    value={subCategory}
    onChange={(v) => {
      setSubCategory(v);
      setErrors((p) => ({ ...p, subCategory: undefined }));
    }}
    options={subCategories}
    placeholder={category ? "e.g. Web Development" : "Select a category first"}
    disabled={loading || !category}
    error={errors.subCategory}
  />
</Field>

              <Field label="Cost" icon={<Hash className="w-3.5 h-3.5" />} required error={errors.price}
                hint={isEdit ? "Cost cannot be changed after creation." : "Enter Cost"}>
                <div className="relative">
                  <Input
                    value={price}
                    onChange={(e) => {
                      setPrice(e.target.value);
                      setErrors((p) => ({ ...p, price: undefined }));
                    }}
                    // readOnly={isEdit}
                    error={errors.price}
                    disabled={loading}
                  />
                  {isEdit && <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />}
                </div>
              </Field>
            </div>

            <Field label="Description" icon={<AlignLeft className="w-3.5 h-3.5" />} required error={errors.description}>
              <Textarea rows={3} placeholder="Describe what this academy does…"
                value={description}
                onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })); }}
                error={errors.description} disabled={loading} />
            </Field>
          </Section>

          {/* Details */}
          <Section title="Details about Academy">
            <Field label="Academy URL" icon={<Link2 className="w-3.5 h-3.5" />} error={errors.academyUrl}
              hint="Eg: https://www.udemy.com/">
              <Input placeholder="https://www.udemy.com/"
                value={academyUrl}
                onChange={(e) => { setAcademyUrl(e.target.value); setErrors((p) => ({ ...p, academyUrl: undefined })); }}
                error={errors.academyUrl} disabled={loading} />
            </Field>

            <Field label="Rating" icon={<Star className="w-3.5 h-3.5" />}
              hint="Click a star or type a value between 0.0 and 5.0.">
              <RatingPicker value={rating} onChange={(v) => { setRating(v); setErrors((p) => ({ ...p, rating: undefined })); }} error={errors.rating} />
            </Field>
          </Section>

          {/* FEATURES */}
          <Section title="Features of Academy">
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
              <CheckCircle2 className="w-4 h-4" />{isEdit ? "academy updated!" : "academy created!"}
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">
            {isEdit
              ? "Changes will update the academy immediately."
              : <><span className="font-semibold text-gray-600">Add</span> your academy and benefit millions</>}
          </p>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={saveAcademy} disabled={loading || step === "done"}
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