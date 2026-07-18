"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Pencil, Plus, Save, Trash2 } from "lucide-react";
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
} from "../components/HomeAdminShared";
import {
  DEFAULT_HOME_SECTIONS,
  TRUSTED_BY_ICON_NAMES,
  createTrustedByBrand,
  deleteTrustedByBrand,
  resetHomeSection,
  saveHomeSection,
  subscribeHomeSection,
  subscribeTrustedByBrands,
  toggleTrustedByBrandStatus,
  updateTrustedByBrand,
} from "../service/home.service";

const SECTION_KEY = "trusted-by";
const ROUTE = "/infodrif/home/trusted-by";
const DEFAULTS = DEFAULT_HOME_SECTIONS[SECTION_KEY];

const EMPTY_BRAND = { label: "", icon: TRUSTED_BY_ICON_NAMES[0], order: 0, active: true };

export default function InfodrifHomeTrustedByPage() {
  const [saved, setSaved] = useState(DEFAULTS);
  const [draft, setDraft] = useState(DEFAULTS);
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
    return subscribeHomeSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load trusted-by settings." });
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return subscribeTrustedByBrands(
      (data) => {
        setItems(data);
        setItemsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load brands." });
        setItemsLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["label", "icon"]), [
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
      await saveHomeSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: "Trusted-by settings saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_TRUSTED_BY_SETTINGS_UPDATE",
        entityType: "homeTrustedBySettings",
        entityId: SECTION_KEY,
        summary: "Updated Infodrif home trusted-by settings",
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
      await resetHomeSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Trusted-by settings reset to defaults." });
      logAuditEvent({
        module: "home",
        action: "HOME_TRUSTED_BY_SETTINGS_RESET",
        entityType: "homeTrustedBySettings",
        entityId: SECTION_KEY,
        summary: "Reset Infodrif home trusted-by settings to defaults",
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
        await updateTrustedByBrand(modalItem.id, form);
        emitAlert({ type: "success", message: "Brand updated." });
        logAuditEvent({
          module: "home",
          action: "HOME_TRUSTED_BY_BRAND_UPDATE",
          entityType: "homeTrustedByBrand",
          entityId: modalItem.id,
          summary: `Updated trusted-by brand "${form.label}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createTrustedByBrand(form);
        emitAlert({ type: "success", message: "Brand added." });
        logAuditEvent({
          module: "home",
          action: "HOME_TRUSTED_BY_BRAND_CREATE",
          entityType: "homeTrustedByBrand",
          summary: `Created trusted-by brand "${form.label}"`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save brand." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTrustedByBrand(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.label}" deleted.` });
      logAuditEvent({
        module: "home",
        action: "HOME_TRUSTED_BY_BRAND_DELETE",
        entityType: "homeTrustedByBrand",
        entityId: deleteTarget.id,
        summary: `Deleted trusted-by brand "${deleteTarget.label}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete brand." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleTrustedByBrandStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.label}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update brand status." });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] px-6 pb-6">
      <ActionHeader
        title="Home — Trusted By"
        description="The split social-proof heading and the strip of trusted brand logos."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="Trusted-by settings" title="Heading">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <>
              <p className="mb-4 text-xs leading-5 text-[var(--muted)]">
                The heading is stored as three separate fields because the site renders the middle
                one as its own highlighted span. Keep the surrounding spaces — they are what separate
                the words.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Heading prefix" error={errors.headingPrefix}>
                  <input
                    value={draft.headingPrefix || ""}
                    onChange={(event) => setField("headingPrefix", event.target.value)}
                    className={inputClass}
                    placeholder="Trusted by more than "
                  />
                </Field>
                <Field label="Heading highlight" hint="Rendered as the accent span." error={errors.headingHighlight}>
                  <input
                    value={draft.headingHighlight || ""}
                    onChange={(event) => setField("headingHighlight", event.target.value)}
                    className={inputClass}
                    placeholder="100+"
                  />
                </Field>
                <Field label="Heading suffix" error={errors.headingSuffix}>
                  <input
                    value={draft.headingSuffix || ""}
                    onChange={(event) => setField("headingSuffix", event.target.value)}
                    className={inputClass}
                    placeholder=" companies"
                  />
                </Field>
              </div>

              <div className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Preview
                </p>
                <p className="mt-1.5 text-sm font-semibold text-[var(--muted)]">
                  {draft.headingPrefix}
                  <span className="font-bold text-[var(--primary)]">{draft.headingHighlight}</span>
                  {draft.headingSuffix}
                </p>
              </div>
            </>
          )}
        </Panel>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <ItemsToolbar
            search={search}
            onSearchChange={setSearch}
            searchLabel="Search brands"
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            shownCount={filtered.length}
            totalCount={items.length}
            countNoun="brands"
            actions={
              <PrimaryButton
                icon={Plus}
                onClick={() => setModalItem({ ...EMPTY_BRAND, order: nextOrder })}
              >
                Add Brand
              </PrimaryButton>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Label</th>
                  <th className="px-4 py-3">Icon</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {itemsLoading ? (
                  <TableSkeletonRows colSpan={5} />
                ) : filtered.length ? (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                      <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                        {item.label}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 font-mono text-xs font-medium text-[var(--muted)]">
                          {item.icon}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          aria-label={`Toggle ${item.label} status`}
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
                            aria-label={`Edit ${item.label}`}
                          />
                          <IconButton
                            icon={Trash2}
                            tone="danger"
                            onClick={() => setDeleteTarget(item)}
                            aria-label={`Delete ${item.label}`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <TableEmptyState
                    icon={Award}
                    title="No brands found"
                    description="Add the first brand to the trusted-by strip."
                    colSpan={5}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <BrandModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete brand"
          message={`Delete "${deleteTarget.label}" from the trusted-by strip?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset trusted-by settings"
          message="Reset the trusted-by heading back to the default content? Brands are not affected."
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function BrandModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_BRAND, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.label?.trim()) nextErrors.label = "Label is required.";
    if (!form.icon?.trim()) nextErrors.icon = "Pick an icon.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow="Trusted-by brand"
      title={isEdit ? "Edit brand" : "Add brand"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update brand" : "Add brand"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Label" error={errors.label}>
        <input
          value={form.label}
          onChange={(event) => updateField("label", event.target.value)}
          className={inputClass}
          placeholder="logipsum"
        />
      </Field>

      <Field
        label="Icon"
        hint="Stored as a lucide icon name and mapped back by TrustedBy.jsx on the site."
        error={errors.icon}
      >
        <IconSelect
          value={form.icon}
          options={TRUSTED_BY_ICON_NAMES}
          onChange={(value) => updateField("icon", value)}
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
  if (!values.headingPrefix?.trim()) errors.headingPrefix = "Heading prefix is required.";
  if (!values.headingHighlight?.trim()) errors.headingHighlight = "Heading highlight is required.";
  if (!values.headingSuffix?.trim()) errors.headingSuffix = "Heading suffix is required.";
  return errors;
}
