"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Boxes,
  Code2,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Mail,
  MonitorSmartphone,
  Pencil,
  PenTool,
  Plus,
  Save,
  Search,
  Share2,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_SERVICES_SETTINGS,
  SERVICE_ICON_OPTIONS,
  createServiceItem,
  createSlug,
  deleteServiceImage,
  deleteServiceItem,
  saveServicesSettings,
  subscribeServiceItems,
  subscribeServicesSettings,
  toggleServiceItemStatus,
  updateServiceItem,
  uploadServiceImage,
} from "./service/services.service";

const ICON_COMPONENTS = {
  MonitorSmartphone,
  Smartphone,
  Search,
  Mail,
  Share2,
  Code2,
  LayoutTemplate,
  PenTool,
};

const EMPTY_ITEM = {
  slug: "",
  title: "",
  icon: SERVICE_ICON_OPTIONS[0],
  shortDescription: "",
  description: "",
  imageUrl: "",
  imagePath: "",
  benefits: ["", "", ""],
  process: ["", "", ""],
  features: ["", "", "", ""],
  seoTitle: "",
  seoDescription: "",
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

function ServiceItemModal({ item, nextOrder, saving, onClose, onSave }) {
  const isEdit = Boolean(item?.id);
  const [form, setForm] = useState(() => ({
    ...EMPTY_ITEM,
    ...item,
    benefits: item?.benefits?.length ? item.benefits : [...EMPTY_ITEM.benefits],
    process: item?.process?.length ? item.process : [...EMPTY_ITEM.process],
    features: item?.features?.length ? item.features : [...EMPTY_ITEM.features],
    order: item?.order ?? nextOrder,
    active: item?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [slugEdited, setSlugEdited] = useState(Boolean(item?.slug));
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const updateField = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugEdited) next.slug = createSlug(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const updateSlugField = (value) => {
    setSlugEdited(true);
    updateField("slug", createSlug(value));
  };

  const updateListField = (key, index, value) => {
    setForm((prev) => {
      const list = [...prev[key]];
      list[index] = value;
      return { ...prev, [key]: list };
    });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadServiceImage({ file, onProgress: setUploadProgress });
      if (form.imagePath) {
        try {
          await deleteServiceImage(form.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "New image uploaded, but old image cleanup failed." });
        }
      }
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Service image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteServiceImage(path);
      emitAlert({ type: "success", message: "Service image removed." });
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateItem(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Service</p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {isEdit ? "Edit service" : "Add service"}
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
          <Field label="Service image" error={errors.imageUrl}>
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-28 items-center justify-center rounded-lg border border-gray-200 bg-white">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Service preview"
                      className="max-h-16 w-28 rounded-lg object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Upload a PNG, JPG, or WebP image
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">Max 5MB.</p>
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
                    onChange={(event) => handleImageUpload(event.target.files?.[0])}
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
            <Field label="Title" error={errors.title}>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={inputClass}
                placeholder="Performance Marketing"
              />
            </Field>

            <Field label="Slug" error={errors.slug}>
              <input
                value={form.slug}
                onChange={(event) => updateSlugField(event.target.value)}
                className={inputClass}
                placeholder="performance-marketing"
              />
            </Field>
          </div>

          <Field label="Icon" error={errors.icon}>
            <select
              value={form.icon}
              onChange={(event) => updateField("icon", event.target.value)}
              className={inputClass}
            >
              {SERVICE_ICON_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2">
              {SERVICE_ICON_OPTIONS.map((option) => {
                const OptionIcon = ICON_COMPONENTS[option];
                const selected = form.icon === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("icon", option)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                      selected
                        ? "border-gray-900 bg-gray-900 text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <OptionIcon className="h-3.5 w-3.5" />
                    {option}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Short description" error={errors.shortDescription}>
            <input
              value={form.shortDescription}
              onChange={(event) => updateField("shortDescription", event.target.value)}
              className={inputClass}
              placeholder="Shown on the services grid card"
            />
          </Field>

          <Field label="Full description" error={errors.description}>
            <textarea
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              rows={4}
              className={textareaClass}
              placeholder="Shown on the service detail page hero"
            />
          </Field>

          <Field label="Benefits (3)" error={errors.benefits}>
            <div className="space-y-2">
              {form.benefits.map((value, index) => (
                <input
                  key={index}
                  value={value}
                  onChange={(event) => updateListField("benefits", index, event.target.value)}
                  className={inputClass}
                  placeholder={`Benefit ${index + 1}`}
                />
              ))}
            </div>
          </Field>

          <Field label="Process (3)" error={errors.process}>
            <div className="space-y-2">
              {form.process.map((value, index) => (
                <input
                  key={index}
                  value={value}
                  onChange={(event) => updateListField("process", index, event.target.value)}
                  className={inputClass}
                  placeholder={`Step ${index + 1}`}
                />
              ))}
            </div>
          </Field>

          <Field label="Features (4)" error={errors.features}>
            <div className="grid gap-2 sm:grid-cols-2">
              {form.features.map((value, index) => (
                <input
                  key={index}
                  value={value}
                  onChange={(event) => updateListField("features", index, event.target.value)}
                  className={inputClass}
                  placeholder={`Feature ${index + 1}`}
                />
              ))}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="SEO title">
              <input
                value={form.seoTitle}
                onChange={(event) => updateField("seoTitle", event.target.value)}
                className={inputClass}
                placeholder="Defaults to title"
              />
            </Field>
            <Field label="SEO description">
              <input
                value={form.seoDescription}
                onChange={(event) => updateField("seoDescription", event.target.value)}
                className={inputClass}
                placeholder="Defaults to short description"
              />
            </Field>
          </div>

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
            {isEdit ? "Update service" : "Add service"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CampaignastraServicesPage() {
  const [settings, setSettings] = useState(DEFAULT_SERVICES_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_SERVICES_SETTINGS);
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

    const unsubSettings = subscribeServicesSettings(
      (data) => {
        settingsReady = true;
        setSettings(data);
        setSettingsDraft(data);
        markReady();
      },
      () => {
        settingsReady = true;
        emitAlert({ type: "error", message: "Failed to load services settings" });
        markReady();
      },
    );

    const unsubItems = subscribeServiceItems(
      (data) => {
        itemsReady = true;
        setItems(data);
        markReady();
      },
      () => {
        itemsReady = true;
        emitAlert({ type: "error", message: "Failed to load service items" });
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
        item.slug?.toLowerCase().includes(queryText);
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

  const handleSaveSettings = async () => {
    const errors = validateSettings(settingsDraft);
    setSettingsErrors(errors);
    if (Object.keys(errors).length) return;

    setSettingsSaving(true);
    try {
      await saveServicesSettings(settingsDraft);
      emitAlert({ type: "success", message: "Services settings saved." });
      logAuditEvent({
        module: "services",
        action: "SERVICES_SETTINGS_UPDATE",
        entityType: "servicesSettings",
        entityId: "settings",
        summary: "Updated Campaignastra services page copy",
        route: "/campaignastra/services",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save services settings." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveItem = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateServiceItem(modalItem.id, form);
        emitAlert({ type: "success", message: "Service updated." });
        logAuditEvent({
          module: "services",
          action: "SERVICE_UPDATE",
          entityType: "serviceItem",
          entityId: modalItem.id,
          summary: `Updated service ${form.title}`,
          changes: form,
          route: "/campaignastra/services",
        });
      } else {
        const id = await createServiceItem(form);
        emitAlert({ type: "success", message: "Service added." });
        logAuditEvent({
          module: "services",
          action: "SERVICE_CREATE",
          entityType: "serviceItem",
          entityId: id,
          summary: `Created service ${form.title}`,
          changes: form,
          route: "/campaignastra/services",
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save service." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteServiceItem(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteServiceImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Service deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "services",
        action: "SERVICE_DELETE",
        entityType: "serviceItem",
        entityId: deleteTarget.id,
        summary: `Deleted service ${deleteTarget.title}`,
        route: "/campaignastra/services",
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete service." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      await toggleServiceItemStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.title} set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update service status." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaignastra Services</h1>
              <p className="text-sm text-gray-500">
                Manage the services page copy and the individual service items.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalItem({ ...EMPTY_ITEM, order: nextOrder })}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Page copy
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Services section content</h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Eyebrow" error={settingsErrors.eyebrow}>
              <input
                value={settingsDraft.eyebrow}
                onChange={(event) => updateSettingsDraft("eyebrow", event.target.value)}
                className={inputClass}
                placeholder="What we do"
              />
            </Field>
            <Field label="Title" error={settingsErrors.title}>
              <input
                value={settingsDraft.title}
                onChange={(event) => updateSettingsDraft("title", event.target.value)}
                className={inputClass}
                placeholder="Our Services"
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Subtitle" error={settingsErrors.subtitle}>
              <textarea
                value={settingsDraft.subtitle}
                onChange={(event) => updateSettingsDraft("subtitle", event.target.value)}
                rows={2}
                className={textareaClass}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="SEO title" error={settingsErrors.seoTitle}>
              <input
                value={settingsDraft.seoTitle}
                onChange={(event) => updateSettingsDraft("seoTitle", event.target.value)}
                className={inputClass}
                placeholder="Our Services | Campaignastra"
              />
            </Field>
            <Field label="SEO description" error={settingsErrors.seoDescription}>
              <input
                value={settingsDraft.seoDescription}
                onChange={(event) => updateSettingsDraft("seoDescription", event.target.value)}
                className={inputClass}
                placeholder="Meta description for the services page"
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60 md:w-auto"
          >
            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Services Settings
          </button>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Services" value={loading ? "-" : items.length} />
          <StatCard label="Active Services" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Services" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services"
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
              {filteredItems.length} of {items.length} services
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={6} className="px-4 py-3">
                        <div className="h-9 animate-pulse rounded-lg bg-gray-100" />
                      </td>
                    </tr>
                  ))
                ) : filteredItems.length ? (
                  filteredItems.map((item) => {
                    const ItemIcon = ICON_COMPONENTS[item.icon] || MonitorSmartphone;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-700">{item.order}</td>
                        <td className="px-4 py-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                            <ItemIcon className="h-4 w-4" />
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{item.title}</td>
                        <td className="px-4 py-3 text-gray-500">
                          <span className="rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium">
                            {item.slug}
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
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <Boxes className="mx-auto h-8 w-8 text-gray-200" />
                      <p className="mt-3 text-sm font-semibold text-gray-500">No services found</p>
                      <p className="mt-1 text-xs text-gray-400">Add the first Campaignastra service.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <ServiceItemModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order || nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete service"
          message={`Delete "${deleteTarget.title}" from Campaignastra services?`}
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
  if (!values.eyebrow?.trim()) {
    errors.eyebrow = "Eyebrow is required.";
  }
  if (!values.title?.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.subtitle?.trim()) {
    errors.subtitle = "Subtitle is required.";
  }
  return errors;
}

function validateItem(values) {
  const errors = {};
  if (!values.title?.trim()) {
    errors.title = "Title is required.";
  }
  if (!values.slug?.trim()) {
    errors.slug = "Slug is required.";
  }
  if (!values.shortDescription?.trim()) {
    errors.shortDescription = "Short description is required.";
  }
  if (Number.isNaN(Number(values.order)) || Number(values.order) < 0) {
    errors.order = "Order must be zero or higher.";
  }
  return errors;
}
