"use client";
import { useState } from "react";
import PermissionMatrix from "@/app/(protected)/admin-management/components/PermissionMatrix";
import { getAuth } from "firebase/auth";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { PROJECTS } from "@/projects";
import {
  X, Shield, ShieldCheck, Loader2, CheckCircle2, Info,
} from "lucide-react";

const PROJECT_LIST = Object.values(PROJECTS);

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

export default function ApproveRequestModal({ request, onClose, refresh }) {
  const [roleType, setRoleType] = useState("admin");
  const [projectAccess, setProjectAccess] = useState({});
  const [activeProjectId, setActiveProjectId] = useState(PROJECT_LIST[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("idle");

  const activeProject = PROJECTS[activeProjectId];
  const activeModules = activeProject
    ? Object.fromEntries(Object.entries(activeProject.modules).map(([k, v]) => [k, v.label]))
    : {};

  const setActivePermissions = (newPerms) => {
    setProjectAccess((prev) => ({
      ...prev,
      [activeProjectId]: { permissions: newPerms },
    }));
  };

  const activePermissions = projectAccess[activeProjectId]?.permissions ?? {};

  const handleApprove = async () => {
    setLoading(true);
    setStep("saving");
    try {
      const currentUser = getAuth().currentUser;
      if (!currentUser) {
        emitAlert({ type: "error", message: "Session expired. Please log in again." });
        setStep("idle");
        return;
      }
      const token = await currentUser.getIdToken(true);

      /* ── Step 1: Create the Firestore admin doc via existing API.
         /api/admin/create now does getUserByEmail first, so it never
         calls createUser() for Google users who already have an Auth record. ── */
      const createRes = await fetch("/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          email: request.email,
          // No password — the Google Auth user already exists.
          // /api/admin/create handles absent password gracefully.
          roleType,
          permissions: {},
          projectAccess: roleType === "superadmin" ? {} : projectAccess,
        }),
      });

      await readApiJson(createRes, "Failed to create admin");

      /* ── Step 2: Mark the access request as approved ── */
      const approveRes = await fetch("/api/admin/access-requests/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId: request.id }),
      });

      try {
        await readApiJson(approveRes, "Admin created, but request status update failed");
      } catch (error) {
        emitAlert({ type: "warning", message: error?.message || "Admin created, but request status update failed" });
      }

      setStep("done");
      emitAlert({ type: "success", message: `Admin account created for ${request.email}` });
      refresh();
      setTimeout(onClose, 600);
    } catch (error) {
      console.error("ApproveRequestModal error:", error);
      setStep("idle");
      emitAlert({ type: "error", message: error?.message || "Network error. Check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const stepLabel = { idle: "Approve & Create Admin", saving: "Creating…", done: "Done!" }[step];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-base font-bold text-gray-900">Approve Access Request</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Create an admin account for{" "}
              <span className="font-semibold text-gray-700">{request.email}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* Email read-only card */}
          <Section title="Account">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-9 h-9 rounded-xl bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                {request.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">{request.email}</p>
                <p className="text-xs text-gray-400">Google account · access request</p>
              </div>
            </div>
          </Section>

          {/* Role */}
          <Section title="Role & Access">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "admin",      label: "Admin",       desc: "Limited access based on permissions below",    icon: <Shield className="w-5 h-5" /> },
                { value: "superadmin", label: "Super Admin", desc: "Full unrestricted access to all modules",      icon: <ShieldCheck className="w-5 h-5" /> },
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

          {/* Permissions */}
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
          <p className="text-xs text-gray-400">The user will be able to log in immediately after approval.</p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-white transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={handleApprove} disabled={loading || step === "done"}
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
