"use client";

import { useEffect, useMemo, useState } from "react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_HERO_SETTINGS,
  deletePartnersHeroImage,
  resetPartnersHero,
  savePartnersHero,
  subscribePartnersHero,
  uploadPartnersHeroImage,
} from "../service/partners.service";
import {
  ActionHeader,
  Field,
  ImageUploadField,
  Panel,
  cardClass,
  eyebrowClass,
  formatDate,
  inputClass,
  textareaClass,
} from "../components/PartnersAdminShared";

const ROUTE = "/infodrif/partners/hero";

export default function InfodrifPartnersHeroPage() {
  const [saved, setSaved] = useState(DEFAULT_HERO_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_HERO_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    return subscribePartnersHero(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load partners hero settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleSave() {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await savePartnersHero(draft);
      emitAlert({ type: "success", message: "Partners hero saved." });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_HERO_UPDATE",
        entityType: "partnersHero",
        entityId: "hero",
        summary: "Updated Infodrif partners hero",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save partners hero." });
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await resetPartnersHero();
      emitAlert({ type: "success", message: "Partners hero reset to defaults." });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_HERO_RESET",
        entityType: "partnersHero",
        entityId: "hero",
        summary: "Reset Infodrif partners hero to defaults",
        route: ROUTE,
      });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 pb-6">
      <ActionHeader
        title="Partners — Hero"
        description="Edit the partners hero headline, paragraph, CTA, and image."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving || uploading}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-5xl flex-col gap-5">
        <Panel title="Hero copy">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-md bg-surface-soft" />
              ))}
            </div>
          ) : (
            <>
              <Field label="Heading" required error={errors.heading}>
                <textarea
                  rows={3}
                  value={draft.heading || ""}
                  onChange={(event) => setField("heading", event.target.value)}
                  className={textareaClass}
                  placeholder="Better teamwork and more sales..."
                />
              </Field>

              <Field label="Paragraph" required error={errors.paragraph}>
                <textarea
                  rows={3}
                  value={draft.paragraph || ""}
                  onChange={(event) => setField("paragraph", event.target.value)}
                  className={textareaClass}
                  placeholder="InfoDrif helps affiliates discover high-converting offers..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CTA label" required error={errors.ctaLabel}>
                  <input
                    value={draft.ctaLabel || ""}
                    onChange={(event) => setField("ctaLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Try Our Services"
                  />
                </Field>
                <Field label="Image alt text" error={errors.imageAlt}>
                  <input
                    value={draft.imageAlt || ""}
                    onChange={(event) => setField("imageAlt", event.target.value)}
                    className={inputClass}
                    placeholder="Hero"
                  />
                </Field>
              </div>
            </>
          )}
        </Panel>

        <Panel title="Hero image">
          <ImageUploadField
            label="Image"
            imageUrl={draft.imageUrl || ""}
            imagePath={draft.imagePath || ""}
            alt={draft.imageAlt}
            upload={uploadPartnersHeroImage}
            remove={deletePartnersHeroImage}
            onUploadingChange={setUploading}
            onChange={({ imageUrl, imagePath }) =>
              setDraft((prev) => ({ ...prev, imageUrl, imagePath }))
            }
          />
          <Field label="Image URL" hint="Set automatically on upload. Paste a URL to use an external image (leave the path empty).">
            <input
              value={draft.imageUrl || ""}
              onChange={(event) => setField("imageUrl", event.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </Field>
        </Panel>

        <div className={`${cardClass} p-5`}>
          <p className={eyebrowClass}>Preview</p>
          <h2 className="mt-3 max-w-2xl text-2xl font-bold text-foreground">
            {draft.heading || "Heading"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
            {draft.paragraph || "Paragraph copy"}
          </p>
          <span className="mt-4 inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
            {draft.ctaLabel || "CTA"}
          </span>
        </div>
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset partners hero"
          message="Reset the partners hero back to the default content?"
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.paragraph?.trim()) errors.paragraph = "Paragraph is required.";
  if (!values.ctaLabel?.trim()) errors.ctaLabel = "CTA label is required.";
  return errors;
}
