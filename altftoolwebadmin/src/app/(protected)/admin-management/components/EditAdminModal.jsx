"use client";

import { useState } from "react";
import PermissionMatrix from "./PermissionMatrix";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { PROJECTS } from "@/projects";
import {
  X, Lock, Eye, EyeOff, Shield, ShieldCheck,
  AlertTriangle, AlertCircle, Loader2, CheckCircle2, UserX, UserCheck,
} from "lucide-react";

const PROJECT_LIST = Object.values(PROJECTS);

function Field({ label, hint, error, icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 font-medium">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {children}
    </div>
  );
}

export default function EditAdminModal({ admin, onClose, refresh }) {
  const [roleType, setRoleType] = useState(admin.roleType);
  const [projectAccess, setProjectAccess] = useState(admin.projectAccess || {});
  const [activeProjectId, setActiveProjectId] = useState(PROJECT_LIST[0]?.id ?? null);
  const [isActive, setIsActive] = useState(admin.isActive);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");

  const currentUserUid = getAuth().currentUser?.uid;
  const isSelf = currentUserUid === admin.id;

  const activeProject = PROJECTS[activeProjectId];
  const activeModules = activeProject
    ? Object.fromEntries(Object.entries(activeProject.modules).map(([k, v]) => [k, v.label]))
    : {};

  // PermissionMatrix calls this with a plain new permissions object (not an updater fn)
  const setActivePermissions = (newPerms) => {
    setProjectAccess((prev) => ({
      ...prev,
      [activeProjectId]: { permissions: newPerms },
    }));
  };

  const activePermissions = projectAccess[activeProjectId]?.permissions ?? {};

  const updateAdmin = async () => {
    if (isSelf && !isActive) {
      emitAlert({ type: "warning", message: "You cannot deactivate your own account" });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setStep("saving");
    try {
      const user = getAuth().currentUser;
      if (!user) { emitAlert({ type: "error", message: "Session expired." }); setStep("idle"); return; }
      const token = await user.getIdToken(true);

      const updateRes = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          uid: admin.id,
          updates: {
            roleType,
            isActive,
            permissions: {},
            projectAccess: roleType === "superadmin" ? {} : projectAccess,
          },
        }),
      });

      await readApiJson(updateRes, "Failed to update admin details");

      if (newPassword) {
        const passRes = await fetch("/api/admin/change-password", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ uid: admin.id, password: newPassword }),
        });
        await readApiJson(passRes, "Admin updated, but password change failed");
      }

      setStep("done");
      emitAlert({ type: "success", message: newPassword ? "Admin updated and password changed" : "Admin updated successfully" });
      refresh();
      setTimeout(onClose, 600);
    } catch (error) {
      setStep("idle");
      emitAlert({ type: "error", message: error?.message || "Network error. Try again later." });
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = { idle: "Save Changes", saving: "Saving…", done: "Saved!" }[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Edit Admin</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Editing <span className="font-semibold text-gray-700">{admin.email}</span>
              {isSelf && <span className="ml-1.5 text-[10px] font-bold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">You</span>}
            </p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          <Section title="Account">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                {admin.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{admin.email}</p>
                <p className="text-xs text-gray-400">UID: <span className="font-mono">{admin.id}</span></p>
              </div>
              <div className="ml-auto shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${admin.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </Section>

          <Section title="Change Password">
            {isSelf && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Changing your own password may require you to log in again.</p>
              </div>
            )}
            <Field label="New Password" icon={<Lock className="w-3.5 h-3.5" />}
              hint="Leave blank to keep the current password." error={passwordError}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="edit-admin-new-password"
                  autoComplete="new-password" placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  disabled={loading}
                  className={`w-full text-sm px-3 py-2.5 pr-10 rounded-xl border bg-white placeholder:text-gray-400 focus:outline-none focus:ring-2 transition ${
                    passwordError ? "border-red-300 focus:ring-red-400/30" : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"
                  }`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
          </Section>

          <Section title="Role & Access">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "admin", label: "Admin", desc: "Limited access via permissions", icon: <Shield className="w-5 h-5" /> },
                { value: "superadmin", label: "Super Admin", desc: "Full access to all modules", icon: <ShieldCheck className="w-5 h-5" /> },
              ].map((role) => (
                <label key={role.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none ${isSelf ? "opacity-50 cursor-not-allowed" : ""} ${
                    roleType === role.value
                      ? role.value === "superadmin" ? "border-gray-900 bg-gray-900" : "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  <input type="radio" name="roleType" value={role.value} checked={roleType === role.value}
                    onChange={() => !isSelf && setRoleType(role.value)}
                    disabled={isSelf} className="mt-0.5 accent-gray-800" />
                  <div>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${roleType === role.value && role.value === "superadmin" ? "text-white" : "text-gray-800"}`}>
                      <span className={roleType === role.value && role.value === "superadmin" ? "text-white" : "text-gray-500"}>{role.icon}</span>
                      {role.label}
                    </div>
                    <p className={`text-xs mt-0.5 ${roleType === role.value && role.value === "superadmin" ? "text-gray-300" : "text-gray-500"}`}>{role.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {isSelf && <p className="text-xs text-gray-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" />You cannot change your own role.</p>}

            {!isSelf && (
              <div className={`flex items-center justify-between p-4 rounded-xl border transition ${isActive ? "border-green-200 bg-green-50/40" : "border-red-200 bg-red-50/40"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-green-100" : "bg-red-100"}`}>
                    {isActive ? <UserCheck className="w-4 h-4 text-green-600" /> : <UserX className="w-4 h-4 text-red-600" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Account Status</p>
                    <p className="text-xs text-gray-500">{isActive ? "Account is active — admin can log in." : "Account is inactive — access revoked immediately."}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsActive((v) => !v)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-green-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            )}
          </Section>

          {roleType === "admin" && (
            <Section title="Module Permissions">
              <div className="flex gap-0 border-b border-gray-100">
                {PROJECT_LIST.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  const hasAny = Object.values(projectAccess[proj.id]?.permissions ?? {})
                    .some((p) => p?.read || p?.write || p?.delete);
                  return (
                    <button key={proj.id} type="button" onClick={() => setActiveProjectId(proj.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
                        isActive ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                      }`}>
                      {proj.name}
                      {hasAny && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />}
                    </button>
                  );
                })}
              </div>

              <PermissionMatrix
                modules={activeModules}
                permissions={activePermissions}
                setPermissions={setActivePermissions}
              />
            </Section>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />Changes saved successfully.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">Changes take effect immediately on next login check.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">Cancel</button>
            <button onClick={updateAdmin} disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-gray-900 hover:bg-gray-700 disabled:opacity-60 text-white font-semibold rounded-xl transition shadow-sm">
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {step === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
              {stepLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
