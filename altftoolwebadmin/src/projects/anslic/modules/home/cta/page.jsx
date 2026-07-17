"use client";

import { useEffect, useMemo, useState } from "react";
import { Rocket } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { DEFAULT_HOME_SECTIONS, resetHomeSection, saveHomeSection, subscribeHomeSection } from "../service/home.service";
import { ActionHeader, Field, formatDate, inputClass, textareaClass } from "../components/HomeAdminShared";

const SECTION_KEY = "cta";
const ROUTE = "/anslic/home/cta";

export default function AnslicHomeCtaPage() {
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
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load CTA section." });
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
      emitAlert({ type: "success", message: "CTA section saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_CTA_UPDATE",
        entityType: "homeCta",
        entityId: "cta",
        summary: "Updated Anslic home CTA section",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save CTA section." });
    } finally {
      setSaving(false);
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetHomeSection(SECTION_KEY);
      emitAlert({ type: "success", message: "CTA section reset." });
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
        title="Home — CTA Section"
        description="Edit the closing call-to-action heading, copy, and button."
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
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">CTA Section Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Heading" error={errors.heading}>
                <input value={draft.heading || ""} onChange={(event) => setField("heading", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Paragraph" error={errors.paragraph}>
                <textarea value={draft.paragraph || ""} onChange={(event) => setField("paragraph", event.target.value)} rows={3} className={textareaClass} />
              </Field>
              <Field label="Button Text" error={errors.buttonText}>
                <input value={draft.buttonText || ""} onChange={(event) => setField("buttonText", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Button Link" error={errors.buttonLink}>
                <input value={draft.buttonLink || ""} onChange={(event) => setField("buttonLink", event.target.value)} className={inputClass} />
              </Field>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <CtaPreview draft={draft} />
        </section>
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset CTA section"
          message="Reset this section back to default content?"
          loading={saving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function CtaPreview({ draft }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#05050d] shadow-sm">
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-5 bg-[linear-gradient(110deg,#111222,#05050d_45%,#0b0c1c)] p-8 text-center text-white">
        <Rocket className="h-8 w-8 text-white/70" />
        <h2 className="max-w-xl text-3xl font-black tracking-normal">{draft.heading || "Heading"}</h2>
        <p className="max-w-lg text-sm font-semibold leading-6 text-white/75">{draft.paragraph || "Paragraph copy"}</p>
        <span className="rounded-full bg-[#4b56f5] px-6 py-2.5 text-sm font-bold text-white">
          {draft.buttonText || "Button"}
        </span>
      </div>
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.paragraph?.trim()) errors.paragraph = "Paragraph is required.";
  if (!values.buttonText?.trim()) errors.buttonText = "Button text is required.";
  if (!values.buttonLink?.trim()) errors.buttonLink = "Button link is required.";
  return errors;
}
