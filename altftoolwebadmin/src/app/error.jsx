"use client";

import Link from "next/link";
import { useEffect } from "react";
import {
  AlertTriangle,
  LayoutDashboard,
  LifeBuoy,
  RefreshCw,
  UserCircle,
} from "lucide-react";

const recoveryRoutes = [
  {
    href: "/admin-management",
    label: "Admin Management",
    description: "Review admins, roles, and access requests.",
    icon: LayoutDashboard,
  },
  {
    href: "/support",
    label: "Support",
    description: "Open tickets and support workflow.",
    icon: LifeBuoy,
  },
  {
    href: "/profile",
    label: "Profile",
    description: "Check account and session details.",
    icon: UserCircle,
  },
];

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("AltFTool admin route error:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 text-[var(--foreground)]">
      <section className="w-full max-w-3xl rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]">
          Admin route recovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This admin page needs a retry
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
          The route failed while loading data or rendering the module. Retry the route, or move to a stable admin area.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)] transition hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/admin-management"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin hub
          </Link>
        </div>

        <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
          {recoveryRoutes.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--primary)] hover:bg-[var(--surface)]"
            >
              <Icon className="h-5 w-5 text-[var(--primary)]" />
              <span className="mt-3 block text-sm font-semibold text-[var(--foreground)]">
                {label}
              </span>
              <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                {description}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
