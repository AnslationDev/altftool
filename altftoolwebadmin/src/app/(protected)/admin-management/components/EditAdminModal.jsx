"use client";

import { useState } from "react";
import PermissionMatrix from "./PermissionMatrix";
import { useAuth } from "@/context/AuthContext";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { PROJECTS } from "@/projects";
import {
  X, Mail, Lock, Eye, EyeOff, Shield, ShieldCheck, Users,
  AlertTriangle, AlertCircle, Loader2, CheckCircle2, UserX, UserCheck,
} from "lucide-react";

const PROJECT_LIST = Object.values(PROJECTS);

function Field({ label, hint, error, icon, htmlFor, required, children }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] uppercase tracking-wider">
        {icon && <span className="text-[var(--muted)]">{icon}</span>}
        {label}
        {required && <span className="text-[var(--danger)]">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-xs text-[var(--danger)] font-medium">
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
        <span className="text-[10px] font-black text-[var(--muted)] uppercase tracking-[0.15em] whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>
      {children}
    </div>
  );
}

export default function EditAdminModal({ admin, onClose, refresh }) {
  const { user: currentUser } = useAuth();
  const [email, setEmail] = useState(admin.email || "");
  const [fullName, setFullName] = useState(admin.fullName || "");
  const [team, setTeam] = useState(admin.team || "");
  const [roleType, setRoleType] = useState(admin.roleType);
  const [projectAccess, setProjectAccess] = useState(admin.projectAccess || {});
  const [activeProjectId, setActiveProjectId] = useState(PROJECT_LIST[0]?.id ?? null);
  const [isActive, setIsActive] = useState(admin.isActive);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const deleteAdmin = async () => {
    if (isSelf) {

      emitAlert({ type: "warning", message: "You cannot delete your own account" });
      return;
    }
    setLoading(true);
    setDeleting(true);
    try {
      const token = await getAdminIdToken(true);
      if (!token) {
        emitAlert({ type: "error", message: "Session expired." });
        return;
      }
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uid: admin.id }),
      });

      await readApiJson(res, "Failed to delete admin");

      emitAlert({ type: "success", message: "Admin account deleted successfully" });
      refresh();
      onClose();
    } catch (error) {
      emitAlert({ type: "error", message: error?.message || "Failed to delete admin" });
    } finally {
      setLoading(false);
      setDeleting(false);
    }
  };

  // From context, not getAuth().currentUser: under the local-admin dev session
  // there is no Firebase user, so a raw Firebase read left this self-protection
  // check permanently disabled in that mode.
  const currentUserUid = currentUser?.uid;
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
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError("Email address is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setEmailError("Enter a valid email address");
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setStep("saving");
    try {
      const token = await getAdminIdToken(true);
      if (!token) { emitAlert({ type: "error", message: "Session expired." }); setStep("idle"); return; }

      const updateRes = await fetch("/api/admin/update", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          uid: admin.id,
          updates: {
            email: trimmedEmail,
            fullName,
            team,
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
      <div role="dialog" aria-modal="true" aria-labelledby="edit-admin-modal-title" className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 id="edit-admin-modal-title" className="text-base font-bold text-[var(--foreground)]">Edit Admin</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Editing <span className="font-semibold text-[var(--foreground)]">{admin.email}</span>
              {isSelf && <span className="ml-1.5 text-[10px] font-bold bg-[var(--primary-soft)] text-[var(--primary)] px-1.5 py-0.5 rounded-full">You</span>}
            </p>
          </div>
          <button onClick={onClose} disabled={loading} aria-label="Close" className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          <Section title="Account">
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--border)] flex items-center justify-center text-sm font-bold text-[var(--muted)] shrink-0">
                {admin.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{admin.email}</p>
                <p className="text-xs text-[var(--muted)]">UID: <span className="font-mono">{admin.id}</span></p>
              </div>
              <div className="ml-auto shrink-0">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${admin.isActive ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-[var(--danger-soft)] text-[var(--danger)]"}`}>
                  {admin.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
            <Field label="Login Email" htmlFor="edit-admin-email" icon={<Mail className="w-3.5 h-3.5" />} required
              hint="Used to sign in to the admin panel." error={emailError}>
              <input
                id="edit-admin-email"
                type="email"
                value={email}
                onChange={(event) => { setEmail(event.target.value); setEmailError(""); }}
                disabled={loading}
                autoComplete="email"
                aria-invalid={emailError ? "true" : undefined}
                className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 transition ${
                  emailError ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30" : "border-[var(--border)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                }`}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full Name" htmlFor="edit-admin-full-name" icon={<Users className="w-3.5 h-3.5" />} hint="Shown on the admin card.">
                <input
                  id="edit-admin-full-name"
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
                />
              </Field>
              <Field label="Team" htmlFor="edit-admin-team" icon={<Users className="w-3.5 h-3.5" />} hint="Optional team or department.">
                <input
                  id="edit-admin-team"
                  type="text"
                  value={team}
                  onChange={(event) => setTeam(event.target.value)}
                  disabled={loading}
                  placeholder="e.g. Operations"
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition"
                />
              </Field>
            </div>
          </Section>

          <Section title="Reset Password">
            {isSelf && (
              <div className="flex items-start gap-2 bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-xl px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--warning)]">Changing your own password may require you to log in again.</p>
              </div>
            )}
            <Field label="New Password" htmlFor="edit-admin-new-password" icon={<Lock className="w-3.5 h-3.5" />}
              hint="Passwords cannot be viewed. Enter a new password to reset it." error={passwordError}>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} id="edit-admin-new-password" name="edit-admin-new-password"
                  autoComplete="new-password" placeholder="Leave blank to keep current password"
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(""); }}
                  disabled={loading}
                  className={`w-full text-sm px-3 py-2.5 pr-10 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 transition ${
                    passwordError ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30" : "border-[var(--border)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"
                  }`} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition">
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
                      ? role.value === "superadmin" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--primary)]/40 bg-[var(--primary-soft)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                  }`}>
                  <input type="radio" name="roleType" value={role.value} checked={roleType === role.value}
                    onChange={() => !isSelf && setRoleType(role.value)}
                    disabled={isSelf} className="mt-0.5 accent-[var(--primary)]" />
                  <div>
                    <div className={`flex items-center gap-1.5 text-sm font-bold ${roleType === role.value && role.value === "superadmin" ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]"}`}>
                      <span className={roleType === role.value && role.value === "superadmin" ? "text-[var(--primary-foreground)]" : "text-[var(--muted)]"}>{role.icon}</span>
                      {role.label}
                    </div>
                    <p className={`text-xs mt-0.5 ${roleType === role.value && role.value === "superadmin" ? "text-[var(--primary-foreground)]/70" : "text-[var(--muted)]"}`}>{role.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            {isSelf && <p className="text-xs text-[var(--muted)] flex items-center gap-1"><AlertCircle className="w-3 h-3" />You cannot change your own role.</p>}

            {!isSelf && (
              <div className={`flex items-center justify-between p-4 rounded-xl border transition ${isActive ? "border-[var(--success)]/30 bg-[var(--success-soft)]/40" : "border-[var(--danger)]/30 bg-[var(--danger-soft)]/40"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isActive ? "bg-[var(--success-soft)]" : "bg-[var(--danger-soft)]"}`}>
                    {isActive ? <UserCheck className="w-4 h-4 text-[var(--success)]" /> : <UserX className="w-4 h-4 text-[var(--danger)]" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground)]">Account Status</p>
                    <p className="text-xs text-[var(--muted)]">{isActive ? "Account is active — admin can log in." : "Account is inactive — access revoked immediately."}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setIsActive((v) => !v)}
                  role="switch" aria-checked={isActive} aria-label="Account active"
                  className={`relative w-11 h-6 rounded-full transition-colors ${isActive ? "bg-[var(--success)]" : "bg-[var(--border-strong)]"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
                </button>
              </div>
            )}
          </Section>

          {roleType === "admin" && (
            <Section title="Module Permissions">
              <div className="flex gap-0 border-b border-[var(--border)]">
                {PROJECT_LIST.map((proj) => {
                  const isActive = proj.id === activeProjectId;
                  const hasAny = Object.values(projectAccess[proj.id]?.permissions ?? {})
                    .some((p) => p?.read || p?.write || p?.delete);
                  return (
                    <button key={proj.id} type="button" onClick={() => setActiveProjectId(proj.id)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
                        isActive ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                      }`}>
                      {proj.name}
                      {hasAny && <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />}
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
            <div className="flex items-center gap-2 text-xs text-[var(--success)] font-medium">
              <CheckCircle2 className="w-4 h-4" />Changes saved successfully.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-soft)]">
          {showDeleteConfirm ? (
            <>
              <p className="text-xs font-semibold text-[var(--danger)] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Are you sure? This cannot be undone.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAdmin}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-[var(--danger)] hover:opacity-90 text-[var(--danger-foreground)] font-semibold rounded-xl transition shadow-sm"
                >
                  {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Delete
                </button>
              </div>
            </>
          ) : (
            <>
              {!isSelf ? (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={loading}
                  className="px-4 py-2 text-sm border border-[var(--danger)]/30 rounded-xl text-[var(--danger)] hover:bg-[var(--danger-soft)] bg-[var(--surface)] font-semibold transition disabled:opacity-40"
                >
                  Delete Admin
                </button>
              ) : (
                <p className="text-xs text-[var(--muted)]">Changes take effect immediately on next login check.</p>
              )}
              <div className="flex items-center gap-2">
                <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--surface-soft)] transition disabled:opacity-40">Cancel</button>
                <button onClick={updateAdmin} disabled={loading || step === "done"}
                  className="flex items-center gap-2 px-5 py-2 text-sm bg-[var(--primary)] hover:opacity-90 disabled:opacity-60 text-[var(--primary-foreground)] font-semibold rounded-xl transition shadow-sm">
                  {loading && step === "saving" && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {step === "done" && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {stepLabel}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
