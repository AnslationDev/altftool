"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutGrid, Pencil, Plus, Save, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ActionHeader,
  ActiveToggle,
  Field,
  IconButton,
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
} from "../components/HomeAdminShared";
import {
  DEFAULT_HOME_SECTIONS,
  SHOWCASE_COLORS,
  SHOWCASE_ROWS,
  createShowcaseCard,
  deleteShowcaseCard,
  resetHomeSection,
  saveHomeSection,
  subscribeHomeSection,
  subscribeShowcaseRow,
  toggleShowcaseCardStatus,
  updateShowcaseCard,
} from "../service/home.service";

const SECTION_KEY = "showcase";
const ROUTE = "/infodrif/home/showcase";
const DEFAULTS = DEFAULT_HOME_SECTIONS[SECTION_KEY];

const EMPTY_CARD = {
  name: "",
  desc: "",
  logo: "",
  color: SHOWCASE_COLORS[0],
  order: 0,
  active: true,
};

export default function InfodrifHomeShowcasePage() {
  const [saved, setSaved] = useState(DEFAULTS);
  const [draft, setDraft] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    return subscribeHomeSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load showcase settings." });
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
      await saveHomeSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: "Showcase settings saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_SHOWCASE_SETTINGS_UPDATE",
        entityType: "homeShowcaseSettings",
        entityId: SECTION_KEY,
        summary: "Updated Infodrif home showcase settings",
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
      emitAlert({ type: "success", message: "Showcase settings reset to defaults." });
      logAuditEvent({
        module: "home",
        action: "HOME_SHOWCASE_SETTINGS_RESET",
        entityType: "homeShowcaseSettings",
        entityId: SECTION_KEY,
        summary: "Reset Infodrif home showcase settings to defaults",
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
        title="Home — Showcase"
        description="The integrations heading and the three scrolling rows of app cards."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="Showcase settings" title="Heading">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Heading" error={errors.heading}>
                <input
                  value={draft.heading || ""}
                  onChange={(event) => setField("heading", event.target.value)}
                  className={inputClass}
                  placeholder="One marketing platform to unite 300+ apps"
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
            </div>
          )}
        </Panel>

        {SHOWCASE_ROWS.map((row) => (
          <ShowcaseRowPanel key={row.key} rowKey={row.key} rowLabel={row.label} />
        ))}
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset showcase settings"
          message="Reset the showcase heading back to the default content? The card rows are not affected."
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function ShowcaseRowPanel({ rowKey, rowLabel }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeShowcaseRow(
      rowKey,
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: `Failed to load ${rowLabel} cards.` });
        setLoading(false);
      },
    );
  }, [rowKey, rowLabel]);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["name", "desc"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateShowcaseCard(rowKey, modalItem.id, form);
        emitAlert({ type: "success", message: "Card updated." });
        logAuditEvent({
          module: "home",
          action: "HOME_SHOWCASE_CARD_UPDATE",
          entityType: "homeShowcaseCard",
          entityId: modalItem.id,
          summary: `Updated showcase card "${form.name}" in ${rowLabel}`,
          changes: { ...form, row: rowKey },
          route: ROUTE,
        });
      } else {
        await createShowcaseCard(rowKey, form);
        emitAlert({ type: "success", message: "Card added." });
        logAuditEvent({
          module: "home",
          action: "HOME_SHOWCASE_CARD_CREATE",
          entityType: "homeShowcaseCard",
          summary: `Created showcase card "${form.name}" in ${rowLabel}`,
          changes: { ...form, row: rowKey },
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save card." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteShowcaseCard(rowKey, deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.name}" deleted.` });
      logAuditEvent({
        module: "home",
        action: "HOME_SHOWCASE_CARD_DELETE",
        entityType: "homeShowcaseCard",
        entityId: deleteTarget.id,
        summary: `Deleted showcase card "${deleteTarget.name}" from ${rowLabel}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete card." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleShowcaseCardStatus(rowKey, item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.name}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update card status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel={`Search ${rowLabel} cards`}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="cards"
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_CARD, order: nextOrder })}
          >
            Add Card
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            {rowLabel}
            <span className="ml-2 text-xs font-medium text-[var(--muted)]">
              One scrolling row of integration cards.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">App</th>
              <th className="px-4 py-3">Logo</th>
              <th className="px-4 py-3">Colour</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <TableSkeletonRows colSpan={6} rows={3} />
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--foreground)]">{item.name}</p>
                    <p className="line-clamp-1 text-xs text-[var(--muted)]">{item.desc}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] text-xs font-bold text-[var(--foreground)]">
                      {item.logo}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{item.color}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      aria-label={`Toggle ${item.name} status`}
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
                        aria-label={`Edit ${item.name}`}
                      />
                      <IconButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.name}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyState
                icon={LayoutGrid}
                title={`No cards in ${rowLabel}`}
                description="Add the first integration card for this row."
                colSpan={6}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <ShowcaseCardModal
          rowLabel={rowLabel}
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete showcase card"
          message={`Delete "${deleteTarget.name}" from ${rowLabel}?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function ShowcaseCardModal({ rowLabel, item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_CARD, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Name is required.";
    if (!form.desc?.trim()) nextErrors.desc = "Description is required.";
    if (!form.logo?.trim()) nextErrors.logo = "Logo text is required.";
    if (!form.color?.trim()) nextErrors.color = "Pick a colour.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow={`Showcase card — ${rowLabel}`}
      title={isEdit ? "Edit card" : "Add card"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update card" : "Add card"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Name" error={errors.name}>
        <input
          value={form.name}
          onChange={(event) => updateField("name", event.target.value)}
          className={inputClass}
          placeholder="Canva"
        />
      </Field>

      <Field label="Description" error={errors.desc}>
        <textarea
          value={form.desc}
          onChange={(event) => updateField("desc", event.target.value)}
          rows={2}
          className={textareaClass}
          placeholder="Create content in Canva and seamlessly use it in Mailchimp"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Logo"
          hint="A short glyph or wordmark shown in the tile, e.g. “C”, “Woo”, “⌘”."
          error={errors.logo}
        >
          <input
            value={form.logo}
            onChange={(event) => updateField("logo", event.target.value)}
            className={inputClass}
            placeholder="C"
          />
        </Field>
        <Field
          label="Colour"
          hint="A Tailwind background class the site's build already emits."
          error={errors.color}
        >
          <OptionSelect
            value={form.color}
            options={SHOWCASE_COLORS}
            onChange={(value) => updateField("color", value)}
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
          <ActiveToggle active={form.active} onChange={(value) => updateField("active", value)} />
        </Field>
      </div>
    </ModalShell>
  );
}

function validateSettings(values) {
  const errors = {};
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.subheading?.trim()) errors.subheading = "Subheading is required.";
  return errors;
}
