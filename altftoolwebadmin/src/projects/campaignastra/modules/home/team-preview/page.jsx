"use client";

import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import { DEFAULT_HOME_SECTIONS, resetHomeSection, saveHomeSection, subscribeHomeSection } from "../service/home.service";
import { ActionHeader, Field, SimplePreview, formatDate, inputClass, textareaClass } from "../components/HomeAdminShared";

const SECTION_KEY = "team-preview";
const ROUTE = "/campaignastra/home/team-preview";

export default function CampaignastraHomeTeamPreviewPage() {
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
        emitAlert({ type: "error", message: "Failed to load team preview section." });
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
      emitAlert({ type: "success", message: "Team preview section saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_TEAM_PREVIEW_UPDATE",
        entityType: "homeTeamPreview",
        entityId: "team-preview",
        summary: "Updated Campaignastra home team preview section",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save team preview section." });
    } finally {
      setSaving(false);
    }
  }

  async function resetSection() {
    setSaving(true);
    try {
      await resetHomeSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Team preview section reset." });
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
        title="Home — Team Preview"
        description="Edit the intro copy shown above the team cards."
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
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Team Preview Management</p>
          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Eyebrow" error={errors.eyebrow}>
                <input value={draft.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Title" error={errors.title}>
                <input value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle" error={errors.subtitle}>
                <textarea value={draft.subtitle || ""} onChange={(event) => setField("subtitle", event.target.value)} rows={3} className={textareaClass} />
              </Field>
              <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-400">
                Note: the actual team members shown on the homepage are managed separately in the Team module.
              </p>
            </div>
          )}
        </section>

        <section className="space-y-4">
          <p className="text-sm font-bold text-gray-700">Live preview</p>
          <SimplePreview icon={Users} eyebrow={draft.eyebrow} title={draft.title} subtitle={draft.subtitle} />
        </section>
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset team preview section"
          message="Reset this section back to default content?"
          loading={saving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.title?.trim()) errors.title = "Title is required.";
  if (!values.subtitle?.trim()) errors.subtitle = "Subtitle is required.";
  return errors;
}
