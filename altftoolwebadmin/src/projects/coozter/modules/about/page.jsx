"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DatabaseZap, Loader2, RefreshCw, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import {
  ABOUT_SECTION_TABS,
  ARRAY_FIELD_DEFAULTS,
  DEFAULT_ABOUT_PAGE_CONTENT,
  ROOT_ARRAY_SECTIONS,
  saveAboutPageContent,
  seedAboutPageContent,
  subscribeAboutPageContent,
  validateAboutPageContent,
} from "./service/about.service";
import { LoadingFields, PreviewPanel, buttonClass } from "./components/AboutSectionShared";
import HeroSectionTab from "./hero-section/page";
import WhyChooseSectionTab from "./why-choose-section/page";
import BeliefsSectionTab from "./beliefs-section/page";
import WorkModelSectionTab from "./work-model-section/page";
import TeamSectionTab from "./team-section/page";

const SECTION_COMPONENTS = {
  heroSection: HeroSectionTab,
  whyChooseSection: WhyChooseSectionTab,
  beliefsSection: BeliefsSectionTab,
  workModelSection: WorkModelSectionTab,
  teamSection: TeamSectionTab,
};

export default function CoozterAboutAdminPage() {
  const [content, setContent] = useState(DEFAULT_ABOUT_PAGE_CONTENT);
  const [activeSection, setActiveSection] = useState("heroSection");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [errors, setErrors] = useState({});
  const saveInFlightRef = useRef(false);
  const seedInFlightRef = useRef(false);

  useEffect(() => {
    return subscribeAboutPageContent(
      (next) => {
        setContent(next);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        emitAlert({ type: "error", message: error?.message || "Failed to load Coozter about content." });
      },
    );
  }, []);

  const activeLabel = useMemo(() => ABOUT_SECTION_TABS.find((section) => section.key === activeSection)?.label || "About Section", [activeSection]);
  const activeData = content[activeSection] || (ROOT_ARRAY_SECTIONS.has(activeSection) ? [] : {});
  const activeErrors = Object.keys(errors).filter((key) => key.startsWith(`${activeSection}.`)).length;
  const SectionComponent = SECTION_COMPONENTS[activeSection] || HeroSectionTab;

  function setSectionField(field, value) {
    if (ROOT_ARRAY_SECTIONS.has(activeSection)) return;
    setContent((prev) => ({ ...prev, [activeSection]: { ...prev[activeSection], [field]: value } }));
    clearFieldError(`${activeSection}.${field}`);
  }

  function setSectionActive() {
    if (ROOT_ARRAY_SECTIONS.has(activeSection)) return;
    setSectionField("isActive", activeData.isActive === false);
  }

  function updateArrayItem(arrayKey, index, field, value) {
    setContent((prev) => {
      if (ROOT_ARRAY_SECTIONS.has(activeSection)) {
        const rows = [...(prev[activeSection] || [])];
        rows[index] = { ...rows[index], [field]: value };
        return { ...prev, [activeSection]: rows };
      }

      const rows = [...(prev[activeSection]?.[arrayKey] || [])];
      rows[index] = { ...rows[index], [field]: value };
      return { ...prev, [activeSection]: { ...prev[activeSection], [arrayKey]: rows } };
    });
    clearFieldError(`${activeSection}.${arrayKey}.${index}.${field}`);
  }

  function addArrayItem(arrayKey) {
    setContent((prev) => {
      if (ROOT_ARRAY_SECTIONS.has(activeSection)) {
        const rows = prev[activeSection] || [];
        return { ...prev, [activeSection]: [...rows, { ...(ARRAY_FIELD_DEFAULTS[arrayKey] || {}), sortOrder: rows.length + 1, isActive: true }] };
      }

      const rows = prev[activeSection]?.[arrayKey] || [];
      return {
        ...prev,
        [activeSection]: {
          ...prev[activeSection],
          [arrayKey]: [...rows, { ...(ARRAY_FIELD_DEFAULTS[arrayKey] || {}), sortOrder: rows.length + 1, isActive: true }],
        },
      };
    });
  }

  function removeArrayItem(arrayKey, index) {
    setContent((prev) => {
      if (ROOT_ARRAY_SECTIONS.has(activeSection)) return { ...prev, [activeSection]: (prev[activeSection] || []).filter((_, itemIndex) => itemIndex !== index) };
      return { ...prev, [activeSection]: { ...prev[activeSection], [arrayKey]: (prev[activeSection]?.[arrayKey] || []).filter((_, itemIndex) => itemIndex !== index) } };
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
    const nextErrors = validateAboutPageContent(content);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      emitAlert({ type: "error", message: "Please fix required about page fields before saving." });
      return;
    }

    saveInFlightRef.current = true;
    setSaving(true);
    try {
      await saveAboutPageContent(content);
      emitAlert({ type: "success", message: "Coozter about content saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save about content." });
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
      await seedAboutPageContent();
      setErrors({});
      emitAlert({ type: "success", message: "Default Coozter about content seeded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to seed defaults." });
    } finally {
      seedInFlightRef.current = false;
      setSeeding(false);
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="mt-1 text-2xl font-bold text-[var(--foreground)]">About Page Content</h1>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => setContent(DEFAULT_ABOUT_PAGE_CONTENT)} className={buttonClass("secondary")}><RefreshCw className="h-4 w-4" /> Reset Form</button>
            <button type="button" onClick={handleSeedDefaults} disabled={seeding || saving} className={buttonClass("secondary")}>{seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <DatabaseZap className="h-4 w-4" />} Seed Defaults</button>
            <button type="button" onClick={handleSave} disabled={saving || seeding} className={buttonClass("primary")}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Content</button>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {ABOUT_SECTION_TABS.map((tab) => {
            const isCurrent = activeSection === tab.key;
            const tabErrors = Object.keys(errors).filter((key) => key.startsWith(`${tab.key}.`)).length;
            const active = ROOT_ARRAY_SECTIONS.has(tab.key) ? (content[tab.key] || []).some((item) => item.isActive !== false) : content[tab.key]?.isActive !== false;
            return (
              <button key={tab.key} type="button" onClick={() => setActiveSection(tab.key)} className={`rounded-lg border p-3 text-left shadow-[var(--shadow-sm)] transition ${isCurrent ? "border-[var(--primary)] bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))]" : "border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-soft)]"}`}>
                <span className="block text-sm font-bold text-[var(--foreground)]">{tab.label}</span>
                <span className="mt-2 flex items-center justify-between gap-2 text-xs text-[var(--muted)]"><span>{active ? "Active" : "Hidden"}</span>{tabErrors ? <span className="font-bold text-[var(--danger)]">{tabErrors}</span> : null}</span>
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
              {!ROOT_ARRAY_SECTIONS.has(activeSection) ? <button type="button" onClick={setSectionActive} className={buttonClass("secondary")}>{activeData.isActive === false ? "Section Hidden" : "Section Active"}</button> : null}
            </div>

            {loading ? <LoadingFields /> : <SectionComponent section={activeData} errors={errors} onFieldChange={setSectionField} onArrayAdd={addArrayItem} onArrayRemove={removeArrayItem} onArrayUpdate={updateArrayItem} />}
          </div>

          <PreviewPanel label={activeLabel} section={activeData} errorCount={activeErrors} content={content} />
        </section>
      </div>
    </main>
  );
}
