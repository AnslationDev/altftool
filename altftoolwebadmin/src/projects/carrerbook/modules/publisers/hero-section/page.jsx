"use client";

import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { Field, inputClass, textareaClass } from "../../home/components/HomeSectionShared";

export default function PublisherHeroSectionTab({
  draft,
  setField,
  errors,
  handleUpload,
  handleRemoveImage,
  uploading,
  uploadProgress,
}) {
  return {
    editor: (
      <div className="space-y-5">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Hero content</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Heading prefix" error={errors.headingPrefix}>
              <input value={draft.headingPrefix || ""} onChange={(event) => setField("headingPrefix", event.target.value)} className={inputClass} />
            </Field>
            <Field label="Highlight words" error={errors.highlightWords}>
              <input value={draft.highlightWords || ""} onChange={(event) => setField("highlightWords", event.target.value)} className={inputClass} />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Description" error={errors.description}>
                <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
              </Field>
            </div>
            <Field label="CTA button text" error={errors.buttonText}>
              <input value={draft.buttonText || ""} onChange={(event) => setField("buttonText", event.target.value)} className={inputClass} />
            </Field>
            <Field label="CTA button link" error={errors.buttonLink}>
              <input value={draft.buttonLink || ""} onChange={(event) => setField("buttonLink", event.target.value)} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Right-side hero image</p>
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex h-24 w-32 items-center justify-center rounded-xl border border-gray-200 bg-white">
                {draft.imageUrl ? <img src={draft.imageUrl} alt="Hero preview" className="max-h-20 max-w-28 object-contain" /> : <ImageIcon className="h-7 w-7 text-gray-300" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800">Upload publisher hero image</p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP up to 8MB.</p>
                {errors.imageUrl ? <p className="mt-1 text-xs font-medium text-red-500">{errors.imageUrl}</p> : null}
                {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => handleUpload(event.target.files?.[0])} />
              </label>
              {draft.imageUrl ? (
                <button onClick={handleRemoveImage} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    ),
    preview: <PublisherHeroPreview draft={draft} />,
  };
}

function PublisherHeroPreview({ draft }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] shadow-sm">
      <div className="relative grid min-h-[430px] gap-8 bg-[linear-gradient(115deg,#32177a_0%,#050505_46%,#2b146d_100%)] p-8 text-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative z-10 flex flex-col justify-center">
          <h2 className="text-4xl font-light leading-tight tracking-normal md:text-5xl">
            {draft.headingPrefix || "Promote with"}{" "}
            <span className="font-black text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,.65)]">{draft.highlightWords || "CPL Model"}</span>
          </h2>
          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/88">{draft.description}</p>
          <span className="mt-8 w-fit rounded-full border border-amber-300/70 px-8 py-3 text-sm font-black shadow-[0_0_22px_rgba(245,158,11,.45)]">
            {draft.buttonText || "Let's get started"}
          </span>
        </div>
        <div className="relative z-10 flex items-center justify-center">
          {draft.imageUrl ? (
            <img src={draft.imageUrl} alt="Publisher hero" className="max-h-[340px] w-full object-contain" />
          ) : (
            <div className="relative grid h-72 w-full max-w-md place-items-center rounded-2xl border border-white/15 bg-white/5">
              <div className="absolute h-44 w-44 rounded-full bg-amber-400" />
              <ImageIcon className="relative z-10 h-16 w-16 text-white/70" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
