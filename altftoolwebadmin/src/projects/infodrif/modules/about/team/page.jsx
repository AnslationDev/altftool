"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, Pencil, Plus, Save, Trash2, Users } from "lucide-react";
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
} from "../components/AboutAdminShared";
import {
  DEFAULT_ABOUT_TEAM,
  createAboutTeamMember,
  deleteAboutTeamMember,
  deleteAboutTeamMemberImage,
  resetAboutTeam,
  saveAboutTeam,
  subscribeAboutTeam,
  subscribeAboutTeamMembers,
  toggleAboutTeamMemberStatus,
  updateAboutTeamMember,
  uploadAboutTeamMemberImage,
} from "../service/about.service";

const ROUTE = "/infodrif/about/team";

const EMPTY_MEMBER = {
  name: "",
  role: "",
  imageUrl: "",
  imagePath: "",
  order: 0,
  active: true,
};

export default function InfodrifAboutTeamPage() {
  const [saved, setSaved] = useState(DEFAULT_ABOUT_TEAM);
  const [draft, setDraft] = useState(DEFAULT_ABOUT_TEAM);
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
    return subscribeAboutTeam(
      (data) => {
        setSaved(data);
        setDraft(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load about team settings." });
        setLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    return subscribeAboutTeamMembers(
      (data) => {
        setItems(data);
        setItemsLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load team members." });
        setItemsLoading(false);
      },
    );
  }, []);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const filtered = useMemo(() => filterItems(items, search, statusFilter, ["name", "role"]), [
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
      await saveAboutTeam(draft);
      emitAlert({ type: "success", message: "About team settings saved." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_TEAM_SETTINGS_UPDATE",
        entityType: "aboutTeamSettings",
        entityId: "team",
        summary: "Updated Infodrif about team settings",
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
      await resetAboutTeam();
      emitAlert({ type: "success", message: "About team settings reset to defaults." });
      logAuditEvent({
        module: "about",
        action: "ABOUT_TEAM_SETTINGS_RESET",
        entityType: "aboutTeamSettings",
        entityId: "team",
        summary: "Reset Infodrif about team settings to defaults",
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
        await updateAboutTeamMember(modalItem.id, form);
        emitAlert({ type: "success", message: "Team member updated." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_TEAM_MEMBER_UPDATE",
          entityType: "aboutTeamMember",
          entityId: modalItem.id,
          summary: `Updated about team member ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      } else {
        await createAboutTeamMember(form);
        emitAlert({ type: "success", message: "Team member added." });
        logAuditEvent({
          module: "about",
          action: "ABOUT_TEAM_MEMBER_CREATE",
          entityType: "aboutTeamMember",
          summary: `Created about team member ${form.name}`,
          changes: form,
          route: ROUTE,
        });
      }
      setModalItem(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save team member." });
    } finally {
      setItemSaving(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteAboutTeamMember(deleteTarget.id);
      // Storage cleanup is best-effort: the document is already gone, so a
      // failed blob delete is a warning, never a blocked delete.
      if (deleteTarget.imagePath) {
        try {
          await deleteAboutTeamMemberImage(deleteTarget.imagePath);
        } catch {
          emitAlert({
            type: "warning",
            message: "Member deleted, but their stored photo could not be removed.",
          });
        }
      }
      emitAlert({ type: "success", message: `${deleteTarget.name} deleted.` });
      logAuditEvent({
        module: "about",
        action: "ABOUT_TEAM_MEMBER_DELETE",
        entityType: "aboutTeamMember",
        entityId: deleteTarget.id,
        summary: `Deleted about team member ${deleteTarget.name}`,
        route: ROUTE,
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete team member." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await toggleAboutTeamMemberStatus(item.id, !item.active);
      emitAlert({
        type: "success",
        message: `${item.name} set to ${item.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update team member status." });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--page,var(--background))] px-6 pb-6">
      <ActionHeader
        title="About — Team"
        description="Team heading, blurb, placeholder image, and the team member cards."
        lastUpdated={formatDate(saved.updatedAt)}
        dirty={dirty}
        saving={saving}
        onSave={handleSave}
        onReset={() => setConfirmReset(true)}
      />

      <div className="mx-auto mt-6 flex max-w-7xl flex-col gap-5">
        <Panel eyebrow="About team settings" title="Heading & blurb">
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-lg bg-[var(--surface-soft)]" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Eyebrow" error={errors.eyebrow}>
                  <input
                    value={draft.eyebrow || ""}
                    onChange={(event) => setField("eyebrow", event.target.value)}
                    className={inputClass}
                    placeholder="Team"
                  />
                </Field>
                <Field label="Heading" error={errors.heading}>
                  <input
                    value={draft.heading || ""}
                    onChange={(event) => setField("heading", event.target.value)}
                    className={inputClass}
                    placeholder="People at InfoDrif."
                  />
                </Field>
                <Field label="Leadership label" error={errors.leadershipLabel}>
                  <input
                    value={draft.leadershipLabel || ""}
                    onChange={(event) => setField("leadershipLabel", event.target.value)}
                    className={inputClass}
                    placeholder="Global Leadership"
                  />
                </Field>
              </div>

              <Field label="Blurb" error={errors.blurb}>
                <textarea
                  value={draft.blurb || ""}
                  onChange={(event) => setField("blurb", event.target.value)}
                  rows={3}
                  className={textareaClass}
                />
              </Field>

              <Field
                label="Placeholder image URL"
                hint="Used for any member card without its own photo."
                error={errors.placeholderImageUrl}
              >
                <input
                  value={draft.placeholderImageUrl || ""}
                  onChange={(event) => setField("placeholderImageUrl", event.target.value)}
                  className={inputClass}
                  placeholder="https://via.placeholder.com/300x260"
                />
              </Field>
            </div>
          )}
        </Panel>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
          <ItemsToolbar
            search={search}
            onSearchChange={setSearch}
            searchLabel="Search team members"
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            shownCount={filtered.length}
            totalCount={items.length}
            countNoun="members"
            actions={
              <PrimaryButton
                icon={Plus}
                onClick={() => setModalItem({ ...EMPTY_MEMBER, order: nextOrder })}
              >
                Add Member
              </PrimaryButton>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface-soft)] text-left text-[10px] font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Role</th>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-soft)]">
                            {item.imageUrl ? (
                              <img
                                src={item.imageUrl}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-4 w-4 text-[var(--muted)] opacity-60" />
                            )}
                          </div>
                          <span className="font-semibold text-[var(--foreground)]">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[var(--muted)]">{item.role}</td>
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
                    icon={Users}
                    title="No team members found"
                    description="Add the first Infodrif team member."
                    colSpan={5}
                  />
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <MemberModal
          item={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order ?? nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete team member"
          message={`Delete ${deleteTarget.name} from the Infodrif team?`}
          confirmText="Delete"
          loading={deleteLoading}
          onConfirm={handleDeleteItem}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}

      {confirmReset ? (
        <DeleteConfirmModal
          title="Reset about team settings"
          message="Reset the team heading and blurb back to the default content? The members are not affected."
          confirmText="Reset"
          loading={saving}
          onConfirm={handleReset}
          onCancel={() => setConfirmReset(false)}
        />
      ) : null}
    </div>
  );
}

function MemberModal({ item, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(item || { ...EMPTY_MEMBER, order: nextOrder });
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
      const uploaded = await uploadAboutTeamMemberImage({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Photo uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Photo upload failed." });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const previousPath = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    if (!previousPath) return;
    try {
      await deleteAboutTeamMemberImage(previousPath);
      emitAlert({ type: "success", message: "Photo removed." });
    } catch {
      emitAlert({
        type: "warning",
        message: "Photo cleared from the form, but Storage cleanup failed.",
      });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Name is required.";
    if (!form.role?.trim()) nextErrors.role = "Role is required.";
    if (form.imageUrl?.trim() && !isSafeUrl(form.imageUrl)) {
      nextErrors.imageUrl = "Use a relative path or an http(s) URL.";
    }
    if (!isValidOrder(form.order)) nextErrors.order = "Order must be zero or higher.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <ModalShell
      eyebrow="About team member"
      title={isEdit ? "Edit team member" : "Add team member"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <>
          <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
          <PrimaryButton type="submit" icon={Save} loading={saving} disabled={saving || uploading}>
            {isEdit ? "Update member" : "Add member"}
          </PrimaryButton>
        </>
      }
    >
      <ImagePairField
        label="Photo"
        hint="Leave empty to fall back to the section's placeholder image."
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>
          <input
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className={inputClass}
            placeholder="Neil Patel"
          />
        </Field>
        <Field label="Role" error={errors.role}>
          <input
            value={form.role}
            onChange={(event) => updateField("role", event.target.value)}
            className={inputClass}
            placeholder="Co-Founder"
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
  if (!values.blurb?.trim()) errors.blurb = "Blurb is required.";
  if (!values.leadershipLabel?.trim()) errors.leadershipLabel = "Leadership label is required.";
  if (!values.placeholderImageUrl?.trim()) {
    errors.placeholderImageUrl = "Placeholder image URL is required.";
  } else if (!isSafeUrl(values.placeholderImageUrl)) {
    errors.placeholderImageUrl = "Use a relative path or an http(s) URL.";
  }
  return errors;
}
