"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Image as ImageIcon,
  Menu,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Text,
  Trash2,
  Upload,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  Field,
  IconButton,
  ModalShell,
  PageHeader,
  Panel,
  PrimaryButton,
  SecondaryButton,
  StatCard,
  StatusBadge,
  TableEmptyState,
  TableSkeletonRows,
  inputClass,
  isSafeUrl,
} from "../../components/ui";
import {
  DEFAULT_NAVBAR_SETTINGS,
  createNavbarItem,
  deleteNavbarItem,
  deleteNavbarLogo,
  saveNavbarSettings,
  subscribeNavbarItems,
  subscribeNavbarSettings,
  toggleNavbarItemStatus,
  updateNavbarItem,
  uploadNavbarLogo,
} from "./service/navbar.service";

const ROUTE = "/infodrif/navbar";

const EMPTY_ITEM = {
  title: "",
  url: "",
  order: 1,
  active: true,
};

function NavbarPreview({ settings, items }) {
  const activeItems = items.filter((item) => item.active);

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[#0b0f1a] shadow-sm">
      <div className="flex min-h-20 items-center gap-5 px-5 py-4 text-white">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {settings.logoType === "image" && settings.logoImageUrl ? (
            <img
              src={settings.logoImageUrl}
              alt={settings.logoText || "InfoDrift logo"}
              className="h-10 max-w-48 rounded-md object-contain"
            />
          ) : (
            <>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#ff6a63] text-xs font-extrabold text-white">
                {settings.logoInitials || "ID"}
              </span>
              <span className="truncate text-xl font-bold">
                {settings.logoText || "InfoDrift"}
              </span>
            </>
          )}
        </div>
        <div className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {activeItems.length ? (
            activeItems.map((item) => (
              <span key={item.id} className="whitespace-nowrap text-white/80">
                {item.title}
              </span>
            ))
          ) : (
            <span className="text-white/50">No active menu items</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MenuItemModal({ item, nextOrder, saving, onClose, onSave }) {
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
    <ModalShell
      eyebrow="Navbar item"
      title={isEdit ? "Edit menu item" : "Add menu item"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" loading={saving} icon={Save} disabled={saving}>
            {isEdit ? "Update item" : "Add item"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Menu item title" error={errors.title}>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
          placeholder="Partners"
        />
      </Field>

      <Field label="Menu item URL" error={errors.url}>
        <input
          value={form.url}
          onChange={(event) => updateField("url", event.target.value)}
          className={inputClass}
          placeholder="/partners"
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
            aria-pressed={form.active}
            className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
              form.active
                ? "border-[color-mix(in_srgb,var(--success)_35%,var(--border))] bg-[var(--success-soft)] text-[var(--success)]"
                : "border-[var(--border)] bg-[var(--surface-soft)] text-[var(--muted)]"
            }`}
          >
            <span>{form.active ? "Active" : "Inactive"}</span>
            <span className="h-2.5 w-2.5 rounded-full bg-current" />
          </button>
        </Field>
      </div>
    </ModalShell>
  );
}

export default function InfodrifNavbarPage() {
  const [settings, setSettings] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_NAVBAR_SETTINGS);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [itemSaving, setItemSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
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

    const unsubSettings = subscribeNavbarSettings(
      (data) => {
        settingsReady = true;
        setSettings(data);
        setSettingsDraft(data);
        markReady();
      },
      () => {
        settingsReady = true;
        emitAlert({ type: "error", message: "Failed to load navbar settings" });
        markReady();
      },
    );

    const unsubItems = subscribeNavbarItems(
      (data) => {
        itemsReady = true;
        setItems(data);
        markReady();
      },
      () => {
        itemsReady = true;
        emitAlert({ type: "error", message: "Failed to load navbar items" });
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
        item.url?.toLowerCase().includes(queryText);
      const matchesStatus =
        statusFilter === "all" || (statusFilter === "active" ? item.active : !item.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedItems, statusFilter]);

  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;
  const nextOrder = items.length
    ? Math.max(...items.map((item) => Number(item.order || 0))) + 1
    : 0;

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadNavbarLogo({ file, onProgress: setUploadProgress });
      setSettingsDraft((prev) => ({
        ...prev,
        logoType: "image",
        logoImageUrl: uploaded.url,
        logoImagePath: uploaded.path,
      }));
      emitAlert({ type: "success", message: "Logo image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Logo upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    const previousPath = settingsDraft.logoImagePath;
    setSettingsDraft((prev) => ({
      ...prev,
      logoType: "text",
      logoImageUrl: "",
      logoImagePath: "",
    }));
    try {
      await deleteNavbarLogo(previousPath);
      emitAlert({ type: "success", message: "Logo image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Logo removed from form, but Storage cleanup failed.",
      });
    }
  };

  const handleSaveSettings = async () => {
    const errors = validateSettings(settingsDraft);
    setSettingsErrors(errors);
    if (Object.keys(errors).length) return;

    setSettingsSaving(true);
    try {
      await saveNavbarSettings(settingsDraft);
      emitAlert({ type: "success", message: "Navbar settings saved." });
      logAuditEvent({
        module: "navbar",
        action: "NAVBAR_SETTINGS_UPDATE",
        entityType: "navbarSettings",
        entityId: "settings",
        summary: "Updated Infodrif navbar settings",
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveItem = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateNavbarItem(modalItem.id, form);
        emitAlert({ type: "success", message: "Menu item updated." });
        logAuditEvent({
          module: "navbar",
          action: "NAVBAR_ITEM_UPDATE",
          entityType: "navbarItem",
          entityId: modalItem.id,
          summary: `Updated navbar item ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createNavbarItem(form);
        emitAlert({ type: "success", message: "Menu item added." });
        logAuditEvent({
          module: "navbar",
          action: "NAVBAR_ITEM_CREATE",
          entityType: "navbarItem",
          summary: `Created navbar item ${form.title}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save menu item." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteNavbarItem(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "navbar",
        action: "NAVBAR_ITEM_DELETE",
        entityType: "navbarItem",
        entityId: deleteTarget.id,
        summary: `Deleted navbar item ${deleteTarget.title}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete menu item." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await toggleNavbarItemStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.title} set to ${item.active ? "inactive" : "active"}.`,
      });
      logAuditEvent({
        module: "navbar",
        action: "NAVBAR_ITEM_UPDATE",
        entityType: "navbarItem",
        entityId: item.id,
        summary: `Set navbar item ${item.title} to ${item.active ? "inactive" : "active"}`,
        route: ROUTE,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update item status." });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <PageHeader
          icon={Menu}
          title="Infodrif Navbar"
          description="Manage logo, navigation links, order, and visibility."
          actions={
            <PrimaryButton
              icon={Plus}
              onClick={() => setModalItem({ ...EMPTY_ITEM, order: nextOrder })}
            >
              Add Menu Item
            </PrimaryButton>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Items" value={loading ? "-" : items.length} />
          <StatCard label="Active Items" value={loading ? "-" : activeCount} tone="success" />
          <StatCard label="Inactive Items" value={loading ? "-" : inactiveCount} tone="warning" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <Panel
            eyebrow="Logo settings"
            title="Brand control"
            actions={
              <SecondaryButton
                icon={RefreshCw}
                onClick={() => setSettingsDraft(settings)}
                className="h-9 px-3 text-xs"
              >
                Reset
              </SecondaryButton>
            }
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-[var(--surface-soft)] p-1">
                {[
                  { key: "text", label: "Text logo", icon: Text },
                  { key: "image", label: "Image logo", icon: ImageIcon },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateSettingsDraft("logoType", key)}
                    aria-pressed={settingsDraft.logoType === key}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
                      settingsDraft.logoType === key
                        ? "bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Logo text" error={settingsErrors.logoText}>
                  <input
                    value={settingsDraft.logoText}
                    onChange={(event) => updateSettingsDraft("logoText", event.target.value)}
                    className={inputClass}
                    placeholder="InfoDrift"
                  />
                </Field>

                <Field label="Logo text (mobile)" hint="Shown on small screens.">
                  <input
                    value={settingsDraft.logoTextMobile}
                    onChange={(event) => updateSettingsDraft("logoTextMobile", event.target.value)}
                    className={inputClass}
                    placeholder="InfoDrift"
                  />
                </Field>

                <Field label="Logo initials" error={settingsErrors.logoInitials}>
                  <input
                    value={settingsDraft.logoInitials}
                    onChange={(event) => updateSettingsDraft("logoInitials", event.target.value)}
                    className={inputClass}
                    placeholder="ID"
                  />
                </Field>

                <Field label="Logo initials (mobile)">
                  <input
                    value={settingsDraft.logoInitialsMobile}
                    onChange={(event) =>
                      updateSettingsDraft("logoInitialsMobile", event.target.value)
                    }
                    className={inputClass}
                    placeholder="Id"
                  />
                </Field>
              </div>

              <Field label="Logo image" error={settingsErrors.logoImageUrl}>
                <div className="rounded-xl border border-dashed border-[var(--border-strong,var(--border))] bg-[var(--surface-soft)] p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="grid h-16 w-28 shrink-0 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                      {settingsDraft.logoImageUrl ? (
                        <img
                          src={settingsDraft.logoImageUrl}
                          alt="Uploaded logo preview"
                          className="max-h-12 max-w-24 object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-[var(--muted)] opacity-60" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[var(--foreground)]">
                        Upload a PNG, JPG, or WebP logo
                      </p>
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        Recommended transparent image, max 5MB.
                      </p>
                      {uploading ? (
                        <div
                          className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--border)]"
                          role="progressbar"
                          aria-valuenow={uploadProgress}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-[var(--primary)] transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      ) : null}
                    </div>
                    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-[13px] font-semibold text-[var(--primary-foreground)] transition hover:bg-[color-mix(in_srgb,var(--primary)_85%,black)]">
                      <Upload className="h-4 w-4" strokeWidth={1.75} />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={uploading}
                        onChange={(event) => handleLogoUpload(event.target.files?.[0])}
                      />
                    </label>
                    {settingsDraft.logoImageUrl ? (
                      <SecondaryButton onClick={handleRemoveLogo}>Remove</SecondaryButton>
                    ) : null}
                  </div>
                </div>
              </Field>

              <PrimaryButton
                onClick={handleSaveSettings}
                loading={settingsSaving}
                icon={Save}
                disabled={settingsSaving || uploading}
                className="w-full"
              >
                Save Navbar Settings
              </PrimaryButton>
            </div>
          </Panel>

          <section className="space-y-5">
            <Panel>
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-[var(--muted)]" strokeWidth={1.75} />
                <h2 className="text-base font-bold text-[var(--foreground)]">Live preview</h2>
              </div>
              <NavbarPreview settings={settingsDraft} items={sortedItems} />
            </Panel>

            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search menu items"
                    aria-label="Search menu items"
                    className={`${inputClass} w-56 pl-8`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                  className={`${inputClass} w-auto`}
                >
                  <option value="all">All status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <span className="ml-auto text-xs font-medium text-[var(--muted)]">
                  {filteredItems.length} of {items.length} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">URL</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {loading ? (
                      <TableSkeletonRows colSpan={5} />
                    ) : filteredItems.length ? (
                      filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                          <td className="px-4 py-3 font-semibold text-[var(--muted)]">
                            {item.order}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                            {item.title}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 text-xs font-medium text-[var(--muted)]">
                              {item.url}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(item)}
                              aria-label={`Toggle ${item.title} status`}
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
                                aria-label={`Edit ${item.title}`}
                              />
                              <IconButton
                                icon={Trash2}
                                tone="danger"
                                onClick={() => setDeleteTarget(item)}
                                aria-label={`Delete ${item.title}`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <TableEmptyState
                        icon={Menu}
                        title="No menu items found"
                        description="Add the first Infodrif navigation item."
                        colSpan={5}
                      />
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>

      {modalItem ? (
        <MenuItemModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete menu item"
          message={`Delete "${deleteTarget.title}" from the Infodrif navbar?`}
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
  if (!values.logoText?.trim()) {
    errors.logoText = "Logo text is required.";
  }
  if (!values.logoInitials?.trim()) {
    errors.logoInitials = "Logo initials are required.";
  }
  if (values.logoType === "image" && !values.logoImageUrl) {
    errors.logoImageUrl = "Upload a logo image or switch back to text logo.";
  }
  return errors;
}

function validateItem(values) {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.url?.trim()) {
    errors.url = "URL is required.";
  } else if (!isSafeUrl(values.url)) {
    errors.url = "Use a relative path or a valid http/https URL.";
  }
  if (Number.isNaN(Number(values.order)) || Number(values.order) < 0) {
    errors.order = "Order must be zero or higher.";
  }
  return errors;
}
