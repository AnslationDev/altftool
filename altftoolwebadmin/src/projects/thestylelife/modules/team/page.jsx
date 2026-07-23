"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";
import { emitAlert } from "@/lib/alertBus";
import { ImageField, ListEditor, SettingsCard, inputClass, textareaClass } from "../_shared/AdminSectionShared";
import { createSlug } from "../services/service/services.service";
import {
  DEFAULT_TEAM_SETTINGS,
  createTeamMember,
  deleteTeamMember,
  saveTeamSettings,
  subscribeTeamMembers,
  subscribeTeamSettings,
  toggleTeamMemberStatus,
  updateTeamMember,
  uploadTeamMemberImage,
} from "./service/team.service";

const EMPTY_MEMBER = {
  slug: "",
  name: "",
  role: "",
  image: "",
  bio: "",
  longBio: "",
  focus: [],
  quote: "",
  social: [],
  order: 0,
  active: true,
};

export default function ThestylelifeTeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalState, setModalState] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const unsub = subscribeTeamMembers(
      (items) => {
        // The team/settings doc lives in the same collection — hide it here.
        setMembers(items.filter((item) => item.id !== "settings"));
        setLoading(false);
      },
      () => {
        emitAlert({ type: "error", message: "Failed to load team members." });
        setLoading(false);
      },
    );
    return () => unsub();
  }, []);

  const filteredMembers = useMemo(() => {
    const search = query.trim().toLowerCase();
    return members
      .filter((item) => {
        const matchesSearch = !search || item.name?.toLowerCase().includes(search) || item.role?.toLowerCase().includes(search);
        const matchesStatus =
          statusFilter === "all" ||
          (statusFilter === "active" && item.active !== false) ||
          (statusFilter === "inactive" && item.active === false);
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
  }, [members, query, statusFilter]);

  const activeCount = members.filter((item) => item.active !== false).length;

  async function toggleMember(item) {
    try {
      await toggleTeamMemberStatus(item.id, item.active === false);
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
      emitAlert({ type: "success", message: "Member deleted." });
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
              <h1 className="text-xl font-bold text-gray-900">TheStyleLife Team</h1>
              <p className="text-sm text-gray-500">Manage the studio members shown on /team, member detail pages, and the home preview.</p>
            </div>
          </div>
          <button onClick={() => setModalState({ mode: "create", member: null })} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-700">
            <Plus className="h-4 w-4" /> Add Member
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Members" value={loading ? "-" : members.length} />
          <StatCard label="Active" value={loading ? "-" : activeCount} tone="green" />
          <StatCard label="Inactive" value={loading ? "-" : members.length - activeCount} tone="amber" />
        </div>

        <SettingsCard
          eyebrow="/team Page Hero"
          title="Page hero & related strip"
          defaults={DEFAULT_TEAM_SETTINGS}
          subscribe={subscribeTeamSettings}
          save={saveTeamSettings}
          errorLabel="team page hero"
          fields={[
            { key: "badge", label: "Badge", type: "text", placeholder: "The People" },
            { key: "heroHeadline", label: "Hero Headline", type: "text", required: true },
            { key: "heroSubcopy", label: "Hero Subcopy", type: "textarea", rows: 3 },
            { key: "relatedEyebrow", label: "Related Eyebrow", type: "text", half: true, placeholder: "The Rest of the Studio" },
            { key: "relatedHeading", label: "Related Heading", type: "text", half: true, placeholder: "Other Editors" },
            { key: "relatedCtaLabel", label: "Related CTA Label", type: "text", placeholder: "View Full Studio" },
          ]}
        />

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Member Management</p>
              <h2 className="mt-1 text-base font-bold text-gray-900">{members.length} members</h2>
            </div>
            <span className="text-xs font-medium text-gray-400">{filteredMembers.length} shown</span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_170px]">
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
              <div className="grid grid-cols-[64px_1fr_1fr_1fr_100px_120px] bg-gray-50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                <span>Photo</span><span>Name</span><span>Role</span><span>Slug</span><span>Status</span><span>Actions</span>
              </div>
              {loading ? (
                <div className="space-y-2 p-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-gray-100" />)}</div>
              ) : filteredMembers.length ? filteredMembers.map((item) => (
                <div key={item.id} className="grid grid-cols-[64px_1fr_1fr_1fr_100px_120px] items-center gap-3 border-t border-gray-100 px-3 py-3 text-sm">
                  <div className="h-11 w-11 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                    {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : null}
                  </div>
                  <p className="truncate font-bold text-gray-900">{item.name}</p>
                  <p className="truncate text-xs font-semibold text-gray-500">{item.role}</p>
                  <p className="truncate font-mono text-xs font-semibold text-gray-500">{item.slug}</p>
                  <StatusBadge active={item.active !== false} />
                  <div className="flex gap-2">
                    <button onClick={() => toggleMember(item)} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50">{item.active === false ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
                    <button onClick={() => setModalState({ mode: "edit", member: item })} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><Edit3 className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteTarget(item)} className="rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )) : (
                <div className="border-t border-gray-100 p-8 text-center text-sm font-semibold text-gray-500">No members found.</div>
              )}
            </div>
          </div>
        </section>
      </div>

      {modalState ? <MemberModal mode={modalState.mode} member={modalState.member} members={members} onClose={() => setModalState(null)} /> : null}
      {deleteTarget ? (
        <DeleteConfirmModal
          title="Delete member"
          message={`Delete "${deleteTarget.name || deleteTarget.slug}"?`}
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      ) : null}
    </div>
  );
}

function StatCard({ label, value, tone = "gray" }) {
  const toneClass = {
    gray: "text-gray-900",
    green: "text-emerald-600",
    amber: "text-amber-600",
  }[tone];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`mt-2 text-2xl font-black ${toneClass}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
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

function MemberModal({ mode, member, members, onClose }) {
  const nextOrder = useMemo(() => members.reduce((max, item) => Math.max(max, Number(item.order) || 0), 0) + 1, [members]);
  const [form, setForm] = useState(() => ({
    ...EMPTY_MEMBER,
    ...member,
    focus: Array.isArray(member?.focus) ? member.focus : [],
    social: Array.isArray(member?.social) ? member.social : [],
    order: Number(member?.order) || nextOrder,
    active: member?.active !== false,
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
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

  function addSocialRow() {
    setForm((prev) => ({ ...prev, social: [...prev.social, { label: "", href: "" }] }));
  }

  function updateSocialRow(index, patch) {
    setForm((prev) => ({ ...prev, social: prev.social.map((row, i) => (i === index ? { ...row, ...patch } : row)) }));
  }

  function removeSocialRow(index) {
    setForm((prev) => ({ ...prev, social: prev.social.filter((_, i) => i !== index) }));
  }

  async function save() {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.slug.trim()) nextErrors.slug = "Slug is required.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateTeamMember(member.id, form);
        emitAlert({ type: "success", message: "Member updated." });
      } else {
        await createTeamMember(form);
        emitAlert({ type: "success", message: "Member added." });
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
            <h3 className="mt-1 text-lg font-bold text-gray-900">Member details</h3>
          </div>
          <button onClick={onClose} className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50"><X className="h-4 w-4" /></button>
        </div>

        <div className="mt-5 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" error={errors.name}><input value={form.name} onChange={(event) => setField("name", event.target.value)} className={inputClass} /></Field>
            <Field label="Slug" error={errors.slug}><input value={form.slug} onChange={(event) => setSlug(event.target.value)} className={inputClass} placeholder="mariana-cole" /></Field>
            <Field label="Role"><input value={form.role} onChange={(event) => setField("role", event.target.value)} className={inputClass} placeholder="Founder & Creative Director" /></Field>
            <Field label="Display Order"><input type="number" value={form.order} onChange={(event) => setField("order", event.target.value)} className={inputClass} /></Field>
          </div>

          <ImageField
            label="Portrait"
            value={form.image}
            onChange={(value) => setField("image", value)}
            upload={uploadTeamMemberImage}
          />

          <Field label="Short Bio"><textarea value={form.bio} onChange={(event) => setField("bio", event.target.value)} rows={2} className={textareaClass} /></Field>
          <Field label="Long Bio"><textarea value={form.longBio} onChange={(event) => setField("longBio", event.target.value)} rows={4} className={textareaClass} /></Field>
          <Field label="Pull Quote" hint="Shown as a standalone quote on the member's detail page.">
            <textarea value={form.quote} onChange={(event) => setField("quote", event.target.value)} rows={2} className={textareaClass} placeholder="A good brand reads like a well-edited sentence — nothing extra, nothing missing." />
          </Field>

          <ListEditor
            label="Focus Areas"
            value={form.focus}
            onChange={(value) => setField("focus", value)}
            placeholder="Brand Strategy"
          />

          <Repeater
            label="Social Links"
            rows={form.social}
            onAdd={addSocialRow}
            onRemove={removeSocialRow}
            render={(row, index) => (
              <div className="grid gap-2 sm:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
                <input value={row.label || ""} onChange={(event) => updateSocialRow(index, { label: event.target.value })} className={inputClass} placeholder="LinkedIn" />
                <input value={row.href || ""} onChange={(event) => updateSocialRow(index, { href: event.target.value })} className={inputClass} placeholder="https://linkedin.com/..." />
              </div>
            )}
          />

          <Field label="Status">
            <button onClick={() => setField("active", !form.active)} className={`flex h-11 w-full items-center justify-between rounded-xl border px-3 text-sm font-semibold ${form.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-gray-200 bg-gray-50 text-gray-500"}`}>
              <span>{form.active ? "Active" : "Inactive"}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${form.active ? "bg-emerald-500" : "bg-gray-400"}`} />
            </button>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-700 disabled:opacity-60">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {mode === "edit" ? "Update Member" : "Add Member"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Repeater({ label, rows, onAdd, onRemove, render }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{label}</p>
        <button onClick={onAdd} className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50">
          <Plus className="h-3.5 w-3.5" /> Add Row
        </button>
      </div>
      <div className="mt-3 space-y-3">
        {rows.length ? rows.map((row, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="flex-1">{render(row, index)}</div>
            <button onClick={() => onRemove(index)} className="mt-0.5 rounded-lg border border-red-200 p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        )) : (
          <p className="text-xs font-medium text-gray-400">No rows yet.</p>
        )}
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-gray-400">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs font-medium text-red-500">{error}</span> : null}
    </label>
  );
}
