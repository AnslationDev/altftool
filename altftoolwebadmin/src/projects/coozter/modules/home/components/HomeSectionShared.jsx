"use client";

import { Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";

export const SECTION_FIELDS = {
  heroSection: [
    ["eyebrowText", "Eyebrow text"],
    ["headingText", "Heading text", "textarea"],
    ["highlightedHeadingText", "Highlighted heading text"],
    ["descriptionText", "Description", "textarea"],
    ["primaryButtonLabel", "Primary button label"],
    ["primaryButtonUrl", "Primary button URL"],
    ["secondaryButtonLabel", "Secondary button label"],
    ["secondaryButtonUrl", "Secondary button URL"],
    ["heroImageUrl", "Hero image URL", "image"],
    ["heroImageAltText", "Hero image alt text"],
  ],
  trustSection: [["headingText", "Heading text", "textarea"]],
  marketingChannelsSection: [
    ["headingText", "Heading text"],
    ["highlightedHeadingText", "Highlighted heading text"],
    ["descriptionText", "Description", "textarea"],
    ["centerGraphicLabelLineOne", "Center graphic label line one"],
    ["centerGraphicLabelLineTwo", "Center graphic label line two"],
    ["centerGraphicIconKey", "Center graphic icon key"],
  ],
  processSection: [
    ["headingText", "Heading text", "textarea"],
    ["imageAltText", "Image group alt text"],
  ],
  servicesPreviewSection: [
    ["headingText", "Heading text", "textarea"],
    ["descriptionText", "Description", "textarea"],
    ["buttonLabel", "Button label"],
    ["buttonUrl", "Button URL"],
  ],
  blogPreviewSection: [
    ["eyebrowText", "Eyebrow text"],
    ["headingText", "Heading text", "textarea"],
    ["buttonLabel", "Button label"],
    ["buttonUrl", "Button URL"],
  ],
  contactCtaSection: [
    ["headingText", "Heading text", "textarea"],
    ["descriptionText", "Description", "textarea"],
    ["primaryButtonLabel", "Primary button label"],
    ["primaryButtonUrl", "Primary button URL"],
    ["secondaryButtonLabel", "Secondary button label"],
    ["secondaryButtonUrl", "Secondary button URL"],
  ],
};

export const ARRAY_FIELDS = {
  heroSection: {
    metrics: {
      label: "Hero Stats",
      fields: [
        ["value", "Value"],
        ["label", "Label"],
        ["iconKey", "Icon key"],
      ],
    },
  },
  trustSection: {
    stats: {
      label: "Trust Stats",
      fields: [
        ["value", "Value"],
        ["label", "Label"],
      ],
    },
    partnerLogos: {
      label: "Partner Logos",
      fields: [
        ["name", "Name"],
        ["logoUrl", "Logo URL", "image"],
        ["altText", "Alt text"],
      ],
    },
  },
  marketingChannelsSection: {
    benefits: {
      label: "Benefits",
      fields: [
        ["title", "Title"],
        ["descriptionText", "Description", "textarea"],
        ["iconKey", "Icon key"],
      ],
    },
    growthPoints: {
      label: "Growth Points",
      fields: [
        ["title", "Title"],
        ["descriptionText", "Description", "textarea"],
        ["iconKey", "Icon key"],
      ],
    },
  },
  processSection: {
    images: {
      label: "Process Images",
      fields: [
        ["imageUrl", "Image URL", "image"],
        ["altText", "Alt text"],
      ],
    },
    steps: {
      label: "Process Steps",
      fields: [
        ["title", "Title"],
        ["descriptionText", "Description", "textarea"],
      ],
    },
  },
  servicesPreviewSection: {
    tags: {
      label: "Tags",
      fields: [["label", "Label"]],
    },
    selectedServices: {
      label: "Selected Services",
      fields: [["serviceSlug", "Service slug"]],
    },
  },
  blogPreviewSection: {
    selectedBlogs: {
      label: "Selected Blogs",
      fields: [["blogSlug", "Blog slug"]],
    },
  },
};

export function SectionEditor({
  sectionKey,
  section,
  errors,
  uploadKey,
  uploadProgress,
  onFieldChange,
  onArrayAdd,
  onArrayRemove,
  onArrayUpdate,
  onUpload,
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {(SECTION_FIELDS[sectionKey] || []).map(([field, label, type]) => (
          <Field
            key={field}
            label={label}
            error={errors[`${sectionKey}.${field}`]}
            wide={type === "textarea" || type === "image"}
          >
            <ValueInput
              value={section[field] || ""}
              type={type}
              onChange={(value) => onFieldChange(field, value)}
              onUpload={(file) => onUpload(file, [field])}
              uploading={uploadKey === field}
              uploadProgress={uploadProgress}
            />
          </Field>
        ))}
      </div>

      {Object.entries(ARRAY_FIELDS[sectionKey] || {}).map(([arrayKey, config]) => (
        <ArrayEditor
          key={arrayKey}
          arrayKey={arrayKey}
          config={config}
          rows={section[arrayKey] || []}
          errors={errors}
          sectionKey={sectionKey}
          uploadKey={uploadKey}
          uploadProgress={uploadProgress}
          onAdd={() => onArrayAdd(arrayKey)}
          onRemove={(index) => onArrayRemove(arrayKey, index)}
          onUpdate={(index, field, value) => onArrayUpdate(arrayKey, index, field, value)}
          onUpload={(file, index, field) => onUpload(file, [arrayKey, index, field])}
        />
      ))}
    </div>
  );
}

export function ArrayEditor({
  arrayKey,
  config,
  rows,
  errors,
  sectionKey,
  uploadKey,
  uploadProgress,
  onAdd,
  onRemove,
  onUpdate,
  onUpload,
}) {
  return (
    <section className="rounded-lg border border-[var(--border)] bg-[color-mix(in_srgb,var(--surface-soft)_45%,var(--surface))] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[var(--foreground)]">{config.label}</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">Add, edit, delete, reorder, and hide repeated items.</p>
        </div>
        <button type="button" onClick={onAdd} className={buttonClass("secondary")}>
          <Plus className="h-4 w-4" />
          Add Item
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {rows.length ? (
          rows.map((row, index) => (
            <div key={index} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Item {index + 1}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdate(index, "isActive", row.isActive === false)}
                    className={`rounded-md border px-2.5 py-1.5 text-xs font-bold ${
                      row.isActive === false
                        ? "border-[var(--border)] text-[var(--muted)]"
                        : "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] text-[var(--success)]"
                    }`}
                  >
                    {row.isActive === false ? "Hidden" : "Active"}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-md border border-[color-mix(in_srgb,var(--danger)_35%,var(--border))] p-1.5 text-[var(--danger)] transition hover:bg-[color-mix(in_srgb,var(--danger)_10%,var(--surface))]"
                    aria-label={`Delete ${config.label} item ${index + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {config.fields.map(([field, label, type]) => {
                  const fieldPath = `${sectionKey}.${arrayKey}.${index}.${field}`;
                  const currentUploadKey = `${arrayKey}.${index}.${field}`;
                  return (
                    <Field key={field} label={label} error={errors[fieldPath]} wide={type === "textarea" || type === "image"}>
                      <ValueInput
                        value={row[field] || ""}
                        type={type}
                        onChange={(value) => onUpdate(index, field, value)}
                        onUpload={(file) => onUpload(file, index, field)}
                        uploading={uploadKey === currentUploadKey}
                        uploadProgress={uploadProgress}
                      />
                    </Field>
                  );
                })}
                <Field label="Sort order" error={errors[`${sectionKey}.${arrayKey}.${index}.sortOrder`]}>
                  <input
                    type="number"
                    min="0"
                    value={row.sortOrder ?? index + 1}
                    onChange={(event) => onUpdate(index, "sortOrder", event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-[var(--border-strong,var(--border))] p-6 text-center text-sm text-[var(--muted)]">
            No items yet.
          </div>
        )}
      </div>
    </section>
  );
}

export function ValueInput({ value, type, onChange, onUpload, uploading, uploadProgress }) {
  if (type === "textarea") {
    return <textarea rows={4} value={value} onChange={(event) => onChange(event.target.value)} className={textareaClass} />;
  }

  if (type === "image") {
    return (
      <div className="space-y-2">
        <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} placeholder="/image.png or https://..." />
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-soft)] p-3">
          <div className="grid h-14 w-20 place-items-center overflow-hidden rounded-md border border-[var(--border)] bg-[var(--surface)]">
            {value ? <img src={value} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="h-5 w-5 text-[var(--muted)]" />}
          </div>
          <div className="min-w-0 flex-1 text-xs text-[var(--muted)]">
            <p className="font-semibold text-[var(--foreground)]">Upload or paste URL</p>
            {uploading ? (
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--border)]">
                <div className="h-full bg-[var(--primary)]" style={{ width: `${uploadProgress}%` }} />
              </div>
            ) : null}
          </div>
          <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg bg-[var(--primary)] px-3 text-sm font-semibold text-[var(--primary-foreground)]">
            <Upload className="h-4 w-4" />
            Upload
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => onUpload(event.target.files?.[0])} />
          </label>
        </div>
      </div>
    );
  }

  return <input value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />;
}

export function Field({ label, error, children, wide = false }) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}

export function PreviewPanel() {
  return <aside className="space-y-4" />;
}

export function LoadingFields() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="h-11 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
      ))}
    </div>
  );
}

export function buttonClass(variant) {
  if (variant === "primary") {
    return "inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--primary-hover,var(--primary))] disabled:opacity-60";
  }
  return "inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold text-[var(--foreground)] shadow-[var(--shadow-sm)] transition hover:bg-[var(--surface-soft)] disabled:opacity-60";
}

export const inputClass =
  "h-10 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";

export const textareaClass =
  "w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]";
