"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, CheckCircle2, ChevronDown, ChevronUp, Shield, ShieldCheck, User } from "lucide-react";
import { emitAlert } from "@/lib/alertBus";
import { PROJECTS } from "@/projects";

export default function ProfilePage() {
  const { user, adminData, isSuperAdmin, refreshAuth } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    team: "",
    designation: "",
    bio: "",
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const fileInputRef = useRef(null);

  // Sync form whenever adminData changes (on mount and after refreshAuth)
  useEffect(() => {
    if (!adminData) return;
    setForm({
      firstName: adminData.firstName ?? "",
      lastName: adminData.lastName ?? "",
      team: adminData.team ?? "",
      designation: adminData.designation ?? "",
      bio: adminData.bio ?? "",
    });
  }, [adminData]);

  const photoURL = adminData?.photoURL || null;
  const displayName =
    adminData?.fullName ||
    (adminData?.firstName
      ? `${adminData.firstName} ${adminData.lastName ?? ""}`.trim()
      : null);

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "A").toUpperCase();

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      const fullName = `${form.firstName} ${form.lastName}`.trim();
      await updateDoc(doc(db, "admins", uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        fullName,
        team: form.team,
        designation: form.designation,
        bio: form.bio,
      });

      await refreshAuth();
      emitAlert({ type: "success", message: "Profile updated successfully." });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to save profile." });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `admin-avatars/${uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await updateDoc(doc(db, "admins", uid), { photoURL: url });
      await refreshAuth();
      emitAlert({ type: "success", message: "Profile picture updated." });
    } catch (err) {
      console.error(err);
      emitAlert({ type: "error", message: "Failed to upload image." });
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const projectAccessEntries = Object.entries(adminData?.projectAccess ?? {});

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 space-y-6">
      {/* ── Profile Header ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-5">
        <div className="relative shrink-0">
          {photoURL ? (
            <img
              src={photoURL}
              alt="Profile"
              className="w-20 h-20 rounded-2xl object-cover border border-gray-200"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gray-900 text-white flex items-center justify-center text-2xl font-bold">
              {initials}
            </div>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm hover:bg-gray-50 transition disabled:opacity-50"
            title="Change photo"
          >
            {uploading ? (
              <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-gray-600" />
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        <div className="min-w-0">
          <p className="text-lg font-bold text-gray-900 truncate">
            {displayName || user?.email}
          </p>
          {adminData?.designation && (
            <p className="text-sm text-gray-500 truncate">{adminData.designation}</p>
          )}
          {adminData?.team && (
            <p className="text-xs text-gray-400 mt-0.5">{adminData.team}</p>
          )}
          <span
            className={`mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
              isSuperAdmin ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {isSuperAdmin ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            {isSuperAdmin ? "Super Admin" : "Admin"}
          </span>
        </div>
      </div>

      {/* ── Editable Form ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Profile Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
          <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} />
          <Field label="Team" name="team" value={form.team} onChange={handleChange} />
          <Field label="Designation" name="designation" value={form.designation} onChange={handleChange} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
          <textarea
            name="bio"
            value={form.bio}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 resize-none"
            placeholder="Short bio or notes…"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <User className="w-3.5 h-3.5" />
          <span>{user?.email}</span>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-900 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-60"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* ── Permissions View ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Access & Permissions</h2>

        {isSuperAdmin ? (
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
            <ShieldCheck className="w-4 h-4 text-gray-800" />
            Super Admin — full access to all projects and modules.
          </div>
        ) : projectAccessEntries.length === 0 ? (
          <p className="text-sm text-gray-400 italic">No project permissions assigned yet.</p>
        ) : (
          projectAccessEntries.map(([projectId, projectAccess]) => {
            const project = PROJECTS[projectId];
            const isOpen = expandedProject === projectId;
            const permEntries = Object.entries(projectAccess?.permissions ?? {});

            return (
              <div key={projectId} className="border border-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedProject(isOpen ? null : projectId)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-sm font-semibold text-gray-800"
                >
                  <span>{project?.name ?? projectId}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 divide-y divide-gray-50">
                    {permEntries.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-gray-400 italic">No module permissions.</p>
                    ) : (
                      permEntries.map(([moduleKey, perms]) => {
                        const moduleConfig = project?.modules?.[moduleKey];
                        return (
                          <div key={moduleKey} className="flex items-center justify-between px-4 py-2.5">
                            <span className="text-sm text-gray-700 capitalize">
                              {moduleConfig?.label ?? moduleKey}
                            </span>
                            <div className="flex items-center gap-2">
                              <PermBadge label="Read" active={!!perms?.read} />
                              <PermBadge label="Write" active={!!perms?.write} />
                              <PermBadge label="Delete" active={!!perms?.delete} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Legacy flat permissions fallback */}
        {!isSuperAdmin &&
          projectAccessEntries.length === 0 &&
          Object.keys(adminData?.permissions ?? {}).length > 0 && (
            <div className="border border-gray-100 rounded-xl overflow-hidden">
              <div className="px-4 py-3 text-sm font-semibold text-gray-800 bg-gray-50">
                Module Access (Legacy)
              </div>
              <div className="divide-y divide-gray-50">
                {Object.entries(adminData.permissions).map(([moduleKey, perms]) => (
                  <div key={moduleKey} className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-sm text-gray-700 capitalize">{moduleKey}</span>
                    <div className="flex items-center gap-2">
                      <PermBadge label="Read" active={!!perms?.read} />
                      <PermBadge label="Write" active={!!perms?.write} />
                      <PermBadge label="Delete" active={!!perms?.delete} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
      />
    </div>
  );
}

function PermBadge({ label, active }) {
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
        active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
      }`}
    >
      {label}
    </span>
  );
}