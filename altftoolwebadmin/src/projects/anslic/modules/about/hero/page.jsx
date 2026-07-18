"use client";

import { useEffect, useState } from "react";
import { Image as ImageIcon, Loader2, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_ABOUT_HERO,
  saveAboutHero,
  subscribeAboutHero,
} from "../service/about.service";
import { AboutSectionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AboutShared";

export default function AnslicAboutHeroPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_HERO);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return subscribeAboutHero(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load About hero settings." });
        setLoading(false);
      },
    );
  }, []);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = async () => {
    const nextErrors = validate(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutHero(draft);
      emitAlert({ type: "success", message: "About hero settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_HERO_UPDATE",
        entityType: "aboutHero",
        entityId: "hero",
        summary: "Updated Anslic About hero section",
        changes: draft,
        route: "/anslic/about/hero",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save hero settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <AboutSectionHeader
          icon={ImageIcon}
          title="About Hero Section"
          description="Controls the hero banner shown at the top of the /about page."
          active={draft.active !== false}
          onToggleActive={() => setField("active", draft.active === false)}
        />

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Hero settings</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Content</h2>
            </div>
            <p className="text-xs font-semibold text-gray-400">Last updated: {formatDate(saved.updatedAt)}</p>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <Field label="Eyebrow" error={errors.eyebrow}>
                <input
                  value={draft.eyebrow || ""}
                  onChange={(event) => setField("eyebrow", event.target.value)}
                  className={inputClass}
                  placeholder="About Anslic"
                />
              </Field>

              <Field label="Title" error={errors.title}>
                <input
                  value={draft.title || ""}
                  onChange={(event) => setField("title", event.target.value)}
                  className={inputClass}
                  placeholder="We build growth systems, not just campaigns"
                />
              </Field>

              <Field label="Subtitle" error={errors.subtitle}>
                <textarea
                  value={draft.subtitle || ""}
                  onChange={(event) => setField("subtitle", event.target.value)}
                  rows={3}
                  className={textareaClass}
                  placeholder="A senior team obsessed with compounding results for ambitious brands."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="SEO title" error={errors.seoTitle}>
                  <input
                    value={draft.seoTitle || ""}
                    onChange={(event) => setField("seoTitle", event.target.value)}
                    className={inputClass}
                    placeholder="About Anslic"
                  />
                </Field>
                <Field label="SEO description" error={errors.seoDescription}>
                  <input
                    value={draft.seoDescription || ""}
                    onChange={(event) => setField("seoDescription", event.target.value)}
                    className={inputClass}
                    placeholder="Learn about Anslic's growth team"
                  />
                </Field>
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Hero Settings
              </button>
            </div>
          )}
        </div>
      </div>
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
