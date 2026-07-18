"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, Pencil, Plus, Save, Trash2 } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ActionHeader,
  ActiveToggle,
  Field,
  IconButton,
  IconSelect,
  ImagePairField,
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
  isSafeUrl,
  isValidOrder,
  nextOrderFor,
  textareaClass,
} from "../components/AboutAdminShared";
import {
  ABOUT_HERO_STAT_COLORS,
  ABOUT_HERO_STAT_ICON_NAMES,
  DEFAULT_ABOUT_HERO,
  createAboutHeroStat,
  deleteAboutHeroImage,
  deleteAboutHeroStat,
  resetAboutHero,
  saveAboutHero,
  subscribeAboutHero,
  subscribeAboutHeroStats,
  toggleAboutHeroStatStatus,
  updateAboutHeroStat,
  uploadAboutHeroImage,
} from "../service/about.service";

const ROUTE = "/infodrif/about/hero";

const EMPTY_STAT = {
  icon: ABOUT_HERO_STAT_ICON_NAMES[0],
  value: 0,
  suffix: "+",
  label: "",
  color: ABOUT_HERO_STAT_COLORS[0],
  order: 0,
  active: true,
};

export default function InfodrifAboutHeroPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_HERO);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_HERO);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return subscribeAboutHero(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about hero settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadAboutHeroImage({ file, onProgress: setUploadProgress });
      // imageUrl + imagePath always move together: imagePath is the Storage
      // handle needed to delete the blob later.
      setDraft((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      emitAlert({ type: "success", message: "Hero image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Hero image upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const previousPath = draft.imagePath;
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    if (!previousPath) return;
    try {
      await deleteAboutHeroImage(previousPath);
      emitAlert({ type: "success", message: "Hero image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Hero image cleared from the form, but Storage cleanup failed.",
      });
    }
  };

  const handleSave = async () => {
    const nextErrors = validateSettings(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveAboutHero({
        ...draft,
        // Next/Image needs real numbers, not the strings a number input yields.
        imageWidth: Number(draft.imageWidth) || 0,
        imageHeight: Number(draft.imageHeight) || 0,
      });
      emitAlert({ type: "success", message: "About hero settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_HERO_SETTINGS_UPDATE",
        entityType: "aboutHeroSettings",
        entityId: "hero",
        summary: "Updated Infodrif about hero settings",
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
      await resetAboutHero();
      emitAlert({ type: "success", message: "About hero settings reset to defaults." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_HERO_SETTINGS_RESET",
        entityType: "aboutHeroSettings",
        entityId: "hero",
        summary: "Reset Infodrif about hero settings to defaults",
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
        title="About — Hero"
        description="Split headline, paragraph, CTA, hero image, and the animated counter stats."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        disabled={uploading}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="About hero settings" title="Headline">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <Field label="Eyebrow" error={errors.eyebrow}>
                <input
                  value={draft.eyebrow || ""}
                  onChange={(event) => setField("eyebrow", event.target.value)}
                  className={inputClass}
                  placeholder="AI EXCELLENCE SINCE 2021"
                />
              </Field>

              <p className="text-xs leading-5 text-[var(--muted)]">
                The headline is stored as three separate fields because the site renders each part as
                its own styled span.
              </p>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Heading" error={errors.heading}>
                  <input
                    value={draft.heading || ""}
                    onChange={(event) => setField("heading", event.target.value)}
                    className={inputClass}
                    placeholder="AI Consulting"
                  />
                </Field>
                <Field label="Heading connector" error={errors.headingConnector}>
                  <input
                    value={draft.headingConnector || ""}
                    onChange={(event) => setField("headingConnector", event.target.value)}
                    className={inputClass}
                    placeholder="That"
                  />
                </Field>
                <Field label="Heading accent" error={errors.headingAccent}>
                  <input
                    value={draft.headingAccent || ""}
                    onChange={(event) => setField("headingAccent", event.target.value)}
                    className={inputClass}
                    placeholder="Delivers Results"
                  />
                </Field>
              </div>

              <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  Preview
                </p>
                <p className="mt-1.5 text-sm font-bold text-[var(--foreground)]">
                  {draft.heading} {draft.headingConnector}{" "}
                  <span className="text-[var(--primary)]">{draft.headingAccent}</span>
                </p>
              </div>

              <Field label="Paragraph" error={errors.paragraph}>
                <textarea
                  value={draft.paragraph || ""}
                  onChange={(event) => setField("paragraph", event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CTA label" error={errors.ctaLabel}>
                  <input
                    value={draft.ctaLabel || ""}
                    onChange={(event) => setField("ctaLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Get Strategy"
                  />
                </Field>
                <Field label="CTA link" error={errors.ctaHref}>
                  <input
                    value={draft.ctaHref || ""}
                    onChange={(event) => setField("ctaHref", event.target.value)}
                    className={inputClass}
                    placeholder="/contact"
                  />
                </Field>
              </div>
            </div>
          )}
        </Panel>

        {loading ? null : (
          <Panel eyebrow="About hero settings" title="Hero image">
            <ImagePairField
              label="Hero illustration"
              hint="Rendered with next/image, so width and height must match the asset's aspect ratio."
              error={errors.imageUrl}
              imageUrl={draft.imageUrl}
              imagePath={draft.imagePath}
              onChange={({ imageUrl, imagePath }) =>
                setDraft((prev) => ({ ...prev, imageUrl, imagePath }))
              }
              onUpload={handleUpload}
              onRemove={handleRemoveImage}
              uploading={uploading}
              uploadProgress={uploadProgress}
              previewClass="h-24 w-32"
            />

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Image alt" error={errors.imageAlt}>
                <input
                  value={draft.imageAlt || ""}
                  onChange={(event) => setField("imageAlt", event.target.value)}
                  className={inputClass}
                  placeholder="Brand Illustration"
                />
              </Field>
              <Field label="Image width (px)" error={errors.imageWidth}>
                <input
                  type="number"
                  min="1"
                  value={draft.imageWidth ?? ""}
                  onChange={(event) => setField("imageWidth", event.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Image height (px)" error={errors.imageHeight}>
                <input
                  type="number"
                  min="1"
                  value={draft.imageHeight ?? ""}
                  onChange={(event) => setField("imageHeight", event.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>
          </Panel>
        )}

        <StatsPanel />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset about hero settings"
          message="Reset the about hero settings back to the default content? The stats are not affected."
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
/* Stats — numeric value + string suffix, fed to a CountUp animator           */
/* -------------------------------------------------------------------------- */

function StatsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeAboutHeroStats(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load hero stats." });
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["label", "icon"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateAboutHeroStat(modalItem.id, form);
        emitAlert({ type: "success", message: "Stat updated." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_HERO_STAT_UPDATE",
          entityType: "aboutHeroStat",
          entityId: modalItem.id,
          summary: `Updated about hero stat "${form.label}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createAboutHeroStat(form);
        emitAlert({ type: "success", message: "Stat added." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_HERO_STAT_CREATE",
          entityType: "aboutHeroStat",
          summary: `Created about hero stat "${form.label}"`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save stat." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutHeroStat(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.label}" deleted.` });
      logAuditEvent({
        module: "about",
        action: "ABOUT_HERO_STAT_DELETE",
        entityType: "aboutHeroStat",
        entityId: deleteTarget.id,
        summary: `Deleted about hero stat "${deleteTarget.label}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete stat." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAboutHeroStatStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.label}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update stat status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search stats"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="stats"
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_STAT, order: nextOrder })}
          >
            Add Stat
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            Hero stats
            <span className="ml-2 text-xs font-medium text-[var(--muted)]">
              The number counts up on scroll, then the suffix is appended.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Stat</th>
              <th className="px-4 py-3">Icon</th>
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
                    <p className="font-semibold text-[var(--foreground)]">
                      {item.value}
                      {item.suffix}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{item.label}</p>
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
                icon={BarChart3}
                title="No stats found"
                description="Add the first about hero stat."
                colSpan={6}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <StatModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete stat"
          message={`Delete the "${deleteTarget.label}" stat?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function StatModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_STAT, order: nextOrder });
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
    if (!form.color?.trim()) nextErrors.color = "Pick a colour.";
    if (!Number.isFinite(Number(form.value))) {
      nextErrors.value = "Value must be a number — put any symbol in the suffix.";
    }
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    // `value` is saved as a NUMBER: the site's CountUp does arithmetic on it.
    onSave({ ...form, value: Number(form.value) });
  };

  return (
    <ModalShell
      eyebrow="About hero stat"
      title={isEdit ? "Edit stat" : "Add stat"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update stat" : "Add stat"}
          </PrimaryButton>
        </>
      }
    >
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
          Counter
        </p>
        <p className="mt-1.5 text-xs leading-5 text-[var(--muted)]">
          The value animates from zero on scroll, so it must be a plain number. Any symbol — “+”,
          “%”, “k” — belongs in the suffix.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Value (number)" error={errors.value}>
            <input
              type="number"
              value={form.value}
              onChange={(event) => updateField("value", event.target.value)}
              className={inputClass}
              placeholder="250"
            />
          </Field>
          <Field label="Suffix" error={errors.suffix}>
            <input
              value={form.suffix}
              onChange={(event) => updateField("suffix", event.target.value)}
              className={inputClass}
              placeholder="+"
            />
          </Field>
        </div>

        <p className="mt-3 text-xs font-semibold text-[var(--foreground)]">
          Renders as: {Number(form.value) || 0}
          {form.suffix}
        </p>
      </div>

      <Field label="Label" error={errors.label}>
        <input
          value={form.label}
          onChange={(event) => updateField("label", event.target.value)}
          className={inputClass}
          placeholder="Expert AI Consultants"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Icon" hint="Mapped back by AboutHero.jsx on the site." error={errors.icon}>
          <IconSelect
            value={form.icon}
            options={ABOUT_HERO_STAT_ICON_NAMES}
            onChange={(value) => updateField("icon", value)}
          />
        </Field>
        <Field
          label="Colour"
          hint="A Tailwind gradient pair the site's build already emits."
          error={errors.color}
        >
          <OptionSelect
            value={form.color}
            options={ABOUT_HERO_STAT_COLORS}
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
  if (!values.eyebrow?.trim()) errors.eyebrow = "Eyebrow is required.";
  if (!values.heading?.trim()) errors.heading = "Heading is required.";
  if (!values.headingConnector?.trim()) errors.headingConnector = "Heading connector is required.";
  if (!values.headingAccent?.trim()) errors.headingAccent = "Heading accent is required.";
  if (!values.paragraph?.trim()) errors.paragraph = "Paragraph is required.";
  if (!values.ctaLabel?.trim()) errors.ctaLabel = "CTA label is required.";
  if (!values.ctaHref?.trim()) errors.ctaHref = "CTA link is required.";
  else if (!isSafeUrl(values.ctaHref)) errors.ctaHref = "Use a relative path or an http(s) URL.";
  if (values.imageUrl?.trim() && !isSafeUrl(values.imageUrl)) {
    errors.imageUrl = "Use a relative path or an http(s) URL.";
  }
  if (!values.imageAlt?.trim()) errors.imageAlt = "Image alt text is required.";
  if (!(Number(values.imageWidth) > 0)) errors.imageWidth = "Width must be greater than zero.";
  if (!(Number(values.imageHeight) > 0)) errors.imageHeight = "Height must be greater than zero.";
  return errors;
}
