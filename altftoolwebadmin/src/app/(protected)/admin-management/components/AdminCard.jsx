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
            className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-gray-900 text-white shadow-xl"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translateX(-50%) translateY(-100%)",
            }}
          >
            {label}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
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

  const joinedDate = admin.createdAt
    ? new Date(admin.createdAt).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      onClick={() => onEdit(admin)}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer
      hover:shadow-lg hover:-translate-y-[2px] hover:border-gray-200 transition-all duration-200"
    >
      {/* ── Banner ── */}
      <div
        className={`relative h-16 ${
          isSuper
            ? "bg-gradient-to-r from-gray-900 to-gray-700"
            : "bg-gradient-to-r from-gray-50 to-gray-100"
        }`}
      >
        {/* Status dot */}
        <span className="absolute top-2.5 left-2.5">
          <span
            className={`block w-2 h-2 rounded-full ring-2 ring-white ${
              admin.isActive ? "bg-green-500" : "bg-red-400"
            }`}
          />
        </span>

        {/* Role badge */}
        <span
          className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full backdrop-blur-sm ${
            isSuper
              ? "bg-white/20 text-white"
              : "bg-black/[0.06] text-gray-700"
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
          <div className="ring-[3px] ring-white rounded-xl shadow-sm group-hover:scale-105 transition">
            <AdminAvatar admin={admin} size="lg" />
          </div>
        </div>
      </div>

      {/* ── Identity ── */}
      <div className="pt-8 pb-3 px-4 flex flex-col items-center text-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[14px] font-semibold text-gray-900 truncate max-w-[160px]">
            {displayName ?? admin.email}
          </span>

          {isSelf && (
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
              You
            </span>
          )}
        </div>

        {displayName && (
          <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
            {admin.email}
          </p>
        )}

        {(admin.designation || admin.jobTitle) && (
          <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
            {admin.designation ?? admin.jobTitle}
          </p>
        )}
      </div>

      {/* ── Meta ── */}
      <div className="border-t border-gray-50 px-4 py-3 flex justify-between">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Team
          </span>
          <span className="text-[12px] font-medium text-gray-700">
            {admin.team || <span className="text-gray-300">—</span>}
          </span>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
            Joined
          </span>
          <span className="text-[12px] font-medium text-gray-700">
            {joinedDate || <span className="text-gray-300">—</span>}
          </span>
        </div>
      </div>

      {/* ── Permissions ── */}
      <div className="border-t border-gray-50 px-4 py-3 min-h-[42px]">
        <PermissionSummary admin={admin} />
      </div>

      {/* ── Footer ── */}
      <div
        className="border-t border-gray-50 px-3 py-2 flex items-center justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Status */}
        <span
          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            admin.isActive
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              admin.isActive ? "bg-green-500" : "bg-red-400"
            }`}
          />
          {admin.isActive ? "Active" : "Inactive"}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Tooltip label="Edit admin">
            <button
              onClick={() => onEdit(admin)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </Tooltip>

          <Tooltip label={admin.isActive ? "Deactivate" : "Activate"}>
            <button
              onClick={() => onToggleStatus(admin)}
              disabled={isSelf || busy}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition disabled:opacity-30 ${
                admin.isActive
                  ? "text-gray-400 hover:text-red-500 hover:bg-red-50"
                  : "text-gray-400 hover:text-green-600 hover:bg-green-50"
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