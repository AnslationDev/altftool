"use client";

import { lazy, Suspense, useMemo } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  getAdminModuleLayoutLoader,
  getAdminModulePageLoader,
} from "@/lib/adminModuleLoaders";

function ModuleLoadingFallback() {
  return (
    <div className="min-h-[60vh] bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <section className="mx-auto max-w-7xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--surface-soft)] text-[var(--primary)]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Loading module</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Preparing the admin workspace.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-md bg-[var(--surface-soft)]" />
          ))}
        </div>
        <div className="mt-4 rounded-md border border-[var(--border)]">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-[1fr_0.7fr_0.4fr] gap-3 border-b border-[var(--border)] p-3 last:border-b-0">
              <span className="h-4 animate-pulse rounded bg-[var(--surface-soft)]" />
              <span className="h-4 animate-pulse rounded bg-[var(--surface-soft)]" />
              <span className="h-4 animate-pulse rounded bg-[var(--surface-soft)]" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ModuleUnavailable({ projectId, moduleKey, routeKey }) {
  return (
    <div className="min-h-[60vh] bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <section className="mx-auto max-w-2xl rounded-lg border border-[color-mix(in_srgb,var(--warning)_35%,var(--border))] bg-[color-mix(in_srgb,var(--warning-soft)_60%,var(--surface))] p-5 text-[var(--foreground)] shadow-[var(--shadow-sm)]">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--warning)]" />
          <div>
            <p className="text-sm font-bold">Module route unavailable</p>
            <p className="mt-1 text-sm leading-6">
              {projectId}/{moduleKey}/{routeKey || "index"} is registered, but the lazy module loader could not resolve it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminModuleLazyRoute({ projectId, moduleKey, routeKey, useModuleLayout }) {
  const Page = useMemo(() => {
    const loader = getAdminModulePageLoader(projectId, moduleKey, routeKey);
    return loader ? lazy(loader) : null;
  }, [moduleKey, projectId, routeKey]);

  const Layout = useMemo(() => {
    if (!useModuleLayout) return null;
    const loader = getAdminModuleLayoutLoader(projectId, moduleKey);
    return loader ? lazy(loader) : null;
  }, [moduleKey, projectId, useModuleLayout]);

  if (!Page) {
    return <ModuleUnavailable projectId={projectId} moduleKey={moduleKey} routeKey={routeKey} />;
  }

  const content = <Page />;

  return (
    <Suspense fallback={<ModuleLoadingFallback />}>
      {Layout ? <Layout>{content}</Layout> : content}
    </Suspense>
  );
}
