"use client";

import { useState } from "react";
import PermissionMatrix from "./PermissionMatrix";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { PROJECTS } from "@/projects";
import {
  X, Mail, Lock, Eye, EyeOff, ShieldCheck, Shield,
  AlertCircle, Loader2, Users, CheckCircle2, Info,
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

function TextInput({ error, ...props }) {
  return (
    <input {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-[var(--surface)] placeholder:text-[var(--muted)]
        focus:outline-none focus:ring-2 transition
        ${error ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/30 focus:border-[var(--danger)]" : "border-[var(--border)] focus:ring-[var(--primary)]/30 focus:border-[var(--primary)]"}`} />
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

export default function CreateAdminModal({ onClose, refresh }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [team, setTeam] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roleType, setRoleType] = useState("admin");
  const [projectAccess, setProjectAccess] = useState({});
  const [activeProjectId, setActiveProjectId] = useState(PROJECT_LIST[0]?.id ?? null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");

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

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address";
    if (!password) e.password = "Password is required";
    else if (password.length < 8) e.password = "Password must be at least 8 characters";
    else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      e.password = "Password must include at least one letter and one number";
    }
     if (!fullName.trim()) {
    e.fullName = "Full name is required";
  }

    setErrors(e);
    return Object.keys(e).length === 0;
  };



  const createAdmin = async () => {
    if (!validate()) return;
    setLoading(true);
    setStep("saving");
    try {
      const token = await getAdminIdToken(true);
      if (!token) { setStep("idle"); emitAlert({ type: "error", message: "Session expired. Please log in again." }); return; }

      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email,
          password,
          fullName,
          team,
          roleType,
          permissions: {},
          projectAccess: roleType === "superadmin" ? {} : projectAccess,
        }),
      });

      await readApiJson(res, "Failed to create admin");

      setStep("done");
      emitAlert({ type: "success", message: "Admin created successfully" });
      refresh();
      setTimeout(onClose, 600);
    } catch (error) {
      setStep("idle");
      emitAlert({ type: error?.status === 409 ? "warning" : "error", message: error?.message || "Network error. Check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = { idle: "Create Admin", saving: "Creating…", done: "Done!" }[step];

  return (
    <div className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="create-admin-modal-title" className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 id="create-admin-modal-title" className="text-base font-bold text-[var(--foreground)]">Create Admin Account</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Add a new administrator and configure their access level.</p>
          </div>
          <button onClick={onClose} disabled={loading} aria-label="Close" className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          <Section title="Account Details">
            <Field label="Email Address" htmlFor="create-admin-email" icon={<Mail className="w-3.5 h-3.5" />} required error={errors.email}
              hint="Used to log into the admin panel.">
              <TextInput id="create-admin-email" type="email" placeholder="admin@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                error={errors.email} disabled={loading} autoComplete="off" />
            </Field>

            <Field label="Password" htmlFor="create-admin-password" icon={<Lock className="w-3.5 h-3.5" />} required error={errors.password}
              hint="Minimum 8 characters, including a letter and a number. Admin can change this later.">
              <div className="relative">
                <TextInput id="create-admin-password" type={showPassword ? "text" : "password"} name="create-admin-password"
                  autoComplete="new-password" placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  error={errors.password} disabled={loading} />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>
            <Field
              label="Full Name"
              htmlFor="create-admin-full-name"
              icon={<Users className="w-3.5 h-3.5" />}
              required
              error={errors.fullName}
              hint="Enter the full name of the admin."
            >
              <TextInput
                id="create-admin-full-name"
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                error={errors.fullName}
                disabled={loading}
              />
            </Field>

            <Field
              label="Team"
              htmlFor="create-admin-team"
              icon={<Users className="w-3.5 h-3.5" />}
              hint="Optional team, department, or function for this administrator."
            >
              <TextInput
                id="create-admin-team"
                type="text"
                placeholder="e.g. Operations"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                disabled={loading}
              />
            </Field>

          </Section>



          <Section title="Role & Access">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "admin", label: "Admin", desc: "Limited access based on permissions below", icon: <Shield className="w-5 h-5" /> },
                { value: "superadmin", label: "Super Admin", desc: "Full unrestricted access to all modules", icon: <ShieldCheck className="w-5 h-5" /> },
              ].map((role) => (
                <label key={role.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none ${
                    roleType === role.value
                      ? role.value === "superadmin" ? "border-[var(--primary)] bg-[var(--primary-soft)]" : "border-[var(--primary)]/40 bg-[var(--primary-soft)]"
                      : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                  }`}>
                  <input type="radio" name="roleType" value={role.value} checked={roleType === role.value}
                    onChange={() => setRoleType(role.value)} className="mt-0.5 accent-[var(--primary)]" />
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-[var(--foreground)]">
                      <span className={roleType === role.value ? "text-[var(--primary)]" : "text-[var(--muted)]"}>{role.icon}</span>
                      {role.label}
                    </div>
                    <p className={`text-xs mt-0.5 ${roleType === role.value ? "text-[var(--foreground)]/80" : "text-[var(--muted)]"}`}>{role.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            {roleType === "superadmin" && (
              <div className="flex items-start gap-2 bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-xl px-4 py-3 text-[color-mix(in_srgb,var(--warning)_50%,var(--foreground))]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs">Super Admins have full access to all modules and can manage other admins.</p>
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
              <p className="text-xs text-[var(--muted)]">Switch tabs to configure permissions per project.</p>
            </Section>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-[var(--success)] font-medium">
              <CheckCircle2 className="w-4 h-4" />Admin account created successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-soft)]">
          <p className="text-xs text-[var(--muted)]">New admin will receive login credentials separately.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--foreground)] bg-[var(--surface)] hover:bg-[var(--border-strong)] transition disabled:opacity-40">Cancel</button>
            <button onClick={createAdmin} disabled={loading || step === "done"}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-60 text-[var(--primary-foreground)] font-semibold rounded-xl transition shadow-sm">
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
