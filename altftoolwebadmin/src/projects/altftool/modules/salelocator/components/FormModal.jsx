"use client";

/**
 * FormModal.jsx
 *
 * A single reusable modal that renders any module's form from config.
 *
 * Usage:
 *   <FormModal
 *     type="extension"          // key into formConfigs
 *     entity={extensionObject}  // pass for edit mode; omit for create
 *     onClose={() => {}}
 *     refresh={() => {}}
 *     onSave={async (payload, isEdit, entity) => {}}   // your save logic
 *     onUpload={async (file, key, slug) => string}      // returns download URL
 *   />
 *
 * The modal is intentionally unaware of Firebase / specific services.
 * Pass `onSave` and `onUpload` from the parent so each module keeps
 * its own service wiring while sharing all UI/validation/state logic.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X, Type, Hash, Tag, AlignLeft, Zap, Link2, Star, DollarSign, Clock,
  User, UploadCloud, Trash2, Plus, AlertCircle, CheckCircle2,
  Loader2, GripVertical, Lock,
} from "lucide-react";
import { formConfigs, defaultValueForType } from "./formConfigs";

// ─── Icon map ─────────────────────────────────────────────────────────────────
const ICONS = {
  Type, Hash, Tag, AlignLeft, Zap, Link2, Star,
  DollarSign, Clock, User, UploadCloud,
};
function FieldIcon({ name }) {
  const Icon = ICONS[name];
  return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
}

// ─── Primitive UI pieces ──────────────────────────────────────────────────────

function FieldWrapper({ label, hint, error, iconName, required: req, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {iconName && <span className="text-gray-400"><FieldIcon name={iconName} /></span>}
        {label}
        {req && <span className="text-red-400 font-bold">*</span>}
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

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">
          {title}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

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

// ─── RatingPicker ─────────────────────────────────────────────────────────────

function RatingPicker({ value, onChange, error }) {
  const [hovered, setHovered] = useState(null);
  const num = parseFloat(value) || 0;
  const display = hovered ?? num;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <svg
              viewBox="0 0 24 24"
              className={`w-6 h-6 transition-colors ${display >= star ? "text-yellow-400" : "text-gray-200"}`}
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Input
          type="number"
          step="0.1"
          min="0"
          max="5"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={error}
          className="w-20 text-center"
          placeholder="0.0"
        />
        {value > 0 && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-gray-400 hover:text-gray-600 transition"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

// ─── ArrayField ───────────────────────────────────────────────────────────────

function ArrayField({ value = [""], onChange, fieldConfig, error, disabled }) {
  const add = () => onChange([...value, ""]);
  const update = (i, v) => onChange(value.map((item, idx) => (idx === i ? v : item)));
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="text-gray-300 cursor-grab shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <Input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`${fieldConfig.placeholder || "Item"} ${i + 1}`}
              error={error && !item.trim() ? true : undefined}
              disabled={disabled}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            disabled={value.length === 1 || disabled}
            className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-30 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
      <button
        type="button"
        onClick={add}
        disabled={disabled}
        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition disabled:opacity-40"
      >
        <Plus className="w-3.5 h-3.5" />
        {fieldConfig.addLabel || "Add Item"}
      </button>
    </div>
  );
}

// ─── ImageUpload ──────────────────────────────────────────────────────────────

function ImageUpload({ value: preview, file, onFile, onRemove, error, disabled }) {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback((selected) => {
    if (!selected) return;
    if (!selected.type.startsWith("image/")) {
      onFile(null, "Only image files are allowed (JPG, PNG, WebP)");
      return;
    }
    if (selected.size > 2 * 1024 * 1024) {
      onFile(null, "File size must be under 2MB");
      return;
    }
    onFile(selected, null);
  }, [onFile]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files[0]);
  };

  const fmtSize = (b) =>
    b < 1024 * 1024 ? `${(b / 1024).toFixed(1)} KB` : `${(b / (1024 * 1024)).toFixed(1)} MB`;

  if (!preview) {
    return (
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-all cursor-pointer
          ${dragOver ? "border-blue-400 bg-blue-50 scale-[1.01]"
            : error ? "border-red-300 bg-red-50/30"
            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"}
          ${disabled ? "pointer-events-none opacity-50" : ""}`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${dragOver ? "bg-blue-100" : "bg-gray-100"}`}>
          <UploadCloud className={`w-6 h-6 transition-colors ${dragOver ? "text-blue-500" : "text-gray-400"}`} />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700">
            Drop image here or <span className="text-blue-500">browse</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 2MB</p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => processFile(e.target.files[0])}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
      <div className="relative group">
        <img src={preview} alt="Preview" className="w-full max-h-52 object-contain bg-white" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
          <button
            onClick={onRemove}
            disabled={disabled}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
          >
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
  );
}

// ─── Field renderer ───────────────────────────────────────────────────────────
/**
 * renderField maps a field config + current state to the right component.
 * Keeps the switch statement small and each branch obvious.
 */
function renderField({ fieldConfig, value, onChange, error, disabled, isEdit, imageState }) {
  const { type, key } = fieldConfig;
  const isReadOnly = isEdit && fieldConfig.readOnlyOnEdit;

  switch (type) {
    case "text":
    case "url":
      return (
        <div className="relative">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={fieldConfig.placeholder}
            readOnly={isReadOnly}
            error={error}
            disabled={disabled}
          />
          {isReadOnly && (
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          )}
        </div>
      );

    case "number":
      return (
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fieldConfig.placeholder}
          step={fieldConfig.step ?? 1}
          min={fieldConfig.min}
          max={fieldConfig.max}
          error={error}
          disabled={disabled}
        />
      );

    case "textarea":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fieldConfig.placeholder}
          rows={fieldConfig.rows ?? 3}
          error={error}
          disabled={disabled}
        />
      );

    case "rating":
      return (
        <RatingPicker value={value} onChange={onChange} error={error} />
      );

    case "array":
      return (
        <ArrayField
          value={value}
          onChange={onChange}
          fieldConfig={fieldConfig}
          error={error}
          disabled={disabled}
        />
      );

    case "image":
      return (
        <ImageUpload
          value={imageState.preview}
          file={imageState.file}
          onFile={imageState.onFile}
          onRemove={imageState.onRemove}
          error={error}
          disabled={disabled}
        />
      );

    default:
      return (
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={fieldConfig.placeholder}
          error={error}
          disabled={disabled}
        />
      );
  }
}

// ─── FormModal ────────────────────────────────────────────────────────────────

/**
 * Props:
 *  type       — key in formConfigs (e.g. "extension", "academy")
 *  entity     — existing record for edit mode; omit for create
 *  onClose    — called when modal should close
 *  refresh    — called after successful save
 *  onSave     — async (payload: object, isEdit: bool, entity) => void
 *               Throw to surface error toast.
 *  onUpload   — async (file: File, fieldKey: string, slug: string) => string (url)
 *               Only called when an image field has a new file selected.
 */
export default function FormModal({ type, entity, onClose, refresh, onSave, onUpload }) {
  const config = formConfigs[type];
  if (!config) throw new Error(`FormModal: unknown type "${type}". Add it to formConfigs.js.`);

  const isEdit = !!entity;

  // ── Collect all field configs in a flat list (for state init) ──────────────
  const allFields = config.sections.flatMap((s) => s.fields);

  // ── Build initial form state from config + entity values ───────────────────
  const buildInitialState = () => {
    return Object.fromEntries(
      allFields.map((f) => {
        if (f.type === "image") return [f.key, null]; // image handled separately
        const entityVal = entity?.[f.key];
        if (entityVal !== undefined && entityVal !== null) return [f.key, entityVal];
        // array: ensure at least one empty entry
        if (f.type === "array") return [f.key, entityVal?.length ? entityVal : [""]];
        return [f.key, defaultValueForType[f.type] ?? ""];
      })
    );
  };

  const [values, setValues] = useState(buildInitialState);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [step, setStep] = useState("idle"); // idle | uploading | saving | done

  // ── Image state ────────────────────────────────────────────────────────────
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(entity?.image || null);
  const [imageError, setImageError] = useState(null);

  const handleImageFile = useCallback((file, err) => {
    if (err) { setImageError(err); return; }
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setImageError(null);
    setErrors((p) => ({ ...p, image: undefined }));
  }, [imagePreview, imageFile]);

  const handleImageRemove = () => {
    if (imagePreview && imageFile) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  };

  // ── Auto-derive fields (e.g. slug from name) on create ────────────────────
  useEffect(() => {
    if (isEdit) return;
    allFields.forEach((f) => {
      if (!f.deriveFrom) return;
      const { field, transform } = f.deriveFrom;
      const source = values[field];
      if (source !== undefined) {
        setValues((prev) => ({ ...prev, [f.key]: transform(source) }));
      }
    });
  }, [values.name]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = (key, val) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    allFields.forEach((f) => {
      if (f.type === "image") {
        // image errors handled by imageError state — just mirror into errs
        if (imageError) errs.image = imageError;
        return;
      }
      if (!f.validate) return;
      const result = f.validate(values[f.key], values);
      if (result) errs[f.key] = result;
    });
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      // Upload image if new file was selected
      let imageUrl = entity?.image || "";
      if (imageFile && onUpload) {
        setStep("uploading");
        imageUrl = await onUpload(imageFile, "image", values.slug, (pct) => setUploadProgress(pct));
      }

      setStep("saving");

      // Build payload — strip image field, add resolved URL
      const imageFieldKeys = allFields.filter((f) => f.type === "image").map((f) => f.key);
      const payload = Object.fromEntries(
        Object.entries(values).filter(([k]) => !imageFieldKeys.includes(k))
      );

      // Clean array fields
      allFields.forEach((f) => {
        if (f.type === "array" && payload[f.key]) {
          payload[f.key] = payload[f.key].filter((v) => String(v ?? "").trim());
        }
      });

      // Trim all strings
      Object.keys(payload).forEach((k) => {
        if (typeof payload[k] === "string") payload[k] = payload[k].trim();
      });

      payload.image = imageUrl;

      await onSave(payload, isEdit, entity);

      setStep("done");
      refresh?.();
      setTimeout(onClose, 600);
    } catch (err) {
      console.error("FormModal save error:", err);
      setStep("idle");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // ── Step label ─────────────────────────────────────────────────────────────
  const stepLabel = {
    idle: isEdit ? `Update ${type.charAt(0).toUpperCase() + type.slice(1)}` : `Create ${type.charAt(0).toUpperCase() + type.slice(1)}`,
    uploading: `Uploading… ${uploadProgress}%`,
    saving: "Saving…",
    done: "Done!",
  }[step];

  // ── Modal title / subtitle ─────────────────────────────────────────────────
  const modalTitle = isEdit ? config.title.edit : config.title.create;
  const modalSubtitle = isEdit
    ? (typeof config.subtitle.edit === "function" ? config.subtitle.edit(entity) : config.subtitle.edit)
    : config.subtitle.create;

  const footerHint = typeof config.footerHint === "object" && !React?.isValidElement?.(config.footerHint)
    ? (isEdit ? config.footerHint.edit : config.footerHint.create)
    : config.footerHint;

  // ── Image state object passed to renderField ───────────────────────────────
  const imageState = {
    preview: imagePreview,
    file: imageFile,
    onFile: handleImageFile,
    onRemove: handleImageRemove,
  };

  // ── Track which section titles we've already rendered (dedup visual dividers)
  const renderedSectionTitles = new Set();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">{modalTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{modalSubtitle}</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition disabled:opacity-40"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">
          {config.sections.map((section, sIdx) => {
            const isFirstOccurrence = !renderedSectionTitles.has(section.title);
            renderedSectionTitles.add(section.title);

            return (
              <Section key={sIdx} title={isFirstOccurrence ? section.title : ""}>
                <div className={section.columns === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
                  {section.fields.map((fieldConfig) => {
                    const { key, type: fType, label, icon, required: req, hint } = fieldConfig;
                    const isReadOnly = isEdit && fieldConfig.readOnlyOnEdit;
                    const resolvedHint = typeof hint === "object" && hint !== null && !React?.isValidElement?.(hint)
                      ? (isEdit ? hint.edit : hint.create)
                      : hint;
                    const err = key === "image" ? (errors.image || imageError) : errors[key];

                    return (
                      <FieldWrapper
                        key={key}
                        label={label}
                        hint={resolvedHint}
                        error={err}
                        iconName={icon}
                        required={req}
                      >
                        {renderField({
                          fieldConfig,
                          value: fType !== "image" ? (values[key] ?? defaultValueForType[fType] ?? "") : null,
                          onChange: (val) => handleChange(key, val),
                          error: err,
                          disabled: loading || isReadOnly,
                          isEdit,
                          imageState,
                        })}
                      </FieldWrapper>
                    );
                  })}
                </div>
              </Section>
            );
          })}

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
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
              Saving to database…
            </div>
          )}
          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />
              {isEdit ? "Updated successfully!" : "Created successfully!"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">{footerHint}</p>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm"
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