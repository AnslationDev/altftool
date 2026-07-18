"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Image as ImageIcon, Pencil, Plus, Save, Trash2 } from "lucide-react";
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
  OptionSelect,
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
  DEFAULT_ABOUT_STORY,
  STORY_IMAGE_SIDES,
  createAboutStoryTimelineEntry,
  deleteAboutStoryImage,
  deleteAboutStoryTimelineEntry,
  resetAboutStory,
  saveAboutStory,
  subscribeAboutStory,
  subscribeAboutStoryTimeline,
  toggleAboutStoryTimelineEntryStatus,
  updateAboutStoryTimelineEntry,
  uploadAboutStoryImage,
} from "../service/about.service";

const ROUTE = "/infodrif/about/story";

const EMPTY_ENTRY = {
  year: "",
  imageUrl: "",
  imagePath: "",
  description: "",
  imageSide: "left",
  order: 0,
  active: true,
};

export default function InfodrifAboutStoryPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_STORY);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_STORY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    return subscribeAboutStory(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about story settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = async () => {
    const nextErrors = validateSettings(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutStory(draft);
      emitAlert({ type: "success", message: "About story settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_STORY_SETTINGS_UPDATE",
        entityType: "aboutStorySettings",
        entityId: "story",
        summary: "Updated Infodrif about story settings",
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
      await resetAboutStory();
      emitAlert({ type: "success", message: "About story settings reset to defaults." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_STORY_SETTINGS_RESET",
        entityType: "aboutStorySettings",
        entityId: "story",
        summary: "Reset Infodrif about story settings to defaults",
        route: ROUTE,
      });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] px-6 pb-6">
      <ActionHeader
        title="About — Story"
        description="Story intro, closing line, CTA, and the year-by-year timeline entries."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="About story settings" title="Intro & CTA">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 5 }).map((_, index) => (
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
                  placeholder="Our story"
                />
              </Field>

              <Field label="Subheading" error={errors.subheading}>
                <textarea
                  value={draft.subheading || ""}
                  onChange={(event) => setField("subheading", event.target.value)}
                  rows={2}
                  className={textareaClass}
                />
              </Field>

              <Field
                label="Closing line"
                hint="Shown after the last timeline entry."
                error={errors.closingLine}
              >
                <input
                  value={draft.closingLine || ""}
                  onChange={(event) => setField("closingLine", event.target.value)}
                  className={inputClass}
                  placeholder="The best chapters are yet to be written."
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CTA label" error={errors.ctaLabel}>
                  <input
                    value={draft.ctaLabel || ""}
                    onChange={(event) => setField("ctaLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Join Our Journey"
                  />
                </Field>
                <Field label="CTA link" error={errors.ctaHref}>
                  <input
                    value={draft.ctaHref || ""}
                    onChange={(event) => setField("ctaHref", event.target.value)}
                    className={inputClass}
                    placeholder="/contact"
                  />
                </Field>
              </div>
            </div>
          )}
        </Panel>

        <TimelinePanel />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset about story settings"
          message="Reset the story intro and CTA back to the default content? The timeline entries are not affected."
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
/* Timeline                                                                   */
/* -------------------------------------------------------------------------- */

function TimelinePanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeAboutStoryTimeline(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load timeline entries." });
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["year", "description"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateAboutStoryTimelineEntry(modalItem.id, form);
        emitAlert({ type: "success", message: "Timeline entry updated." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_STORY_TIMELINE_UPDATE",
          entityType: "aboutStoryTimelineEntry",
          entityId: modalItem.id,
          summary: `Updated about story timeline entry ${form.year}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createAboutStoryTimelineEntry(form);
        emitAlert({ type: "success", message: "Timeline entry added." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_STORY_TIMELINE_CREATE",
          entityType: "aboutStoryTimelineEntry",
          summary: `Created about story timeline entry ${form.year}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save timeline entry." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutStoryTimelineEntry(deleteTarget.id);
      // Storage cleanup is best-effort: the document is already gone, so a
      // failed blob delete is a warning, never a blocked delete.
      if (deleteTarget.imagePath) {
        try {
          await deleteAboutStoryImage(deleteTarget.imagePath);
        } catch {
          emitAlert({
            type: "warning",
            message: "Entry deleted, but its stored image could not be removed.",
          });
        }
      }
      emitAlert({ type: "success", message: `Timeline entry ${deleteTarget.year} deleted.` });
      logAuditEvent({
        module: "about",
        action: "ABOUT_STORY_TIMELINE_DELETE",
        entityType: "aboutStoryTimelineEntry",
        entityId: deleteTarget.id,
        summary: `Deleted about story timeline entry ${deleteTarget.year}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete timeline entry." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAboutStoryTimelineEntryStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.year} set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update timeline entry status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search timeline"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="entries"
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_ENTRY, order: nextOrder })}
          >
            Add Entry
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            Timeline
            <span className="ml-2 text-xs font-medium text-[var(--muted)]">
              Image side alternates the layout of each row.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Year</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Image side</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <TableSkeletonRows colSpan={6} />
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-12 shrink-0 place-items-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-soft)]">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-[var(--muted)] opacity-60" />
                        )}
                      </div>
                      <span className="font-semibold text-[var(--foreground)]">{item.year}</span>
                    </div>
                  </td>
                  <td className="max-w-sm px-4 py-3">
                    <span className="line-clamp-2 text-xs text-[var(--muted)]">
                      {item.description}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 text-xs font-semibold capitalize text-[var(--muted)]">
                      {item.imageSide}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      aria-label={`Toggle ${item.year} status`}
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
                        aria-label={`Edit ${item.year}`}
                      />
                      <IconButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.year}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyState
                icon={BookOpen}
                title="No timeline entries found"
                description="Add the first chapter of the story."
                colSpan={6}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <TimelineModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete timeline entry"
          message={`Delete the ${deleteTarget.year} timeline entry?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function TimelineModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_ENTRY, order: nextOrder });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAboutStoryImage({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Timeline image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const previousPath = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    if (!previousPath) return;
    try {
      await deleteAboutStoryImage(previousPath);
      emitAlert({ type: "success", message: "Timeline image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Image cleared from the form, but Storage cleanup failed.",
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.year?.trim()) nextErrors.year = "Year is required.";
    if (!form.description?.trim()) nextErrors.description = "Description is required.";
    if (!form.imageUrl?.trim()) nextErrors.imageUrl = "An image is required.";
    else if (!isSafeUrl(form.imageUrl)) nextErrors.imageUrl = "Use a relative path or an http(s) URL.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow="About story timeline"
      title={isEdit ? "Edit timeline entry" : "Add timeline entry"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving || uploading}>
            {isEdit ? "Update entry" : "Add entry"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Year" error={errors.year}>
        <input
          value={form.year}
          onChange={(event) => updateField("year", event.target.value)}
          className={inputClass}
          placeholder="2021"
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={5}
          className={textareaClass}
        />
      </Field>

      <ImagePairField
        label="Image"
        error={errors.imageUrl}
        imageUrl={form.imageUrl}
        imagePath={form.imagePath}
        onChange={({ imageUrl, imagePath }) => setForm((prev) => ({ ...prev, imageUrl, imagePath }))}
        onUpload={handleUpload}
        onRemove={handleRemoveImage}
        uploading={uploading}
        uploadProgress={uploadProgress}
        previewClass="h-20 w-28"
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Image side" hint="Which side of the row the image sits on.">
          <OptionSelect
            value={form.imageSide}
            options={STORY_IMAGE_SIDES}
            onChange={(value) => updateField("imageSide", value)}
          />
        </Field>
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
  if (!values.subheading?.trim()) errors.subheading = "Subheading is required.";
  if (!values.closingLine?.trim()) errors.closingLine = "Closing line is required.";
  if (!values.ctaLabel?.trim()) errors.ctaLabel = "CTA label is required.";
  if (!values.ctaHref?.trim()) errors.ctaHref = "CTA link is required.";
  else if (!isSafeUrl(values.ctaHref)) errors.ctaHref = "Use a relative path or an http(s) URL.";
  return errors;
}
