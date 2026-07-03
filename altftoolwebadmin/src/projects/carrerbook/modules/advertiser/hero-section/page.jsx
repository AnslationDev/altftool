"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_ADVERTISER_SECTIONS,
  deleteAdvertiserImage,
  resetAdvertiserSection,
  saveAdvertiserSection,
  subscribeAdvertiserSection,
  uploadAdvertiserImage,
} from "../service/advertiser.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AdvertiserAdminShared";

const SECTION_KEY = "hero-section";

export default function AdvertiserHeroSectionPage() {
  const [saved, setSaved] = useState(DEFAULT_ADVERTISER_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_ADVERTISER_SECTIONS[SECTION_KEY]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [autosaving, setAutosaving] = useState(false);

  useEffect(() => {
    return subscribeAdvertiserSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load advertiser hero." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  useEffect(() => {
    const handler = (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  useEffect(() => {
    if (!dirty) return;
    setAutosaving(true);
    const timer = setTimeout(() => setAutosaving(false), 700);
    return () => clearTimeout(timer);
  }, [draft, dirty]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save({ publish = false } = {}) {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await saveAdvertiserSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: publish ? "Hero section published." : "Hero section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save advertiser hero." });
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Hero image must be an image file." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Hero image must be 10MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAdvertiserImage({ file, sectionKey: SECTION_KEY, folder: "hero", onProgress: setUploadProgress });
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Hero image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = draft.imagePath;
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteAdvertiserImage(path);
      emitAlert({ type: "success", message: "Hero image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetAdvertiserSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Hero section reset." });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-6">
      <ActionHeader
        title="Advertiser Hero Section"
        description="Edit the hero banner copy, CTA, and image."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        autosaving={autosaving}
        saving={saving}
        onSave={() => save()}
        onPublish={() => save({ publish: true })}
        onPreview={() => document.getElementById("advertiser-hero-preview")?.scrollIntoView({ behavior: "smooth" })}
        onReset={() => setConfirmReset(true)}
        onToggleActive={() => setField("active", draft.active === false)}
      />

      <div className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Hero Section Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Heading" error={errors.heading}>
                <input value={draft.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Description" error={errors.description}>
                <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={4} className={textareaClass} />
              </Field>
              <Field label="CTA Text" error={errors.buttonText}>
                <input value={draft.buttonText || ""} onChange={(event) => setField("buttonText", event.target.value)} className={inputClass} />
              </Field>
              <Field label="CTA Link" error={errors.buttonLink}>
                <input value={draft.buttonLink || ""} onChange={(event) => setField("buttonLink", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Hero Image" error={errors.imageUrl}>
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      {draft.imageUrl ? <img src={draft.imageUrl} alt="Hero preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-7 w-7 text-gray-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">Upload or replace hero image</p>
                      <p className="text-xs text-gray-400">PNG, JPG, WebP up to 10MB.</p>
                      {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
                    </div>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                      <Upload className="h-4 w-4" /> Upload
                      <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
                    </label>
                    {draft.imageUrl ? <button onClick={removeImage} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Remove</button> : null}
                  </div>
                </div>
              </Field>
            </div>
          )}
        </section>

        <section id="advertiser-hero-preview" className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <HeroPreview draft={draft} />
        </section>
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset advertiser hero"
          message="Reset this section back to default content?"
          loading={saving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function HeroPreview({ draft }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] shadow-sm">
      <div className="relative grid min-h-[560px] gap-8 bg-[linear-gradient(115deg,#32177a_0%,#050505_46%,#2b146d_100%)] p-8 text-white lg:grid-cols-[1.1fr_0.9fr]">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:64px_64px]" />
        <div className="relative z-10 flex items-center justify-center">
          {draft.imageUrl ? (
            <img src={draft.imageUrl} alt="Advertiser hero" className="max-h-[420px] w-full object-contain" />
          ) : (
            <div className="relative grid h-80 w-full max-w-xl place-items-center rounded-2xl border border-white/15 bg-white/5">
              <div className="absolute h-44 w-44 rounded-full bg-violet-500/50" />
              <ImageIcon className="relative z-10 h-16 w-16 text-white/70" />
            </div>
          )}
        </div>
        <div className="relative z-10 flex flex-col justify-center">
          <h2 className="text-5xl font-black tracking-normal md:text-6xl">{draft.heading || "Advertisers"}</h2>
          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-white/88">{draft.description || "Brand-safe access to every form of digital media"}</p>
          <span className="mt-8 w-fit rounded-full border border-amber-300/70 px-8 py-3 text-sm font-black shadow-[0_0_22px_rgba(245,158,11,.45)]">
            {draft.buttonText || "Let's get started"}
          </span>
        </div>
      </div>
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.description?.trim()) errors.description = "Description is required.";
  if (!values.buttonText?.trim()) errors.buttonText = "CTA text is required.";
  if (!values.buttonLink?.trim()) errors.buttonLink = "CTA link is required.";
  if (!values.imageUrl) errors.imageUrl = "Hero image is required.";
  return errors;
}
