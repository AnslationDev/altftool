"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useId, useRef, useState } from "react";
import { auth } from "@/lib/firebaseAuth";
import { db } from "@/lib/firebaseFirestore";
import { storage } from "@/lib/firebaseStorage";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Lock,
  Shield,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { Button, Field, Input, Textarea } from "@altftool/ui";
import { EmptyState, PageHeader, SectionCard } from "@/ansets";
import { emitAlert } from "@/lib/alertBus";
import { PROJECTS } from "@/projects";
import { RBAC_PATHS } from "@/lib/rbacPaths";

const NO_SESSION_MESSAGE =
  "Your session isn't ready — please sign in again before editing your profile.";

const NO_PROFILE_RECORD_MESSAGE =
  "No editable admin record is linked to your account id. Ask a super admin to re-link your admin profile, then try again.";

// The <input accept="image/*"> attribute is a picker hint only — a file can
// still be dropped/selected around it — so the actual type and size must be
// checked in code before anything is uploaded.
const ALLOWED_PHOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/**
 * Resolve where this admin's profile actually lives, mirroring /api/admin/me:
 * RBAC store first (`super_admin_dashboard/main/admin_users/{uid}`), legacy
 * `admins/{uid}` only as a fallback. Admins created through the current flow
 * have no legacy doc at all, so writing straight to `admins/{uid}` failed with
 * NOT_FOUND (or landed on a document nothing reads).
 *
 * Both branches confirm the document exists before returning a writer, so
 * callers can trust that a resolved writer has a real destination.
 *
 * Known gap: /api/admin/me (serverRbac.getRbacAdminDoc) also falls back to a
 * `where("email","==",…)` lookup, so an RBAC doc whose id is not the uid still
 * renders the profile. The browser cannot follow that fallback — firestore.rules
 * only allows self-reads/writes at `admin_users/{request.auth.uid}` — so those
 * accounts get NO_PROFILE_RECORD_MESSAGE here instead of a silent failure.
 * Closing it properly needs a server route that writes with the Admin SDK.
 */
async function resolveProfileWriter(uid) {
  const rbacRef = doc(db, ...RBAC_PATHS.adminUsers, uid);
  const rbacSnap = await getDoc(rbacRef);

  if (rbacSnap.exists()) {
    // setDoc+merge rather than updateDoc so a partially-provisioned doc never
    // throws; `updatedAt` is whitelisted by firestore.rules on this path only.
    return (data) => setDoc(rbacRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  }

  // firestore.rules allows a signed-in admin to read its own `admins/{uid}`,
  // so this probe is safe and keeps us from returning a writer that can only
  // fail with NOT_FOUND.
  const legacyRef = doc(db, "admins", uid);
  const legacySnap = await getDoc(legacyRef);

  if (legacySnap.exists()) {
    return (data) => updateDoc(legacyRef, data);
  }

  const error = new Error(NO_PROFILE_RECORD_MESSAGE);
  error.userMessage = NO_PROFILE_RECORD_MESSAGE;
  throw error;
}

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
  const [removingPhoto, setRemovingPhoto] = useState(false);
  const [expandedProject, setExpandedProject] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const fileInputRef = useRef(null);
  // Every input needs a real id so its <label for> points somewhere. The old
  // markup rendered bare <label> elements with no association at all.
  const fieldId = useId();

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
    const uid = auth.currentUser?.uid;
    if (!uid) {
      emitAlert({ type: "error", message: NO_SESSION_MESSAGE });
      return;
    }

    setSaving(true);
    try {
      // Never blank an existing name: most admins are created with `fullName`
      // only, so firstName/lastName are empty and recomputing unconditionally
      // wiped the display name on every unrelated edit.
      const derivedFullName = [form.firstName, form.lastName]
        .map((part) => part.trim())
        .filter(Boolean)
        .join(" ");
      const fullName = derivedFullName || adminData?.fullName || "";

      const write = await resolveProfileWriter(uid);
      await write({
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
      emitAlert({
        type: "error",
        message:
          err?.userMessage ||
          (err?.code
            ? `Failed to save profile (${err.code}).`
            : "Failed to save profile."),
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
      emitAlert({ type: "error", message: "Please choose a JPEG, PNG, WEBP or GIF image." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      emitAlert({ type: "error", message: "Image must be 5MB or smaller." });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const uid = auth.currentUser?.uid;
    if (!uid) {
      emitAlert({ type: "error", message: NO_SESSION_MESSAGE });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    try {
      // Resolve (and confirm the existence of) the destination BEFORE uploading,
      // so a profile with no writable record does not leave an orphaned object
      // in admin-avatars/.
      const write = await resolveProfileWriter(uid);

      const storageRef = ref(storage, `admin-avatars/${uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      await write({ photoURL: url });
      await refreshAuth();
      emitAlert({ type: "success", message: "Profile picture updated." });
    } catch (err) {
      console.error(err);
      emitAlert({
        type: "error",
        message:
          err?.userMessage ||
          (err?.code ? `Failed to upload image (${err.code}).` : "Failed to upload image."),
      });
    } finally {
      setUploading(false);
      // Reset so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      emitAlert({ type: "error", message: NO_SESSION_MESSAGE });
      return;
    }

    setRemovingPhoto(true);
    try {
      const write = await resolveProfileWriter(uid);
      // Empty string (not deleteField) mirrors how `photoURL` is already read
      // elsewhere in this file: `adminData?.photoURL || null` treats "" the
      // same as absent and falls back to the initials avatar.
      await write({ photoURL: "" });
      // storage.rules allows public read on admin-avatars/{uid}, so clearing
      // only the Firestore pointer leaves the actual image permanently
      // fetchable at its old URL — delete the blob too, matching how every
      // other image-removal flow in this app (ImagesLibrary.jsx,
      // VideosLibrary.jsx, storageUpload.js, ...) pairs the two.
      try {
        await deleteObject(ref(storage, `admin-avatars/${uid}`));
      } catch (storageErr) {
        if (storageErr?.code !== "storage/object-not-found") throw storageErr;
      }
      await refreshAuth();
      emitAlert({ type: "success", message: "Profile picture removed." });
    } catch (err) {
      console.error(err);
      emitAlert({
        type: "error",
        message:
          err?.userMessage ||
          (err?.code ? `Failed to remove photo (${err.code}).` : "Failed to remove photo."),
      });
    } finally {
      setRemovingPhoto(false);
    }
  };

  // Password change was previously only reachable through EditAdminModal,
  // which is superadmin-only — a regular admin had no way to ever change
  // their own password after account creation. This is self-service (client
  // SDK reauthenticate + updatePassword), so it needs no new server route,
  // and it only applies to admins who actually signed in with a password —
  // a Google-only or local-dev-session account has none to change.
  const hasPasswordProvider =
    !user?.isLocalAdmin &&
    Boolean(auth.currentUser?.providerData?.some((p) => p.providerId === "password"));

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      emitAlert({ type: "error", message: "New password must be at least 6 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      emitAlert({ type: "error", message: "New passwords don't match." });
      return;
    }
    const currentUser = auth.currentUser;
    if (!currentUser?.email) {
      emitAlert({ type: "error", message: NO_SESSION_MESSAGE });
      return;
    }
    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      emitAlert({ type: "success", message: "Password changed successfully." });
    } catch (err) {
      console.error(err);
      const message =
        err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential"
          ? "Current password is incorrect."
          : err?.code === "auth/weak-password"
            ? "New password is too weak."
            : err?.code === "auth/too-many-requests"
              ? "Too many attempts. Please wait a few minutes and try again."
              : err?.code === "auth/requires-recent-login"
                ? "For your security, please sign out and sign in again before changing your password."
                : "Failed to change password.";
      emitAlert({ type: "error", message });
    } finally {
      setChangingPassword(false);
    }
  };

  const projectAccessEntries = Object.entries(adminData?.projectAccess ?? {});
  const legacyPermissionEntries = Object.entries(adminData?.permissions ?? {});
  // Legacy flat permissions are only consulted when no per-project grant exists.
  const showLegacyPermissions =
    !isSuperAdmin && projectAccessEntries.length === 0 && legacyPermissionEntries.length > 0;
  const hasNoPermissions =
    !isSuperAdmin && projectAccessEntries.length === 0 && !showLegacyPermissions;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PageHeader
        icon={User}
        title="My Profile"
        description="Your admin identity, the details other admins see on your account, and the access this account has been granted."
      />

      <div className="space-y-6">
        {/* ── Identity ── */}
        <SectionCard>
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt="Profile"
                  className="h-20 w-20 rounded-xl border border-[var(--border)] object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-[var(--primary)] text-2xl font-semibold text-[var(--primary-foreground)]">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || removingPhoto}
                className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-50"
                title="Change photo"
                aria-label="Change profile photo"
              >
                {uploading ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none" />
                ) : (
                  <Camera className="h-3.5 w-3.5 text-[var(--muted)]" aria-hidden="true" />
                )}
              </button>
              {photoURL && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={uploading || removingPhoto}
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] disabled:opacity-50"
                  title="Remove photo"
                  aria-label="Remove profile photo"
                >
                  {removingPhoto ? (
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-[var(--border)] border-t-[var(--foreground)] motion-reduce:animate-none" />
                  ) : (
                    <X className="h-3 w-3 text-[var(--muted)]" aria-hidden="true" />
                  )}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Profile photo file"
                onChange={handlePhotoUpload}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-[var(--foreground)]">
                {displayName || user?.email}
              </p>
              {adminData?.designation && (
                <p className="truncate text-sm text-[var(--muted)]">{adminData.designation}</p>
              )}
              {adminData?.team && (
                <p className="mt-0.5 text-xs text-[var(--muted)]">{adminData.team}</p>
              )}
              <span
                className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                  isSuperAdmin
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "bg-[var(--surface-soft)] text-[var(--foreground)]"
                }`}
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                ) : (
                  <Shield className="h-3 w-3" aria-hidden="true" />
                )}
                {isSuperAdmin ? "Super Admin" : "Admin"}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── Editable form ── */}
        <SectionCard
          title="Profile Details"
          description="Shown to other admins across the console."
          footer={
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-xs text-[var(--muted)]">
                <User className="h-3.5 w-3.5" aria-hidden="true" />
                {user?.email}
              </span>
              <Button onClick={handleSave} loading={saving} loadingLabel="Saving profile">
                {saving ? null : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First Name" htmlFor={`${fieldId}-firstName`}>
              <Input
                id={`${fieldId}-firstName`}
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
              />
            </Field>
            <Field label="Last Name" htmlFor={`${fieldId}-lastName`}>
              <Input
                id={`${fieldId}-lastName`}
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
              />
            </Field>
            <Field label="Team" htmlFor={`${fieldId}-team`}>
              <Input
                id={`${fieldId}-team`}
                name="team"
                value={form.team}
                onChange={handleChange}
              />
            </Field>
            <Field label="Designation" htmlFor={`${fieldId}-designation`}>
              <Input
                id={`${fieldId}-designation`}
                name="designation"
                value={form.designation}
                onChange={handleChange}
              />
            </Field>
          </div>

          <Field label="Bio" htmlFor={`${fieldId}-bio`} className="mt-4">
            <Textarea
              id={`${fieldId}-bio`}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={3}
              placeholder="Short bio or notes…"
            />
          </Field>
        </SectionCard>

        {/* ── Change password (self-service) ── */}
        {hasPasswordProvider && (
          <SectionCard
            title="Change Password"
            description="Update the password you sign in with. You'll need your current password."
          >
            <form onSubmit={handleChangePassword} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Current Password" htmlFor={`${fieldId}-currentPassword`} className="sm:col-span-2">
                <div className="relative">
                  <Input
                    id={`${fieldId}-currentPassword`}
                    type={showPasswords ? "text" : "password"}
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    disabled={changingPassword}
                    className="pr-10"
                    required
                  />
                </div>
              </Field>
              <Field label="New Password" htmlFor={`${fieldId}-newPassword`}>
                <Input
                  id={`${fieldId}-newPassword`}
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={changingPassword}
                  minLength={6}
                  required
                />
              </Field>
              <Field label="Confirm New Password" htmlFor={`${fieldId}-confirmPassword`}>
                <Input
                  id={`${fieldId}-confirmPassword`}
                  type={showPasswords ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={changingPassword}
                  minLength={6}
                  required
                />
              </Field>

              <div className="flex items-center justify-between gap-3 sm:col-span-2">
                <button
                  type="button"
                  onClick={() => setShowPasswords((v) => !v)}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
                >
                  {showPasswords ? (
                    <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {showPasswords ? "Hide passwords" : "Show passwords"}
                </button>
                <Button type="submit" loading={changingPassword} loadingLabel="Changing password">
                  {changingPassword ? null : <Lock className="h-4 w-4" aria-hidden="true" />}
                  {changingPassword ? "Changing…" : "Change Password"}
                </Button>
              </div>
            </form>
          </SectionCard>
        )}

        {/* ── Permissions (read-only) ── */}
        <SectionCard
          title="Access & Permissions"
          description="What this account can reach. Only a super admin can change it."
          flush={hasNoPermissions}
        >
          {isSuperAdmin ? (
            <div className="flex items-center gap-2 rounded-lg bg-[var(--surface-soft)] px-4 py-3 text-sm text-[var(--muted)]">
              <ShieldCheck className="h-4 w-4 text-[var(--foreground)]" aria-hidden="true" />
              Super Admin — full access to all projects and modules.
            </div>
          ) : hasNoPermissions ? (
            <EmptyState
              icon={Shield}
              title="No project permissions assigned yet"
              description="Ask a super admin to grant this account access to the projects and modules you need."
            />
          ) : (
            <div className="space-y-4">
              {projectAccessEntries.map(([projectId, projectAccess]) => {
                const project = PROJECTS[projectId];
                const isOpen = expandedProject === projectId;
                const permEntries = Object.entries(projectAccess?.permissions ?? {});

                return (
                  <div
                    key={projectId}
                    className="overflow-hidden rounded-lg border border-[var(--border)]"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedProject(isOpen ? null : projectId)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-soft)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)]"
                    >
                      <span>{project?.name ?? projectId}</span>
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                        {permEntries.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-[var(--muted)]">
                            No module permissions.
                          </p>
                        ) : (
                          permEntries.map(([moduleKey, perms]) => {
                            const moduleConfig = project?.modules?.[moduleKey];
                            return (
                              <div
                                key={moduleKey}
                                className="flex items-center justify-between px-4 py-2.5"
                              >
                                <span className="text-sm capitalize text-[var(--foreground)]">
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
              })}

              {/* Legacy flat permissions fallback */}
              {showLegacyPermissions && (
                <div className="overflow-hidden rounded-lg border border-[var(--border)]">
                  <div className="bg-[var(--surface-soft)] px-4 py-3 text-sm font-semibold text-[var(--foreground)]">
                    Module Access (Legacy)
                  </div>
                  <div className="divide-y divide-[var(--border)] border-t border-[var(--border)]">
                    {legacyPermissionEntries.map(([moduleKey, perms]) => (
                      <div
                        key={moduleKey}
                        className="flex items-center justify-between px-4 py-2.5"
                      >
                        <span className="text-sm capitalize text-[var(--foreground)]">
                          {moduleKey}
                        </span>
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
          )}
        </SectionCard>
      </div>
    </div>
  );
}

function PermBadge({ label, active }) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        active
          ? "bg-[var(--success-soft)] text-[var(--success)]"
          : "bg-[var(--surface-soft)] text-[var(--muted)]"
      }`}
    >
      {label}
    </span>
  );
}
