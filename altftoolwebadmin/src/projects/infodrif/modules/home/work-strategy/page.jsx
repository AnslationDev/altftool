"use client";

import { useEffect, useMemo, useState } from "react";
import { PieChart, Pencil, Plus, Save, Sparkles, Trash2 } from "lucide-react";
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
  OptionSelect,
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
  textareaClass,
} from "../components/HomeAdminShared";
import {
  DEFAULT_HOME_SECTIONS,
  SEGMENT_ID_PATTERN,
  WORK_STRATEGY_FEATURE_COLORS,
  WORK_STRATEGY_ICON_NAMES,
  WORK_STRATEGY_SEGMENT_COLORS,
  createWorkStrategyFeature,
  deleteWorkStrategyFeature,
  deleteWorkStrategySegment,
  resetHomeSection,
  saveHomeSection,
  saveWorkStrategySegment,
  subscribeHomeSection,
  subscribeWorkStrategyFeatures,
  subscribeWorkStrategySegments,
  toggleWorkStrategyFeatureStatus,
  toggleWorkStrategySegmentStatus,
  updateWorkStrategyFeature,
} from "../service/home.service";

const SECTION_KEY = "work-strategy";
const ROUTE = "/infodrif/home/work-strategy";
const DEFAULTS = DEFAULT_HOME_SECTIONS[SECTION_KEY];

const EMPTY_SEGMENT = {
  label: "",
  startAngle: 0,
  endAngle: 0,
  id: "",
  color: WORK_STRATEGY_SEGMENT_COLORS[0],
  title: "",
  description: "",
  stats: "",
  order: 0,
  active: true,
};

const EMPTY_FEATURE = {
  icon: WORK_STRATEGY_ICON_NAMES[0],
  title: "",
  desc: "",
  color: WORK_STRATEGY_FEATURE_COLORS[0],
  order: 0,
  active: true,
};

export default function InfodrifHomeWorkStrategyPage() {
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
        emitAlert({ type: "error", message: "Failed to load work-strategy settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  /**
   * `highlightCard` is a NESTED object on the settings document, so it is
   * edited as a group and written back whole. The site merges nested plain
   * objects recursively, so a cleared field falls back key-by-key.
   */
  const setHighlightCardField = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      highlightCard: { ...(prev.highlightCard || {}), [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [`highlightCard.${key}`]: "" }));
  };

  const handleSave = async () => {
    const nextErrors = validateSettings(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveHomeSection(SECTION_KEY, draft);
      emitAlert({ type: "success", message: "Work-strategy settings saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_WORK_STRATEGY_SETTINGS_UPDATE",
        entityType: "homeWorkStrategySettings",
        entityId: SECTION_KEY,
        summary: "Updated Infodrif home work-strategy settings",
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
      emitAlert({ type: "success", message: "Work-strategy settings reset to defaults." });
      logAuditEvent({
        module: "home",
        action: "HOME_WORK_STRATEGY_SETTINGS_RESET",
        entityType: "homeWorkStrategySettings",
        entityId: SECTION_KEY,
        summary: "Reset Infodrif home work-strategy settings to defaults",
        route: ROUTE,
      });
      setConfirmReset(false);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Reset failed." });
    } finally {
      setSaving(false);
    }
  };

  const highlightCard = draft.highlightCard || {};

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] px-6 pb-6">
      <ActionHeader
        title="Home — Work Strategy"
        description="Heading, eyebrow, the highlight card, the arc segments, and the feature list."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="Work-strategy settings" title="Heading & eyebrow">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading line 1" error={errors.headingLine1}>
                <input
                  value={draft.headingLine1 || ""}
                  onChange={(event) => setField("headingLine1", event.target.value)}
                  className={inputClass}
                  placeholder="Smarter Solutions."
                />
              </Field>
              <Field label="Heading line 2" error={errors.headingLine2}>
                <input
                  value={draft.headingLine2 || ""}
                  onChange={(event) => setField("headingLine2", event.target.value)}
                  className={inputClass}
                  placeholder="Stronger Businesses."
                />
              </Field>
              <Field label="Eyebrow line 1" error={errors.eyebrowLine1}>
                <input
                  value={draft.eyebrowLine1 || ""}
                  onChange={(event) => setField("eyebrowLine1", event.target.value)}
                  className={inputClass}
                  placeholder="AI + AUTOMATION + STRATEGY"
                />
              </Field>
              <Field label="Eyebrow line 2" error={errors.eyebrowLine2}>
                <input
                  value={draft.eyebrowLine2 || ""}
                  onChange={(event) => setField("eyebrowLine2", event.target.value)}
                  className={inputClass}
                  placeholder="Build. Grow. Scale."
                />
              </Field>
            </div>
          )}
        </Panel>

        {loading ? null : (
          <Panel
            eyebrow="Work-strategy settings"
            title="Highlight card"
            actions={
              <span className="text-xs font-medium text-[var(--muted)]">
                Nested group on the settings document
              </span>
            }
          >
            <p className="mb-4 text-xs leading-5 text-[var(--muted)]">
              The brand wordmark is split into a prefix and a suffix so the site can style each half
              differently.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Brand prefix" error={errors["highlightCard.brandPrefix"]}>
                <input
                  value={highlightCard.brandPrefix || ""}
                  onChange={(event) => setHighlightCardField("brandPrefix", event.target.value)}
                  className={inputClass}
                  placeholder="Web"
                />
              </Field>
              <Field label="Brand suffix" error={errors["highlightCard.brandSuffix"]}>
                <input
                  value={highlightCard.brandSuffix || ""}
                  onChange={(event) => setHighlightCardField("brandSuffix", event.target.value)}
                  className={inputClass}
                  placeholder="FX"
                />
              </Field>
              <Field label="Card title" error={errors["highlightCard.title"]}>
                <input
                  value={highlightCard.title || ""}
                  onChange={(event) => setHighlightCardField("title", event.target.value)}
                  className={inputClass}
                  placeholder="Revenue Engine"
                />
              </Field>
              <Field label="Stat value" error={errors["highlightCard.statValue"]}>
                <input
                  value={highlightCard.statValue || ""}
                  onChange={(event) => setHighlightCardField("statValue", event.target.value)}
                  className={inputClass}
                  placeholder="15%"
                />
              </Field>
              <Field label="Stat label" error={errors["highlightCard.statLabel"]}>
                <input
                  value={highlightCard.statLabel || ""}
                  onChange={(event) => setHighlightCardField("statLabel", event.target.value)}
                  className={inputClass}
                  placeholder="Higher Lead Growth"
                />
              </Field>
              <Field label="Card status" hint="Hides just the highlight card, not the section.">
                <ActiveToggle
                  active={highlightCard.active !== false}
                  onChange={(value) => setHighlightCardField("active", value)}
                />
              </Field>
            </div>
          </Panel>
        )}

        <SegmentsPanel />
        <FeaturesPanel />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset work-strategy settings"
          message="Reset the heading, eyebrow, and highlight card back to the default content? Segments and features are not affected."
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
/* Segments — arc geometry                                                    */
/* -------------------------------------------------------------------------- */

function SegmentsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeWorkStrategySegments(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load segments." });
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(
    () => filterItems(items, search, statusFilter, ["label", "title", "id"]),
    [items, search, statusFilter],
  );
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form, previousId) => {
    setItemSaving(true);
    try {
      await saveWorkStrategySegment(form, previousId);
      emitAlert({ type: "success", message: previousId ? "Segment updated." : "Segment added." });
      logAuditEvent({
        module: "home",
        action: previousId ? "HOME_WORK_STRATEGY_SEGMENT_UPDATE" : "HOME_WORK_STRATEGY_SEGMENT_CREATE",
        entityType: "homeWorkStrategySegment",
        entityId: form.id,
        summary: `${previousId ? "Updated" : "Created"} work-strategy segment "${form.label}"`,
        changes: form,
        route: ROUTE,
      });
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save segment." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteWorkStrategySegment(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.label}" deleted.` });
      logAuditEvent({
        module: "home",
        action: "HOME_WORK_STRATEGY_SEGMENT_DELETE",
        entityType: "homeWorkStrategySegment",
        entityId: deleteTarget.id,
        summary: `Deleted work-strategy segment "${deleteTarget.label}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete segment." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleWorkStrategySegmentStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.label}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update segment status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search segments"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="segments"
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_SEGMENT, order: nextOrder })}
          >
            Add Segment
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            Arc segments
            <span className="ml-2 text-xs font-medium text-[var(--muted)]">
              Each segment draws one arc of the interactive wheel.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Label</th>
              <th className="px-4 py-3">Arc ID</th>
              <th className="px-4 py-3">Angles</th>
              <th className="px-4 py-3">Colour</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <TableSkeletonRows colSpan={7} />
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-[var(--foreground)]">{item.label}</p>
                    <p className="text-xs text-[var(--muted)]">{item.title}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 font-mono text-xs font-medium text-[var(--muted)]">
                      {item.id}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {item.startAngle}° → {item.endAngle}°
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{item.color}</td>
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
                icon={PieChart}
                title="No segments found"
                description="Add the first arc segment of the strategy wheel."
                colSpan={7}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <SegmentModal
          item={modalItem.id ? modalItem : null}
          existingIds={items.map((item) => item.id)}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete segment"
          message={`Delete the "${deleteTarget.label}" arc segment?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function SegmentModal({ item, existingIds, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_SEGMENT, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);
  const previousId = item?.id;

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.label?.trim()) nextErrors.label = "Label is required.";
    if (!form.title?.trim()) nextErrors.title = "Title is required.";
    if (!form.description?.trim()) nextErrors.description = "Description is required.";
    if (!form.stats?.trim()) nextErrors.stats = "Stats text is required.";
    if (!form.color?.trim()) nextErrors.color = "Pick a colour.";

    const arcId = String(form.id || "").trim();
    if (!arcId) {
      nextErrors.id = "Arc ID is required.";
    } else if (!SEGMENT_ID_PATTERN.test(arcId)) {
      nextErrors.id = "Start with a letter; letters, numbers, hyphen, and underscore only.";
    } else if (arcId !== previousId && existingIds.includes(arcId)) {
      nextErrors.id = "Another segment already uses this arc ID.";
    }

    if (!Number.isFinite(Number(form.startAngle))) nextErrors.startAngle = "Enter a number.";
    if (!Number.isFinite(Number(form.endAngle))) nextErrors.endAngle = "Enter a number.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form, previousId);
  };

  return (
    <ModalShell
      eyebrow="Work-strategy segment"
      title={isEdit ? "Edit segment" : "Add segment"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update segment" : "Add segment"}
          </PrimaryButton>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Label" hint="Curved text drawn along the arc." error={errors.label}>
          <input
            value={form.label}
            onChange={(event) => updateField("label", event.target.value)}
            className={inputClass}
            placeholder="Acquisition"
          />
        </Field>
        <Field label="Title" error={errors.title}>
          <input
            value={form.title}
            onChange={(event) => updateField("title", event.target.value)}
            className={inputClass}
            placeholder="Customer Acquisition"
          />
        </Field>
      </div>

      <Field label="Description" error={errors.description}>
        <textarea
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={3}
          className={textareaClass}
        />
      </Field>

      <Field label="Stats" hint="Short proof point shown on the active segment." error={errors.stats}>
        <input
          value={form.stats}
          onChange={(event) => updateField("stats", event.target.value)}
          className={inputClass}
          placeholder="+38% Conversion"
        />
      </Field>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          Arc geometry
        </p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
          Angles are degrees around the wheel. The arc ID is also the document ID and is referenced
          by the SVG that curves the label text — it must be unique.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Start angle" error={errors.startAngle}>
            <input
              type="number"
              value={form.startAngle}
              onChange={(event) => updateField("startAngle", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="End angle" error={errors.endAngle}>
            <input
              type="number"
              value={form.endAngle}
              onChange={(event) => updateField("endAngle", event.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Arc ID" error={errors.id}>
            <input
              value={form.id}
              onChange={(event) => updateField("id", event.target.value)}
              className={inputClass}
              placeholder="arc1"
            />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Colour" error={errors.color}>
          <OptionSelect
            value={form.color}
            options={WORK_STRATEGY_SEGMENT_COLORS}
            onChange={(value) => updateField("color", value)}
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

/* -------------------------------------------------------------------------- */
/* Features                                                                   */
/* -------------------------------------------------------------------------- */

function FeaturesPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeWorkStrategyFeatures(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load features." });
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["title", "desc"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateWorkStrategyFeature(modalItem.id, form);
        emitAlert({ type: "success", message: "Feature updated." });
        logAuditEvent({
          module: "home",
          action: "HOME_WORK_STRATEGY_FEATURE_UPDATE",
          entityType: "homeWorkStrategyFeature",
          entityId: modalItem.id,
          summary: `Updated work-strategy feature "${form.title}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createWorkStrategyFeature(form);
        emitAlert({ type: "success", message: "Feature added." });
        logAuditEvent({
          module: "home",
          action: "HOME_WORK_STRATEGY_FEATURE_CREATE",
          entityType: "homeWorkStrategyFeature",
          summary: `Created work-strategy feature "${form.title}"`,
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
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteWorkStrategyFeature(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.title}" deleted.` });
      logAuditEvent({
        module: "home",
        action: "HOME_WORK_STRATEGY_FEATURE_DELETE",
        entityType: "homeWorkStrategyFeature",
        entityId: deleteTarget.id,
        summary: `Deleted work-strategy feature "${deleteTarget.title}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete feature." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleWorkStrategyFeatureStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.title}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update feature status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search features"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="features"
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_FEATURE, order: nextOrder })}
          >
            Add Feature
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            Features
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Icon</th>
              <th className="px-4 py-3">Colour</th>
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
                    <p className="font-semibold text-[var(--foreground)]">{item.title}</p>
                    <p className="text-xs text-[var(--muted)]">{item.desc}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-[var(--surface-soft)] px-2 py-1 font-mono text-xs font-medium text-[var(--muted)]">
                      {item.icon}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">{item.color}</td>
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
                icon={Sparkles}
                title="No features found"
                description="Add the first work-strategy feature."
                colSpan={6}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <FeatureModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete feature"
          message={`Delete the "${deleteTarget.title}" feature?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function FeatureModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_FEATURE, order: nextOrder });
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
    if (!form.desc?.trim()) nextErrors.desc = "Description is required.";
    if (!form.icon?.trim()) nextErrors.icon = "Pick an icon.";
    if (!form.color?.trim()) nextErrors.color = "Pick a colour.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow="Work-strategy feature"
      title={isEdit ? "Edit feature" : "Add feature"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update feature" : "Add feature"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Title" error={errors.title}>
        <input
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          className={inputClass}
          placeholder="Work Smarter"
        />
      </Field>

      <Field label="Description" error={errors.desc}>
        <input
          value={form.desc}
          onChange={(event) => updateField("desc", event.target.value)}
          className={inputClass}
          placeholder="Save time, boost efficiency"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Icon"
          hint="Mapped back by WorkStretegy.jsx on the site."
          error={errors.icon}
        >
          <IconSelect
            value={form.icon}
            options={WORK_STRATEGY_ICON_NAMES}
            onChange={(value) => updateField("icon", value)}
          />
        </Field>
        <Field
          label="Colour"
          hint="A Tailwind text class the site's build already emits."
          error={errors.color}
        >
          <OptionSelect
            value={form.color}
            options={WORK_STRATEGY_FEATURE_COLORS}
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
  if (!values.headingLine1?.trim()) errors.headingLine1 = "Heading line 1 is required.";
  if (!values.headingLine2?.trim()) errors.headingLine2 = "Heading line 2 is required.";
  if (!values.eyebrowLine1?.trim()) errors.eyebrowLine1 = "Eyebrow line 1 is required.";
  if (!values.eyebrowLine2?.trim()) errors.eyebrowLine2 = "Eyebrow line 2 is required.";

  const card = values.highlightCard || {};
  if (!card.brandPrefix?.trim()) errors["highlightCard.brandPrefix"] = "Brand prefix is required.";
  if (!card.brandSuffix?.trim()) errors["highlightCard.brandSuffix"] = "Brand suffix is required.";
  if (!card.title?.trim()) errors["highlightCard.title"] = "Card title is required.";
  if (!card.statValue?.trim()) errors["highlightCard.statValue"] = "Stat value is required.";
  if (!card.statLabel?.trim()) errors["highlightCard.statLabel"] = "Stat label is required.";
  return errors;
}
