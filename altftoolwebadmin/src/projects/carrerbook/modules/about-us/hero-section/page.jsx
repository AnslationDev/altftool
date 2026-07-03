"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Trash2, Upload } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import {
  DEFAULT_ABOUT_SECTIONS,
  deleteAboutImage,
  resetAboutSection,
  saveAboutSection,
  subscribeAboutSection,
  uploadAboutImage,
} from "../service/about.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AboutAdminShared";

const SECTION_KEY = "hero-section";

export default function AboutHeroSectionPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_SECTIONS[SECTION_KEY]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [autosaving, setAutosaving] = useState(false);

  useEffect(() => {
    return subscribeAboutSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load About Us hero." });
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
      await saveAboutSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: publish ? "Hero section published." : "Hero section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save hero section." });
    } finally {
      setSaving(false);
    }
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Banner must be an image file." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Banner image must be 10MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAboutImage({ file, sectionKey: SECTION_KEY, folder: "banner", onProgress: setUploadProgress });
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Banner uploaded. Save to publish it." });
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
      await deleteAboutImage(path);
      emitAlert({ type: "success", message: "Banner image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetAboutSection(SECTION_KEY);
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
        title="About Us Hero Section"
        description="Edit the banner copy, image, and status."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        autosaving={autosaving}
        saving={saving}
        onSave={() => save()}
        onPublish={() => save({ publish: true })}
        onPreview={() => document.getElementById("about-hero-preview")?.scrollIntoView({ behavior: "smooth" })}
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
              <Field label="Small Label" error={errors.smallLabel}>
                <input value={draft.smallLabel || ""} onChange={(event) => setField("smallLabel", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Main Heading" error={errors.heading}>
                <input value={draft.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Description" error={errors.description}>
                <textarea value={draft.description || ""} onChange={(event) => setField("description", event.target.value)} rows={5} className={textareaClass} />
              </Field>
              <Field label="Background Banner Image" error={errors.imageUrl}>
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-24 w-36 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white">
                      {draft.imageUrl ? <img src={draft.imageUrl} alt="Banner preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-7 w-7 text-gray-300" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">Upload or replace banner image</p>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP up to 10MB.</p>
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

        <section id="about-hero-preview" className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <HeroPreview draft={draft} />
        </section>
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset hero section"
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
      <div className="relative min-h-[520px] p-10 text-white">
        {draft.imageUrl ? <img src={draft.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 bg-gray-900" />}
        <div className="absolute inset-0 bg-black/58" />
        <div className="relative z-10 flex min-h-[440px] max-w-3xl flex-col justify-center">
          <p className="text-xl font-semibold">{draft.smallLabel || "Choose CareerBook"}</p>
          <h2 className="mt-6 text-5xl font-black tracking-normal md:text-6xl">{draft.heading || "For Quality & Growth"}</h2>
          <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-white/88">{draft.description}</p>
        </div>
      </div>
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.smallLabel?.trim()) errors.smallLabel = "Small label is required.";
  if (!values.heading?.trim()) errors.heading = "Main heading is required.";
  if (!values.description?.trim()) errors.description = "Description is required.";
  if (!values.imageUrl) errors.imageUrl = "Background banner image is required.";
  return errors;
}
