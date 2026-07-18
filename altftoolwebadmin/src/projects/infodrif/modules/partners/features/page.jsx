"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_FEATURES_SETTINGS,
  EMPTY_FEATURE_ITEM,
  createFeatureItem,
  deleteFeatureItem,
  deleteFeatureItemImage,
  resetFeaturesSettings,
  saveFeaturesSettings,
  subscribeFeatureItems,
  subscribeFeaturesSettings,
  toggleFeatureItemStatus,
  updateFeatureItem,
  uploadFeatureItemImage,
} from "../service/partners.service";
import {
  ActionHeader,
  Field,
  ImageUploadField,
  ModalShell,
  Panel,
  StatCard,
  StatusBadge,
  StatusToggle,
  TableSkeletonRows,
  cardClass,
  formatDate,
  inputClass,
  outlineButtonClass,
  primaryButtonClass,
  selectClass,
  textareaClass,
} from "../components/PartnersAdminShared";

const ROUTE = "/infodrif/partners/features";

export default function InfodrifPartnersFeaturesPage() {
  const [saved, setSaved] = useState(DEFAULT_FEATURES_SETTINGS);
  const [draft, setDraft] = useState(DEFAULT_FEATURES_SETTINGS);
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
    return subscribeFeaturesSettings(
      (data) => {
        setSaved(data);
        setDraft(data);
        setSettingsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load features settings." });
        setSettingsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return subscribeFeatureItems(
      (data) => {
        setItems(data);
        setItemsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load feature items." });
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
    const nextErrors = {};
    if (!draft.heading?.trim()) nextErrors.heading = "Heading is required.";
    setSettingsErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSettingsSaving(true);
    try {
      await saveFeaturesSettings(draft);
      emitAlert({ type: "success", message: "Features settings saved." });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_FEATURES_SETTINGS_UPDATE",
        entityType: "partnersFeaturesSettings",
        entityId: "features",
        summary: "Updated Infodrif partners features settings",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save features settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function handleResetSettings() {
    setSettingsSaving(true);
    try {
      await resetFeaturesSettings();
      emitAlert({ type: "success", message: "Features settings reset." });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_FEATURES_SETTINGS_RESET",
        entityType: "partnersFeaturesSettings",
        entityId: "features",
        summary: "Reset Infodrif partners features settings",
        route: ROUTE,
      });
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
        [item.title, item.description].some((value) =>
          String(value || "").toLowerCase().includes(queryText),
        );
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? item.active : !item.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedItems, statusFilter]);

  const activeCount = items.filter((item) => item.active).length;
  const nextOrder = items.length ? Math.max(...items.map((item) => Number(item.order || 0))) + 1 : 0;
  const nextNumber = items.length
    ? Math.max(...items.map((item) => Number(item.number || 0))) + 1
    : 1;

  async function handleSaveItem(form) {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateFeatureItem(modalItem.id, form);
        emitAlert({ type: "success", message: "Feature updated." });
        logAuditEvent({
          module: "partners",
          action: "PARTNERS_FEATURE_UPDATE",
          entityType: "partnersFeatureItem",
          entityId: modalItem.id,
          summary: `Updated feature ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        const id = await createFeatureItem(form);
        emitAlert({ type: "success", message: "Feature added." });
        logAuditEvent({
          module: "partners",
          action: "PARTNERS_FEATURE_CREATE",
          entityType: "partnersFeatureItem",
          entityId: id,
          summary: `Created feature ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save feature." });
    } finally {
      setItemSaving(false);
    }
  }

  async function handleDeleteItem() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteFeatureItem(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteFeatureItemImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Feature deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "partners",
        action: "PARTNERS_FEATURE_DELETE",
        entityType: "partnersFeatureItem",
        entityId: deleteTarget.id,
        summary: `Deleted feature ${deleteTarget.title}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete feature." });
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleToggle(item) {
    try {
      await toggleFeatureItemStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.title} set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update feature status." });
    }
  }

  return (
    <div className="min-h-screen bg-background px-6 pb-6">
      <ActionHeader
        title="Partners — Main Features"
        description="Edit the features heading and manage the numbered feature rows."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={settingsSaving}
        onSave={saveSettings}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel title="Features settings">
          {settingsLoading ? (
            <div className="h-10 animate-pulse rounded-md bg-surface-soft" />
          ) : (
            <Field label="Heading" required error={settingsErrors.heading}>
              <input
                value={draft.heading || ""}
                onChange={(event) => setField("heading", event.target.value)}
                className={inputClass}
                placeholder="Main features"
              />
            </Field>
          )}
        </Panel>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Features" value={itemsLoading ? "-" : items.length} />
          <StatCard label="Active" value={itemsLoading ? "-" : activeCount} tone="success" />
          <StatCard
            label="Inactive"
            value={itemsLoading ? "-" : items.length - activeCount}
            tone="warning"
          />
        </div>

        <div className={cardClass}>
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-surface-soft px-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search features"
                className="w-48 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={selectClass}
            >
              <option value="all">All status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <span className="ml-auto text-xs font-medium text-muted">
              {filteredItems.length} of {items.length} features
            </span>
            <button
              type="button"
              onClick={() =>
                setModalItem({ ...EMPTY_FEATURE_ITEM, order: nextOrder, number: nextNumber })
              }
              className={primaryButtonClass}
            >
              <Plus className="h-4 w-4" />
              Add Feature
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-surface-soft text-left text-xs font-semibold uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Number</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Layout</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {itemsLoading ? (
                  <TableSkeletonRows columns={7} />
                ) : filteredItems.length ? (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="transition hover:bg-surface-soft">
                      <td className="px-4 py-3 font-semibold text-foreground">{item.order}</td>
                      <td className="px-4 py-3 text-muted">{item.number}</td>
                      <td className="px-4 py-3">
                        <div className="flex h-12 w-16 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-soft">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-4 w-4 text-muted" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="line-clamp-1 text-xs text-muted">{item.description}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-md bg-surface-soft px-2 py-1 text-xs font-medium text-muted">
                          {item.reverse ? "Reversed" : "Standard"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggle(item)}>
                          <StatusBadge active={item.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalItem(item)}
                            className="rounded-md p-2 text-primary transition hover:bg-primary-soft"
                            aria-label={`Edit ${item.title}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(item)}
                            className="rounded-md p-2 text-danger transition hover:bg-danger-soft"
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
                    <td colSpan={7} className="px-4 py-14 text-center">
                      <Tag className="mx-auto h-8 w-8 text-muted" />
                      <p className="mt-3 text-sm font-semibold text-foreground">No features found</p>
                      <p className="mt-1 text-xs text-muted">Add the first Infodrif feature row.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <FeatureItemModal
          item={modalItem.id ? modalItem : null}
          defaults={modalItem}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete feature"
          message={`Delete "${deleteTarget.title}" from the partners page?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset features settings"
          message="Reset the features heading back to the default content?"
          confirmText="Reset"
          loading={settingsSaving}
          onConfirm={handleResetSettings}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function FeatureItemModal({ item, defaults, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || defaults || EMPTY_FEATURE_ITEM);
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const isEdit = Boolean(item?.id);

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title?.trim()) nextErrors.title = "Title is required.";
    if (!form.description?.trim()) nextErrors.description = "Description is required.";
    if (Number.isNaN(Number(form.number)) || Number(form.number) < 0) {
      nextErrors.number = "Number must be zero or higher.";
    }
    if (Number.isNaN(Number(form.order)) || Number(form.order) < 0) {
      nextErrors.order = "Order must be zero or higher.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  }

  return (
    <ModalShell
      eyebrow="Feature"
      title={isEdit ? "Edit feature" : "Add feature"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <button type="button" onClick={onClose} className={outlineButtonClass}>
            Cancel
          </button>
          <button type="submit" disabled={saving || uploading} className={primaryButtonClass}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update feature" : "Add feature"}
          </button>
        </>
      }
    >
      <Field label="Title" required error={errors.title}>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
          placeholder="Easy Management"
        />
      </Field>

      <Field label="Description" required error={errors.description}>
        <textarea
          rows={3}
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          className={textareaClass}
          placeholder="Automate repetitive business processes..."
        />
      </Field>

      <ImageUploadField
        imageUrl={form.imageUrl || ""}
        imagePath={form.imagePath || ""}
        alt={form.title}
        upload={uploadFeatureItemImage}
        remove={deleteFeatureItemImage}
        onUploadingChange={setUploading}
        onChange={({ imageUrl, imagePath }) =>
          setForm((prev) => ({ ...prev, imageUrl, imagePath }))
        }
      />

      <Field label="Image URL" hint="Set automatically on upload. Paste a URL to use an external image.">
        <input
          value={form.imageUrl || ""}
          onChange={(event) => updateField("imageUrl", event.target.value)}
          className={inputClass}
          placeholder="https://..."
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Number"
          required
          error={errors.number}
          hint="The big number rendered beside the row."
        >
          <input
            type="number"
            min="0"
            value={form.number}
            onChange={(event) => updateField("number", event.target.value)}
            className={inputClass}
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
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Layout" hint="Reversed flips the image to the other side of the row.">
          <button
            type="button"
            onClick={() => updateField("reverse", !form.reverse)}
            className={`flex h-10 w-full items-center justify-between rounded-md border px-3 text-sm font-semibold transition ${
              form.reverse
                ? "border-[color-mix(in_srgb,var(--info)_35%,transparent)] bg-info-soft text-info"
                : "border-border bg-surface-soft text-muted"
            }`}
          >
            <span>{form.reverse ? "Reversed" : "Standard"}</span>
            <span
              className={`h-2.5 w-2.5 rounded-full ${form.reverse ? "bg-info" : "bg-[var(--muted)]"}`}
            />
          </button>
        </Field>
        <Field label="Status">
          <StatusToggle active={form.active} onToggle={() => updateField("active", !form.active)} />
        </Field>
      </div>
    </ModalShell>
  );
}
