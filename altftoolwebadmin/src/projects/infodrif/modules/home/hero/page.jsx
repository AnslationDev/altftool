"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Pencil, Plus, Save, Trash2, Type, Users } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  ActionHeader,
  ActiveToggle,
  Field,
  IconButton,
  ImagePairField,
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
  isSafeUrl,
  isValidOrder,
  nextOrderFor,
  textareaClass,
} from "../components/HomeAdminShared";
import {
  DEFAULT_HOME_SECTIONS,
  createHeroCustomerAvatar,
  createHeroRotatingWord,
  createHeroTeamAvatar,
  deleteCustomerAvatarImage,
  deleteHeroCustomerAvatar,
  deleteHeroImage,
  deleteHeroRotatingWord,
  deleteHeroTeamAvatar,
  deleteTeamAvatarImage,
  resetHomeSection,
  saveHomeSection,
  subscribeHeroCustomerAvatars,
  subscribeHeroRotatingWords,
  subscribeHeroTeamAvatars,
  subscribeHomeSection,
  toggleHeroCustomerAvatarStatus,
  toggleHeroRotatingWordStatus,
  toggleHeroTeamAvatarStatus,
  updateHeroCustomerAvatar,
  updateHeroRotatingWord,
  updateHeroTeamAvatar,
  uploadCustomerAvatarImage,
  uploadHeroImage,
  uploadTeamAvatarImage,
} from "../service/home.service";

const SECTION_KEY = "hero";
const ROUTE = "/infodrif/home/hero";
const DEFAULTS = DEFAULT_HOME_SECTIONS[SECTION_KEY];

const EMPTY_WORD = { text: "", order: 0, active: true };
const EMPTY_AVATAR = { imageUrl: "", imagePath: "", alt: "", order: 0, active: true };

/** The two avatar strips are identical in shape, so one config drives both. */
const AVATAR_STRIPS = {
  customerAvatars: {
    label: "Customer avatars",
    noun: "avatars",
    entityType: "homeHeroCustomerAvatar",
    actionPrefix: "HOME_HERO_CUSTOMER_AVATAR",
    subscribe: subscribeHeroCustomerAvatars,
    create: createHeroCustomerAvatar,
    update: updateHeroCustomerAvatar,
    remove: deleteHeroCustomerAvatar,
    toggle: toggleHeroCustomerAvatarStatus,
    upload: uploadCustomerAvatarImage,
    removeImage: deleteCustomerAvatarImage,
  },
  teamAvatars: {
    label: "Team avatars",
    noun: "avatars",
    entityType: "homeHeroTeamAvatar",
    actionPrefix: "HOME_HERO_TEAM_AVATAR",
    subscribe: subscribeHeroTeamAvatars,
    create: createHeroTeamAvatar,
    update: updateHeroTeamAvatar,
    remove: deleteHeroTeamAvatar,
    toggle: toggleHeroTeamAvatarStatus,
    upload: uploadTeamAvatarImage,
    removeImage: deleteTeamAvatarImage,
  },
};

export default function InfodrifHomeHeroPage() {
  const [saved, setSaved] = useState(DEFAULTS);
  const [draft, setDraft] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    return subscribeHomeSection(
      SECTION_KEY,
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load hero settings." });
        setLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const setField = (key, value) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUploadHeroImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadHeroImage({ file, onProgress: setUploadProgress });
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

  const handleRemoveHeroImage = async () => {
    const previousPath = draft.imagePath;
    setDraft((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    if (!previousPath) return;
    try {
      await deleteHeroImage(previousPath);
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
      await saveHomeSection(SECTION_KEY, {
        ...draft,
        // Next/Image needs real numbers, not the strings a number input yields.
        imageWidth: Number(draft.imageWidth) || 0,
        imageHeight: Number(draft.imageHeight) || 0,
      });
      emitAlert({ type: "success", message: "Hero settings saved." });
      logAuditEvent({
        module: "home",
        action: "HOME_HERO_SETTINGS_UPDATE",
        entityType: "homeHeroSettings",
        entityId: SECTION_KEY,
        summary: "Updated Infodrif home hero settings",
        changes: draft,
        route: ROUTE,
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save hero settings." });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      await resetHomeSection(SECTION_KEY);
      emitAlert({ type: "success", message: "Hero settings reset to defaults." });
      logAuditEvent({
        module: "home",
        action: "HOME_HERO_SETTINGS_RESET",
        entityType: "homeHeroSettings",
        entityId: SECTION_KEY,
        summary: "Reset Infodrif home hero settings to defaults",
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
        title="Home — Hero"
        description="Badge, headline, CTA, rating, stats, hero image, and the avatar strips."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        disabled={uploading}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="Hero settings" title="Headline & badge">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-[120px_minmax(0,1fr)]">
                <Field label="Badge emoji" error={errors.badgeEmoji}>
                  <input
                    value={draft.badgeEmoji || ""}
                    onChange={(event) => setField("badgeEmoji", event.target.value)}
                    className={inputClass}
                    placeholder="🚀"
                  />
                </Field>
                <Field label="Badge text" error={errors.badgeText}>
                  <input
                    value={draft.badgeText || ""}
                    onChange={(event) => setField("badgeText", event.target.value)}
                    className={inputClass}
                    placeholder="#1 Performance Marketing Agency"
                  />
                </Field>
              </div>

              <Field
                label="Heading line 1"
                hint="The static half of the headline. The animated half comes from the rotating words below."
                error={errors.headingLine1}
              >
                <input
                  value={draft.headingLine1 || ""}
                  onChange={(event) => setField("headingLine1", event.target.value)}
                  className={inputClass}
                  placeholder="Smart Ideas"
                />
              </Field>

              <Field label="Subheading" error={errors.subheading}>
                <textarea
                  value={draft.subheading || ""}
                  onChange={(event) => setField("subheading", event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </Field>
            </div>
          )}
        </Panel>

        {loading ? null : (
          <>
            <Panel eyebrow="Hero settings" title="Call to action & social proof">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="CTA label" error={errors.ctaLabel}>
                  <input
                    value={draft.ctaLabel || ""}
                    onChange={(event) => setField("ctaLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Get Started"
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
                <Field label="Customers label" error={errors.customersLabel}>
                  <input
                    value={draft.customersLabel || ""}
                    onChange={(event) => setField("customersLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Our Happy Customers"
                  />
                </Field>
                <Field label="Team label" error={errors.teamLabel}>
                  <input
                    value={draft.teamLabel || ""}
                    onChange={(event) => setField("teamLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Team Members"
                  />
                </Field>
                <Field label="Rating value" error={errors.ratingValue}>
                  <input
                    value={draft.ratingValue || ""}
                    onChange={(event) => setField("ratingValue", event.target.value)}
                    className={inputClass}
                    placeholder="4.9"
                  />
                </Field>
                <Field label="Rating label" error={errors.ratingLabel}>
                  <input
                    value={draft.ratingLabel || ""}
                    onChange={(event) => setField("ratingLabel", event.target.value)}
                    className={inputClass}
                    placeholder="(15k Reviews)"
                  />
                </Field>
                <Field label="Stat value" error={errors.statValue}>
                  <input
                    value={draft.statValue || ""}
                    onChange={(event) => setField("statValue", event.target.value)}
                    className={inputClass}
                    placeholder="250+"
                  />
                </Field>
                <Field label="Stat label" error={errors.statLabel}>
                  <input
                    value={draft.statLabel || ""}
                    onChange={(event) => setField("statLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Projects Completed"
                  />
                </Field>
              </div>
            </Panel>

            <Panel eyebrow="Hero settings" title="Hero image">
              <ImagePairField
                label="Hero illustration"
                hint="Rendered with next/image, so width and height must match the asset's aspect ratio."
                error={errors.imageUrl}
                imageUrl={draft.imageUrl}
                imagePath={draft.imagePath}
                onChange={({ imageUrl, imagePath }) =>
                  setDraft((prev) => ({ ...prev, imageUrl, imagePath }))
                }
                onUpload={handleUploadHeroImage}
                onRemove={handleRemoveHeroImage}
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
          </>
        )}

        <RotatingWordsPanel />
        <AvatarsPanel stripKey="customerAvatars" />
        <AvatarsPanel stripKey="teamAvatars" />
      </div>

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset hero settings"
          message="Reset the hero settings back to the default content? Rotating words and avatars are not affected."
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
/* Rotating words                                                             */
/* -------------------------------------------------------------------------- */

function RotatingWordsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return subscribeHeroRotatingWords(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load rotating words." });
        setLoading(false);
      },
    );
  }, []);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["text"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateHeroRotatingWord(modalItem.id, form);
        emitAlert({ type: "success", message: "Rotating word updated." });
        logAuditEvent({
          module: "home",
          action: "HOME_HERO_ROTATING_WORD_UPDATE",
          entityType: "homeHeroRotatingWord",
          entityId: modalItem.id,
          summary: `Updated hero rotating word "${form.text}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createHeroRotatingWord(form);
        emitAlert({ type: "success", message: "Rotating word added." });
        logAuditEvent({
          module: "home",
          action: "HOME_HERO_ROTATING_WORD_CREATE",
          entityType: "homeHeroRotatingWord",
          summary: `Created hero rotating word "${form.text}"`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save rotating word." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteHeroRotatingWord(deleteTarget.id);
      emitAlert({ type: "success", message: `"${deleteTarget.text}" deleted.` });
      logAuditEvent({
        module: "home",
        action: "HOME_HERO_ROTATING_WORD_DELETE",
        entityType: "homeHeroRotatingWord",
        entityId: deleteTarget.id,
        summary: `Deleted hero rotating word "${deleteTarget.text}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete rotating word." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleHeroRotatingWordStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.text}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update rotating word status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel="Search rotating words"
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun="words"
        actions={
          <PrimaryButton icon={Plus} onClick={() => setModalItem({ ...EMPTY_WORD, order: nextOrder })}>
            Add Word
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            Rotating words
            <span className="ml-2 text-xs font-medium text-[var(--muted)]">
              Cycled beneath the headline, in order.
            </span>
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Text</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <TableSkeletonRows colSpan={4} rows={3} />
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                  <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{item.text}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      aria-label={`Toggle ${item.text} status`}
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
                        aria-label={`Edit ${item.text}`}
                      />
                      <IconButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.text}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyState
                icon={Type}
                title="No rotating words found"
                description="Add the first animated headline word."
                colSpan={4}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <RotatingWordModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete rotating word"
          message={`Delete "${deleteTarget.text}" from the hero headline?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function RotatingWordModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_WORD, order: nextOrder });
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.text?.trim()) nextErrors.text = "Text is required.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow="Hero rotating word"
      title={isEdit ? "Edit rotating word" : "Add rotating word"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving}>
            {isEdit ? "Update word" : "Add word"}
          </PrimaryButton>
        </>
      }
    >
      <Field label="Text" error={errors.text}>
        <input
          value={form.text}
          onChange={(event) => updateField("text", event.target.value)}
          className={inputClass}
          placeholder="For Your Brands"
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

/* -------------------------------------------------------------------------- */
/* Avatar strips (customerAvatars / teamAvatars)                              */
/* -------------------------------------------------------------------------- */

function AvatarsPanel({ stripKey }) {
  const config = AVATAR_STRIPS[stripKey];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalItem, setModalItem] = useState(null);
  const [itemSaving, setItemSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    return config.subscribe(
      (data) => {
        setItems(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: `Failed to load ${config.label.toLowerCase()}.` });
        setLoading(false);
      },
    );
  }, [config]);

  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["alt"]), [
    items,
    search,
    statusFilter,
  ]);
  const nextOrder = useMemo(() => nextOrderFor(items), [items]);

  const handleSave = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await config.update(modalItem.id, form);
        emitAlert({ type: "success", message: "Avatar updated." });
        logAuditEvent({
          module: "home",
          action: `${config.actionPrefix}_UPDATE`,
          entityType: config.entityType,
          entityId: modalItem.id,
          summary: `Updated hero ${config.label.toLowerCase()} entry "${form.alt}"`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await config.create(form);
        emitAlert({ type: "success", message: "Avatar added." });
        logAuditEvent({
          module: "home",
          action: `${config.actionPrefix}_CREATE`,
          entityType: config.entityType,
          summary: `Created hero ${config.label.toLowerCase()} entry "${form.alt}"`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save avatar." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await config.remove(deleteTarget.id);
      // Storage cleanup is best-effort: the document is already gone, so a
      // failed blob delete is a warning, never a blocked delete.
      if (deleteTarget.imagePath) {
        try {
          await config.removeImage(deleteTarget.imagePath);
        } catch {
          emitAlert({
            type: "warning",
            message: "Avatar deleted, but its stored image could not be removed.",
          });
        }
      }
      emitAlert({ type: "success", message: `"${deleteTarget.alt}" deleted.` });
      logAuditEvent({
        module: "home",
        action: `${config.actionPrefix}_DELETE`,
        entityType: config.entityType,
        entityId: deleteTarget.id,
        summary: `Deleted hero ${config.label.toLowerCase()} entry "${deleteTarget.alt}"`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete avatar." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await config.toggle(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `"${item.alt}" set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update avatar status." });
    }
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <ItemsToolbar
        search={search}
        onSearchChange={setSearch}
        searchLabel={`Search ${config.label.toLowerCase()}`}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        shownCount={filtered.length}
        totalCount={items.length}
        countNoun={config.noun}
        actions={
          <PrimaryButton
            icon={Plus}
            onClick={() => setModalItem({ ...EMPTY_AVATAR, order: nextOrder })}
          >
            Add Avatar
          </PrimaryButton>
        }
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="px-4 pt-4 text-left text-sm font-bold text-[var(--foreground)]">
            {config.label}
          </caption>
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Avatar</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <TableSkeletonRows colSpan={4} rows={3} />
            ) : filtered.length ? (
              filtered.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--surface-soft)]">
                  <td className="px-4 py-3 font-semibold text-[var(--muted)]">{item.order}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-soft)]">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-[var(--muted)] opacity-60" />
                        )}
                      </div>
                      <span className="font-semibold text-[var(--foreground)]">{item.alt}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggle(item)}
                      aria-label={`Toggle ${item.alt} status`}
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
                        aria-label={`Edit ${item.alt}`}
                      />
                      <IconButton
                        icon={Trash2}
                        tone="danger"
                        onClick={() => setDeleteTarget(item)}
                        aria-label={`Delete ${item.alt}`}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <TableEmptyState
                icon={Users}
                title={`No ${config.label.toLowerCase()} found`}
                description="Add the first avatar for this strip."
                colSpan={4}
              />
            )}
          </tbody>
        </table>
      </div>

      {modalItem ? (
        <AvatarModal
          config={config}
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete avatar"
          message={`Delete "${deleteTarget.alt}" from the ${config.label.toLowerCase()} strip?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function AvatarModal({ config, item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_AVATAR, order: nextOrder });
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEdit = Boolean(item?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await config.upload({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Avatar uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Avatar upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const previousPath = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    if (!previousPath) return;
    try {
      await config.removeImage(previousPath);
      emitAlert({ type: "success", message: "Avatar image removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Image cleared from the form, but Storage cleanup failed.",
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.imageUrl?.trim()) nextErrors.imageUrl = "An image is required.";
    else if (!isSafeUrl(form.imageUrl)) nextErrors.imageUrl = "Use a relative path or an http(s) URL.";
    if (!form.alt?.trim()) nextErrors.alt = "Alt text is required.";
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow={config.label}
      title={isEdit ? "Edit avatar" : "Add avatar"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving || uploading}>
            {isEdit ? "Update avatar" : "Add avatar"}
          </PrimaryButton>
        </>
      }
    >
      <ImagePairField
        label="Avatar image"
        error={errors.imageUrl}
        imageUrl={form.imageUrl}
        imagePath={form.imagePath}
        onChange={({ imageUrl, imagePath }) => setForm((prev) => ({ ...prev, imageUrl, imagePath }))}
        onUpload={handleUpload}
        onRemove={handleRemoveImage}
        uploading={uploading}
        uploadProgress={uploadProgress}
        round
        previewClass="h-16 w-16"
      />

      <Field label="Alt text" error={errors.alt}>
        <input
          value={form.alt}
          onChange={(event) => updateField("alt", event.target.value)}
          className={inputClass}
          placeholder="Avatar 1"
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

/* -------------------------------------------------------------------------- */

function validateSettings(values) {
  const errors = {};
  if (!values.badgeText?.trim()) errors.badgeText = "Badge text is required.";
  if (!values.headingLine1?.trim()) errors.headingLine1 = "Heading line 1 is required.";
  if (!values.subheading?.trim()) errors.subheading = "Subheading is required.";
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
