"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers, Pencil, Plus, Save, Star, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ActionHeader,
  ActiveToggle,
  Field,
  IconButton,
  IconSelect,
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
  isValidOrder,
  nextOrderFor,
  textareaClass,
} from "../components/AboutAdminShared";
import {
  ABOUT_SERVICE_ICON_NAMES,
  ABOUT_SERVICE_SPANS,
  DEFAULT_ABOUT_SERVICES,
  createAboutServiceItem,
  deleteAboutServiceItem,
  resetAboutServices,
  saveAboutServices,
  subscribeAboutServiceItems,
  subscribeAboutServices,
  toggleAboutServiceItemStatus,
  updateAboutServiceItem,
} from "../service/about.service";

const ROUTE = "/infodrif/about/services";

const EMPTY_ITEM = {
  title: "",
  description: "",
  icon: ABOUT_SERVICE_ICON_NAMES[0],
  iconSize: 28,
  featured: false,
  span: ABOUT_SERVICE_SPANS[0].value,
  order: 0,
  active: true,
};

export default function InfodrifAboutServicesPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_SERVICES);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_SERVICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
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
    return subscribeAboutServices(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about services settings." });
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return subscribeAboutServiceItems(
      (data) => {
        setItems(data);
        setItemsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load service items." });
        setItemsLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["title", "description"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

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
      await saveAboutServices(draft);
      emitAlert({ type: "success", message: "About services settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_SERVICES_SETTINGS_UPDATE",
        entityType: "aboutServicesSettings",
        entityId: "services",
        summary: "Updated Infodrif about services settings",
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
      await resetAboutServices();
      emitAlert({ type: "success", message: "About services settings reset to defaults." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_SERVICES_SETTINGS_RESET",
        entityType: "aboutServicesSettings",
        entityId: "services",
        summary: "Reset Infodrif about services settings to defaults",
        route: ROUTE,
      });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveItem = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateAboutServiceItem(modalItem.id, form);
        emitAlert({ type: "success", message: "Service updated." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_SERVICE_ITEM_UPDATE",
          entityType: "aboutServiceItem",
          entityId: modalItem.id,
          summary: `Updated about service "${form.title}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createAboutServiceItem(form);
        emitAlert({ type: "success", message: "Service added." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_SERVICE_ITEM_CREATE",
          entityType: "aboutServiceItem",
          summary: `Created about service "${form.title}"`,
          changes: form,
          route: ROUTE,
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
      await deleteAboutServiceItem(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "about",
        action: "ABOUT_SERVICE_ITEM_DELETE",
        entityType: "aboutServiceItem",
        entityId: deleteTarget.id,
        summary: `Deleted about service "${deleteTarget.title}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete service." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAboutServiceItemStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.title}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update service status." });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] px-6 pb-6">
      <ActionHeader
        title="About — Services"
        description="The services heading and the bento grid of service cards."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="About services settings" title="Heading">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs leading-5 text-[var(--muted)]">
                The heading is split into two fields because the site renders the accent half as its
                own styled span.
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Eyebrow" error={errors.eyebrow}>
                  <input
                    value={draft.eyebrow || ""}
                    onChange={(event) => setField("eyebrow", event.target.value)}
                    className={inputClass}
                    placeholder="Our Expertise"
                  />
                </Field>
                <Field label="CTA label" error={errors.ctaLabel}>
                  <input
                    value={draft.ctaLabel || ""}
                    onChange={(event) => setField("ctaLabel", event.target.value)}
                    className={inputClass}
                    placeholder="View All Services"
                  />
                </Field>
                <Field label="Heading" error={errors.heading}>
                  <input
                    value={draft.heading || ""}
                    onChange={(event) => setField("heading", event.target.value)}
                    className={inputClass}
                    placeholder="We Provide Best"
                  />
                </Field>
                <Field label="Heading accent" error={errors.headingAccent}>
                  <input
                    value={draft.headingAccent || ""}
                    onChange={(event) => setField("headingAccent", event.target.value)}
                    className={inputClass}
                    placeholder="AI Consulting"
                  />
                </Field>
              </div>
            </div>
          )}
        </Panel>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <ItemsToolbar
            search={search}
            onSearchChange={setSearch}
            searchLabel="Search services"
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            shownCount={filtered.length}
            totalCount={items.length}
            countNoun="services"
            actions={
              <PrimaryButton
                icon={Plus}
                onClick={() => setModalItem({ ...EMPTY_ITEM, order: nextOrder })}
              >
                Add Service
              </PrimaryButton>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
                Service cards
                <span className="ml-2 text-xs font-medium text-[var(--muted)]">
                  Featured and span control the bento grid layout.
                </span>
              </caption>
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Layout</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {itemsLoading ? (
                  <TableSkeletonRows colSpan={6} />
                ) : filtered.length ? (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                      <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                          {item.featured ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--primary)]">
                              <Star className="h-3 w-3" strokeWidth={2} />
                              Featured
                            </span>
                          ) : null}
                        </div>
                        <p className="line-clamp-1 text-xs text-[var(--muted)]">
                          {item.description}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 font-mono text-xs font-medium text-[var(--muted)]">
                          {item.icon} · {item.iconSize}px
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-[var(--muted)]">{item.span}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
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
                    icon={Layers}
                    title="No services found"
                    description="Add the first about service card."
                    colSpan={6}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <ServiceModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete service"
          message={`Delete the "${deleteTarget.title}" service card?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset about services settings"
          message="Reset the services heading back to the default content? The service cards are not affected."
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function ServiceModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_ITEM, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title?.trim()) nextErrors.title = "Title is required.";
    if (!form.description?.trim()) nextErrors.description = "Description is required.";
    if (!form.icon?.trim()) nextErrors.icon = "Pick an icon.";
    if (!form.span?.trim()) nextErrors.span = "Pick a column span.";
    if (!(Number(form.iconSize) > 0)) nextErrors.iconSize = "Icon size must be greater than zero.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave({ ...form, iconSize: Number(form.iconSize) });
  };

  return (
    <ModalShell
      eyebrow="About service"
      title={isEdit ? "Edit service" : "Add service"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update service" : "Add service"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Title" error={errors.title}>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
          placeholder="AI-Consulting offerings"
        />
      </Field>

      <Field label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={2}
          className={textareaClass}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Icon"
          hint="Mapped back by AboutServices.jsx on the site."
          error={errors.icon}
        >
          <IconSelect
            value={form.icon}
            options={ABOUT_SERVICE_ICON_NAMES}
            onChange={(value) => updateField("icon", value)}
          />
        </Field>
        <Field label="Icon size (px)" error={errors.iconSize}>
          <input
            type="number"
            min="1"
            value={form.iconSize}
            onChange={(event) => updateField("iconSize", event.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          Bento grid layout
        </p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
          Featured cards render larger. The span sets how many grid columns the card occupies.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Column span" error={errors.span}>
            <OptionSelect
              value={form.span}
              options={ABOUT_SERVICE_SPANS}
              onChange={(value) => updateField("span", value)}
            />
          </Field>
          <Field label="Featured">
            <button
              type="button"
              onClick={() => updateField("featured", !form.featured)}
              aria-pressed={form.featured}
              className={`flex h-10 w-full items-center justify-between rounded-lg border px-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)] ${
                form.featured
                  ? "border-[color-mix(in_srgb,var(--primary)_35%,var(--border))] bg-[var(--primary-soft)] text-[var(--primary)]"
                  : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              <span>{form.featured ? "Featured card" : "Standard card"}</span>
              <Star
                className="h-3.5 w-3.5"
                strokeWidth={2}
                fill={form.featured ? "currentColor" : "none"}
              />
            </button>
          </Field>
        </div>
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
  if (!values.ctaLabel?.trim()) errors.ctaLabel = "CTA label is required.";
  return errors;
}
