"use client";

import { useState } from "react";
import PermissionMatrix from "./PermissionMatrix";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { PROJECTS } from "@/projects";
import {
  X, Mail, Lock, Eye, EyeOff, ShieldCheck, Shield,
  AlertCircle, Loader2, CheckCircle2, Info,
} from "lucide-react";

const PROJECT_LIST = Object.values(PROJECTS);

function Field({ label, hint, error, icon, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 uppercase tracking-wider">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
        {required && <span className="text-red-400">*</span>}
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

function TextInput({ error, ...props }) {
  return (
    <input {...props}
      className={`w-full text-sm px-3 py-2.5 rounded-xl border bg-white placeholder:text-gray-400
        focus:outline-none focus:ring-2 transition
        ${error ? "border-red-300 focus:ring-red-400/30 focus:border-red-400" : "border-gray-200 focus:ring-blue-400/30 focus:border-blue-400"}`} />
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

export default function CreateAdminModal({ onClose, refresh }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    else if (password.length < 6) e.password = "Password must be at least 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const createAdmin = async () => {
    if (!validate()) return;
    setLoading(true);
    setStep("saving");
    try {
      const user = getAuth().currentUser;
      if (!user) { setStep("idle"); emitAlert({ type: "error", message: "Session expired. Please log in again." }); return; }
      const token = await user.getIdToken(true);

      const res = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email,
          password,
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Create Admin Account</h2>
            <p className="text-xs text-gray-400 mt-0.5">Add a new administrator and configure their access level.</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          <Section title="Account Details">
            <Field label="Email Address" icon={<Mail className="w-3.5 h-3.5" />} required error={errors.email}
              hint="Used to log into the admin panel.">
              <TextInput type="email" placeholder="admin@example.com" value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                error={errors.email} disabled={loading} autoComplete="off" />
            </Field>

            <Field label="Password" icon={<Lock className="w-3.5 h-3.5" />} required error={errors.password}
              hint="Minimum 6 characters. Admin can change this later.">
              <div className="relative">
                <TextInput type={showPassword ? "text" : "password"} name="create-admin-password"
                  autoComplete="new-password" placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  error={errors.password} disabled={loading} />
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
                { value: "admin", label: "Admin", desc: "Limited access based on permissions below", icon: <Shield className="w-5 h-5" /> },
                { value: "superadmin", label: "Super Admin", desc: "Full unrestricted access to all modules", icon: <ShieldCheck className="w-5 h-5" /> },
              ].map((role) => (
                <label key={role.value}
                  className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none ${
                    roleType === role.value
                      ? role.value === "superadmin" ? "border-gray-900 bg-gray-900" : "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}>
                  <input type="radio" name="roleType" value={role.value} checked={roleType === role.value}
                    onChange={() => setRoleType(role.value)} className="mt-0.5 accent-gray-800" />
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

            {roleType === "superadmin" && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">Super Admins have full access to all modules and can manage other admins.</p>
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
              <p className="text-xs text-gray-400">Switch tabs to configure permissions per project.</p>
            </Section>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-4 h-4" />Admin account created successfully!
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-3 shrink-0 bg-gray-50">
          <p className="text-xs text-gray-400">New admin will receive login credentials separately.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={loading} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">Cancel</button>
            <button onClick={createAdmin} disabled={loading || step === "done"}
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
