import Link from "next/link";
import { ArrowLeft, LayoutDashboard, LifeBuoy, UserCircle } from "lucide-react";

const adminFallbackRoutes = [
  {
    href: "/profile",
    label: "My Profile",
    description: "Open your account and access details.",
    icon: UserCircle,
  },
  {
    href: "/support",
    label: "Support Center",
    description: "Create or review support tickets.",
    icon: LifeBuoy,
  },
  {
    href: "/admin-management",
    label: "Admin Management",
    description: "Manage admins and access requests.",
    icon: LayoutDashboard,
  },
];

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 py-12 text-[var(--foreground)]">
      <section className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
          Route not found
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          This admin page is not available
        </h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          The module may have moved, or the URL may be incomplete. Choose a safe admin destination below.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {adminFallbackRoutes.map(({ href, label, description, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] p-4 transition hover:border-[var(--primary)] hover:bg-[var(--surface)]"
            >
              <Icon className="h-5 w-5 text-[var(--primary)]" />
              <span className="mt-3 block text-sm font-semibold">{label}</span>
              <span className="mt-1 block text-xs leading-5 text-[var(--muted)]">
                {description}
              </span>
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </section>
    </main>
  );
}
