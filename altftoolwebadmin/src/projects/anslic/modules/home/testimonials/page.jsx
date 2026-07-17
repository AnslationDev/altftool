"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_HOME_SECTIONS,
  createTestimonialItem,
  deleteTestimonialImage,
  deleteTestimonialItem,
  resetHomeSection,
  saveHomeSection,
  subscribeHomeSection,
  subscribeTestimonialItems,
  toggleTestimonialItemStatus,
  updateTestimonialItem,
  uploadTestimonialImage,
} from "../service/home.service";
import { ActionHeader, Field, StatusBadge, formatDate, inputClass, textareaClass } from "../components/HomeAdminShared";

const SECTION_KEY = "testimonials";
const ROUTE = "/anslic/home/testimonials";

const EMPTY_ITEM = {
  quote: "",
  name: "",
  role: "",
  imageUrl: "",
  imagePath: "",
  order: 1,
  active: true,
};

export default function AnslicHomeTestimonialsPage() {
  const [saved, setSaved] = useState(DEFAULT_HOME_SECTIONS[SECTION_KEY]);
  const [draft, setDraft] = useState(DEFAULT_HOME_SECTIONS[SECTION_KEY]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  const [items, setItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeHomeSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setSettingsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load testimonials settings." });
        setSettingsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return subscribeTestimonialItems(
      (data) => {
        setItems(data);
        setItemsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load testimonial items." });
        setItemsLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  function setField(key, value) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function saveSettings() {
    const nextErrors = validateSettings(draft);
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSettingsSaving(true);
    try {
      await saveHomeSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: "Testimonials settings saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_TESTIMONIALS_SETTINGS_UPDATE",
        entityType: "homeTestimonialsSettings",
        entityId: "testimonials",
        summary: "Updated Anslic home testimonials settings",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save testimonials settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function resetSection() {
    setSettingsSaving(true);
    try {
      await resetHomeSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Testimonials settings reset." });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSettingsSaving(false);
    }
  }

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [items],
  );

  const filteredItems = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedItems.filter((item) => {
      const matchesSearch =
        !queryText ||
        item.name?.toLowerCase().includes(queryText) ||
        item.role?.toLowerCase().includes(queryText) ||
        item.quote?.toLowerCase().includes(queryText);
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? item.active : !item.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedItems, statusFilter]);

  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;
  const nextOrder = items.length ? Math.max(...items.map((item) => Number(item.order || 0))) + 1 : 1;

  async function handleSaveItem(form) {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateTestimonialItem(modalItem.id, form);
        emitAlert({ type: "success", message: "Testimonial updated." });
        logAuditEvent({
          module: "home",
          action: "HOME_TESTIMONIAL_UPDATE",
          entityType: "homeTestimonial",
          entityId: modalItem.id,
          summary: `Updated testimonial from ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createTestimonialItem(form);
        emitAlert({ type: "success", message: "Testimonial added." });
        logAuditEvent({
          module: "home",
          action: "HOME_TESTIMONIAL_CREATE",
          entityType: "homeTestimonial",
          summary: `Created testimonial from ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save testimonial." });
    } finally {
      setItemSaving(false);
    }
  }

  async function handleDeleteItem() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTestimonialItem(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteTestimonialImage(deleteTarget.imagePath);
        } catch {
          // storage cleanup best-effort
        }
      }
      emitAlert({ type: "success", message: `Testimonial from "${deleteTarget.name}" deleted.` });
      logAuditEvent({
        module: "home",
        action: "HOME_TESTIMONIAL_DELETE",
        entityType: "homeTestimonial",
        entityId: deleteTarget.id,
        summary: `Deleted testimonial from ${deleteTarget.name}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete testimonial." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggleStatus(item) {
    try {
      await toggleTestimonialItemStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.name} set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update testimonial status." });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-6 pb-6">
      <ActionHeader
        title="Home — Testimonials"
        description="Edit the testimonials intro copy and manage the client testimonial cards."
        lastUpdated={formatDate(saved.updatedAt)}
        active={draft.active !== false}
        dirty={dirty}
        saving={settingsSaving}
        onSave={saveSettings}
        onReset={() => setConfirmReset(true)}
        onToggleActive={() => setField("active", draft.active === false)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Testimonials Settings</p>
          {settingsLoading ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Field label="Eyebrow" error={settingsErrors.eyebrow}>
                <input value={draft.eyebrow || ""} onChange={(event) => setField("eyebrow", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Title" error={settingsErrors.title}>
                <input value={draft.title || ""} onChange={(event) => setField("title", event.target.value)} className={inputClass} />
              </Field>
              <Field label="Subtitle" error={settingsErrors.subtitle}>
                <input value={draft.subtitle || ""} onChange={(event) => setField("subtitle", event.target.value)} className={inputClass} />
              </Field>
            </div>
          )}
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Testimonials" value={itemsLoading ? "-" : items.length} />
          <StatCard label="Active" value={itemsLoading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={itemsLoading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search testimonials"
                className="w-48 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-600 outline-none"
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-xs font-medium text-gray-400">
              {filteredItems.length} of {items.length} testimonials
            </span>
            <button
              type="button"
              onClick={() => setModalItem({ ...EMPTY_ITEM, order: nextOrder })}
              className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
            >
              <Plus className="h-4 w-4" />
              Add Testimonial
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Person</th>
                  <th className="px-4 py-3">Quote</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {itemsLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-700">{item.order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-400">{item.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="max-w-sm px-4 py-3 text-gray-500">
                        <span className="line-clamp-2 text-xs">{item.quote}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggleStatus(item)}>
                          <StatusBadge active={item.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalItem(item)}
                            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                            aria-label={`Edit ${item.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label={`Delete ${item.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-14 text-center">
                      <MessageSquareQuote className="mx-auto h-8 w-8 text-gray-200" />
                      <p className="mt-3 text-sm font-semibold text-gray-500">No testimonials found</p>
                      <p className="mt-1 text-xs text-gray-400">Add the first Anslic testimonial.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <TestimonialModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order || nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete testimonial"
          message={`Delete the testimonial from "${deleteTarget.name}"?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset testimonials settings"
          message="Reset the testimonials intro copy back to default content?"
          loading={settingsSaving}
          onConfirm={resetSection}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function TestimonialModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_ITEM, order: nextOrder });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEdit = Boolean(item?.id);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function handleUpload(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadTestimonialImage({ file, onProgress: setUploadProgress });
      updateField("imageUrl", uploaded.url);
      setForm((prev) => ({ ...prev, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Testimonial photo uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Photo upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function handleRemoveImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteTestimonialImage(path);
      emitAlert({ type: "success", message: "Testimonial photo removed." });
    } catch {
      emitAlert({ type: "warning", message: "Photo removed from form, but Storage cleanup failed." });
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateItem(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Testimonial</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {isEdit ? "Edit testimonial" : "Add testimonial"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <Field label="Quote" error={errors.quote}>
            <textarea
              value={form.quote}
              onChange={(event) => updateField("quote", event.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Anslic completely transformed our pipeline."
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className={inputClass}
                placeholder="Jordan Lee"
              />
            </Field>
            <Field label="Role / Company" error={errors.role}>
              <input
                value={form.role}
                onChange={(event) => updateField("role", event.target.value)}
                className={inputClass}
                placeholder="VP Marketing, Northwind"
              />
            </Field>
          </div>

          <Field label="Photo" error={errors.imageUrl}>
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="Testimonial preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">Upload a headshot</p>
                  <p className="mt-0.5 text-xs text-gray-400">PNG, JPG, or WebP, max 5MB.</p>
                  {uploading ? (
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                      <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  ) : null}
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700">
                  <Upload className="h-4 w-4" />
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploading}
                    onChange={(event) => handleUpload(event.target.files?.[0])}
                  />
                </label>
                {form.imageUrl ? (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
            </div>
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
              <button
                type="button"
                onClick={() => updateField("active", !form.active)}
                className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold transition ${
                  form.active
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }`}
              >
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update testimonial" : "Add testimonial"}
          </button>
        </div>
      </form>
    </div>
  );
}

function validateSettings(values) {
  const errors = {};
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.title?.trim()) errors.title = "Title is required.";
  if (!values.subtitle?.trim()) errors.subtitle = "Subtitle is required.";
  return errors;
}

function validateItem(values) {
  const errors = {};
  if (!values.quote?.trim()) errors.quote = "Quote is required.";
  if (!values.name?.trim()) errors.name = "Name is required.";
  if (!values.role?.trim()) errors.role = "Role is required.";
  if (Number.isNaN(Number(values.order)) || Number(values.order) < 0) {
    errors.order = "Order must be zero or higher.";
  }
  return errors;
}
