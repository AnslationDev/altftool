"use client";

import { useEffect, useState } from "react";
import { Loader2, Save, Target } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_ABOUT_MISSION_VISION,
  saveAboutMissionVision,
  subscribeAboutMissionVision,
} from "../service/about.service";
import { AboutSectionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AboutShared";

export default function AnslicAboutMissionVisionPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_MISSION_VISION);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_MISSION_VISION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return subscribeAboutMissionVision(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load Mission & Vision settings." });
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
      await saveAboutMissionVision(draft);
      emitAlert({ type: "success", message: "Mission & Vision settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_MISSION_VISION_UPDATE",
        entityType: "aboutMissionVision",
        entityId: "mission-vision",
        summary: "Updated Anslic About mission & vision section",
        changes: draft,
        route: "/anslic/about/mission-vision",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save mission & vision settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <AboutSectionHeader
          icon={Target}
          title="Mission & Vision"
          description="Controls the mission and vision statement blocks on the /about page."
          active={draft.active !== false}
          onToggleActive={() => setField("active", draft.active === false)}
        />

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Mission block</p>
            {loading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <Field label="Mission title" error={errors.missionTitle}>
                  <input
                    value={draft.missionTitle || ""}
                    onChange={(event) => setField("missionTitle", event.target.value)}
                    className={inputClass}
                    placeholder="Our Mission"
                  />
                </Field>
                <Field label="Mission text" error={errors.missionText}>
                  <textarea
                    value={draft.missionText || ""}
                    onChange={(event) => setField("missionText", event.target.value)}
                    rows={6}
                    className={textareaClass}
                    placeholder="To help ambitious businesses build durable growth engines through clear strategy and relentless execution."
                  />
                </Field>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Vision block</p>
            {loading ? (
              <div className="mt-5 space-y-3">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <Field label="Vision title" error={errors.visionTitle}>
                  <input
                    value={draft.visionTitle || ""}
                    onChange={(event) => setField("visionTitle", event.target.value)}
                    className={inputClass}
                    placeholder="Our Vision"
                  />
                </Field>
                <Field label="Vision text" error={errors.visionText}>
                  <textarea
                    value={draft.visionText || ""}
                    onChange={(event) => setField("visionText", event.target.value)}
                    rows={6}
                    className={textareaClass}
                    placeholder="A web where brands grow through genuine value and honest marketing, not gimmicks."
                  />
                </Field>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold text-gray-400">Last updated: {formatDate(saved.updatedAt)}</p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Mission & Vision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function validate(values) {
  const errors = {};
  if (!values.missionTitle?.trim()) errors.missionTitle = "Mission title is required.";
  if (!values.missionText?.trim()) errors.missionText = "Mission text is required.";
  if (!values.visionTitle?.trim()) errors.visionTitle = "Vision title is required.";
  if (!values.visionText?.trim()) errors.visionText = "Vision text is required.";
  return errors;
}
