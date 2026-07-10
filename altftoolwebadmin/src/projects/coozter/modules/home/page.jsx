
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DatabaseZap, Loader2, RefreshCw, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  ARRAY_FIELD_DEFAULTS,
  DEFAULT_HOME_PAGE_CONTENT,
  HOME_SECTION_TABS,
  saveHomePageContent,
  seedHomePageContent,
  subscribeHomePageContent,
  uploadHomeAsset,
  validateHomePageContent,
} from "./service/home.service";
import { LoadingFields, PreviewPanel, buttonClass } from "./components/HomeSectionShared";
import HeroSectionTab from "./hero-section/page";
import TrustSectionTab from "./trust-section/page";
import MarketingChannelsTab from "./marketing-channels/page";
import ProcessSectionTab from "./process-section/page";
import ServicesPreviewTab from "./services-preview/page";
import BlogPreviewTab from "./blog-preview/page";
import ContactCtaTab from "./contact-cta/page";

const SECTION_COMPONENTS = {
  heroSection: HeroSectionTab,
  trustSection: TrustSectionTab,
  marketingChannelsSection: MarketingChannelsTab,
  processSection: ProcessSectionTab,
  servicesPreviewSection: ServicesPreviewTab,
  blogPreviewSection: BlogPreviewTab,
  contactCtaSection: ContactCtaTab,
};

export default function CoozterHomeAdminPage() {
  const [content, setContent] = useState(DEFAULT_HOME_PAGE_CONTENT);
  const [activeSection, setActiveSection] = useState("heroSection");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [uploadKey, setUploadKey] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const saveInFlightRef = useRef(false);
  const seedInFlightRef = useRef(false);

  useEffect(() => {
    return subscribeHomePageContent(
      (next) => {
        setContent(next);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load Coozter home content." });
      },
    );
  }, []);

  const activeLabel = useMemo(
    () => HOME_SECTION_TABS.find((section) => section.key === activeSection)?.label || "Home Section",
    [activeSection],
  );
  const activeData = content[activeSection] || {};
  const activeErrors = Object.keys(errors).filter((key) => key.startsWith(`${activeSection}.`)).length;
  const SectionComponent = SECTION_COMPONENTS[activeSection] || HeroSectionTab;

  function setSectionField(field, value) {
    setContent((prev) => ({
      ...prev,
      [activeSection]: {
        ...prev[activeSection],
        [field]: value,
      },
    }));
    clearFieldError(`${activeSection}.${field}`);
  }

  function setSectionActive() {
    setSectionField("isActive", activeData.isActive === false);
  }

  function updateArrayItem(arrayKey, index, field, value) {
    setContent((prev) => {
      const rows = [...(prev[activeSection]?.[arrayKey] || [])];
      rows[index] = { ...rows[index], [field]: value };
      return {
        ...prev,
        [activeSection]: {
          ...prev[activeSection],
          [arrayKey]: rows,
        },
      };
    });
    clearFieldError(`${activeSection}.${arrayKey}.${index}.${field}`);
  }

  function addArrayItem(arrayKey) {
    setContent((prev) => {
      const rows = prev[activeSection]?.[arrayKey] || [];
      return {
        ...prev,
        [activeSection]: {
          ...prev[activeSection],
          [arrayKey]: [
            ...rows,
            {
              ...(ARRAY_FIELD_DEFAULTS[arrayKey] || { sortOrder: rows.length + 1, isActive: true }),
              sortOrder: rows.length + 1,
            },
          ],
        },
      };
    });
  }

  function removeArrayItem(arrayKey, index) {
    setContent((prev) => {
      const rows = (prev[activeSection]?.[arrayKey] || []).filter((_, itemIndex) => itemIndex !== index);
      return {
        ...prev,
        [activeSection]: {
          ...prev[activeSection],
          [arrayKey]: rows,
        },
      };
    });
  }

  function clearFieldError(path) {
    setErrors((prev) => {
      if (!prev[path]) return prev;
      const next = { ...prev };
      delete next[path];
      return next;
    });
  }

  async function handleSave() {
    if (saveInFlightRef.current) return;

    const nextErrors = validateHomePageContent(content);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      emitAlert({ type: "error", message: "Please fix required home page fields before saving." });
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    try {
      await saveHomePageContent(content);
      emitAlert({ type: "success", message: "Coozter home content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save home content." });
    } finally {
      saveInFlightRef.current = false;
      setSaving(false);
    }
  }

  async function handleSeedDefaults() {
    if (seedInFlightRef.current) return;

    seedInFlightRef.current = true;
    setSeeding(true);
    try {
      await seedHomePageContent();
      setErrors({});
      emitAlert({ type: "success", message: "Default Coozter home content seeded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to seed defaults." });
    } finally {
      seedInFlightRef.current = false;
      setSeeding(false);
    }
  }

  async function handleUpload(file, target) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Please upload an image file." });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Image must be 10MB or smaller." });
      return;
    }

    const key = target.join(".");
    setUploadKey(key);
    setUploadProgress(0);
    try {
      const uploaded = await uploadHomeAsset({
        file,
        sectionKey: activeSection,
        fieldKey: key,
        onProgress: setUploadProgress,
      });

      if (target.length === 1) {
        setSectionField(target[0], uploaded.url);
      } else {
        updateArrayItem(target[0], target[1], target[2], uploaded.url);
      }
      emitAlert({ type: "success", message: "Image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploadKey("");
      setUploadProgress(0);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">Home Page Content</h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setContent(DEFAULT_HOME_PAGE_CONTENT)} className={buttonClass("secondary")}>
              <RefreshCw className="h-4 w-4" />
              Reset Form
            </button>
            <button type="button" onClick={handleSeedDefaults} disabled={seeding || saving} className={buttonClass("secondary")}>
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />}
              Seed Defaults
            </button>
            <button type="button" onClick={handleSave} disabled={saving || seeding} className={buttonClass("primary")}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Content
            </button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          {HOME_SECTION_TABS.map((tab) => {
            const isCurrent = activeSection === tab.key;
            const section = content[tab.key] || {};
            const tabErrors = Object.keys(errors).filter((key) => key.startsWith(`${tab.key}.`)).length;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveSection(tab.key)}
                className={`rounded-lg border p-3 text-left shadow-[var(--shadow-sm)] transition ${
                  isCurrent
                    ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))]"
                    : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-soft)]"
                }`}
              >
                <span className="block text-sm font-bold text-[var(--foreground)]">{tab.label}</span>
                <span className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--muted)]">
                  <span>{section.isActive === false ? "Hidden" : "Active"}</span>
                  {tabErrors ? <span className="font-bold text-[var(--danger)]">{tabErrors}</span> : null}
                </span>
              </button>
            );
          })}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.68fr)_minmax(360px,0.32fr)]">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">{activeLabel}</p>
                <h2 className="mt-1 text-lg font-bold text-[var(--foreground)]">Editable Fields</h2>
              </div>
              <button
                type="button"
                onClick={setSectionActive}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  activeData.isActive === false
                    ? "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
                    : "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[color-mix(in_srgb,var(--success)_10%,var(--surface))] text-[var(--success)]"
                }`}
              >
                {activeData.isActive === false ? "Section Hidden" : "Section Active"}
              </button>
            </div>

            {loading ? (
              <LoadingFields />
            ) : (
              <SectionComponent
                section={activeData}
                errors={errors}
                uploadKey={uploadKey}
                uploadProgress={uploadProgress}
                onFieldChange={setSectionField}
                onArrayAdd={addArrayItem}
                onArrayRemove={removeArrayItem}
                onArrayUpdate={updateArrayItem}
                onUpload={handleUpload}
              />
            )}
          </div>

          <PreviewPanel label={activeLabel} section={activeData} errorCount={activeErrors} content={content} />
        </section>
      </div>
    </main>
  );
}

