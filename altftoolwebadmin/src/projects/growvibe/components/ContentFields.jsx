"use client";

import { useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { uploadSectionImage } from "../lib/content.service";
import { emitAlert } from "@/lib/alertBus";

export const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
export const textareaClass = `${inputClass} min-h-[90px] resize-y`;

function FieldShell({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}

/* ---------- Image field with upload / URL ---------- */
function ImageField({ label, value, onChange, sectionKey }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setProgress(0);
    try {
      const { url } = await uploadSectionImage(sectionKey, file, setProgress);
      onChange(url);
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <FieldShell label={label}>
      <div className="flex items-start gap-3">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-gray-300" />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Image URL"
            className={inputClass}
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> {progress}%
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" /> Upload herebs
                </>
              )}
            </button>
            {value ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-500 transition hover:bg-red-100"
              >
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </button>
            ) : null}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
      </div>
    </FieldShell>
  );
}

/* ---------- List of objects (collapsible rows, add/remove/reorder) ---------- */
function ListField({ field, value, onChange, sectionKey }) {
  const items = Array.isArray(value) ? value : [];
  const [openIndex, setOpenIndex] = useState(items.length === 1 ? 0 : -1);

  const update = (index, next) => {
    const copy = [...items];
    copy[index] = next;
    onChange(copy);
  };
  const move = (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    [copy[index], copy[target]] = [copy[target], copy[index]];
    onChange(copy);
    setOpenIndex(target);
  };
  const remove = (index) => {
    onChange(items.filter((_, i) => i !== index));
    setOpenIndex(-1);
  };
  const add = () => {
    const blank = {};
    (field.itemFields || []).forEach((f) => {
      blank[f.key] = f.type === "list" || f.type === "slist" ? [] : f.type === "group" ? {} : "";
    });
    onChange([...items, blank]);
    setOpenIndex(items.length);
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {field.label} ({items.length})
        </span>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1 rounded-lg border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 transition hover:bg-indigo-100"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => {
          const title =
            item?.[field.itemLabelKey] ||
            item?.title ||
            item?.label ||
            item?.name ||
            item?.q ||
            item?.heading ||
            `Item ${index + 1}`;
          const open = openIndex === index;
          return (
            <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/60">
              <div className="flex items-center gap-1.5 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : index)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  {open ? (
                    <ChevronUp className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                  )}
                  <span className="truncate text-sm font-bold text-gray-700">{String(title)}</span>
                </button>
                <button type="button" onClick={() => move(index, -1)} className="rounded p-1 text-gray-400 hover:text-indigo-600" aria-label="Move up">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => move(index, 1)} className="rounded p-1 text-gray-400 hover:text-indigo-600" aria-label="Move down">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                <button type="button" onClick={() => remove(index)} className="rounded p-1 text-gray-400 hover:text-red-500" aria-label="Remove">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              {open ? (
                <div className="space-y-3 border-t border-gray-200 bg-white p-3">
                  {(field.itemFields || []).map((sub) => (
                    <ContentField
                      key={sub.key}
                      field={sub}
                      value={item?.[sub.key]}
                      onChange={(next) => update(index, { ...item, [sub.key]: next })}
                      sectionKey={sectionKey}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Generic field renderer ---------- */
export function ContentField({ field, value, onChange, sectionKey }) {
  if (field.type === "textarea") {
    return (
      <FieldShell label={field.label}>
        <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className={textareaClass} />
      </FieldShell>
    );
  }
  if (field.type === "image") {
    return <ImageField label={field.label} value={value} onChange={onChange} sectionKey={sectionKey} />;
  }
  if (field.type === "toggle") {
    return (
      <label className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-400"
        />
        <span className="text-xs font-bold uppercase tracking-wider text-gray-500">{field.label}</span>
      </label>
    );
  }
  if (field.type === "slist") {
    return (
      <FieldShell label={`${field.label} (one per line)`}>
        <textarea
          value={(Array.isArray(value) ? value : []).join("\n")}
          onChange={(e) => onChange(e.target.value.split("\n"))}
          className={textareaClass}
        />
      </FieldShell>
    );
  }
  if (field.type === "list") {
    return <ListField field={field} value={value} onChange={onChange} sectionKey={sectionKey} />;
  }
  if (field.type === "group") {
    const group = value || {};
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-3">
        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">{field.label}</p>
        <div className="space-y-3">
          {(field.itemFields || []).map((sub) => (
            <ContentField
              key={sub.key}
              field={sub}
              value={group?.[sub.key]}
              onChange={(next) => onChange({ ...group, [sub.key]: next })}
              sectionKey={sectionKey}
            />
          ))}
        </div>
      </div>
    );
  }
  return (
    <FieldShell label={field.label}>
      <input value={value || ""} onChange={(e) => onChange(e.target.value)} className={inputClass} />
    </FieldShell>
  );
}
