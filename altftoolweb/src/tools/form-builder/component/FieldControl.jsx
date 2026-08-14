"use client";

import React from "react";
import FileUploadPreview from "./FileUploadPreview";

/**
 * Shared form-control renderer used by every surface that renders a live
 * form field (main.jsx's Live Preview, MultiStepForm.jsx, TestMode.jsx).
 *
 * - Renders real <select>/radio-group/checkbox-group markup for
 *   select/radio/checkbox fields instead of always falling back to a
 *   generic <input>, so options actually work in the tool's own UI
 *   (matches the logic download.js already uses for the exported HTML).
 * - Renders file inputs uncontrolled (no `value` prop), reading
 *   e.target.files[0] on change, so selecting a file never throws
 *   "This input element accepts a filename, which may only be
 *   programmatically set to the empty string." (the same pattern
 *   MultiStepForm.jsx already used correctly before this component existed).
 */
const FieldControl = ({
  field,
  value,
  onChange,
  theme,
  id,
  uploadedFile,
  onFileChange,
  ariaDescribedBy,
  ariaInvalid,
}) => {
  const baseInputClass = "w-full px-3 py-2 border border-(--border) rounded-md";
  const style = theme
    ? { borderRadius: `${theme.borderRadius}px`, fontFamily: theme.fontFamily }
    : undefined;

  if (field.type === "file") {
    return (
      <>
        <input
          id={id}
          type="file"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) onFileChange?.(file);
          }}
          className={baseInputClass}
          style={style}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid || undefined}
        />
        {uploadedFile && <FileUploadPreview file={uploadedFile} />}
      </>
    );
  }

  if (field.type === "textarea") {
    return (
      <textarea
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className={baseInputClass}
        style={style}
        rows={3}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
      />
    );
  }

  if (field.type === "select") {
    return (
      <select
        id={id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={baseInputClass}
        style={style}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
      >
        <option value="">Select an option</option>
        {(field.options || []).map((opt, idx) => (
          <option key={idx} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === "radio") {
    return (
      <div
        className="space-y-2"
        role="radiogroup"
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
      >
        {(field.options || []).map((opt, idx) => (
          <label key={idx} className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name={id}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  if (field.type === "checkbox") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2" role="group" aria-describedby={ariaDescribedBy}>
        {(field.options || []).map((opt, idx) => (
          <label key={idx} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={(e) => {
                const next = e.target.checked
                  ? [...selected, opt]
                  : selected.filter((o) => o !== opt);
                onChange(next);
              }}
              aria-invalid={ariaInvalid || undefined}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }

  return (
    <input
      id={id}
      type={field.type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={baseInputClass}
      style={style}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
    />
  );
};

export default FieldControl;
