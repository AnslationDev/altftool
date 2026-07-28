"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  Bell,
  ChevronDown,
  ChevronRight,
  Headset,
  Info,
  LogOut,
  Megaphone,
  Menu,
  Search,
  Shield,
  ShieldCheck,
  User,
  X,
} from "lucide-react";
import { ThemeModeMenu } from "@altftool/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  collection,
  getCountFromServer,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebaseFirestore";
import { emitAlert } from "@/lib/alertBus";
import { getAdminRouteInfo, buildAdminBreadcrumbs } from "@/lib/routeUtils";
import { useAuth } from "@/context/AuthContext";
import { useAdminTheme } from "@/context/ThemeContext";
import { PROJECTS } from "@/projects";
import {
  GLOBAL_ADMIN_MODULES,
  getProjectModuleRoute,
} from "@/config/adminRoutes";
import { hasModuleAccess } from "@/lib/permissionUtils";

const TYPE_ICON = {
  announcement: Megaphone,
  warning: AlertTriangle,
  notice: Info,
};

const normalizeSearchText = (value = "") => String(value).trim().toLowerCase();

function createAdminQuickRoutes({ adminData, isSuperAdmin }) {
  const routes = [];

  Object.entries(GLOBAL_ADMIN_MODULES).forEach(([key, config]) => {
    const allowed =
      isSuperAdmin ||
      config.allAdmins ||
      adminData?.permissions?.[key]?.read === true;
    if (!allowed) return;

    routes.push({
      key: `global-${key}`,
      label: config.label,
      helper: config.superadminOnly ? "Global admin" : "Workspace",
      href: config.path,
      icon: config.icon,
      keywords: `${key} ${config.label}`,
    });
  });

  Object.entries(PROJECTS).forEach(([projectId, project]) => {
    Object.entries(project.modules || {}).forEach(
      ([moduleKey, moduleConfig]) => {
        const allowed =
          isSuperAdmin ||
          hasModuleAccess({ adminData, projectId, moduleKey, action: "read" });
        if (!allowed) return;

        routes.push({
          key: `${projectId}-${moduleKey}`,
          label: moduleConfig.label,
          helper: project.name,
          href: getProjectModuleRoute(projectId, moduleKey),
          icon: moduleConfig.icon,
          keywords: `${projectId} ${project.name} ${moduleKey} ${moduleConfig.label}`,
        });
      },
    );
  });

  return routes;
}

function NotificationIcon({ type }) {
  const Icon = TYPE_ICON[type] || Bell;

  return (
    <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
      <Icon className="h-4 w-4" />
    </span>
  );
}

export default function AdminHeader({ user, adminData, onOpenSidebar }) {
  const router = useRouter();
  const { logout: logoutAuth } = useAuth();
  const pathname = usePathname();
  const routeInfo = getAdminRouteInfo(pathname);
  const breadcrumbs = buildAdminBreadcrumbs(routeInfo);
  const isSuperAdmin = adminData?.roleType === "superadmin";
  const { themeMode, setThemeMode } = useAdminTheme();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeReady, setThemeReady] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [markingRead, setMarkingRead] = useState(null);
  const [quickQuery, setQuickQuery] = useState("");
  const [quickOpen, setQuickOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const quickNavRef = useRef(null);
  const quickInputRef = useRef(null);

  // ⌘K / Ctrl+K opens the quick navigation search. `mobileSearchOpen` makes
  // the panel visible below xl (it's otherwise gated behind `xl:block`); the
  // focus effect further down runs once that panel is actually in the DOM.
  useEffect(() => {
    const handleShortcut = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setMobileSearchOpen(true);
        setQuickOpen(true);
      }
    };

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  useEffect(() => {
    if (quickOpen) {
      quickInputRef.current?.focus();
    }
  }, [quickOpen]);

  const photoURL = adminData?.photoURL || null;
  const displayName =
    adminData?.fullName ||
    (adminData?.firstName
      ? `${adminData.firstName} ${adminData.lastName ?? ""}`.trim()
      : null);
  const initials = displayName
    ? displayName
        .split(" ")
        .map((name) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : (user?.email?.[0] ?? "A").toUpperCase();
  const logout = async () => {
    await logoutAuth();
    router.replace("/login");
  };

  useEffect(() => {
    setThemeReady(true);
  }, []);

  useEffect(() => {
    setDropdownOpen(false);
    setNotifOpen(false);
    setQuickOpen(false);
    setMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (user?.isLocalAdmin) return undefined;
    if (!user?.uid) return undefined;

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    return onSnapshot(
      notificationsQuery,
      (snapshot) => {
        setNotifications(
          snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          })),
        );
      },
      (error) => {
        console.warn(
          "Unable to load admin notifications:",
          error?.message || error,
        );
        setNotifications([]);
      },
    );
  }, [user?.isLocalAdmin, user?.uid]);

  // The listener above is capped at 20 docs so the dropdown stays light —
  // the badge needs the true total, so it re-fetches an uncapped count()
  // aggregation every time that capped snapshot changes.
  useEffect(() => {
    if (user?.isLocalAdmin) return undefined;
    if (!user?.uid) return undefined;

    let cancelled = false;
    const unreadCountQuery = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      where("read", "==", false),
    );

    getCountFromServer(unreadCountQuery)
      .then((snapshot) => {
        if (!cancelled) setUnreadCount(snapshot.data().count);
      })
      .catch((error) => {
        console.warn(
          "Unable to load unread notification count:",
          error?.message || error,
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user?.isLocalAdmin, user?.uid, notifications]);

  useEffect(() => {
    const closeMenus = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (quickNavRef.current && !quickNavRef.current.contains(event.target)) {
        setQuickOpen(false);
        setMobileSearchOpen(false);
      }
    };

    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      setDropdownOpen(false);
      setNotifOpen(false);
      setQuickOpen(false);
      setMobileSearchOpen(false);
    };

    document.addEventListener("pointerdown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const quickRoutes = useMemo(
    () => createAdminQuickRoutes({ adminData, isSuperAdmin }),
    [adminData, isSuperAdmin],
  );
  const quickMatches = useMemo(() => {
    const query = normalizeSearchText(quickQuery);
    const source = quickQuery ? quickRoutes : quickRoutes.slice(0, 7);

    if (!query) return source.slice(0, 7);

    return source
      .map((item, index) => {
        const haystack = normalizeSearchText(
          `${item.label} ${item.helper} ${item.keywords}`,
        );
        const label = normalizeSearchText(item.label);
        const score =
          label === query
            ? 100
            : label.startsWith(query)
              ? 60
              : haystack.includes(query)
                ? 25
                : 0;

        return { ...item, score, index };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, 7);
  }, [quickQuery, quickRoutes]);

  // Results reshuffle whenever the query (or the open/closed state) changes,
  // so the roving highlight always starts back at the top match.
  useEffect(() => {
    setHighlightedIndex(0);
  }, [quickQuery, quickOpen]);

  const closeQuickNav = () => {
    setQuickOpen(false);
    setQuickQuery("");
    setHighlightedIndex(0);
    setMobileSearchOpen(false);
  };

  const openQuickRoute = (href) => {
    if (!href) return;
    closeQuickNav();
    router.push(href);
  };

  const handleQuickKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeQuickNav();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (!quickMatches.length) return;
      setHighlightedIndex((index) => (index + 1) % quickMatches.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!quickMatches.length) return;
      setHighlightedIndex(
        (index) => (index - 1 + quickMatches.length) % quickMatches.length,
      );
      return;
    }

    if (event.key === "Enter" && quickMatches[highlightedIndex]) {
      event.preventDefault();
      openQuickRoute(quickMatches[highlightedIndex].href);
    }
  };

  const markRead = async (notification) => {
    if (markingRead === notification.id) return;
    setMarkingRead(notification.id);

    try {
      const token = await user.getIdToken();
      const res = await fetch("/api/notifications/mark-read", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId: notification.id }),
      });

      if (!res.ok) {
        throw new Error(`Mark-read failed with status ${res.status}`);
      }

      if (notification.actionUrl) {
        router.push(notification.actionUrl);
        setNotifOpen(false);
      }
    } catch (error) {
      console.warn(
        "Unable to mark notification as read:",
        error?.message || error,
      );
      emitAlert({
        type: "error",
        message: "Couldn't mark that notification as read. Please try again.",
      });
    } finally {
      setMarkingRead(null);
    }
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-3 sm:px-5 lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex h-[var(--anslation-ds-target-min)] w-[var(--anslation-ds-target-min)] shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] lg:hidden"
          aria-label="Open admin navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <nav
          className="flex min-w-0 items-center gap-2 overflow-x-auto text-sm"
          aria-label="Admin breadcrumbs"
        >
          {breadcrumbs.map((crumb, index) => (
            <div
              key={`${crumb.label}-${index}`}
              className="flex shrink-0 items-center gap-2"
            >
              {index !== 0 ? (
                <ChevronRight className="h-3.5 w-3.5 text-[var(--muted)]" />
              ) : null}
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="max-w-[9rem] truncate text-[var(--muted)] transition hover:text-[var(--foreground)] sm:max-w-[12rem]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="max-w-[12rem] truncate font-semibold text-[var(--foreground)] sm:max-w-[18rem]">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div
        className={`${
          mobileSearchOpen
            ? "fixed inset-x-3 top-16 z-50 mx-auto sm:inset-x-5 lg:inset-x-6"
            : "hidden"
        } min-w-[240px] max-w-md xl:relative xl:inset-auto xl:top-auto xl:z-auto xl:mx-0 xl:block xl:flex-1`}
        ref={quickNavRef}
      >
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--muted)]" />
        <input
          ref={quickInputRef}
          value={quickQuery}
          onChange={(event) => {
            setQuickQuery(event.target.value);
            setQuickOpen(true);
          }}
          onFocus={() => setQuickOpen(true)}
          onKeyDown={handleQuickKeyDown}
          placeholder="Jump to module…"
          className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] pl-9 pr-12 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:ring-2 focus:ring-[color-mix(in_srgb,var(--primary)_18%,transparent)]"
          aria-label="Jump to admin module"
          aria-expanded={quickOpen}
          aria-haspopup="listbox"
          aria-controls="admin-quick-nav-listbox"
          aria-activedescendant={
            quickMatches[highlightedIndex]
              ? `quick-nav-option-${quickMatches[highlightedIndex].key}`
              : undefined
          }
        />
        <button
          type="button"
          onClick={closeQuickNav}
          className="absolute right-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-md text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] xl:hidden"
          aria-label="Close search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)] xl:block">
          ⌘K
        </kbd>
        {quickOpen ? (
          <div
            id="admin-quick-nav-listbox"
            role="listbox"
            className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-lg)]"
          >
            {quickMatches.length ? (
              quickMatches.map((item, index) => {
                const Icon = item.icon || Search;
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={item.key}
                    id={`quick-nav-option-${item.key}`}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => openQuickRoute(item.href)}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition hover:bg-[var(--surface-soft)] ${
                      isHighlighted ? "bg-[var(--surface-soft)]" : ""
                    }`}
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-[var(--foreground)]">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-[var(--muted)]">
                        {item.helper}
                      </span>
                    </span>
                    {isHighlighted ? (
                      <kbd className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[var(--muted)]">
                        ↵
                      </kbd>
                    ) : null}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-6 text-center text-xs font-medium text-[var(--muted)]">
                No matching module found.
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => {
            setMobileSearchOpen(true);
            setQuickOpen(true);
          }}
          className="grid h-[var(--anslation-ds-target-min)] w-[var(--anslation-ds-target-min)] place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] xl:hidden"
          aria-label="Search admin modules"
        >
          <Search className="h-4 w-4" />
        </button>

        <Link
          href="/health"
          className="hidden h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs font-bold text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] md:inline-flex"
          title="Open health dashboard"
        >
          <Activity className="h-3.5 w-3.5" />
          Health
        </Link>

        <span
          className="hidden items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--surface-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-[var(--muted)] sm:inline-flex"
          title={isSuperAdmin ? "Super Admin — full access" : "Admin"}
        >
          {isSuperAdmin ? (
            <ShieldCheck className="h-3 w-3 text-[var(--primary)]" />
          ) : (
            <Shield className="h-3 w-3" />
          )}
          {isSuperAdmin ? "Super Admin" : "Admin"}
        </span>

        <ThemeModeMenu
          value={themeMode}
          onChange={setThemeMode}
          hydrated={themeReady}
        />

        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((open) => !open)}
            className="grid h-[var(--anslation-ds-target-min)] w-[var(--anslation-ds-target-min)] place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--primary)_35%,transparent)]"
            aria-label="Notifications"
            aria-haspopup="menu"
            aria-expanded={notifOpen}
          >
            {/* The 44px tap target comes from the button; the badge stays
                anchored to this 16px icon box so it keeps hugging the bell. */}
            <span className="relative grid h-4 w-4 place-items-center">
              <Bell className="h-4 w-4" />
              {unreadCount > 0 ? (
                // The count is 9px bold, so WCAG AA needs 4.5:1 — plain
                // --danger/--danger-foreground is only 3.76:1 in light. Mixing the
                // fill toward --foreground darkens it in light and lightens it in
                // dark, so the badge clears AA in both themes without new tokens.
                <span className="absolute -right-3 -top-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--danger)_82%,var(--foreground))] px-1 text-[9px] font-bold leading-none text-[var(--danger-foreground)]">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ) : null}
            </span>
          </button>

          {notifOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-11 z-50 w-80 max-w-[calc(100vw-1rem)] overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
                <p className="text-sm font-semibold text-[var(--foreground)]">
                  Notifications
                </p>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-[var(--danger-soft)] px-2 py-0.5 text-[10px] font-bold text-[var(--danger)]">
                    {unreadCount} unread
                  </span>
                ) : null}
              </div>

              <div className="admin-thin-scroll max-h-80 divide-y divide-[var(--border)] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center">
                    <Bell className="mx-auto mb-2 h-6 w-6 text-[var(--muted)] opacity-50" />
                    <p className="text-xs text-[var(--muted)]">All caught up</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      type="button"
                      role="menuitem"
                      onClick={() => markRead(notification)}
                      disabled={markingRead === notification.id}
                      className="group flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-[var(--surface-soft)] disabled:opacity-60"
                    >
                      <NotificationIcon type={notification.type} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
                          {notification.title}
                        </span>
                        <span className="mt-1 line-clamp-4 block text-xs leading-snug text-[var(--muted)]">
                          {notification.body}
                        </span>
                        {notification.actionUrl ? (
                          <span className="mt-1 block truncate text-[10px] font-medium text-[var(--primary)]">
                            {notification.actionUrl}
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--primary)]" />
                    </button>
                  ))
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="border-t border-[var(--border)] bg-[var(--surface-soft)] px-4 py-2.5">
                  <p className="text-center text-[10px] text-[var(--muted)]">
                    Open a notification to mark it as read
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((open) => !open)}
            className="flex min-h-[var(--anslation-ds-target-min)] min-w-[var(--anslation-ds-target-min)] items-center justify-center gap-2 rounded-lg p-1 transition hover:bg-[var(--surface-soft)]"
            aria-label="Open profile menu"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            {photoURL ? (
              <img
                src={photoURL}
                alt="Profile"
                className="h-8 w-8 shrink-0 rounded-lg border border-[var(--border)] object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--foreground)] text-xs font-bold text-[var(--background)]">
                {initials}
              </span>
            )}
            <span className="hidden min-w-0 text-left md:block">
              {displayName ? (
                <span className="block max-w-[160px] truncate text-sm font-semibold leading-tight text-[var(--foreground)]">
                  {displayName}
                </span>
              ) : null}
              <span className="block max-w-[160px] truncate text-xs text-[var(--muted)]">
                {user?.email}
              </span>
            </span>
            <ChevronDown className="hidden h-4 w-4 text-[var(--muted)] sm:block" />
          </button>

          {dropdownOpen ? (
            <div
              role="menu"
              className="absolute right-0 top-11 z-50 w-56 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-[var(--shadow-lg)]"
            >
              <div className="border-b border-[var(--border)] px-4 py-2.5">
                {displayName ? (
                  <p className="truncate text-sm font-semibold text-[var(--foreground)]">
                    {displayName}
                  </p>
                ) : null}
                <p className="truncate text-xs text-[var(--muted)]">
                  {user?.email}
                </p>
              </div>
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              >
                <User className="h-4 w-4" />
                My Profile
              </Link>
              <Link
                href="/support"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
              >
                <Headset className="h-4 w-4" />
                Support
              </Link>
              <div className="my-1 border-t border-[var(--border)]" />
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--danger)] transition hover:bg-[var(--danger-soft)]"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
