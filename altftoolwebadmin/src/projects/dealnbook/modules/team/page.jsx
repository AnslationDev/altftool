"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Save, Search, Trash2, Upload, Users, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_TEAM_SETTINGS,
  createSlug,
  createTeamMember,
  deleteTeamImage,
  deleteTeamMember,
  saveTeamSettings,
  subscribeTeamMembers,
  subscribeTeamSettings,
  toggleTeamMemberStatus,
  updateTeamMember,
  uploadTeamImage,
} from "./service/team.service";

const inputClass = "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";
const textareaClass = "w-full resize-none rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none transition focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10";

const EMPTY_MEMBER = {
  slug: "",
  name: "",
  role: "",
  department: "",
  image: "",
  imagePath: "",
  bio: "",
  experience: "",
  skills: "",
  social: { linkedin: "", instagram: "", twitter: "", behance: "" },
  order: 0,
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
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 inline-flex rounded-lg px-2.5 py-1 text-xl font-bold ${toneClass}`}>{value}</p>
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

export default function TeamPage() {
  const [settings, setSettings] = useState(DEFAULT_TEAM_SETTINGS);
  const [settingsDraft, setSettingsDraft] = useState(DEFAULT_TEAM_SETTINGS);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeTeamSettings(
      (data) => {
        setSettings(data);
        setSettingsDraft(data);
      },
      () => emitAlert({ type: "error", message: "Failed to load team settings." }),
    );
    const unsubMembers = subscribeTeamMembers(
      (items) => {
        setMembers(items);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load team members." });
        setLoading(false);
      },
    );
    return () => {
      unsubSettings();
      unsubMembers();
    };
  }, []);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return members
      .filter((member) => {
        const matchesSearch =
          !search ||
          member.name?.toLowerCase().includes(search) ||
          member.role?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && member.active !== false) ||
          (statusFilter === "inactive" && member.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [members, query, statusFilter]);

  const activeCount = members.filter((member) => member.active !== false).length;
  const inactiveCount = members.length - activeCount;

  function updateSettingsDraft(key, value) {
    setSettingsDraft((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSaveSettings() {
    setSettingsSaving(true);
    try {
      await saveTeamSettings(settingsDraft);
      emitAlert({ type: "success", message: "Team settings saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save settings." });
    } finally {
      setSettingsSaving(false);
    }
  }

  async function toggleMember(member) {
    try {
      await toggleTeamMemberStatus(member.id, member.active === false);
      emitAlert({ type: "success", message: "Member status updated." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to update status." });
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteTeamMember(deleteTarget.id);
      if (deleteTarget.imagePath) {
        try {
          await deleteTeamImage(deleteTarget.imagePath);
        } catch {
          emitAlert({ type: "warning", message: "Member deleted, but image cleanup failed." });
        }
      }
      emitAlert({ type: "success", message: "Team member deleted." });
      setDeleteTarget(null);
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete member." });
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-900 text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Dealnbook Team</h1>
              <p className="text-sm text-gray-500">Manage the team page copy and the team members shown on the site.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", member: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Page copy</p>
            <h2 className="mt-1 text-base font-bold text-gray-900">Team section content</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Hero Headline"><input value={settingsDraft.heroHeadline || ""} onChange={(event) => updateSettingsDraft("heroHeadline", event.target.value)} className={inputClass} /></Field>
            <Field label="Hero Subcopy"><input value={settingsDraft.heroSubcopy || ""} onChange={(event) => updateSettingsDraft("heroSubcopy", event.target.value)} className={inputClass} /></Field>
          </div>
          <button onClick={handleSaveSettings} disabled={settingsSaving} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-60 md:w-auto">
            {settingsSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Team Settings
          </button>
        </section>

        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard label="Total Members" value={loading ? "-" : members.length} />
          <StatCard label="Active Members" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive Members" value={loading ? "-" : inactiveCount} tone="amber" />
        </div>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Team Card Management</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">{members.length} members</h2>
            </div>
            <span className="text-xs font-medium text-gray-400">{filteredMembers.length} shown</span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_170px]">
            <label className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by name or role" />
            </label>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[70px_1fr_1fr_1fr_80px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Image</span><span>Name</span><span>Role</span><span>Department</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">Loading team members…</div>
              ) : filteredMembers.length ? filteredMembers.map((member) => (
                <div key={member.id} className="grid grid-cols-[70px_1fr_1fr_1fr_80px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {member.image ? <img src={member.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-3.5 h-5 w-5 text-gray-300" />}
                  </div>
                  <p className="truncate font-bold text-gray-900">{member.name}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{member.role}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{member.department}</p>
                  <button type="button" onClick={() => toggleMember(member)} className="w-fit"><StatusBadge active={member.active !== false} /></button>
                  <div className="flex gap-2">
                    <button onClick={() => toggleMember(member)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{member.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => setModalState({ mode: "edit", member })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(member)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No team members found.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {modalState ? <MemberModal mode={modalState.mode} member={modalState.member} members={members} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete team member"
          message={`Delete "${deleteTarget.name}" from team?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function MemberModal({ mode, member, members, onClose }) {
  const nextOrder = useMemo(() => members.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [members]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_MEMBER,
    ...member,
    skills: Array.isArray(member?.skills) ? member.skills.join("\n") : member?.skills || "",
    social: { ...EMPTY_MEMBER.social, ...(member?.social || {}) },
    order: Number(member?.order) || nextOrder,
    active: member?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [slugEdited, setSlugEdited] = useState(Boolean(member?.slug));

  function setField(key, value) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "name" && !slugEdited) next.slug = createSlug(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  function setSlug(value) {
    setSlugEdited(true);
    setField("slug", createSlug(value));
  }

  function setSocial(key, value) {
    setForm((prev) => ({ ...prev, social: { ...prev.social, [key]: value } }));
  }

  async function uploadImage(file) {
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadTeamImage({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, image: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, image: "" }));
      emitAlert({ type: "success", message: "Member image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, image: "", imagePath: "" }));
    try {
      await deleteTeamImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.role.trim()) nextErrors.role = "Role is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateTeamMember(member.id, form);
        emitAlert({ type: "success", message: "Team member updated." });
      } else {
        await createTeamMember(form);
        emitAlert({ type: "success", message: "Team member added." });
      }
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save member." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{mode === "edit" ? "Edit Member" : "Add Member"}</p>
            <h3 className="mt-1 text-lg font-bold text-gray-900">Team member details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex aspect-[0.82] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.image ? <img src={form.image} alt="Member preview" className="h-full w-full object-cover object-top" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            {errors.image ? <p className="mt-2 text-xs font-medium text-red-500">{errors.image}</p> : null}
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                <Upload className="h-3.5 w-3.5" /> Upload
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
              </label>
              {form.image ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name" error={errors.name}><input value={form.name} onChange={(event) => setField("name", event.target.value)} className={inputClass} /></Field>
              <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="jane-doe" /></Field>
              <Field label="Role" error={errors.role}><input value={form.role} onChange={(event) => setField("role", event.target.value)} className={inputClass} /></Field>
              <Field label="Department"><input value={form.department} onChange={(event) => setField("department", event.target.value)} className={inputClass} /></Field>
              <Field label="Experience"><input value={form.experience} onChange={(event) => setField("experience", event.target.value)} className={inputClass} placeholder="5+ years" /></Field>
              <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
            </div>
            <Field label="Bio"><textarea value={form.bio} onChange={(event) => setField("bio", event.target.value)} rows={3} className={textareaClass} /></Field>
            <Field label="Skills (one per line)"><textarea value={form.skills} onChange={(event) => setField("skills", event.target.value)} rows={4} className={textareaClass} placeholder={"Deal Curation\nMerchant Relations\nContent Strategy"} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="LinkedIn URL"><input value={form.social.linkedin} onChange={(event) => setSocial("linkedin", event.target.value)} className={inputClass} /></Field>
              <Field label="Instagram URL"><input value={form.social.instagram} onChange={(event) => setSocial("instagram", event.target.value)} className={inputClass} /></Field>
              <Field label="Twitter URL"><input value={form.social.twitter} onChange={(event) => setSocial("twitter", event.target.value)} className={inputClass} /></Field>
              <Field label="Behance URL"><input value={form.social.behance} onChange={(event) => setSocial("behance", event.target.value)} className={inputClass} /></Field>
            </div>
            <Field label="Status">
              <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                <span>{form.active ? "Active" : "Inactive"}</span>
                <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
              </button>
            </Field>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving || uploading} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {mode === "edit" ? "Update Member" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
