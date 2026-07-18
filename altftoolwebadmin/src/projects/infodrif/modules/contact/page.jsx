"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Inbox,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  CONTACT_FIELD_TYPES,
  DEFAULT_CONTACT_SETTINGS,
  EMPTY_CONTACT_FIELD,
  LEAD_FIELD_NAMES,
  saveContactSettings,
  subscribeContactSettings,
} from "./service/contact.service";

const ROUTE = "/infodrif/contact";

const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const textareaClass =
  "w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";
const outlineButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";
const dashedButtonClass =
  "inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";
const iconButtonClass =
  "grid h-8 w-8 place-items-center rounded-md border border-border text-muted transition hover:bg-surface-soft hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";
const cardClass = "rounded-lg border border-border bg-surface shadow-[var(--shadow-sm)]";

function Field({ label, required, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">
        {label}
        {required ? <span className="text-danger"> *</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-danger">{error}</span> : null}
    </label>
  );
}

export default function InfodrifContactPage() {
  const [settings, setSettings] = useState(DEFAULT_CONTACT_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_CONTACT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    return subscribeContactSettings(
      (data) => {
        const normalized = { ...data, fields: Array.isArray(data.fields) ? data.fields : [] };
        setSettings(normalized);
        setDraft(normalized);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load contact settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateFormField(index, key, value) {
    setDraft((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) => (i === index ? { ...field, [key]: value } : field)),
    }));
    setErrors((prev) => ({ ...prev, fields: "" }));
  }

  function addFormField() {
    setDraft((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...EMPTY_CONTACT_FIELD, order: prev.fields.length }],
    }));
  }

  function removeFormField(index) {
    setDraft((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  }

  function moveFormField(index, delta) {
    const target = index + delta;
    setDraft((prev) => {
      if (target < 0 || target >= prev.fields.length) return prev;
      const fields = [...prev.fields];
      [fields[index], fields[target]] = [fields[target], fields[index]];
      // Keep `order` matching the visible sequence.
      return { ...prev, fields: fields.map((field, i) => ({ ...field, order: i })) };
    });
  }

  async function handleSave() {
    const nextErrors = {};
    if (!draft.heading?.trim()) nextErrors.heading = "Heading is required.";
    if (!draft.email?.trim()) nextErrors.email = "Email is required.";
    if (!draft.submitLabel?.trim()) nextErrors.submitLabel = "Submit label is required.";
    if (!draft.fields.length) nextErrors.fields = "Add at least one form field.";
    if (draft.fields.some((field) => !field.name?.trim() || !field.label?.trim())) {
      nextErrors.fields = "Every field needs a name and a label.";
    }
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
        summary: "Updated Infodrif contact page copy and form fields",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save contact settings." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-[var(--shadow-sm)]">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Infodrif Contact</h1>
              <p className="text-sm text-muted">
                Manage the contact page copy and the public form fields.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                dirty ? "bg-warning-soft text-warning" : "bg-success-soft text-success"
              }`}
            >
              {dirty ? "Unsaved changes" : "Saved"}
            </span>
            <button type="button" onClick={() => setDraft(settings)} className={outlineButtonClass}>
              <RefreshCw className="h-4 w-4" />
              Reset
            </button>
            <Link href={`${ROUTE}/leads`} className={outlineButtonClass}>
              <Inbox className="h-4 w-4" />
              View Leads
            </Link>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || loading}
              className={primaryButtonClass}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Contact Settings
            </button>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <section className={`${cardClass} p-5`}>
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Page copy
              </p>
              <h2 className="mt-1 text-base font-bold text-foreground">Contact page content</h2>
            </div>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="h-10 animate-pulse rounded-md bg-surface-soft" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Eyebrow">
                    <input
                      value={draft.eyebrow || ""}
                      onChange={(event) => setField("eyebrow", event.target.value)}
                      className={inputClass}
                      placeholder="Contact"
                    />
                  </Field>
                  <Field label="Heading" required error={errors.heading}>
                    <input
                      value={draft.heading || ""}
                      onChange={(event) => setField("heading", event.target.value)}
                      className={inputClass}
                      placeholder="Talk partnerships."
                    />
                  </Field>
                </div>

                <Field label="Note">
                  <textarea
                    rows={2}
                    value={draft.note || ""}
                    onChange={(event) => setField("note", event.target.value)}
                    className={textareaClass}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email label">
                    <input
                      value={draft.emailLabel || ""}
                      onChange={(event) => setField("emailLabel", event.target.value)}
                      className={inputClass}
                      placeholder="Email:"
                    />
                  </Field>
                  <Field label="Email" required error={errors.email}>
                    <input
                      value={draft.email || ""}
                      onChange={(event) => setField("email", event.target.value)}
                      className={inputClass}
                      placeholder="partners@dailyhnt.demo"
                    />
                  </Field>
                  <Field label="Response time label">
                    <input
                      value={draft.responseTimeLabel || ""}
                      onChange={(event) => setField("responseTimeLabel", event.target.value)}
                      className={inputClass}
                      placeholder="Response time:"
                    />
                  </Field>
                  <Field label="Response time">
                    <input
                      value={draft.responseTime || ""}
                      onChange={(event) => setField("responseTime", event.target.value)}
                      className={inputClass}
                      placeholder="within 24–48 hours"
                    />
                  </Field>
                </div>

                <Field label="Submit label" required error={errors.submitLabel}>
                  <input
                    value={draft.submitLabel || ""}
                    onChange={(event) => setField("submitLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Send message"
                  />
                </Field>

                <Field label="Fine print">
                  <textarea
                    rows={2}
                    value={draft.finePrint || ""}
                    onChange={(event) => setField("finePrint", event.target.value)}
                    className={textareaClass}
                  />
                </Field>
              </div>
            )}
          </section>

          <section className={`${cardClass} p-5`}>
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  Form fields
                </p>
                <h2 className="mt-1 text-base font-bold text-foreground">Public contact form</h2>
                <p className="mt-1 max-w-md text-xs text-muted">
                  Stored inline on the settings document, not as a subcollection. The form only
                  submits {LEAD_FIELD_NAMES.join(", ")} — a field named anything else renders but is
                  never saved to the lead.
                </p>
              </div>
              <button type="button" onClick={addFormField} className={dashedButtonClass}>
                <Plus className="h-3.5 w-3.5" />
                Add field
              </button>
            </div>

            {errors.fields ? (
              <p className="mb-3 text-xs font-medium text-danger">{errors.fields}</p>
            ) : null}

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-md bg-surface-soft" />
                ))}
              </div>
            ) : draft.fields.length ? (
              <div className="space-y-3">
                {draft.fields.map((field, index) => (
                  <div key={index} className="rounded-md border border-border bg-surface-soft p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-md bg-primary-soft px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                        {index + 1}
                      </span>
                      {LEAD_FIELD_NAMES.includes(field.name) ? null : (
                        <span className="rounded-md bg-warning-soft px-2 py-1 text-[10px] font-semibold text-warning">
                          Not stored on leads
                        </span>
                      )}
                      <div className="ml-auto flex gap-1">
                        <button
                          type="button"
                          onClick={() => moveFormField(index, -1)}
                          disabled={index === 0}
                          className={iconButtonClass}
                          aria-label={`Move field ${index + 1} up`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFormField(index, 1)}
                          disabled={index === draft.fields.length - 1}
                          className={iconButtonClass}
                          aria-label={`Move field ${index + 1} down`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFormField(index)}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-soft"
                          aria-label={`Remove field ${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Name" required hint="The key sent with the submission.">
                        <input
                          value={field.name || ""}
                          onChange={(event) => updateFormField(index, "name", event.target.value)}
                          className={inputClass}
                          placeholder="name"
                          list="infodrif-lead-field-names"
                        />
                        <datalist id="infodrif-lead-field-names">
                          {LEAD_FIELD_NAMES.map((name) => (
                            <option key={name} value={name} />
                          ))}
                        </datalist>
                      </Field>
                      <Field label="Label" required>
                        <input
                          value={field.label || ""}
                          onChange={(event) => updateFormField(index, "label", event.target.value)}
                          className={inputClass}
                          placeholder="Name"
                        />
                      </Field>
                      <Field label="Placeholder">
                        <input
                          value={field.placeholder || ""}
                          onChange={(event) =>
                            updateFormField(index, "placeholder", event.target.value)
                          }
                          className={inputClass}
                          placeholder="Your name"
                        />
                      </Field>
                      <Field label="Type">
                        <select
                          value={field.type || "text"}
                          onChange={(event) => updateFormField(index, "type", event.target.value)}
                          className={inputClass}
                        >
                          {CONTACT_FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Order">
                        <input
                          type="number"
                          min="0"
                          value={field.order ?? index}
                          onChange={(event) => updateFormField(index, "order", event.target.value)}
                          className={inputClass}
                        />
                      </Field>
                      <div className="grid grid-cols-2 gap-2">
                        <Field label="Required">
                          <button
                            type="button"
                            onClick={() => updateFormField(index, "required", !field.required)}
                            className={`h-10 w-full rounded-md border px-3 text-sm font-semibold transition ${
                              field.required
                                ? "border-[color-mix(in_srgb,var(--info)_35%,transparent)] bg-info-soft text-info"
                                : "border-border bg-surface text-muted"
                            }`}
                          >
                            {field.required ? "Required" : "Optional"}
                          </button>
                        </Field>
                        <Field label="Status">
                          <button
                            type="button"
                            onClick={() => updateFormField(index, "active", !field.active)}
                            className={`h-10 w-full rounded-md border px-3 text-sm font-semibold transition ${
                              field.active
                                ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-success-soft text-success"
                                : "border-border bg-surface text-muted"
                            }`}
                          >
                            {field.active ? "Active" : "Inactive"}
                          </button>
                        </Field>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border py-8 text-center text-xs text-muted">
                No form fields configured. Add one above.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
