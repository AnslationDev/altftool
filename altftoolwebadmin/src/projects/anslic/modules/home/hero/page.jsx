"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { DEFAULT_HOME_SECTIONS, resetHomeSection, saveHomeSection, subscribeHomeSection } from "../service/home.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/HomeAdminShared";

const SECTION_KEY = "hero";
const ROUTE = "/anslic/home/hero";

export default function AnslicHomeHeroPage() {
  const [saved, setSaved] = useState(DEFAULT_HOME_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_HOME_SECTIONS[SECTION_KEY]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    return subscribeHomeSection(
      SECTION_KEY,
      (data) => {
        setSaved((prevSaved) => {
          setDraft((prevDraft) => {
            const hasLocalEdits = JSON.stringify(prevDraft) !== JSON.stringify(prevSaved);
            if (!hasLocalEdits) return data;
            if (JSON.stringify(prevDraft) !== JSON.stringify(data)) {
              emitAlert({
                type: "warning",
                message: "Hero section was updated elsewhere while you have unsaved changes. Your edits were kept — save to overwrite, or refresh to discard them.",
              });
            }
            return prevDraft;
          });
          return data;
        });
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load hero section." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function save() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await saveHomeSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: "Hero section saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_HERO_UPDATE",
        entityType: "homeHero",
        entityId: "hero",
        summary: "Updated Anslic home hero section",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save hero section." });
    } finally {
      setSaving(false);
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetHomeSection(SECTION_KEY);
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
        title="Home — Hero Section"
        description="Edit the homepage hero eyebrow, headline, stats, and CTA buttons."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        saving={saving}
        onSave={save}
        onReset={() => setConfirmReset(true)}
        onToggleActive={() => setField("active", draft.active === false)}
      />

      <div className="mx-auto mt-6 grid max-w-7xl gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Hero Section Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Eyebrow" error={errors.eyebrow}>
                <input value={draft.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Headline" error={errors.headline}>
                <input value={draft.headline || ""} onChange={(event) => setField("headline", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle" error={errors.subtitle}>
                <textarea value={draft.subtitle || ""} onChange={(event) => setField("subtitle", event.target.value)} rows={3} className={textareaClass} />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Stat 1 Value" error={errors.stat1Value}>
                  <input value={draft.stat1Value || ""} onChange={(event) => setField("stat1Value", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Stat 1 Label" error={errors.stat1Label}>
                  <input value={draft.stat1Label || ""} onChange={(event) => setField("stat1Label", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Stat 2 Value" error={errors.stat2Value}>
                  <input value={draft.stat2Value || ""} onChange={(event) => setField("stat2Value", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Stat 2 Label" error={errors.stat2Label}>
                  <input value={draft.stat2Label || ""} onChange={(event) => setField("stat2Label", event.target.value)} className={inputClass} />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Button 1 Text" error={errors.button1Text}>
                  <input value={draft.button1Text || ""} onChange={(event) => setField("button1Text", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Button 1 Link" error={errors.button1Link}>
                  <input value={draft.button1Link || ""} onChange={(event) => setField("button1Link", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Button 2 Text" error={errors.button2Text}>
                  <input value={draft.button2Text || ""} onChange={(event) => setField("button2Text", event.target.value)} className={inputClass} />
                </Field>
                <Field label="Button 2 Link" error={errors.button2Link}>
                  <input value={draft.button2Link || ""} onChange={(event) => setField("button2Link", event.target.value)} className={inputClass} />
                </Field>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4">
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
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#05050d] shadow-sm">
      <div className="relative flex min-h-[420px] flex-col justify-center gap-6 bg-[linear-gradient(110deg,#111222,#05050d_45%,#0b0c1c)] p-8 text-white">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white/70">
          <Sparkles className="h-3.5 w-3.5" />
          {draft.eyebrow || "Eyebrow"}
        </span>
        <h2 className="max-w-2xl text-4xl font-black tracking-normal md:text-5xl">
          {draft.headline || "Headline"}
        </h2>
        <p className="max-w-xl text-sm font-semibold leading-6 text-white/75">
          {draft.subtitle || "Subtitle copy"}
        </p>
        <div className="flex gap-8">
          <div>
            <p className="text-2xl font-black">{draft.stat1Value || "0"}</p>
            <p className="text-xs font-semibold text-white/60">{draft.stat1Label || "Stat label"}</p>
          </div>
          <div>
            <p className="text-2xl font-black">{draft.stat2Value || "0"}</p>
            <p className="text-xs font-semibold text-white/60">{draft.stat2Label || "Stat label"}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="rounded-full bg-[#4b56f5] px-5 py-2.5 text-sm font-bold text-white">
            {draft.button1Text || "Button 1"}
          </span>
          <span className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white">
            {draft.button2Text || "Button 2"}
          </span>
        </div>
      </div>
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.headline?.trim()) errors.headline = "Headline is required.";
  if (!values.subtitle?.trim()) errors.subtitle = "Subtitle is required.";
  if (!values.button1Text?.trim()) errors.button1Text = "Button 1 text is required.";
  if (!values.button1Link?.trim()) errors.button1Link = "Button 1 link is required.";
  if (!values.button2Text?.trim()) errors.button2Text = "Button 2 text is required.";
  if (!values.button2Link?.trim()) errors.button2Link = "Button 2 link is required.";
  return errors;
}
