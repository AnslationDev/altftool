"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Shield, ShieldCheck, ChevronRight, User, Bell, ChevronDown, Headset, Moon, Sun } from "lucide-react";
import { db } from "@/lib/firebase";
import { getAdminRouteInfo, buildAdminBreadcrumbs } from "@/lib/routeUtils";
import { useRef, useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader({ user, adminData }) {
  const router = useRouter();
  const { logout: logoutAuth } = useAuth();
  const pathname = usePathname();
  const routeInfo = getAdminRouteInfo(pathname);
  const breadcrumbs = buildAdminBreadcrumbs(routeInfo);
  const isSuperAdmin = adminData?.roleType === "superadmin";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [markingRead, setMarkingRead] = useState(null);
  const [theme, setTheme] = useState("light");

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const photoURL = adminData?.photoURL || null;
  const displayName =
    adminData?.fullName ||
    (adminData?.firstName
      ? `${adminData.firstName} ${adminData.lastName ?? ""}`.trim()
      : null);
  const initials = displayName
    ? displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0] ?? "A").toUpperCase();

  const logout = async () => {
    await logoutAuth();
    router.replace("/login");
  };

  useEffect(() => {
    const current =
      document.documentElement.getAttribute("data-theme") || "light";
    setTheme(current);
  }, []);

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("appTheme", next);
      localStorage.setItem("themeManual", "true");
      return next;
    });
  };

  // ── Real-time unread notifications listener ──
  useEffect(() => {
    if (user?.isLocalAdmin) return;
    if (!user?.uid) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user?.uid]);

  const unreadCount = notifications.length;

  // Mark single notification as read
  const markRead = async (notif) => {
    if (markingRead === notif.id) return;
    setMarkingRead(notif.id);
    try {
      const token = await user.getIdToken();
      await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId: notif.id }),
      });
      if (notif.actionUrl) {
        router.push(notif.actionUrl);
        setNotifOpen(false);
      }
    } catch (err) {
      console.error("mark-read error", err);
    } finally {
      setMarkingRead(null);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const TYPE_ICON = {
    announcement: "📢",
    warning: "⚠️",
    notice: "ℹ️",
  };

  return (
    <header className="h-14 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between px-6 shrink-0">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <div key={i} className="flex items-center gap-2">
            {i !== 0 && <ChevronRight className="w-3.5 h-3.5 text-[var(--muted)]" />}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-semibold text-[var(--foreground)]">{crumb.label}</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <span
          className={`hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full ${
            isSuperAdmin
              ? "bg-gray-900 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {isSuperAdmin ? (
            <ShieldCheck className="w-3 h-3" />
          ) : (
            <Shield className="w-3 h-3" />
          )}
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </span>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] transition"
          aria-label="Toggle theme"
        >
          <span className="grid h-4 w-4 place-items-center" suppressHydrationWarning>
            <Sun className="hidden h-4 w-4 dark:block" />
            <Moon className="h-4 w-4 dark:hidden" />
          </span>
        </button>

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            className="relative p-2 rounded-xl hover:bg-gray-50 text-gray-500 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-red-500 text-white text-[9px] font-bold rounded-full px-1 leading-none">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-800">
                  Notifications
                </p>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="w-6 h-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">All caught up!</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n)}
                      disabled={markingRead === n.id}
                      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition group"
                    >
                      <span className="text-base shrink-0 mt-0.5">
                        {TYPE_ICON[n.type] ?? "🔔"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate leading-tight">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-5 leading-snug">
                          {n.body}
                        </p>
                        {n.actionUrl && (
                          <p className="text-[10px] text-blue-500 mt-0.5 truncate">
                            {n.actionUrl}
                          </p>
                        )}
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-2" />
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50">
                  <p className="text-[10px] text-gray-400 text-center">
                    Click a notification to mark it as read
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Avatar + profile dropdown ── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 rounded-xl hover:bg-gray-50 p-1 transition cursor-pointer"
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-xl object-cover border border-gray-200 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
            )}
            <div className="hidden md:block text-left">
              {displayName ? (
                <p className="text-sm text-gray-800 font-semibold leading-tight max-w-[160px] truncate">
                  {displayName}
                </p>
              ) : null}
              <p className="text-xs text-gray-400 max-w-[160px] truncate">
                {user?.email}
              </p>
              
            </div><ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-11 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden py-1">
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <User className="w-4 h-4 text-gray-400" />
                My Profile
              </Link>
              <div className="border-t border-gray-100 my-1" />
              <Link href="/support"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
              >
                <Headset className="w-4 h-4 text-gray-400" />
                Support
              </Link>
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
