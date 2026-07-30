"use client";
import { useState } from "react";
import PermissionMatrix from "@/app/(protected)/admin-management/components/PermissionMatrix";
import { emitAlert } from "@/lib/alertBus";
import { readApiJson } from "@/lib/apiClient";
import { getAdminIdToken } from "@/lib/adminIdToken";
import { PROJECTS } from "@/projects";
import {
  X, Shield, ShieldCheck, Loader2, CheckCircle2, Info, AlertTriangle,
} from "lucide-react";

const PROJECT_LIST = Object.values(PROJECTS);

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-black text-[var(--muted-soft)] uppercase tracking-[0.15em] whitespace-nowrap">{title}</span>
        <div className="flex-1 h-px bg-[var(--border)]" />
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
  const [approveError, setApproveError] = useState(null);

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
    setApproveError(null);
    try {
      const token = await getAdminIdToken(true);
      if (!token) {
        emitAlert({ type: "error", message: "Session expired. Please log in again." });
        setStep("idle");
        return;
      }

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
        // The admin account already exists at this point (step 1 succeeded) —
        // showing the normal "Done" success state / auto-close here would tell
        // the operator everything worked while the request row stays "pending"
        // in Firestore, inviting a second "Approve" click that would retry
        // /api/admin/create for an email that already has an admin doc. Surface
        // a persistent error instead so the operator knows the account exists
        // but the request itself still needs to be marked approved (or that
        // status corrected directly), and stop here — no done state, no toast,
        // no auto-close, no refresh of the (unresolved) requests list.
        const message = error?.message || "Admin created, but request status update failed";
        setApproveError(
          `Admin account created for ${request.email}, but the request could not be marked approved (${message}). ` +
            "It will still show as pending — do not approve it again; the account already exists.",
        );
        setStep("idle");
        emitAlert({ type: "error", message });
        return;
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
    <div className="fixed inset-0 bg-[var(--overlay)] flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl shadow-2xl w-full max-w-[700px] max-h-[92vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[var(--border)] shrink-0">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Approve Access Request</h2>
            <p className="text-xs text-[var(--muted-soft)] mt-0.5">
              Create an admin account for{" "}
              <span className="font-semibold text-[var(--foreground)]">{request.email}</span>
            </p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1.5 rounded-lg text-[var(--muted)] hover:bg-[var(--surface-soft)] transition disabled:opacity-40">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-7">

          {/* Email read-only card */}
          <Section title="Account">
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--surface-soft)] rounded-xl border border-[var(--border)]">
              <div className="w-9 h-9 rounded-xl bg-[var(--border)]/60 flex items-center justify-center text-sm font-bold text-[var(--muted)] shrink-0">
                {request.email?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--foreground)] truncate">{request.email}</p>
                <p className="text-xs text-[var(--muted-soft)]">Google account · access request</p>
              </div>
            </div>
          </Section>

          {/* Role */}
          <Section title="Role & Access">
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "admin",      label: "Admin",       desc: "Limited access based on permissions below",    icon: <Shield className="w-5 h-5" /> },
                { value: "superadmin", label: "Super Admin", desc: "Full unrestricted access to all modules",      icon: <ShieldCheck className="w-5 h-5" /> },
              ].map((role) => {
                const isSelected = roleType === role.value;
                const isSuperSelected = isSelected && role.value === "superadmin";
                return (
                  <label key={role.value}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition select-none ${
                      isSuperSelected
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : isSelected
                          ? "border-[var(--primary)]/50 bg-[var(--primary-soft)]"
                          : "border-[var(--border)] hover:bg-[var(--surface-soft)]"
                    }`}>
                    <input type="radio" name="roleType" value={role.value} checked={isSelected}
                      onChange={() => setRoleType(role.value)} className="mt-0.5 accent-[var(--primary)]" />
                    <div>
                      <div className={`flex items-center gap-1.5 text-sm font-bold ${isSuperSelected ? "text-[var(--primary-foreground)]" : "text-[var(--foreground)]"}`}>
                        <span className={isSuperSelected ? "text-[var(--primary-foreground)]" : "text-[var(--muted)]"}>{role.icon}</span>
                        {role.label}
                      </div>
                      <p className={`text-xs mt-0.5 ${isSuperSelected ? "text-[var(--primary-foreground)]/80" : "text-[var(--muted)]"}`}>{role.desc}</p>
                    </div>
                  </label>
                );
              })}
            </div>

            {roleType === "superadmin" && (
              <div className="flex items-start gap-2 bg-[var(--warning-soft)] border border-[var(--warning)]/30 rounded-xl px-4 py-3">
                <Info className="w-4 h-4 text-[var(--warning-text)] shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--warning-text)]">Super Admins have full access to all modules and can manage other admins.</p>
              </div>
            )}
          </Section>

          {/* Permissions */}
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
                        isActive ? "border-[var(--primary)] text-[var(--foreground)]" : "border-transparent text-[var(--muted-soft)] hover:text-[var(--muted)]"
                      }`}>
                      {proj.name}
                      {hasAny && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />}
                    </button>
                  );
                })}
              </div>
              <PermissionMatrix
                modules={activeModules}
                permissions={activePermissions}
                setPermissions={setActivePermissions}
              />
              <p className="text-xs text-[var(--muted-soft)]">Switch tabs to configure permissions per project.</p>
            </Section>
          )}

          {step === "done" && (
            <div className="flex items-center gap-2 text-xs text-[var(--success)] font-medium">
              <CheckCircle2 className="w-4 h-4" />Admin account created successfully!
            </div>
          )}

          {/* Persistent — does not auto-dismiss like a toast — because the
              admin account already exists at this point; the operator needs
              to see this until they've dealt with the still-pending request. */}
          {approveError && (
            <div className="flex items-start gap-2 bg-[var(--danger-soft)] border border-[var(--danger)]/30 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-[var(--danger)] shrink-0 mt-0.5" />
              <p className="text-xs text-[var(--danger-text)]">{approveError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between gap-3 shrink-0 bg-[var(--surface-soft)]">
          <p className="text-xs text-[var(--muted-soft)]">
            {approveError
              ? "Resolve the request status manually — approving again would try to create the admin account a second time."
              : "The user will be able to log in immediately after approval."}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm border border-[var(--border)] rounded-xl text-[var(--muted)] hover:bg-[var(--surface)] transition disabled:opacity-40">
              Cancel
            </button>
            <button onClick={handleApprove} disabled={loading || step === "done" || Boolean(approveError)}
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
