"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, Home, RefreshCw, Search, Wrench } from "lucide-react";

const recoveryRoutes = [
  {
    href: "/tools/all",
    label: "Open tools",
    description: "Return to the full microtool directory.",
    icon: Wrench,
  },
  {
    href: "/search",
    label: "Search AltFTool",
    description: "Find tools, guides, extensions, and deals.",
    icon: Search,
  },
  {
    href: "/",
    label: "Go home",
    description: "Start again from the main AltFTool hub.",
    icon: Home,
  },
];

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("AltFTool route error:", error);
  }, [error]);

  return (
    <main className="bg-(--background) text-(--foreground)">
      <section className="section flex min-h-[72vh] items-center justify-center py-16">
        <div className="w-full max-w-3xl rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 text-center shadow-[var(--anslation-ds-shadow-sm)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-red-200 bg-red-50 text-red-600">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-(--muted-foreground)">
            Route recovery
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal text-(--foreground) sm:text-3xl">
            Something interrupted this page
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-(--muted-foreground)">
            Try loading this route again, or jump to a stable AltFTool area while the page recovers.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <button
              type="button"
              onClick={reset}
              className="inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius)] bg-(--primary) px-4 text-sm font-semibold text-(--primary-foreground) transition hover:bg-(--primary-active)"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/tools/all"
              className="inline-flex h-10 items-center gap-2 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) px-4 text-sm font-semibold text-(--muted-foreground) transition hover:border-(--primary) hover:text-(--foreground)"
            >
              <Wrench className="h-4 w-4" />
              Tool directory
            </Link>
          </div>

          <div className="mt-8 grid gap-3 text-left sm:grid-cols-3">
            {recoveryRoutes.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--background) p-4 transition hover:border-(--primary) hover:bg-(--muted)"
              >
                <Icon className="h-5 w-5 text-(--primary)" />
                <span className="mt-3 block text-sm font-semibold text-(--foreground)">
                  {label}
                </span>
                <span className="mt-1 block text-xs leading-5 text-(--muted-foreground)">
                  {description}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
