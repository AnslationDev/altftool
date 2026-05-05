"use client";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function LoadingBone({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={cx("relative overflow-hidden rounded-[var(--anslation-ds-radius)] bg-(--muted)", className)}
    >
      <div className="absolute inset-y-0 left-0 w-1/2 translate-x-[-120%] animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
    </div>
  );
}

export function RouteHeroSkeleton({ compact = false }) {
  return (
    <section className="section">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="space-y-4">
          <LoadingBone className="h-7 w-28 rounded-full" />
          <LoadingBone className={cx("max-w-full rounded-xl", compact ? "h-9 w-72" : "h-12 w-[34rem]")} />
          <LoadingBone className="h-5 w-full max-w-xl rounded-full" />
          <LoadingBone className="h-5 w-4/5 max-w-lg rounded-full" />
          <div className="flex flex-wrap gap-3 pt-2">
            <LoadingBone className="h-10 w-32 rounded-full" />
            <LoadingBone className="h-10 w-28 rounded-full" />
          </div>
        </div>
        <LoadingBone className={cx("w-full rounded-xl sm:rounded-2xl", compact ? "h-[220px]" : "h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px]")} />
      </div>
    </section>
  );
}

export function RouteCardGridSkeleton({ cards = 6, columns = "lg:grid-cols-3" }) {
  return (
    <section className="section">
      <div className="mb-6 space-y-3">
        <LoadingBone className="h-8 w-64 max-w-full rounded-xl" />
        <LoadingBone className="h-4 w-80 max-w-full rounded-full" />
      </div>
      <div className={cx("grid grid-cols-1 gap-4 sm:grid-cols-2", columns)}>
        {Array.from({ length: cards }).map((_, index) => (
          <div key={index} className="rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)]">
            <LoadingBone className="aspect-[16/9] rounded-[var(--anslation-ds-radius)]" />
            <div className="mt-4 space-y-2">
              <LoadingBone className="h-4 w-3/4 rounded-full" />
              <LoadingBone className="h-4 w-11/12 rounded-full" />
              <LoadingBone className="h-3 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function RouteStripSkeleton({ items = 6 }) {
  return (
    <section className="section">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: items }).map((_, index) => (
          <div key={index} className="min-w-[220px] rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-3">
            <LoadingBone className="h-28 rounded-[var(--anslation-ds-radius)]" />
            <LoadingBone className="mt-3 h-4 w-3/4 rounded-full" />
            <LoadingBone className="mt-2 h-3 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function RouteSectionSkeleton({ cards = 3 }) {
  return (
    <div className="section">
      <div className="mb-6 space-y-3">
        <LoadingBone className="mx-auto h-8 w-64 max-w-full rounded-xl" />
        <LoadingBone className="mx-auto h-4 w-80 max-w-full rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: cards }).map((_, index) => (
          <LoadingBone key={index} className="h-40 rounded-[var(--anslation-ds-radius-lg)]" />
        ))}
      </div>
    </div>
  );
}

export function RouteLoadingShell({ variant = "listing" }) {
  if (variant === "commerce") {
    return (
      <main className="bg-(--background) text-(--foreground)">
        <RouteHeroSkeleton />
        <RouteStripSkeleton items={5} />
        <RouteCardGridSkeleton cards={6} />
      </main>
    );
  }

  if (variant === "landing") {
    return (
      <main className="bg-(--background) text-(--foreground)">
        <RouteHeroSkeleton />
        <RouteSectionSkeleton cards={4} />
        <RouteCardGridSkeleton cards={6} />
      </main>
    );
  }

  return (
    <main className="bg-(--background) text-(--foreground)">
      <RouteHeroSkeleton compact />
      <RouteCardGridSkeleton cards={8} columns="lg:grid-cols-4" />
    </main>
  );
}
