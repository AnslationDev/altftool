"use client";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function LoadingBone({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={cx("relative overflow-hidden rounded-[var(--radius-md)] bg-[var(--surface-soft)]", className)}
    >
      <div className="absolute inset-y-0 left-0 w-1/2 translate-x-[-120%] animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/55 to-transparent" />
    </div>
  );
}

export function AdminRouteLoadingShell() {
  return (
    <main className="min-h-screen bg-[var(--background)] p-4 text-[var(--foreground)] sm:p-6">
      <div className="mx-auto flex max-w-7xl gap-4">
        <aside className="hidden w-60 shrink-0 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-3 lg:block">
          <LoadingBone className="mb-5 h-10 w-36" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingBone key={index} className="h-9 w-full" />
            ))}
          </div>
        </aside>

        <section className="min-w-0 flex-1 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <LoadingBone className="h-8 w-56" />
              <LoadingBone className="h-4 w-80 max-w-full" />
            </div>
            <LoadingBone className="h-10 w-32" />
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <LoadingBone key={index} className="h-24" />
            ))}
          </div>

          <div className="rounded-[var(--radius-md)] border border-[var(--border)]">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="grid grid-cols-[1fr_0.7fr_0.4fr] gap-3 border-b border-[var(--border)] p-3 last:border-b-0">
                <LoadingBone className="h-4" />
                <LoadingBone className="h-4" />
                <LoadingBone className="h-4" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
