"use client";

import { useEffect, useMemo, useState } from "react";
import { Edit3, Eye, EyeOff, Image as ImageIcon, Loader2, Plus, Search, Save, Trash2, Upload, Users, X } from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import {
  DEFAULT_TEAM_SETTINGS,
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
  name: "",
  designation: "",
  email: "",
  contact: "",
  skype: "",
  imageUrl: "",
  imagePath: "",
  order: 0,
  active: true,
};

export default function TeamPage() {
  const [settings, setSettings] = useState(DEFAULT_TEAM_SETTINGS);
  const [savedSettings, setSavedSettings] = useState(DEFAULT_TEAM_SETTINGS);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsubSettings = subscribeTeamSettings(
      (data) => {
        setSettings(data);
        setSavedSettings(data);
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load team settings." });
        setLoading(false);
      },
    );
    const unsubMembers = subscribeTeamMembers(
      (items) => setMembers(items),
      () => emitAlert({ type: "error", message: "Failed to load team members." }),
    );
    return () => {
      unsubSettings();
      unsubMembers();
    };
  }, []);

  const dirty = useMemo(() => JSON.stringify(settings) !== JSON.stringify(savedSettings), [settings, savedSettings]);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return members
      .filter((member) => {
        const matchesSearch = !search || member.name?.toLowerCase().includes(search) || member.designation?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && member.active !== false) ||
          (statusFilter === "inactive" && member.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [members, query, statusFilter]);

  function setSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function saveSettings() {
    const nextErrors = {};
    if (!settings.titlePrefix?.trim()) nextErrors.titlePrefix = "Title prefix is required.";
    if (!settings.titleHighlight?.trim()) nextErrors.titleHighlight = "Highlighted title is required.";
    if (!settings.subtitle?.trim()) nextErrors.subtitle = "Subtitle is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await saveTeamSettings(settings);
      emitAlert({ type: "success", message: "Team section saved." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to save team settings." });
    } finally {
      setSaving(false);
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
              <h1 className="text-xl font-bold text-gray-900">CareerBook Team Admin</h1>
              <p className="text-sm text-gray-500">Manage the team section title, subtitle, and member cards.</p>
            </div>
          </div>
          <button onClick={saveSettings} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Title Panel
          </button>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
          <section className="space-y-5">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Title & Subtitle Panel</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">Team section content</h2>
                </div>
                <span className={`rounded-lg px-2.5 py-1 text-xs font-bold ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                  {dirty ? "Unsaved" : "Saved"}
                </span>
              </div>

              {loading ? (
                <div className="mt-5 space-y-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-11 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : (
                <div className="mt-5 space-y-4">
                  <Field label="Title Prefix" error={errors.titlePrefix}>
                    <input value={settings.titlePrefix || ""} onChange={(event) => setSetting("titlePrefix", event.target.value)} className={inputClass} placeholder="MEET OUR" />
                  </Field>
                  <Field label="Highlighted Title" error={errors.titleHighlight}>
                    <input value={settings.titleHighlight || ""} onChange={(event) => setSetting("titleHighlight", event.target.value)} className={inputClass} placeholder="BEST TEAM" />
                  </Field>
                  <Field label="Subtitle" error={errors.subtitle}>
                    <textarea value={settings.subtitle || ""} onChange={(event) => setSetting("subtitle", event.target.value)} rows={4} className={textareaClass} />
                  </Field>
                  <button onClick={() => setSetting("active", settings.active === false)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold ${settings.active !== false ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                    <span>{settings.active !== false ? "Section active" : "Section inactive"}</span>
                    <span className={`h-2.5 w-2.5 rounded-full ${settings.active !== false ? "bg-emerald-500" : "bg-gray-400"}`} />
                  </button>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Team Card Management</p>
                  <h2 className="mt-1 text-base font-bold text-gray-900">{members.length} members</h2>
                </div>
                <button onClick={() => setModalState({ mode: "create", member: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700">
                  <Plus className="h-4 w-4" /> Add Member
                </button>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-[1fr_170px]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input value={query} onChange={(event) => setQuery(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search by name or designation" />
                </label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className={inputClass}>
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="mt-4 overflow-x-auto rounded-xl border border-gray-200">
                <div className="min-w-[900px]">
                  <div className="grid grid-cols-[80px_1fr_1fr_1fr_90px_130px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>Image</span><span>Name</span><span>Designation</span><span>Email</span><span>Status</span><span>Actions</span>
                  </div>
                  {filteredMembers.length ? filteredMembers.map((member) => (
                    <div key={member.id} className="grid grid-cols-[80px_1fr_1fr_1fr_90px_130px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                      <div className="h-14 w-14 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        {member.imageUrl ? <img src={member.imageUrl} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="m-4 h-5 w-5 text-gray-300" />}
                      </div>
                      <p className="truncate font-bold text-gray-900">{member.name}</p>
                      <p className="truncate text-xs font-semibold text-gray-500">{member.designation}</p>
                      <p className="truncate text-xs font-semibold text-blue-600">{member.email}</p>
                      <span className={`w-fit rounded-lg px-2 py-1 text-xs font-bold ${member.active === false ? "bg-gray-100 text-gray-500" : "bg-emerald-50 text-emerald-700"}`}>{member.active === false ? "Inactive" : "Active"}</span>
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
            </div>
          </section>

          <section className="space-y-4">
            <p className="text-sm font-bold text-gray-700">Live preview</p>
            <TeamPreview settings={settings} members={members} />
          </section>
        </div>
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

function TeamPreview({ settings, members }) {
  const activeMembers = members.filter((member) => member.active !== false).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-[#050505] shadow-sm">
      <div className="relative min-h-[640px] bg-[linear-gradient(115deg,#2c166a_0%,#050505_45%,#2b146d_100%)] p-8 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(255,255,255,.24)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.24)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <h2 className="text-4xl font-light tracking-normal">
            {settings.titlePrefix || "MEET OUR"} <span className="font-black">{settings.titleHighlight || "BEST TEAM"}</span>
          </h2>
          <p className="mt-5 text-sm font-semibold leading-6 text-white/72">{settings.subtitle}</p>
        </div>
        <div className="relative z-10 mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {activeMembers.length ? activeMembers.slice(0, 4).map((member) => (
            <article key={member.id} className="overflow-hidden rounded-lg bg-white text-center text-gray-900">
              <div className="mx-5 mt-5 flex aspect-[0.82] items-end justify-center bg-[#160a39] ring-[14px] ring-white">
                {member.imageUrl ? <img src={member.imageUrl} alt="" className="h-full w-full object-cover object-top" /> : <ImageIcon className="mb-20 h-12 w-12 text-white/40" />}
              </div>
              <div className="px-4 py-7">
                <h3 className="text-xl font-black">{member.name}</h3>
                <p className="mt-2 text-sm font-medium text-gray-500">{member.designation}</p>
              </div>
            </article>
          )) : (
            <div className="col-span-full rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/55">No active team members yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function MemberModal({ mode, member, members, onClose }) {
  const nextOrder = useMemo(() => members.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [members]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_MEMBER,
    ...member,
    order: Number(member?.order) || nextOrder,
    active: member?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  }

  async function uploadImage(file) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      emitAlert({ type: "error", message: "Member image must be an image file." });
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      emitAlert({ type: "error", message: "Member image must be 8MB or smaller." });
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const uploaded = await uploadTeamImage({ file, onProgress: setUploadProgress });
      setForm((prev) => ({ ...prev, imageUrl: uploaded.url, imagePath: uploaded.path }));
      setErrors((prev) => ({ ...prev, imageUrl: "" }));
      emitAlert({ type: "success", message: "Member image uploaded." });
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Image upload failed." });
    } finally {
      setUploading(false);
    }
  }

  async function removeImage() {
    const path = form.imagePath;
    setForm((prev) => ({ ...prev, imageUrl: "", imagePath: "" }));
    try {
      await deleteTeamImage(path);
    } catch {
      emitAlert({ type: "warning", message: "Image removed from form, but Storage cleanup failed." });
    }
  }

  async function save() {
    const nextErrors = {};
    if (!form.imageUrl) nextErrors.imageUrl = "Image is required.";
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.designation.trim()) nextErrors.designation = "Designation is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = "Enter a valid email.";
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
            <h3 className="mt-1 text-lg font-bold text-gray-900">Team card details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[220px_1fr]">
          <div>
            <div className="flex aspect-[0.82] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
              {form.imageUrl ? <img src={form.imageUrl} alt="Member preview" className="h-full w-full object-cover object-top" /> : <ImageIcon className="h-8 w-8 text-gray-300" />}
            </div>
            {errors.imageUrl ? <p className="mt-2 text-xs font-medium text-red-500">{errors.imageUrl}</p> : null}
            {uploading ? <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200"><div className="h-full bg-gray-900" style={{ width: `${uploadProgress}%` }} /></div> : null}
            <div className="mt-3 flex gap-2">
              <label className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-gray-700">
                <Upload className="h-3.5 w-3.5" /> Upload
                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadImage(event.target.files?.[0])} />
              </label>
              {form.imageUrl ? <button onClick={removeImage} className="rounded-xl border border-red-200 px-3 py-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button> : null}
            </div>
          </div>
          <div className="space-y-4">
            <Field label="Name" error={errors.name}><input value={form.name} onChange={(event) => setField("name", event.target.value)} className={inputClass} /></Field>
            <Field label="Designation" error={errors.designation}><input value={form.designation} onChange={(event) => setField("designation", event.target.value)} className={inputClass} /></Field>
            <Field label="Email" error={errors.email}><input value={form.email} onChange={(event) => setField("email", event.target.value)} className={inputClass} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Contact"><input value={form.contact} onChange={(event) => setField("contact", event.target.value)} className={inputClass} /></Field>
              <Field label="Skype"><input value={form.skype} onChange={(event) => setField("skype", event.target.value)} className={inputClass} /></Field>
              <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
              <Field label="Status">
                <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
                  <span>{form.active ? "Active" : "Inactive"}</span>
                  <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
                </button>
              </Field>
            </div>
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
