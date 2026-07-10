"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  CircleHelp,
  Home,
  Layers3,
  Loader2,
  Megaphone,
  RefreshCw,
  Save,
  ShieldCheck,
  Sparkles,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_HOME_SECTIONS,
  HOME_TABS,
  deleteHomeImage,
  resetHomeSection,
  saveHomeSection,
  subscribeHomeSection,
  uploadHomeImage,
} from "./service/home.service";
import HeroSectionTab from "./hero-section/page";
import OurServiceTab from "./our-service/page";
import WhyChooseUsTab from "./why-choose-us/page";
import OurStrengthTab from "./our-strength/page";
import FaqTab from "./faq/page";
import MarketingTab from "./marketing/page";
import { StatusBoard } from "./components/HomeSectionShared";

const SECTION_COMPONENTS = {
  hero: HeroSectionTab,
  "our-service": OurServiceTab,
  "why-choose": WhyChooseUsTab,
  "our-strenght": OurStrengthTab,
  faq: FaqTab,
  marketing: MarketingTab,
};

const SECTION_ICONS = {
  hero: Sparkles,
  "our-service": Layers3,
  "why-choose": ShieldCheck,
  "our-strenght": BadgeCheck,
  faq: CircleHelp,
  marketing: Megaphone,
};

export default function CareerBookHomeAdminPage() {
  const [activeTab, setActiveTab] = useState("hero");
  const [sections, setSections] = useState(DEFAULT_HOME_SECTIONS);
  const [draft, setDraft] = useState(DEFAULT_HOME_SECTIONS.hero);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const ready = new Set();
    const unsubs = HOME_TABS.map(({ key }) =>
      subscribeHomeSection(
        key,
        (data) => {
          ready.add(key);
          setSections((prev) => ({ ...prev, [key]: data }));
          if (ready.size === HOME_TABS.length) setLoading(false);
        },
        () => {
          ready.add(key);
          emitAlert({ type: "error", message: `Failed to load ${key} section` });
          if (ready.size === HOME_TABS.length) setLoading(false);
        },
      ),
    );
    return () => unsubs.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    setDraft(sections[activeTab] || DEFAULT_HOME_SECTIONS[activeTab]);
    setErrors({});
  }, [activeTab, sections]);

  const activeLabel = useMemo(
    () => HOME_TABS.find((tab) => tab.key === activeTab)?.label || "Home Section",
    [activeTab],
  );

  const SectionComponent = SECTION_COMPONENTS[activeTab] || HeroSectionTab;
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
      await saveHomeSection(activeTab, normalizeSection(activeTab, draft));
      emitAlert({ type: "success", message: `${activeLabel} saved.` });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save section." });
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
    if (file.size > 10 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Image must be 10MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadHomeImage({ file, sectionKey: activeTab, onProgress: setUploadProgress });
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Hero image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteHomeImage(draft.imagePath);
      emitAlert({ type: "success", message: "Image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function handleReset() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await resetHomeSection(deleteTarget.key);
      emitAlert({ type: "success", message: `${deleteTarget.label} reset.` });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">CareerBook Home Page</h1>
              <p className="text-sm text-gray-500">Click a card to manage that landing page section.</p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Section
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {HOME_TABS.map((tab) => {
            const Icon = SECTION_ICONS[tab.key] || Layers3;
            const section = sections[tab.key] || DEFAULT_HOME_SECTIONS[tab.key];
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  isActive ? "border-gray-900 bg-gray-900 text-white" : "border-gray-200 bg-white text-gray-900"
                }`}
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
        </div>

        <StatusBoard label={activeLabel} draft={draft} sectionKey={activeTab} uploading={uploading} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{activeLabel}</p>
                <h2 className="mt-1 text-base font-bold text-gray-900">Section edit form</h2>
              </div>
              <button onClick={() => setDraft(sections[activeTab] || DEFAULT_HOME_SECTIONS[activeTab])} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50">
                <RefreshCw className="h-3.5 w-3.5" /> Reset Form
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 7 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}
              </div>
            ) : (
              sectionUi.editor
            )}

            <div className="mt-5 space-y-3">
              <button onClick={() => setField("active", !draft.active)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${draft.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{draft.active ? "Section active" : "Section inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${draft.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
              <button onClick={() => setDeleteTarget({ key: activeTab, label: activeLabel })} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
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

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Reset section data"
          message={`Reset ${deleteTarget.label} back to default content?`}
          loading={deleteLoading}
          onConfirm={handleReset}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function validateSection(key, values) {
  const errors = {};
  if (key === "hero") {
    if (!values.headingLine1?.trim()) errors.headingLine1 = "Heading line 1 is required.";
    if (!values.headingLine2?.trim()) errors.headingLine2 = "Heading line 2 is required.";
    if (!values.headingLine3?.trim()) errors.headingLine3 = "Heading line 3 is required.";
    if (!values.subtitle?.trim()) errors.subtitle = "Subtitle is required.";
  } else if (key === "our-service") {
    if (!values.label?.trim()) errors.label = "Section label is required.";
    if (!values.heading?.trim()) errors.heading = "Section heading is required.";
    if (!values.description?.trim()) errors.description = "Section description is required.";
  } else if (key === "why-choose") {
    if (!values.heading?.trim()) errors.heading = "Section heading is required.";
    if (!values.description?.trim()) errors.description = "Section description is required.";
    if (!values.image1Url) errors.image1Url = "Image 1 is required.";
    if (!values.image2Url) errors.image2Url = "Image 2 is required.";
    if (!values.image3Url) errors.image3Url = "Image 3 is required.";
  } else if (key === "faq") {
    if (!values.label?.trim()) errors.label = "Section label is required.";
    if (!values.title?.trim()) errors.title = "Section title is required.";
  } else if (key === "our-strenght") {
    if (!values.label?.trim()) errors.label = "Section label is required.";
    if (!values.title?.trim()) errors.title = "Section title is required.";
  } else if (key === "marketing") {
    if (!values.title?.trim()) errors.title = "Section title is required.";
  } else if (!values.title?.trim()) {
    errors.title = "Section title is required.";
  }
  return errors;
}

function normalizeSection(key, values) {
  if (key === "hero") return values;
  if (key === "our-service") {
    return {
      active: values.active !== false,
      label: String(values.label || "").trim(),
      heading: String(values.heading || "").trim(),
      description: String(values.description || "").trim(),
    };
  }
  if (key === "why-choose") {
    return {
      active: values.active !== false,
      label: String(values.label || "").trim(),
      heading: String(values.heading || "").trim(),
      description: String(values.description || "").trim(),
      image1Url: values.image1Url || "",
      image1Path: values.image1Path || "",
      image2Url: values.image2Url || "",
      image2Path: values.image2Path || "",
      image3Url: values.image3Url || "",
      image3Path: values.image3Path || "",
    };
  }
  if (key === "faq") {
    return {
      active: values.active !== false,
      label: String(values.label || "").trim(),
      title: String(values.title || "").trim(),
    };
  }
  if (key === "our-strenght") {
    return {
      active: values.active !== false,
      label: String(values.label || "").trim(),
      title: String(values.title || "").trim(),
    };
  }
  if (key === "marketing") {
    return {
      active: values.active !== false,
      title: String(values.title || "").trim(),
    };
  }
  return { ...values, items: (values.items || []).map((item) => String(item).trim()).filter(Boolean) };
}
