"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  COMMISSION_TYPES,
  EMPTY_OFFER,
  createOffer,
  createSlug,
  updateOffer,
} from "../service/offers.service";

const ROUTE = "/infodrif/offers";

const inputClass =
  "h-10 w-full rounded-md border border-border bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const textareaClass =
  "w-full resize-none rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted focus:border-primary focus:shadow-[var(--focus-ring)]";
const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-sm)] transition hover:opacity-90 disabled:opacity-60";
const dashedButtonClass =
  "inline-flex items-center gap-2 rounded-md border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted transition hover:bg-surface-soft hover:text-foreground";

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

function Panel({ title, action, children }) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-[var(--shadow-sm)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{title}</h2>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export default function OfferForm({ mode = "create", offer = null }) {
  const router = useRouter();
  const isEdit = mode === "edit" && Boolean(offer?.id);

  const [form, setForm] = useState(() => ({
    ...EMPTY_OFFER,
    ...offer,
    highlights:
      Array.isArray(offer?.highlights) && offer.highlights.length ? offer.highlights : [""],
    faq: Array.isArray(offer?.faq) ? offer.faq : [],
    active: offer?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [slugEdited, setSlugEdited] = useState(Boolean(offer?.slug));

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugEdited) next.slug = createSlug(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function updateHighlight(index, value) {
    setForm((prev) => ({
      ...prev,
      highlights: prev.highlights.map((entry, i) => (i === index ? value : entry)),
    }));
    setErrors((prev) => ({ ...prev, highlights: "" }));
  }

  function addHighlight() {
    setForm((prev) => ({ ...prev, highlights: [...prev.highlights, ""] }));
  }

  function removeHighlight(index) {
    setForm((prev) => ({
      ...prev,
      highlights:
        prev.highlights.length > 1 ? prev.highlights.filter((_, i) => i !== index) : prev.highlights,
    }));
  }

  function updateFaq(index, key, value) {
    setForm((prev) => ({
      ...prev,
      faq: prev.faq.map((entry, i) => (i === index ? { ...entry, [key]: value } : entry)),
    }));
  }

  function addFaq() {
    setForm((prev) => ({ ...prev, faq: [...prev.faq, { q: "", a: "" }] }));
  }

  function removeFaq(index) {
    setForm((prev) => ({ ...prev, faq: prev.faq.filter((_, i) => i !== index) }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    if (!form.category.trim()) nextErrors.category = "Category is required.";
    if (!form.payout.trim()) nextErrors.payout = "Payout is required.";
    if (!form.commissionType.trim()) nextErrors.commissionType = "Commission type is required.";
    if (!form.cookie.trim()) nextErrors.cookie = "Cookie window is required.";
    if (!form.description.trim()) nextErrors.description = "Description is required.";
    if (!form.highlights.some((entry) => entry.trim())) {
      nextErrors.highlights = "At least one highlight is required.";
    }
    if (Number.isNaN(Number(form.order)) || Number(form.order) < 0) {
      nextErrors.order = "Order must be zero or higher.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateOffer(offer.id, form);
        emitAlert({ type: "success", message: "Offer updated." });
        logAuditEvent({
          module: "offers",
          action: "OFFER_UPDATE",
          entityType: "offerItem",
          entityId: offer.id,
          summary: `Updated offer ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        const id = await createOffer(form);
        emitAlert({ type: "success", message: "Offer created." });
        logAuditEvent({
          module: "offers",
          action: "OFFER_CREATE",
          entityType: "offerItem",
          entityId: id,
          summary: `Created offer ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      }
      router.push(ROUTE);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save offer." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push(ROUTE)}
            className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-muted transition hover:bg-surface-soft hover:text-foreground"
            aria-label="Back to offers"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {isEdit ? "Edit Offer" : "Add Offer"}
            </h1>
            <p className="text-sm text-muted">
              {isEdit ? "Update this affiliate offer." : "Publish a new Infodrif affiliate offer."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-5">
            <Panel title="Offer details">
              <Field label="Name" required error={errors.name}>
                <input
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  className={inputClass}
                  placeholder="CRM Trial (SaaS)"
                />
              </Field>

              <Field
                label="Slug"
                required
                error={errors.slug}
                hint="Derived from the name until you edit it."
              >
                <input
                  value={form.slug}
                  onChange={(event) => {
                    setSlugEdited(true);
                    setField("slug", createSlug(event.target.value));
                  }}
                  className={inputClass}
                  placeholder="saas-crm-trial"
                />
              </Field>

              <Field label="Description" required error={errors.description}>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  className={textareaClass}
                  placeholder="Promote a modern CRM trial with in-app onboarding..."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category" required error={errors.category}>
                  <input
                    value={form.category}
                    onChange={(event) => setField("category", event.target.value)}
                    className={inputClass}
                    placeholder="B2B SaaS"
                  />
                </Field>
                <Field label="Payout" required error={errors.payout}>
                  <input
                    value={form.payout}
                    onChange={(event) => setField("payout", event.target.value)}
                    className={inputClass}
                    placeholder="$15 / trial"
                  />
                </Field>
                <Field label="Commission type" required error={errors.commissionType}>
                  <input
                    value={form.commissionType}
                    onChange={(event) => setField("commissionType", event.target.value)}
                    className={inputClass}
                    placeholder="CPS"
                    list="infodrif-commission-types"
                  />
                  <datalist id="infodrif-commission-types">
                    {COMMISSION_TYPES.map((type) => (
                      <option key={type} value={type} />
                    ))}
                  </datalist>
                </Field>
                <Field label="Cookie" required error={errors.cookie}>
                  <input
                    value={form.cookie}
                    onChange={(event) => setField("cookie", event.target.value)}
                    className={inputClass}
                    placeholder="30 days"
                  />
                </Field>
              </div>
            </Panel>

            <Panel title="Highlights">
              {errors.highlights ? (
                <span className="block text-xs font-medium text-danger">{errors.highlights}</span>
              ) : null}
              <div className="space-y-2">
                {form.highlights.map((highlight, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={highlight}
                      onChange={(event) => updateHighlight(index, event.target.value)}
                      className={inputClass}
                      placeholder={`Highlight ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeHighlight(index)}
                      disabled={form.highlights.length === 1}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-border text-danger transition hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`Remove highlight ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addHighlight} className={dashedButtonClass}>
                <Plus className="h-3.5 w-3.5" />
                Add highlight
              </button>
            </Panel>

            <Panel
              title="FAQ"
              action={
                <button type="button" onClick={addFaq} className={dashedButtonClass}>
                  <Plus className="h-3.5 w-3.5" />
                  Add question
                </button>
              }
            >
              {form.faq.length ? (
                <div className="space-y-3">
                  {form.faq.map((entry, index) => (
                    <div key={index} className="rounded-md border border-border bg-surface-soft p-3">
                      <Field label="Question">
                        <input
                          value={entry.q || ""}
                          onChange={(event) => updateFaq(index, "q", event.target.value)}
                          className={inputClass}
                          placeholder="What traffic sources work best?"
                        />
                      </Field>
                      <div className="mt-3">
                        <Field label="Answer">
                          <textarea
                            rows={3}
                            value={entry.a || ""}
                            onChange={(event) => updateFaq(index, "a", event.target.value)}
                            className={textareaClass}
                            placeholder="High-intent content, comparison pages, and email traffic..."
                          />
                        </Field>
                      </div>
                      <div className="mt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeFaq(index)}
                          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold text-danger transition hover:bg-danger-soft"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-md border border-dashed border-border py-6 text-center text-xs text-muted">
                  No FAQ entries yet.
                </p>
              )}
            </Panel>
          </section>

          <aside className="space-y-5">
            <Panel title="Publishing">
              <Field label="Order" error={errors.order}>
                <input
                  type="number"
                  min="0"
                  value={form.order}
                  onChange={(event) => setField("order", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Status">
                <button
                  type="button"
                  onClick={() => setField("active", !form.active)}
                  className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm font-semibold transition ${
                    form.active
                      ? "border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-success-soft text-success"
                      : "border-border bg-surface-soft text-muted"
                  }`}
                >
                  <span>{form.active ? "Active" : "Inactive"}</span>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      form.active ? "bg-success" : "bg-[var(--muted)]"
                    }`}
                  />
                </button>
              </Field>
            </Panel>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`${primaryButtonClass} w-full`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isEdit ? "Update Offer" : "Publish Offer"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
