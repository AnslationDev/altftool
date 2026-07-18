"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Pencil, Plus, Save, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ActionHeader,
  ActiveToggle,
  Field,
  IconButton,
  ImagePairField,
  ItemsToolbar,
  ModalShell,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  TableEmptyState,
  TableSkeletonRows,
  filterItems,
  formatDate,
  inputClass,
  isSafeUrl,
  isValidOrder,
  nextOrderFor,
  textareaClass,
} from "../components/AboutAdminShared";
import {
  DEFAULT_ABOUT_INTRO,
  createAboutIntroHighlight,
  deleteAboutIntroHighlight,
  deleteAboutIntroImage,
  resetAboutIntro,
  saveAboutIntro,
  subscribeAboutIntro,
  subscribeAboutIntroHighlights,
  toggleAboutIntroHighlightStatus,
  updateAboutIntroHighlight,
  uploadAboutIntroImage,
} from "../service/about.service";

const ROUTE = "/infodrif/about/intro";

const EMPTY_HIGHLIGHT = { text: "", order: 0, active: true };

export default function InfodrifAboutIntroPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_INTRO);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_INTRO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return subscribeAboutIntro(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about intro settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /**
   * `testimonial` is a NESTED object on the settings document, so it is edited
   * as a group and written back whole. The site merges nested plain objects
   * recursively, so a cleared field falls back key-by-key.
   */
  const setTestimonialField = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      testimonial: { ...(prev.testimonial || {}), [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [`testimonial.${key}`]: "" }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAboutIntroImage({ file, onProgress: setUploadProgress });
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Intro image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Intro image upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const previousPath = draft.imagePath;
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    if (!previousPath) return;
    try {
      await deleteAboutIntroImage(previousPath);
      emitAlert({ type: "success", message: "Intro image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Intro image cleared from the form, but Storage cleanup failed.",
      });
    }
  };

  const handleSave = async () => {
    const nextErrors = validateSettings(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutIntro(draft);
      emitAlert({ type: "success", message: "About intro settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_INTRO_SETTINGS_UPDATE",
        entityType: "aboutIntroSettings",
        entityId: "intro",
        summary: "Updated Infodrif about intro settings",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await resetAboutIntro();
      emitAlert({ type: "success", message: "About intro settings reset to defaults." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_INTRO_SETTINGS_RESET",
        entityType: "aboutIntroSettings",
        entityId: "intro",
        summary: "Reset Infodrif about intro settings to defaults",
        route: ROUTE,
      });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  };

  const testimonial = draft.testimonial || {};

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] px-6 pb-6">
      <ActionHeader
        title="About — Intro"
        description="The “who we are” copy, image, experience badge, testimonial, and highlight bullets."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        disabled={uploading}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="About intro settings" title="Copy">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Eyebrow" error={errors.eyebrow}>
                <input
                  value={draft.eyebrow || ""}
                  onChange={(event) => setField("eyebrow", event.target.value)}
                  className={inputClass}
                  placeholder="Who We Are"
                />
              </Field>

              <p className="text-xs leading-5 text-[var(--muted)]">
                The heading is split into two fields because the site renders the accent half as its
                own styled span.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Heading" error={errors.heading}>
                  <input
                    value={draft.heading || ""}
                    onChange={(event) => setField("heading", event.target.value)}
                    className={inputClass}
                    placeholder="Building intelligent"
                  />
                </Field>
                <Field label="Heading accent" error={errors.headingAccent}>
                  <input
                    value={draft.headingAccent || ""}
                    onChange={(event) => setField("headingAccent", event.target.value)}
                    className={inputClass}
                    placeholder="futures with AI"
                  />
                </Field>
              </div>

              <Field label="Body" error={errors.body}>
                <textarea
                  value={draft.body || ""}
                  onChange={(event) => setField("body", event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Experience value" error={errors.experienceValue}>
                  <input
                    value={draft.experienceValue || ""}
                    onChange={(event) => setField("experienceValue", event.target.value)}
                    className={inputClass}
                    placeholder="10+"
                  />
                </Field>
                <Field label="Experience label" error={errors.experienceLabel}>
                  <input
                    value={draft.experienceLabel || ""}
                    onChange={(event) => setField("experienceLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Years Experience"
                  />
                </Field>
              </div>
            </div>
          )}
        </Panel>

        {loading ? null : (
          <>
            <Panel eyebrow="About intro settings" title="Intro image">
              <ImagePairField
                label="Intro image"
                error={errors.imageUrl}
                imageUrl={draft.imageUrl}
                imagePath={draft.imagePath}
                onChange={({ imageUrl, imagePath }) =>
                  setDraft((prev) => ({ ...prev, imageUrl, imagePath }))
                }
                onUpload={handleUpload}
                onRemove={handleRemoveImage}
                uploading={uploading}
                uploadProgress={uploadProgress}
                previewClass="h-24 w-32"
              />

              <div className="mt-4">
                <Field label="Image alt" error={errors.imageAlt}>
                  <input
                    value={draft.imageAlt || ""}
                    onChange={(event) => setField("imageAlt", event.target.value)}
                    className={inputClass}
                    placeholder="Team collaboration"
                  />
                </Field>
              </div>
            </Panel>

            <Panel
              eyebrow="About intro settings"
              title="Testimonial"
              actions={
                <span className="text-xs font-medium text-[var(--muted)]">
                  Nested group on the settings document
                </span>
              }
            >
              <div className="space-y-4">
                <Field
                  label="Quote"
                  hint="The default content includes its own quotation marks — the site does not add them."
                  error={errors["testimonial.quote"]}
                >
                  <textarea
                    value={testimonial.quote || ""}
                    onChange={(event) => setTestimonialField("quote", event.target.value)}
                    rows={2}
                    className={textareaClass}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" error={errors["testimonial.name"]}>
                    <input
                      value={testimonial.name || ""}
                      onChange={(event) => setTestimonialField("name", event.target.value)}
                      className={inputClass}
                      placeholder="Sarah Chen"
                    />
                  </Field>
                  <Field label="Role" error={errors["testimonial.role"]}>
                    <input
                      value={testimonial.role || ""}
                      onChange={(event) => setTestimonialField("role", event.target.value)}
                      className={inputClass}
                      placeholder="CTO, Nexus"
                    />
                  </Field>
                </div>
              </div>
            </Panel>
          </>
        )}

        <HighlightsPanel />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset about intro settings"
          message="Reset the about intro settings back to the default content? The highlights are not affected."
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Highlights                                                                 */
/* -------------------------------------------------------------------------- */

function HighlightsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeAboutIntroHighlights(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load highlights." });
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["text"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateAboutIntroHighlight(modalItem.id, form);
        emitAlert({ type: "success", message: "Highlight updated." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_INTRO_HIGHLIGHT_UPDATE",
          entityType: "aboutIntroHighlight",
          entityId: modalItem.id,
          summary: `Updated about intro highlight "${form.text}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createAboutIntroHighlight(form);
        emitAlert({ type: "success", message: "Highlight added." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_INTRO_HIGHLIGHT_CREATE",
          entityType: "aboutIntroHighlight",
          summary: `Created about intro highlight "${form.text}"`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save highlight." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutIntroHighlight(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.text}" deleted.` });
      logAuditEvent({
        module: "about",
        action: "ABOUT_INTRO_HIGHLIGHT_DELETE",
        entityType: "aboutIntroHighlight",
        entityId: deleteTarget.id,
        summary: `Deleted about intro highlight "${deleteTarget.text}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete highlight." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAboutIntroHighlightStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.text}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update highlight status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search highlights"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="highlights"
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_HIGHLIGHT, order: nextOrder })}
          >
            Add Highlight
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            Highlights
            <span className="ml-2 text-xs font-medium text-[var(--muted)]">
              The ticked bullet list beside the intro copy.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Text</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <TableSkeletonRows colSpan={4} rows={3} />
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{item.text}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      aria-label={`Toggle ${item.text} status`}
                      className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
                    >
                      <StatusBadge active={item.active} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <IconButton
                        icon={Pencil}
                        tone="primary"
                        onClick={() => setModalItem(item)}
                        aria-label={`Edit ${item.text}`}
                      />
                      <IconButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.text}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyState
                icon={CheckCircle2}
                title="No highlights found"
                description="Add the first intro highlight."
                colSpan={4}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <HighlightModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete highlight"
          message={`Delete "${deleteTarget.text}" from the intro highlights?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function HighlightModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_HIGHLIGHT, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.text?.trim()) nextErrors.text = "Text is required.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow="About intro highlight"
      title={isEdit ? "Edit highlight" : "Add highlight"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update highlight" : "Add highlight"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Text" error={errors.text}>
        <input
          value={form.text}
          onChange={(event) => updateField("text", event.target.value)}
          className={inputClass}
          placeholder="AI-driven strategy & implementation"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Order" error={errors.order}>
          <input
            type="number"
            min="0"
            value={form.order}
            onChange={(event) => updateField("order", event.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Status">
          <ActiveToggle active={form.active} onChange={(value) => updateField("active", value)} />
        </Field>
      </div>
    </ModalShell>
  );
}

function validateSettings(values) {
  const errors = {};
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.headingAccent?.trim()) errors.headingAccent = "Heading accent is required.";
  if (!values.body?.trim()) errors.body = "Body is required.";
  if (values.imageUrl?.trim() && !isSafeUrl(values.imageUrl)) {
    errors.imageUrl = "Use a relative path or an http(s) URL.";
  }
  if (!values.imageAlt?.trim()) errors.imageAlt = "Image alt text is required.";
  if (!values.experienceValue?.trim()) errors.experienceValue = "Experience value is required.";
  if (!values.experienceLabel?.trim()) errors.experienceLabel = "Experience label is required.";

  const testimonial = values.testimonial || {};
  if (!testimonial.quote?.trim()) errors["testimonial.quote"] = "Quote is required.";
  if (!testimonial.name?.trim()) errors["testimonial.name"] = "Name is required.";
  if (!testimonial.role?.trim()) errors["testimonial.role"] = "Role is required.";
  return errors;
}
