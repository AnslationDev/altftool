"use client";

import { useEffect, useMemo, useState } from "react";
import { Heart, Loader2, Pencil, Plus, RefreshCw, Save, Search, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_ABOUT_VALUES_SETTINGS,
  createAboutValueItem,
  deleteAboutValueItem,
  saveAboutValuesSettings,
  subscribeAboutValueItems,
  subscribeAboutValuesSettings,
  toggleAboutValueItemStatus,
  updateAboutValueItem,
} from "../service/about.service";
import { AboutSectionHeader, Field, formatDate, inputClass, textareaClass } from "../components/AboutShared";

const EMPTY_ITEM = {
  title: "",
  text: "",
  order: 1,
  active: true,
};

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

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-gray-100 text-gray-500 ring-1 ring-gray-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-gray-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function ValueItemModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_ITEM, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateItem(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Value card</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {isEdit ? "Edit value" : "Add value"}
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
          <Field label="Value title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className={inputClass}
              placeholder="Radical Transparency"
            />
          </Field>

          <Field label="Value text" error={errors.text}>
            <textarea
              value={form.text}
              onChange={(event) => updateField("text", event.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Short description of this value."
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
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update value" : "Add value"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AnslicAboutValuesPage() {
  const [settings, setSettings] = useState(DEFAULT_ABOUT_VALUES_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_ABOUT_VALUES_SETTINGS);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);
  const [settingsErrors, setSettingsErrors] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    let settingsReady = false;
    let itemsReady = false;

    const markReady = () => {
      if (settingsReady && itemsReady) setLoading(false);
    };

    const unsubSettings = subscribeAboutValuesSettings(
      (data) => {
        settingsReady = true;
        setSettings(data);
        setSettingsDraft(data);
        markReady();
      },
      () => {
        settingsReady = true;
        emitAlert({ type: "error", message: "Failed to load Values settings." });
        markReady();
      },
    );

    const unsubItems = subscribeAboutValueItems(
      (data) => {
        itemsReady = true;
        setItems(data);
        markReady();
      },
      () => {
        itemsReady = true;
        emitAlert({ type: "error", message: "Failed to load value cards." });
        markReady();
      },
    );

    return () => {
      unsubSettings();
      unsubItems();
    };
  }, []);

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [items],
  );

  const filteredItems = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedItems.filter((item) => {
      const matchesSearch =
        !queryText ||
        item.title?.toLowerCase().includes(queryText) ||
        item.text?.toLowerCase().includes(queryText);
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? item.active : !item.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedItems, statusFilter]);

  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;
  const nextOrder = items.length ? Math.max(...items.map((item) => Number(item.order || 0))) + 1 : 1;

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSaveSettings = async () => {
    const errors = validateSettings(settingsDraft);
    setSettingsErrors(errors);
    if (Object.keys(errors).length) return;

    setSettingsSaving(true);
    try {
      await saveAboutValuesSettings(settingsDraft);
      emitAlert({ type: "success", message: "Values settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_VALUES_SETTINGS_UPDATE",
        entityType: "aboutValuesSettings",
        entityId: "values",
        summary: "Updated Anslic About values section settings",
        changes: settingsDraft,
        route: "/anslic/about/values",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save Values settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveItem = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateAboutValueItem(modalItem.id, form);
        emitAlert({ type: "success", message: "Value card updated." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_VALUE_UPDATE",
          entityType: "aboutValueItem",
          entityId: modalItem.id,
          summary: `Updated About value card ${form.title}`,
          changes: form,
          route: "/anslic/about/values",
        });
      } else {
        await createAboutValueItem(form);
        emitAlert({ type: "success", message: "Value card added." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_VALUE_CREATE",
          entityType: "aboutValueItem",
          summary: `Created About value card ${form.title}`,
          changes: form,
          route: "/anslic/about/values",
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save value card." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutValueItem(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "about",
        action: "ABOUT_VALUE_DELETE",
        entityType: "aboutValueItem",
        entityId: deleteTarget.id,
        summary: `Deleted About value card ${deleteTarget.title}`,
        route: "/anslic/about/values",
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete value card." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await toggleAboutValueItemStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.title} set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update value card status." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <AboutSectionHeader
          icon={Heart}
          title="About Values"
          description="Manage the values section heading and the value cards shown on the /about page."
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Values" value={loading ? "-" : items.length} />
          <StatCard label="Active Values" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Values" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Section settings</p>
                <h2 className="mt-1 text-base font-bold text-gray-900">Heading &amp; copy</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsDraft(settings)}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Eyebrow" error={settingsErrors.eyebrow}>
                <input
                  value={settingsDraft.eyebrow || ""}
                  onChange={(event) => updateSettingsDraft("eyebrow", event.target.value)}
                  className={inputClass}
                  placeholder="What we stand for"
                />
              </Field>

              <Field label="Title" error={settingsErrors.title}>
                <input
                  value={settingsDraft.title || ""}
                  onChange={(event) => updateSettingsDraft("title", event.target.value)}
                  className={inputClass}
                  placeholder="Our Values"
                />
              </Field>

              <p className="text-xs font-semibold text-gray-400">
                Last updated: {formatDate(settings.updatedAt)}
              </p>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={settingsSaving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Values Settings
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search value cards"
                  className="w-40 bg-transparent text-sm outline-none placeholder:text-gray-400"
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
                {filteredItems.length} of {items.length} values
              </span>
              <button
                type="button"
                onClick={() => setModalItem({ ...EMPTY_ITEM, order: nextOrder })}
                className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
              >
                <Plus className="h-4 w-4" />
                Add Value
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Text</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
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
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                        <td className="max-w-xs truncate px-4 py-3 text-gray-500">{item.text}</td>
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
                              aria-label={`Edit ${item.title}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(item)}
                              className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                              aria-label={`Delete ${item.title}`}
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
                        <Heart className="mx-auto h-8 w-8 text-gray-200" />
                        <p className="mt-3 text-sm font-semibold text-gray-500">No value cards found</p>
                        <p className="mt-1 text-xs text-gray-400">Add the first Anslic value card.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>

      {modalItem ? (
        <ValueItemModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order || nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete value card"
          message={`Delete "${deleteTarget.title}" from the Anslic About values?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function validateSettings(values) {
  const errors = {};
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.title?.trim()) errors.title = "Title is required.";
  return errors;
}

function validateItem(values) {
  const errors = {};
  if (!values.title?.trim()) errors.title = "Title is required.";
  if (!values.text?.trim()) errors.text = "Text is required.";
  if (Number.isNaN(Number(values.order)) || Number(values.order) < 0) {
    errors.order = "Order must be zero or higher.";
  }
  return errors;
}
