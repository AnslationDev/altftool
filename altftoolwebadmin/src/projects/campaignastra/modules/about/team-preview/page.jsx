"use client";

import { useEffect, useState } from "react";
import { Info, Loader2, Save, Users } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_ABOUT_TEAM_PREVIEW,
  saveAboutTeamPreview,
  subscribeAboutTeamPreview,
} from "../service/about.service";
import { AboutSectionHeader, Field, formatDate, inputClass } from "../components/AboutShared";

export default function CampaignastraAboutTeamPreviewPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_TEAM_PREVIEW);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_TEAM_PREVIEW);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return subscribeAboutTeamPreview(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Team Preview settings." });
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
      await saveAboutTeamPreview(draft);
      emitAlert({ type: "success", message: "Team Preview settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_TEAM_PREVIEW_UPDATE",
        entityType: "aboutTeamPreview",
        entityId: "team-preview",
        summary: "Updated Campaignastra About team preview heading",
        changes: draft,
        route: "/campaignastra/about/team-preview",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save team preview settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <AboutSectionHeader
          icon={Users}
          title="Team Preview"
          description="Controls the section heading for the team teaser on the /about page."
          active={draft.active !== false}
          onToggleActive={() => setField("active", draft.active === false)}
        />

        <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
          <p className="text-sm font-medium text-blue-700">
            This page only controls the section eyebrow and title shown above the team teaser. The actual
            team members displayed come from the separate <strong>Team</strong> module (the shared
            <code className="mx-1 rounded bg-blue-100 px-1.5 py-0.5 text-xs">teamMembers</code>
            collection), not this page.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Heading settings</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Content</h2>
            </div>
            <p className="text-xs font-semibold text-gray-400">Last updated: {formatDate(saved.updatedAt)}</p>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
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
                  placeholder="Our people"
                />
              </Field>

              <Field label="Title" error={errors.title}>
                <input
                  value={draft.title || ""}
                  onChange={(event) => setField("title", event.target.value)}
                  className={inputClass}
                  placeholder="Team Preview"
                />
              </Field>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Team Preview Settings
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
  return errors;
}
