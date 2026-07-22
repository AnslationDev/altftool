"use client";

import { useEffect, useState } from "react";
import { Loader2, PanelBottom, RefreshCw, Save } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_FOOTER_SETTINGS,
  saveFooterSettings,
  subscribeFooterSettings,
} from "./service/footer.service";

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}

function FooterPreview({ settings }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#05050d] shadow-sm">
      <div className="flex flex-col gap-3 bg-[linear-gradient(115deg,#111222,#05050d_45%,#0b0c1c)] p-8 text-white">
        <span className="text-lg font-bold tracking-normal">ANSLIC</span>
        <p className="max-w-md text-sm font-medium leading-6 text-white/80">
          {settings.tagline || DEFAULT_FOOTER_SETTINGS.tagline}
        </p>
        <p className="mt-6 text-xs font-medium text-white/50">
          {(settings.copyrightText || DEFAULT_FOOTER_SETTINGS.copyrightText).replace(
            "{siteName}",
            "ANSLIC",
          )}
        </p>
      </div>
    </div>
  );
}

export default function CampaignastraFooterPage() {
  const [settings, setSettings] = useState(DEFAULT_FOOTER_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_FOOTER_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeFooterSettings(
      (data) => {
        setSettings(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load footer settings" });
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  const updateField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = async () => {
    const nextErrors = validateFooter(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveFooterSettings(draft);
      emitAlert({ type: "success", message: "Footer settings saved." });
      logAuditEvent({
        module: "footer",
        action: "FOOTER_SETTINGS_UPDATE",
        entityType: "footerSettings",
        entityId: "settings",
        summary: "Updated Campaignastra footer settings",
        route: "/campaignastra/footer",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save footer settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <PanelBottom className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaignastra Footer</h1>
              <p className="text-sm text-gray-500">
                Manage the footer tagline and copyright text.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Footer
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Footer content
                </p>
                <h2 className="mt-1 text-base font-bold text-gray-900">Tagline &amp; copyright</h2>
              </div>
              <button
                type="button"
                onClick={() => setDraft(settings)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                <div className="h-20 animate-pulse rounded-xl bg-gray-100" />
                <div className="h-11 animate-pulse rounded-xl bg-gray-100" />
              </div>
            ) : (
              <div className="space-y-4">
                <Field label="Tagline" error={errors.tagline}>
                  <textarea
                    value={draft.tagline}
                    onChange={(event) => updateField("tagline", event.target.value)}
                    rows={4}
                    className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    placeholder="Premium digital marketing, design, and growth systems for ambitious brands."
                  />
                </Field>

                <Field label="Copyright text" error={errors.copyrightText}>
                  <input
                    value={draft.copyrightText}
                    onChange={(event) => updateField("copyrightText", event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                    placeholder="Copyright 2026 {siteName}. All rights reserved."
                  />
                  <span className="mt-1.5 block text-xs text-gray-400">
                    Use the literal token <code className="rounded bg-gray-100 px-1 py-0.5">{"{siteName}"}</code> — the frontend replaces it with the live site name.
                  </span>
                </Field>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Footer Settings
                </button>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <PanelBottom className="h-4 w-4 text-gray-400" />
              <h2 className="text-base font-bold text-gray-900">Live preview</h2>
            </div>
            <FooterPreview settings={draft} />
          </section>
        </div>
      </div>
    </div>
  );
}

function validateFooter(values) {
  const errors = {};
  if (!values.tagline?.trim()) {
    errors.tagline = "Tagline is required.";
  }
  if (!values.copyrightText?.trim()) {
    errors.copyrightText = "Copyright text is required.";
  }
  return errors;
}
