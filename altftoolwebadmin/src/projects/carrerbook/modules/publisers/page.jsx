"use client";

import { useEffect, useMemo, useState } from "react";
import { BadgeCheck, Loader2, RefreshCw, Save, Sparkles, Trash2, Users } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import PublisherHeroSectionTab from "./hero-section/page";
import WhyChooseCareerBookTab from "./whychoose-carrerbook/page";
import {
  DEFAULT_PUBLISHER_SECTIONS,
  PUBLISHER_TABS,
  deletePublisherImage,
  resetPublisherSection,
  savePublisherSection,
  subscribePublisherSection,
  uploadPublisherImage,
} from "./service/publisher.service";

const SECTION_COMPONENTS = {
  "hero-section": PublisherHeroSectionTab,
  "whychoose-carrerbook": WhyChooseCareerBookTab,
};

const SECTION_ICONS = {
  "hero-section": Sparkles,
  "whychoose-carrerbook": BadgeCheck,
};

export default function PublisersPage() {
  const [activeTab, setActiveTab] = useState("hero-section");
  const [sections, setSections] = useState(DEFAULT_PUBLISHER_SECTIONS);
  const [draft, setDraft] = useState(DEFAULT_PUBLISHER_SECTIONS["hero-section"]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [resetTarget, setResetTarget] = useState(null);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    const ready = new Set();
    const unsubs = PUBLISHER_TABS.map(({ key }) =>
      subscribePublisherSection(
        key,
        (data) => {
          ready.add(key);
          setSections((prev) => ({ ...prev, [key]: data }));
          if (ready.size === PUBLISHER_TABS.length) setLoading(false);
        },
        () => {
          ready.add(key);
          emitAlert({ type: "error", message: `Failed to load ${key}.` });
          if (ready.size === PUBLISHER_TABS.length) setLoading(false);
        },
      ),
    );
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    setDraft(sections[activeTab] || DEFAULT_PUBLISHER_SECTIONS[activeTab]);
    setErrors({});
  }, [activeTab, sections]);

  const activeLabel = useMemo(
    () => PUBLISHER_TABS.find((tab) => tab.key === activeTab)?.label || "Publisher Section",
    [activeTab],
  );

  const SectionComponent = SECTION_COMPONENTS[activeTab] || PublisherHeroSectionTab;
  const sectionUi = SectionComponent({
    draft,
    setField,
    errors,
    handleUpload,
    handleRemoveImage,
    uploading,
    uploadProgress,
  });

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSave() {
    const nextErrors = validateSection(activeTab, draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await savePublisherSection(activeTab, normalizeSection(activeTab, draft));
      emitAlert({ type: "success", message: `${activeLabel} saved.` });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save publisher section." });
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadPublisherImage({
        file,
        sectionKey: activeTab,
        folder: "hero",
        onProgress: setUploadProgress,
      });
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Image uploaded. Save section to publish it." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    const path = draft.imagePath;
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deletePublisherImage(path);
      emitAlert({ type: "success", message: "Image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function handleReset() {
    if (!resetTarget) return;
    setResetLoading(true);
    try {
      await resetPublisherSection(resetTarget.key);
      emitAlert({ type: "success", message: `${resetTarget.label} reset.` });
      setResetTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Publisher Admin</h1>
              <p className="text-sm text-gray-500">Manage publisher hero content and Why CareerBook benefit cards.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Section
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {PUBLISHER_TABS.map((tab) => {
            const Icon = SECTION_ICONS[tab.key] || Sparkles;
            const section = sections[tab.key] || DEFAULT_PUBLISHER_SECTIONS[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${isActive ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"}`}
              >
                <span className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${isActive ? "bg-white/10" : "bg-gray-100"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="block text-sm font-bold">{tab.label}</span>
                <span className={`mt-3 inline-flex rounded-lg px-2 py-1 text-xs font-bold ${section.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                  {section.active ? "Active" : "Inactive"}
                </span>
              </button>
            );
          })}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Firebase Flow</p>
            <p className="mt-3 text-sm font-bold text-gray-900">projects / carrerbook / publisher</p>
            <p className="mt-2 text-xs font-semibold text-gray-500">hero-section, whychoose-carrerbook/cards</p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Upload State</p>
            <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${uploading ? "bg-violet-50 text-violet-700" : "bg-gray-100 text-gray-700"}`}>
              {uploading ? "Uploading" : "Ready"}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{activeLabel}</p>
                <h2 className="mt-1 text-base font-bold text-gray-900">Section edit form</h2>
              </div>
              <button onClick={() => setDraft(sections[activeTab] || DEFAULT_PUBLISHER_SECTIONS[activeTab])} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                <RefreshCw className="h-3.5 w-3.5" /> Reset Form
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">{Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
            ) : (
              sectionUi.editor
            )}

            <div className="mt-5 space-y-3">
              <button onClick={() => setField("active", !draft.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{draft.active ? "Section active" : "Section inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
              <button onClick={() => setResetTarget({ key: activeTab, label: activeLabel })} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Delete / Reset Section Data
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-sm font-bold text-gray-700">Live preview</p>
            {sectionUi.preview}
          </section>
        </div>
      </div>

      {resetTarget ? (
        <DeleteConfirmModal
          title="Reset publisher section"
          message={`Reset ${resetTarget.label} back to default content?`}
          loading={resetLoading}
          onConfirm={handleReset}
          onCancel={() => setResetTarget(null)}
        />
      ) : null}
    </div>
  );
}

function validateSection(key, values) {
  const errors = {};
  if (key === "hero-section") {
    if (!values.headingPrefix?.trim()) errors.headingPrefix = "Heading prefix is required.";
    if (!values.highlightWords?.trim()) errors.highlightWords = "Highlight words are required.";
    if (!values.description?.trim()) errors.description = "Description is required.";
    if (!values.buttonText?.trim()) errors.buttonText = "CTA text is required.";
    if (!values.buttonLink?.trim()) errors.buttonLink = "CTA link is required.";
    if (!values.imageUrl) errors.imageUrl = "Hero image is required.";
  }
  if (key === "whychoose-carrerbook") {
    if (!values.titlePrefix?.trim()) errors.titlePrefix = "Title prefix is required.";
    if (!values.highlightedTitle?.trim()) errors.highlightedTitle = "Highlighted title is required.";
    if (!values.titleSuffix?.trim()) errors.titleSuffix = "Title suffix is required.";
  }
  return errors;
}

function normalizeSection(key, values) {
  if (key === "hero-section") {
    return {
      active: values.active !== false,
      headingPrefix: String(values.headingPrefix || "").trim(),
      highlightWords: String(values.highlightWords || "").trim(),
      description: String(values.description || "").trim(),
      buttonText: String(values.buttonText || "").trim(),
      buttonLink: String(values.buttonLink || "").trim(),
      imageUrl: values.imageUrl || "",
      imagePath: values.imagePath || "",
    };
  }
  return {
    active: values.active !== false,
    titlePrefix: String(values.titlePrefix || "").trim(),
    highlightedTitle: String(values.highlightedTitle || "").trim(),
    titleSuffix: String(values.titleSuffix || "").trim(),
  };
}
