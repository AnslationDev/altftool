"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, Loader2, Mail, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_CONTACT_SETTINGS,
  saveContactSettings,
  subscribeContactSettings,
} from "./service/contact.service";

const EMPTY_SOCIAL_LINK = { label: "", href: "" };

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

const inputClass =
  "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass =
  "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

export default function AnslicContactPage() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = subscribeContactSettings(
      (data) => {
        setSettings(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact settings" });
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSocialChange = (index, key, value) => {
    setDraft((prev) => {
      const next = [...(prev.socialLinks || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, socialLinks: next };
    });
  };

  const addSocialLink = () => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: [...(prev.socialLinks || []), { ...EMPTY_SOCIAL_LINK }],
    }));
  };

  const removeSocialLink = (index) => {
    setDraft((prev) => ({
      ...prev,
      socialLinks: (prev.socialLinks || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSave = async () => {
    const nextErrors = validateSettings(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveContactSettings(draft);
      emitAlert({ type: "success", message: "Contact settings saved." });
      logAuditEvent({
        module: "contact",
        action: "CONTACT_SETTINGS_UPDATE",
        entityType: "contactSettings",
        entityId: "settings",
        summary: "Updated Anslic contact settings",
        route: "/anslic/contact",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save contact settings." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Anslic Contact</h1>
              <p className="text-sm text-gray-500">
                Manage contact info, page copy, and social links.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/anslic/contact/leads"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              <Inbox className="h-4 w-4" />
              View Leads
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Contact Settings
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Page copy
                </p>
                <h2 className="mt-1 text-base font-bold text-gray-900">
                  Contact page content
                </h2>
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

            <div className="space-y-4">
              <Field label="Eyebrow" error={errors.pageEyebrow}>
                <input
                  value={draft.pageEyebrow || ""}
                  onChange={(event) => setField("pageEyebrow", event.target.value)}
                  className={inputClass}
                  placeholder="Get in touch"
                />
              </Field>
              <Field label="Title" error={errors.pageTitle}>
                <input
                  value={draft.pageTitle || ""}
                  onChange={(event) => setField("pageTitle", event.target.value)}
                  className={inputClass}
                  placeholder="Let's build your next growth system"
                />
              </Field>
              <Field label="Subtitle" error={errors.pageSubtitle}>
                <textarea
                  value={draft.pageSubtitle || ""}
                  onChange={(event) => setField("pageSubtitle", event.target.value)}
                  rows={2}
                  className={textareaClass}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Name field label" error={errors.formNameLabel}>
                  <input
                    value={draft.formNameLabel || ""}
                    onChange={(event) => setField("formNameLabel", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Email field label" error={errors.formEmailLabel}>
                  <input
                    value={draft.formEmailLabel || ""}
                    onChange={(event) => setField("formEmailLabel", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Phone field label" error={errors.formPhoneLabel}>
                  <input
                    value={draft.formPhoneLabel || ""}
                    onChange={(event) => setField("formPhoneLabel", event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Service field label" error={errors.formServiceLabel}>
                  <input
                    value={draft.formServiceLabel || ""}
                    onChange={(event) => setField("formServiceLabel", event.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Message field label" error={errors.formMessageLabel}>
                <input
                  value={draft.formMessageLabel || ""}
                  onChange={(event) => setField("formMessageLabel", event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Submit button text" error={errors.submitButtonText}>
                <input
                  value={draft.submitButtonText || ""}
                  onChange={(event) => setField("submitButtonText", event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="Success message" error={errors.successMessage}>
                <textarea
                  value={draft.successMessage || ""}
                  onChange={(event) => setField("successMessage", event.target.value)}
                  rows={2}
                  className={textareaClass}
                />
              </Field>

              <Field label="SEO title" error={errors.seoTitle}>
                <input
                  value={draft.seoTitle || ""}
                  onChange={(event) => setField("seoTitle", event.target.value)}
                  className={inputClass}
                />
              </Field>

              <Field label="SEO description" error={errors.seoDescription}>
                <textarea
                  value={draft.seoDescription || ""}
                  onChange={(event) => setField("seoDescription", event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </Field>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Contact info
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-900">
                Reach details &amp; socials
              </h2>
            </div>

            <div className="space-y-4">
              <Field label="Email" error={errors.email}>
                <input
                  value={draft.email || ""}
                  onChange={(event) => setField("email", event.target.value)}
                  className={inputClass}
                  placeholder="hello@anslic.com"
                />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input
                  value={draft.phone || ""}
                  onChange={(event) => setField("phone", event.target.value)}
                  className={inputClass}
                  placeholder="+1 (555) 014-2098"
                />
              </Field>
              <Field label="Address" error={errors.address}>
                <textarea
                  value={draft.address || ""}
                  onChange={(event) => setField("address", event.target.value)}
                  rows={2}
                  className={textareaClass}
                />
              </Field>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Social links
                  </p>
                  <button
                    type="button"
                    onClick={addSocialLink}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {(draft.socialLinks || []).map((social, index) => (
                    <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1.6fr_40px]">
                      <input
                        value={social.label || ""}
                        onChange={(event) => handleSocialChange(index, "label", event.target.value)}
                        className={inputClass}
                        placeholder="Label"
                      />
                      <input
                        value={social.href || ""}
                        onChange={(event) => handleSocialChange(index, "href", event.target.value)}
                        className={inputClass}
                        placeholder="https://"
                      />
                      <button
                        type="button"
                        onClick={() => removeSocialLink(index)}
                        className="rounded-xl border border-red-200 text-red-500 hover:bg-red-50"
                        aria-label="Remove social link"
                      >
                        <Trash2 className="mx-auto h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  {!(draft.socialLinks || []).length ? (
                    <p className="py-3 text-center text-xs text-gray-400">
                      No social links yet. Add one above.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function validateSettings(values) {
  const errors = {};
  if (!values.email?.trim()) {
    errors.email = "Email is required.";
  }
  if (!values.pageTitle?.trim()) {
    errors.pageTitle = "Title is required.";
  }
  if (!values.submitButtonText?.trim()) {
    errors.submitButtonText = "Submit button text is required.";
  }
  if (!values.successMessage?.trim()) {
    errors.successMessage = "Success message is required.";
  }
  return errors;
}
