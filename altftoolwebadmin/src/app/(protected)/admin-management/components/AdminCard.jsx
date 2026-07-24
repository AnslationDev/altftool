"use client";

import { createPortal } from "react-dom";
import { useRef, useState, useCallback } from "react";
import { Pencil, UserCheck, UserX, ShieldCheck, Shield } from "lucide-react";
import AdminAvatar from "./AdminAvatar";
import PermissionSummary from "./PermissionSummary";

function Tooltip({ label, children }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  const show = useCallback(() => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ top: r.top - 8, left: r.left + r.width / 2 });
  }, []);

  const hide = useCallback(() => setPos(null), []);

  return (
    <>
      <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </div>

      {pos && typeof document !== "undefined" &&
        createPortal(
          <div
            className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-[var(--foreground)] text-[var(--background)] shadow-xl"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            {label}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--foreground)]" />
          </div>,
          document.body
        )}
    </>
  );
}

export default function AdminCard({
  admin,
  currentUid,
  togglingId,
  onEdit,
  onToggleStatus,
}) {
  const isSelf = admin.id === currentUid;
  const busy = togglingId === admin.id;
  const isSuper = admin.roleType === "superadmin";

  const displayName =
    admin.fullName ||
    (admin.firstName
      ? `${admin.firstName} ${admin.lastName ?? ""}`.trim()
      : null);

 const formatDate = (timestamp) => {
  if (!timestamp) return "-";

  // Firestore Timestamp
  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate().toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // JS Date or ISO string
  return new Date(timestamp).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Usage
const joinedDate = formatDate(admin.createdAt);
  return (
    <div
      onClick={() => onEdit(admin)}
      className="group bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden cursor-pointer
      hover:shadow-lg hover:-translate-y-[2px] hover:border-[var(--border-strong)] transition-all duration-200"
    >
      {/* ── Banner ── */}
      <div
        className={`relative h-16 ${
          isSuper
            ? "bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/85"
            : "bg-gradient-to-r from-[var(--surface-soft)] to-[var(--surface)]"
        }`}
      >
        {/* Status dot */}
        <span className="absolute top-2.5 left-2.5">
          <span
            className={`block w-2 h-2 rounded-full ring-2 ring-[var(--surface)] ${
              admin.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
            }`}
          />
        </span>

        {/* Role badge */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm ${
            isSuper
              ? "bg-[var(--primary-foreground)]/20 text-[var(--primary-foreground)]"
              : "bg-[var(--foreground)]/[0.06] text-[var(--foreground)]"
          }`}
        >
          {isSuper ? (
            <ShieldCheck className="w-2.5 h-2.5" />
          ) : (
            <Shield className="w-2.5 h-2.5" />
          )}
          {isSuper ? "Super Admin" : "Admin"}
        </span>

        {/* Avatar */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
          <div className="ring-[3px] ring-[var(--surface)] rounded-xl shadow-sm group-hover:scale-105 transition">
            <AdminAvatar admin={admin} size="lg" />
          </div>
        </div>
      </div>

      {/* ── Identity ── */}
      <div className="pt-8 pb-3 px-4 flex flex-col items-center text-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-[var(--foreground)] truncate max-w-[160px]">
            {displayName ?? admin.email}
          </span>

          {isSelf && (
            <span className="text-[10px] font-semibold bg-[var(--primary-soft)] text-[var(--primary)] px-1.5 py-0.5 rounded-full">
              You 
            </span>
          )}
        </div>

        {displayName && (
          <p className="text-[11px] text-[var(--muted)] truncate max-w-[180px]">
            {admin.email}
          </p>
        )}

        {(admin.designation || admin.jobTitle) && (
          <p className="text-[11px] text-[var(--muted)] truncate max-w-[160px]">
            {admin.designation ?? admin.jobTitle}
          </p>
        )}
      </div>

      {/* ── Meta ── */}
      <div className="border-t border-[var(--border)] px-4 py-3 flex justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
            Team
          </span>
          <span className="text-[12px] font-medium text-[var(--foreground)]">
            {admin.team || <span className="text-[var(--border-strong)]">—</span>}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-[var(--muted)] uppercase tracking-widest">
            Joined
          </span>
          <span className="text-[12px] font-medium text-[var(--foreground)]">
            {joinedDate || <span className="text-[var(--border-strong)]">—</span>}
          </span>
        </div>
      </div>

      {/* ── Permissions ── */}
      <div className="border-t border-[var(--border)] px-4 py-3 min-h-[42px]">
        <PermissionSummary admin={admin} />
      </div>

      {/* ── Footer ── */}
      <div
        className="border-t border-[var(--border)] px-3 py-2 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status */}
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            admin.isActive
              ? "bg-[var(--success-soft)] text-[var(--success)]"
              : "bg-[var(--danger-soft)] text-[var(--danger)]"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              admin.isActive ? "bg-[var(--success)]" : "bg-[var(--danger)]"
            }`}
          />
          {admin.isActive ? "Active" : "Inactive"}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Tooltip label="Edit admin">
            <button
              onClick={() => onEdit(admin)}
              aria-label="Edit admin"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-soft)] transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip label={admin.isActive ? "Deactivate" : "Activate"}>
            <button
              onClick={() => onToggleStatus(admin)}
              disabled={isSelf || busy}
              aria-label={admin.isActive ? "Deactivate admin" : "Activate admin"}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30 ${
                admin.isActive
                  ? "text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  : "text-[var(--muted)] hover:text-[var(--success)] hover:bg-[var(--success-soft)]"
              }`}
            >
              {admin.isActive ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
