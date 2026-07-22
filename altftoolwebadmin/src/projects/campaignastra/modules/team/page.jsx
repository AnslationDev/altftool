"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { logAuditEvent } from "@/lib/auditClient";
import {
  DEFAULT_TEAM_SETTINGS,
  createTeamMember,
  deleteTeamMember,
  deleteTeamMemberImage,
  saveTeamSettings,
  subscribeTeamMembers,
  subscribeTeamSettings,
  toggleTeamMemberStatus,
  updateTeamMember,
  uploadTeamMemberImage,
} from "./service/team.service";

const EMPTY_MEMBER = {
  name: "",
  role: "",
  imageUrl: "",
  imagePath: "",
  socials: { linkedin: "", x: "", instagram: "" },
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

function MemberModal({ member, nextOrder, saving, onClose, onSave }) {
  const [form, setForm] = useState(
    member
      ? { ...EMPTY_MEMBER, ...member, socials: { ...EMPTY_MEMBER.socials, ...member.socials } }
      : { ...EMPTY_MEMBER, order: nextOrder },
  );
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isEdit = Boolean(member?.id);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const updateSocial = (key, value) => {
    setForm((prev) => ({ ...prev, socials: { ...prev.socials, [key]: value } }));
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadTeamMemberImage({ file, onProgress: setUploadProgress });
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
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteTeamMemberImage(path);
      emitAlert({ type: "success", message: "Photo removed." });
    } catch {
      emitAlert({ type: "warning", message: "Photo removed from form, but Storage cleanup failed." });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validateMember(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Team member
            </p>
            <h2 className="mt-1 text-lg font-bold text-gray-900">
              {isEdit ? "Edit team member" : "Add team member"}
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
          <Field label="Photo" error={errors.imageUrl}>
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt="Member preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Upload a PNG, JPG, or WebP photo
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">Square image recommended, max 5MB.</p>
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

          <Field label="Name" error={errors.name}>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              placeholder="Jane Doe"
            />
          </Field>

          <Field label="Role" error={errors.role}>
            <input
              value={form.role}
              onChange={(event) => updateField("role", event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
              placeholder="Creative Director"
            />
          </Field>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Social links (optional)
            </p>
            <Field label="LinkedIn URL">
              <input
                value={form.socials.linkedin}
                onChange={(event) => updateSocial("linkedin", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="https://linkedin.com/in/username"
              />
            </Field>
            <Field label="X (Twitter) URL">
              <input
                value={form.socials.x}
                onChange={(event) => updateSocial("x", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="https://x.com/username"
              />
            </Field>
            <Field label="Instagram URL">
              <input
                value={form.socials.instagram}
                onChange={(event) => updateSocial("instagram", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="https://instagram.com/username"
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
            disabled={saving || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isEdit ? "Update member" : "Add member"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function CampaignastraTeamPage() {
  const [settings, setSettings] = useState(DEFAULT_TEAM_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_TEAM_SETTINGS);
  const [members, setMembers] = useState([]);
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
    let membersReady = false;

    const markReady = () => {
      if (settingsReady && membersReady) setLoading(false);
    };

    const unsubSettings = subscribeTeamSettings(
      (data) => {
        settingsReady = true;
        setSettings(data);
        setSettingsDraft(data);
        markReady();
      },
      () => {
        settingsReady = true;
        emitAlert({ type: "error", message: "Failed to load team page copy." });
        markReady();
      },
    );

    const unsubMembers = subscribeTeamMembers(
      (data) => {
        membersReady = true;
        setMembers(data);
        markReady();
      },
      () => {
        membersReady = true;
        emitAlert({ type: "error", message: "Failed to load team members." });
        markReady();
      },
    );

    return () => {
      unsubSettings();
      unsubMembers();
    };
  }, []);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => Number(a.order || 0) - Number(b.order || 0)),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    return sortedMembers.filter((member) => {
      const matchesSearch =
        !queryText ||
        member.name?.toLowerCase().includes(queryText) ||
        member.role?.toLowerCase().includes(queryText);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? member.active : !member.active);
      return matchesSearch && matchesStatus;
    });
  }, [search, sortedMembers, statusFilter]);

  const activeCount = members.filter((member) => member.active).length;
  const inactiveCount = members.length - activeCount;
  const nextOrder = members.length
    ? Math.max(...members.map((member) => Number(member.order || 0))) + 1
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
      await saveTeamSettings(settingsDraft);
      emitAlert({ type: "success", message: "Team page copy saved." });
      logAuditEvent({
        module: "team",
        action: "TEAM_SETTINGS_UPDATE",
        entityType: "teamSettings",
        entityId: "settings",
        summary: "Updated Campaignastra team page copy",
        route: "/campaignastra/team",
      });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save team page copy." });
    } finally {
      setSettingsSaving(false);
    }
  };

  const handleSaveItem = async (form) => {
    setItemSaving(true);
    try {
      if (modalItem?.id) {
        await updateTeamMember(modalItem.id, form);
        emitAlert({ type: "success", message: "Team member updated." });
        logAuditEvent({
          module: "team",
          action: "TEAM_MEMBER_UPDATE",
          entityType: "teamMember",
          entityId: modalItem.id,
          summary: `Updated team member ${form.name}`,
          changes: form,
          route: "/campaignastra/team",
        });
      } else {
        const id = await createTeamMember(form);
        emitAlert({ type: "success", message: "Team member added." });
        logAuditEvent({
          module: "team",
          action: "TEAM_MEMBER_CREATE",
          entityType: "teamMember",
          entityId: id,
          summary: `Created team member ${form.name}`,
          changes: form,
          route: "/campaignastra/team",
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
      await deleteTeamMember(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteTeamMemberImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Member deleted, but photo cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: `"${deleteTarget.name}" deleted.` });
      logAuditEvent({
        module: "team",
        action: "TEAM_MEMBER_DELETE",
        entityType: "teamMember",
        entityId: deleteTarget.id,
        summary: `Deleted team member ${deleteTarget.name}`,
        route: "/campaignastra/team",
      });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete team member." });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (member) => {
    try {
      await toggleTeamMemberStatus(member.id, !member.active);
      emitAlert({
        type: "success",
        message: `${member.name} set to ${member.active ? "inactive" : "active"}.`,
      });
    } catch {
      emitAlert({ type: "error", message: "Failed to update member status." });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Campaignastra Team</h1>
              <p className="text-sm text-gray-500">
                Manage page copy and member cards. This collection powers the site&apos;s
                /team page, /about page, and the homepage team preview — changes appear
                everywhere at once.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalItem({ ...EMPTY_MEMBER, order: nextOrder })}
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Add Team Member
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                Page copy
              </p>
              <h2 className="mt-1 text-base font-bold text-gray-900">Team section content</h2>
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

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="Eyebrow" error={settingsErrors.eyebrow}>
              <input
                value={settingsDraft.eyebrow}
                onChange={(event) => updateSettingsDraft("eyebrow", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Our people"
              />
            </Field>

            <Field label="Title" error={settingsErrors.title}>
              <input
                value={settingsDraft.title}
                onChange={(event) => updateSettingsDraft("title", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Meet the Team"
              />
            </Field>

            <div className="lg:col-span-2">
              <Field label="Subtitle" error={settingsErrors.subtitle}>
                <textarea
                  value={settingsDraft.subtitle}
                  onChange={(event) => updateSettingsDraft("subtitle", event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                  placeholder="The strategists, designers, and engineers behind Campaignastra."
                />
              </Field>
            </div>

            <Field label="SEO title" error={settingsErrors.seoTitle}>
              <input
                value={settingsDraft.seoTitle}
                onChange={(event) => updateSettingsDraft("seoTitle", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Meet the Campaignastra Team"
              />
            </Field>

            <Field label="SEO description" error={settingsErrors.seoDescription}>
              <input
                value={settingsDraft.seoDescription}
                onChange={(event) => updateSettingsDraft("seoDescription", event.target.value)}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                placeholder="Get to know the people behind Campaignastra."
              />
            </Field>
          </div>

          <button
            type="button"
            onClick={handleSaveSettings}
            disabled={settingsSaving}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60"
          >
            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Page Copy
          </button>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Members" value={loading ? "-" : members.length} />
          <StatCard label="Active Members" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Members" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search team members"
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
              {filteredMembers.length} of {members.length} members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
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
                ) : filteredMembers.length ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                          {member.imageUrl ? (
                            <img
                              src={member.imageUrl}
                              alt={member.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="m-2.5 h-5 w-5 text-gray-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {member.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{member.role}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => handleToggleStatus(member)}>
                          <StatusBadge active={member.active} />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setModalItem(member)}
                            className="rounded-lg p-2 text-blue-500 hover:bg-blue-50"
                            aria-label={`Edit ${member.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                            aria-label={`Delete ${member.name}`}
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
                      <Users className="mx-auto h-8 w-8 text-gray-200" />
                      <p className="mt-3 text-sm font-semibold text-gray-500">
                        No team members found
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        Add the first Campaignastra team member.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalItem ? (
        <MemberModal
          member={modalItem.id ? modalItem : null}
          nextOrder={modalItem.order || nextOrder}
          saving={itemSaving}
          onClose={() => setModalItem(null)}
          onSave={handleSaveItem}
        />
      ) : null}

      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete team member"
          message={`Delete "${deleteTarget.name}" from the Campaignastra team?`}
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

function validateMember(values) {
  const errors = {};
  if (!values.name?.trim()) {
    errors.name = "Name is required.";
  }
  if (!values.role?.trim()) {
    errors.role = "Role is required.";
  }
  if (Number.isNaN(Number(values.order)) || Number(values.order) < 0) {
    errors.order = "Order must be zero or higher.";
  }
  return errors;
}
