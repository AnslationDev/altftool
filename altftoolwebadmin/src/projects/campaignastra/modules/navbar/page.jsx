"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Image as ImageIcon,
  Loader2,
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

const EMPTY_ITEM = {
  title: "",
  url: "",
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>
        {value}
      </p>
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

function NavbarPreview({ settings, items }) {
  const activeItems = items.filter((item) => item.active);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-[#05050d] shadow-sm">
      <div className="flex min-h-20 items-center gap-5 bg-[linear-gradient(110deg,#111222,#05050d_45%,#0b0c1c)] px-5 py-4 text-white">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {settings.logoType === "image" && settings.logoImageUrl ? (
            <img
              src={settings.logoImageUrl}
              alt={settings.logoText || "ANSLIC logo"}
              className="h-10 max-w-48 rounded-md object-contain"
            />
          ) : (
            <span className="truncate text-2xl font-bold tracking-normal">
              {settings.logoText || "ANSLIC"}
            </span>
          )}
        </div>
        <div className="hidden items-center gap-8 text-sm font-semibold lg:flex">
          {activeItems.length ? (
            activeItems.map((item) => (
              <span key={item.id} className="whitespace-nowrap">
                {item.title}
              </span>
            ))
          ) : (
            <span className="text-white/50">No active menu items</span>
          )}
        </div>
        <span className="hidden rounded-full bg-[#4b56f5] px-4 py-2 text-xs font-bold text-white lg:inline-flex">
          {settings.contactCtaLabel || "Contact"}
        </span>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Navbar item
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {isEdit ? "Edit menu item" : "Add menu item"}
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
          <Field label="Menu item title" error={errors.title}>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              placeholder="Services"
            />
          </Field>

          <Field label="Menu item URL" error={errors.url}>
            <input
              value={form.url}
              onChange={(event) => updateField("url", event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              placeholder="/services"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Order" error={errors.order}>
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={(event) => updateField("order", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
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
            {isEdit ? "Update item" : "Add item"}
          </button>
        </div>
      </form>
    </div>
  );
}

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

export default function CampaignastraNavbarPage() {
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
        statusFilter === "all" ||
        (statusFilter === "active" ? item.active : !item.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedItems, statusFilter]);

  const activeCount = items.filter((item) => item.active).length;
  const inactiveCount = items.length - activeCount;
  const nextOrder = items.length
    ? Math.max(...items.map((item) => Number(item.order || 0))) + 1
    : 1;

  const updateSettingsDraft = (key, value) => {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
    setSettingsErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadNavbarLogo({
        file,
        onProgress: setUploadProgress,
      });
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
        summary: "Updated Campaignastra navbar settings",
        route: "/campaignastra/navbar",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleRemoveLogo = async () => {
    setSettingsDraft((prev) => ({
      ...prev,
      logoImageUrl: "",
      logoImagePath: "",
      logoType: "text",
    }));
    try {
      await deleteNavbarLogo(settingsDraft.logoImagePath);
      emitAlert({ type: "success", message: "Logo image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Logo removed from form, but Storage cleanup failed." });
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
          route: "/campaignastra/navbar",
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
          route: "/campaignastra/navbar",
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
        route: "/campaignastra/navbar",
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
    } catch {
      emitAlert({ type: "error", message: "Failed to update item status." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Menu className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaignastra Navbar</h1>
              <p className="text-sm text-gray-500">
                Manage logo, navigation links, order, and visibility.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalItem({ ...EMPTY_ITEM, order: nextOrder })}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Add Menu Item
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Items" value={loading ? "-" : items.length} />
          <StatCard label="Active Items" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Items" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  Logo settings
                </p>
                <h2 className="mt-1 text-base font-bold text-gray-900">
                  Brand control
                </h2>
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
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-100 p-1">
                {[
                  { key: "text", label: "Text logo", icon: Text },
                  { key: "image", label: "Image logo", icon: ImageIcon },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => updateSettingsDraft("logoType", key)}
                    className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      settingsDraft.logoType === key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <Field label="Logo text" error={settingsErrors.logoText}>
                <input
                  value={settingsDraft.logoText}
                  onChange={(event) => updateSettingsDraft("logoText", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="ANSLIC"
                />
              </Field>

              <Field label="Logo image" error={settingsErrors.logoImageUrl}>
                <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-gray-200 bg-white">
                      {settingsDraft.logoImageUrl ? (
                        <img
                          src={settingsDraft.logoImageUrl}
                          alt="Uploaded logo preview"
                          className="max-h-12 max-w-24 object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-gray-300" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-800">
                        Upload a PNG, JPG, or WebP logo
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        Recommended transparent image, max 5MB.
                      </p>
                      {uploading ? (
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-gray-900 transition-all"
                            style={{ width: `${uploadProgress}%` }}
                          />
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
                        onChange={(event) => handleLogoUpload(event.target.files?.[0])}
                      />
                    </label>
                    {settingsDraft.logoImageUrl ? (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              </Field>

              <Field label="Contact CTA button label" error={settingsErrors.contactCtaLabel}>
                <input
                  value={settingsDraft.contactCtaLabel}
                  onChange={(event) => updateSettingsDraft("contactCtaLabel", event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="Contact"
                />
              </Field>

              <button
                type="button"
                onClick={handleSaveSettings}
                disabled={settingsSaving || uploading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
              >
                {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Navbar Settings
              </button>
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Eye className="h-4 w-4 text-gray-400" />
                <h2 className="text-base font-bold text-gray-900">Live preview</h2>
              </div>
              <NavbarPreview settings={settingsDraft} items={sortedItems} />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search menu items"
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
                  {filteredItems.length} of {items.length} items
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                      <th className="px-4 py-3">Order</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">URL</th>
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
                          <td className="px-4 py-3 font-semibold text-gray-700">
                            {item.order}
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-900">
                            {item.title}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium">
                              {item.url}
                            </span>
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
                          <Menu className="mx-auto h-8 w-8 text-gray-200" />
                          <p className="mt-3 text-sm font-semibold text-gray-500">
                            No menu items found
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Add the first Campaignastra navigation item.
                          </p>
                        </td>
                      </tr>
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
          nextOrder={modalItem.order || nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete menu item"
          message={`Delete "${deleteTarget.title}" from the Campaignastra navbar?`}
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

function isSafeUrl(value = "") {
  const url = value.trim();
  if (url.startsWith("/")) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
