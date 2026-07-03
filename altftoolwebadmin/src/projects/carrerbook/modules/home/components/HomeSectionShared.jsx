"use client";

import { Image as ImageIcon, Plus, Trash2, Upload } from "lucide-react";

export function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

export function StatusBoard({ label, draft, sectionKey, uploading }) {
  const itemCount = Array.isArray(draft.items) ? draft.items.filter(Boolean).length : 0;
  const metrics =
    sectionKey === "hero"
      ? [
          ["Status", draft.active ? "Active" : "Inactive", draft.active ? "green" : "gray"],
          ["CTA Buttons", [draft.button1Text, draft.button2Text].filter(Boolean).length, "blue"],
          ["Social Links", (draft.socialLinks || []).length, "purple"],
        ]
      : [
          ["Status", draft.active ? "Active" : "Inactive", draft.active ? "green" : "gray"],
          ["Content Items", itemCount, "blue"],
          ["Upload State", uploading ? "Uploading" : "Ready", uploading ? "purple" : "gray"],
        ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map(([name, value, tone]) => (
        <div key={name} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{name}</p>
          <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass(tone)}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}

export function HeroPreview({ draft }) {
  const highlights = splitCsv(draft.highlightWords);
  const socialLinks = draft.socialLinks || [];
  const line = (value) =>
    String(value || "").split(" ").map((word, index) => {
      const clean = word.replace(/[^\w]/g, "");
      return (
        <span key={`${word}-${index}`} className={highlights.includes(clean) ? "font-black" : ""}>
          {word}{" "}
        </span>
      );
    });

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] shadow-sm">
      <div className="grid min-h-[420px] gap-8 bg-[linear-gradient(115deg,#32177a_0%,#050505_48%,#2b146d_100%)] p-8 text-white lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-light leading-tight tracking-normal md:text-5xl">
            <span className="block">{line(draft.headingLine1)}</span>
            <span className="mt-3 block">{line(draft.headingLine2)}</span>
            <span className="mt-3 block">{line(draft.headingLine3)}</span>
          </h2>
          <p className="mt-7 text-base font-semibold">{draft.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <span className="rounded-full border border-white/60 px-8 py-3 text-sm font-bold">{draft.button1Text}</span>
            <span className="rounded-full border border-white/60 px-8 py-3 text-sm font-bold">{draft.button2Text}</span>
          </div>
          <div className="mt-8 flex gap-4">
            {socialLinks.map((social, index) => (
              <span key={`${social.platform}-${index}`} className="grid h-10 w-10 place-items-center rounded-full text-xs font-black" style={{ background: social.color || "#333" }}>
                {social.platform?.slice(0, 1)?.toUpperCase() || "S"}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center">
          {draft.imageUrl ? <img src={draft.imageUrl} alt="Hero preview" className="max-h-[360px] w-full object-contain" /> : <div className="flex h-72 w-full max-w-md items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-sm text-white/60">Upload hero image</div>}
        </div>
      </div>
    </div>
  );
}

export function HeroEditor({ draft, setField, errors, handleUpload, handleRemoveImage, uploading, uploadProgress }) {
  return (
    <div className="space-y-4">
      <Field label="Heading line 1" error={errors.headingLine1}><input value={draft.headingLine1 || ""} onChange={(e) => setField("headingLine1", e.target.value)} className={inputClass} /></Field>
      <Field label="Heading line 2" error={errors.headingLine2}><input value={draft.headingLine2 || ""} onChange={(e) => setField("headingLine2", e.target.value)} className={inputClass} /></Field>
      <Field label="Heading line 3" error={errors.headingLine3}><input value={draft.headingLine3 || ""} onChange={(e) => setField("headingLine3", e.target.value)} className={inputClass} /></Field>
      <Field label="Highlight words (comma separated)"><input value={draft.highlightWords || ""} onChange={(e) => setField("highlightWords", e.target.value)} className={inputClass} /></Field>
      <Field label="Subtitle" error={errors.subtitle}><input value={draft.subtitle || ""} onChange={(e) => setField("subtitle", e.target.value)} className={inputClass} /></Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Button 1 text"><input value={draft.button1Text || ""} onChange={(e) => setField("button1Text", e.target.value)} className={inputClass} /></Field>
        <Field label="Button 1 link"><input value={draft.button1Link || ""} onChange={(e) => setField("button1Link", e.target.value)} className={inputClass} /></Field>
        <Field label="Button 2 text"><input value={draft.button2Text || ""} onChange={(e) => setField("button2Text", e.target.value)} className={inputClass} /></Field>
        <Field label="Button 2 link"><input value={draft.button2Link || ""} onChange={(e) => setField("button2Link", e.target.value)} className={inputClass} /></Field>
      </div>
      <SocialEditor value={draft.socialLinks || []} onChange={(next) => setField("socialLinks", next)} />
      <ImageUploadField draft={draft} handleUpload={handleUpload} handleRemoveImage={handleRemoveImage} uploading={uploading} uploadProgress={uploadProgress} />
    </div>
  );
}

export function GenericEditor({ draft, setField, errors }) {
  return (
    <div className="space-y-4">
      <Field label="Section title" error={errors.title}><input value={draft.title || ""} onChange={(e) => setField("title", e.target.value)} className={inputClass} /></Field>
      <Field label="Subtitle / description"><textarea value={draft.subtitle || ""} onChange={(e) => setField("subtitle", e.target.value)} rows={4} className={textareaClass} /></Field>
      <Field label="Items (one per line)"><textarea value={(draft.items || []).join("\n")} onChange={(e) => setField("items", e.target.value.split("\n"))} rows={7} className={textareaClass} /></Field>
    </div>
  );
}

export function GenericPreview({ draft, label }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <h2 className="mt-3 text-3xl font-black text-gray-900">{draft.title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-500">{draft.subtitle}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(draft.items || []).filter(Boolean).map((item, index) => (
          <div key={`${item}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-semibold text-gray-700">{item}</div>
        ))}
      </div>
    </div>
  );
}

function ImageUploadField({ draft, handleUpload, handleRemoveImage, uploading, uploadProgress }) {
  return (
    <Field label="Right-side hero image">
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-20 w-28 items-center justify-center rounded-lg border border-gray-200 bg-white">
            {draft.imageUrl ? <img src={draft.imageUrl} alt="Hero" className="max-h-16 max-w-24 object-contain" /> : <ImageIcon className="h-6 w-6 text-gray-300" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-800">Upload hero image</p>
            <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB.</p>
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
            <Upload className="h-4 w-4" /> Upload
            <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => handleUpload(event.target.files?.[0])} />
          </label>
          {draft.imageUrl ? <button onClick={handleRemoveImage} className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50">Remove</button> : null}
        </div>
      </div>
    </Field>
  );
}

function SocialEditor({ value, onChange }) {
  const add = () => onChange([...value, { platform: "social", url: "#", color: "#333333" }]);
  const update = (index, key, nextValue) => {
    const next = [...value];
    next[index] = { ...next[index], [key]: nextValue };
    onChange(next);
  };
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Social icon links</p>
        <button onClick={add} className="inline-flex items-center gap-1 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"><Plus className="h-3 w-3" /> Add</button>
      </div>
      <div className="mt-3 space-y-2">
        {value.map((social, index) => (
          <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.5fr_72px_40px]">
            <input value={social.platform || ""} onChange={(e) => update(index, "platform", e.target.value)} className={inputClass} placeholder="Platform" />
            <input value={social.url || ""} onChange={(e) => update(index, "url", e.target.value)} className={inputClass} placeholder="URL" />
            <input type="color" value={social.color || "#333333"} onChange={(e) => update(index, "color", e.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-2" />
            <button onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="rounded-xl border border-red-200 text-red-500 hover:bg-red-50"><Trash2 className="mx-auto h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function toneClass(tone) {
  if (tone === "green") return "bg-emerald-50 text-emerald-700";
  if (tone === "blue") return "bg-blue-50 text-blue-700";
  if (tone === "purple") return "bg-violet-50 text-violet-700";
  return "bg-gray-100 text-gray-700";
}

function splitCsv(value = "") {
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

export const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
export const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
