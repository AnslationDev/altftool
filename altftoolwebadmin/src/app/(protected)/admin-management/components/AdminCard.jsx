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




















// "use client";

// import { createPortal } from "react-dom";
// import { useRef, useState, useCallback } from "react";
// import {
//   Pencil,
//   UserCheck,
//   UserX,
//   ShieldCheck,
//   Shield,
// } from "lucide-react";
// import AdminAvatar from "./AdminAvatar";
// import PermissionSummary from "./PermissionSummary";

// function Tooltip({ label, children }) {
//   const ref = useRef(null);
//   const [pos, setPos] = useState(null);

//   const show = useCallback(() => {
//     if (!ref.current) return;
//     const r = ref.current.getBoundingClientRect();
//     setPos({ top: r.top - 8, left: r.left + r.width / 2 });
//   }, []);

//   const hide = useCallback(() => setPos(null), []);

//   return (
//     <>
//       <div ref={ref} className="inline-flex" onMouseEnter={show} onMouseLeave={hide}>
//         {children}
//       </div>
//       {pos && typeof document !== "undefined" &&
//         createPortal(
//           <div
//             className="pointer-events-none fixed z-[9999] px-2 py-1 rounded-md text-[11px] font-medium whitespace-nowrap bg-gray-900 text-white shadow-xl"
//             style={{ top: pos.top, left: pos.left, transform: "translateX(-50%) translateY(-100%)" }}
//           >
//             {label}
//             <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
//           </div>,
//           document.body
//         )}
//     </>
//   );
// }

// export default function AdminCard({ admin, currentUid, togglingId, onEdit, onToggleStatus }) {
//   const isSelf = admin.id === currentUid;
//   const busy = togglingId === admin.id;
//   const isSuper = admin.roleType === "superadmin";

//   const displayName =
//     admin.fullName || (admin.firstName ? `${admin.firstName} ${admin.lastName ?? ""}`.trim() : null);

//   const formatDate = (timestamp) => {
//     if (!timestamp) return "-";
//     if (typeof timestamp.toDate === "function") {
//       return timestamp.toDate().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
//     }
//     return new Date(timestamp).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
//   };
//   const joinedDate = formatDate(admin.createdAt);

//   return (
//     <div
//       onClick={() => onEdit(admin)}
//       className="group relative bg-white rounded-[26px] overflow-hidden cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.06)]
//       border border-gray-100 hover:shadow-[0_20px_45px_-15px_rgba(79,70,229,0.35)] hover:-translate-y-1.5 transition-all duration-300 ease-out"
//     >
//       {/* Gradient mesh header */}
//       <div className="relative h-24 overflow-hidden">
//         <div
//           className={`absolute inset-0 ${
//             isSuper
//               ? "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-400"
//               : "bg-gradient-to-br from-sky-400 via-cyan-300 to-teal-200"
//           }`}
//         />
//         <div className="absolute -top-8 -left-6 w-28 h-28 rounded-full bg-white/20 blur-2xl" />
//         <div className="absolute -bottom-10 -right-4 w-32 h-32 rounded-full bg-black/10 blur-2xl" />

//         {/* Role chip */}
//         <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-md text-white ring-1 ring-white/30">
//           {isSuper ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
//           {isSuper ? "Super Admin" : "Admin"}
//         </span>

//         {/* Status pill glass */}
//         <span className="absolute top-3 left-3 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/25 backdrop-blur-md text-white ring-1 ring-white/30">
//           <span className={`w-1.5 h-1.5 rounded-full ${admin.isActive ? "bg-emerald-300" : "bg-red-200"}`} />
//           {admin.isActive ? "Active" : "Inactive"}
//         </span>
//       </div>

//       {/* Floating avatar */}
//       <div className="absolute left-1/2 top-24 -translate-x-1/2 -translate-y-1/2">
//         <div className="rounded-2xl ring-[5px] ring-white shadow-lg group-hover:scale-105 transition-transform duration-300 bg-white">
//           <AdminAvatar admin={admin} size="lg" />
//         </div>
//       </div>

//       <div className="pt-10 pb-4 px-5">
//         <div className="flex flex-col items-center text-center gap-1">
//           <div className="flex items-center gap-1.5">
//             <span className="text-[15.5px] font-bold text-gray-900 tracking-tight truncate max-w-[170px]">
//               {displayName ?? admin.email}
//             </span>
//             {isSelf && (
//               <span className="text-[9.5px] font-bold uppercase tracking-wide bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-1.5 py-0.5 rounded-full">
//                 You
//               </span>
//             )}
//           </div>
//           {displayName && <p className="text-[11.5px] text-gray-400 truncate max-w-[190px]">{admin.email}</p>}
//           {(admin.designation || admin.jobTitle) && (
//             <p className="text-[11px] font-medium text-gray-500 mt-0.5">{admin.designation ?? admin.jobTitle}</p>
//           )}
//         </div>

//         {/* Glass meta panel */}
//         <div className="mt-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 px-4 py-3 flex justify-between">
//           <div className="flex flex-col">
//             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Team</span>
//             <span className="text-[12.5px] font-semibold text-gray-700">
//               {admin.team || <span className="text-gray-300 font-normal">—</span>}
//             </span>
//           </div>
//           <div className="flex flex-col items-end">
//             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Joined</span>
//             <span className="text-[12.5px] font-semibold text-gray-700">
//               {joinedDate || <span className="text-gray-300 font-normal">—</span>}
//             </span>
//           </div>
//         </div>

//         <div className="mt-3 min-h-[42px]">
//           <PermissionSummary admin={admin} />
//         </div>
//       </div>

//       {/* Footer */}
//       <div
//         className="px-4 py-3 flex items-center justify-center gap-2 border-t border-gray-100"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <Tooltip label="Edit admin">
//           <button
//             onClick={() => onEdit(admin)}
//             className="flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 active:scale-[0.98] transition-all"
//           >
//             <Pencil className="w-3.5 h-3.5" />
//             Edit
//           </button>
//         </Tooltip>

//         <Tooltip label={admin.isActive ? "Deactivate" : "Activate"}>
//           <button
//             onClick={() => onToggleStatus(admin)}
//             disabled={isSelf || busy}
//             className={`flex-1 h-9 rounded-xl flex items-center justify-center gap-1.5 text-[12px] font-semibold active:scale-[0.98] transition-all disabled:opacity-30 disabled:active:scale-100 ${
//               admin.isActive
//                 ? "text-red-600 bg-red-50 hover:bg-red-100"
//                 : "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
//             }`}
//           >
//             {admin.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
//             {admin.isActive ? "Deactivate" : "Activate"}
//           </button>
//         </Tooltip>
//       </div>
//     </div>
//   );
// }
