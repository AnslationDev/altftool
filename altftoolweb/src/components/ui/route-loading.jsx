import { Loader2, Puzzle, Sparkles } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function AltftoolLoader({
  label = "Loading AltFTool",
  detail = "Getting things ready",
  compact = false,
  className = "",
}) {
  return (
    <div
      className={cx(
        "flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) px-4 py-6 text-center shadow-[var(--anslation-ds-shadow-sm)]",
        compact ? "min-h-20 flex-row justify-start text-left" : "",
        className,
      )}
      role="status"
      aria-live="polite"
      data-testid="altftool-loader"
    >
      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--anslation-ds-radius)] border border-(--primary)/20 bg-(--primary)/10 text-(--primary)">
        <Puzzle className="h-5 w-5" aria-hidden="true" />
        <Loader2 className="absolute -right-1 -top-1 h-4 w-4 animate-spin text-(--primary)" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-(--foreground)">
          <Sparkles className="h-4 w-4 text-(--primary)" aria-hidden="true" />
          <span>{label}</span>
        </div>
        {!compact ? (
          <p className="mt-1 text-sm leading-6 text-(--muted-foreground)">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}

export function LoadingBone({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "relative overflow-hidden rounded-[var(--anslation-ds-radius)]",
        "bg-[color-mix(in_srgb,var(--border)_55%,var(--card))]",
        className,
      )}
    >
      {/* Elegant token-based shimmer sweep — hidden entirely for reduced-motion users. */}
      <div className="absolute inset-y-0 left-0 w-1/2 translate-x-[-120%] animate-skeleton-shimmer bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--border)_90%,var(--card))] to-transparent motion-reduce:hidden motion-reduce:animate-none" />
    </div>
  );
}

export function HeaderLoadingSkeleton() {
  return (
    <div
      className="section header border-b border-(--border) bg-(--card)"
      role="status"
      aria-label="Loading navigation"
    >
      <div className="flex min-h-14 items-center justify-between gap-4 py-3 lg:min-h-16">
        <LoadingBone className="h-10 w-36 rounded-[var(--anslation-ds-radius)]" />
        <div className="hidden items-center gap-3 lg:flex">
          {Array.from({ length: 5 }).map((_, index) => (
            <LoadingBone key={index} className="h-8 w-20 rounded-full" />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <LoadingBone className="h-9 w-9 rounded-[var(--anslation-ds-radius)]" />
          <LoadingBone className="h-9 w-9 rounded-[var(--anslation-ds-radius)] lg:hidden" />
        </div>
      </div>
    </div>
  );
}

export function RouteHeroSkeleton({ compact = false }) {
  return (
    <section className="section">
      <div className="mb-5">
        <AltftoolLoader label="Loading page" detail="AltFTool is preparing this route" compact={compact} />
      </div>
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="min-w-0 space-y-4">
          <LoadingBone className="h-7 w-28 rounded-full" />
          <LoadingBone
            className={cx(
              "w-full rounded-xl",
              compact ? "h-9 max-w-72" : "h-12 max-w-xl",
            )}
          />
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

export function RouteArticleSkeleton() {
  return (
    <main className="bg-(--background) text-(--foreground)">
      <section className="section">
        <AltftoolLoader
          label="Loading story"
          detail="AltFTool is preparing the latest content"
          className="mb-6"
        />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="min-w-0 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)] sm:p-7">
            <LoadingBone className="h-7 w-36 rounded-full" />
            <LoadingBone className="mt-5 h-12 w-full max-w-3xl rounded-[var(--anslation-ds-radius)] sm:h-16" />
            <div className="mt-5 space-y-3">
              <LoadingBone className="h-4 w-full rounded-full" />
              <LoadingBone className="h-4 w-11/12 rounded-full" />
              <LoadingBone className="h-4 w-3/4 rounded-full" />
            </div>
            <LoadingBone className="mt-7 aspect-[16/8] rounded-[var(--anslation-ds-radius)]" />
            <div className="mt-8 space-y-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <LoadingBone
                  key={index}
                  className={cx("h-4 rounded-full", index % 3 === 0 ? "w-10/12" : "w-full")}
                />
              ))}
            </div>
          </article>
          <aside className="space-y-4">
            <LoadingBone className="h-36 rounded-[var(--anslation-ds-radius-lg)]" />
            <LoadingBone className="h-44 rounded-[var(--anslation-ds-radius-lg)]" />
            <LoadingBone className="h-28 rounded-[var(--anslation-ds-radius-lg)]" />
          </aside>
        </div>
      </section>
    </main>
  );
}

export function ExtensionDetailSkeleton() {
  return (
    <div className="min-h-screen bg-(--background) text-(--foreground)" data-testid="extension-detail-loader">
      <div className="sticky top-0 z-40 border-b border-(--border) bg-(--background)/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center px-4">
          <LoadingBone className="h-9 w-40 rounded-full" />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:py-10 lg:py-12">
        <AltftoolLoader
          label="Loading extension details"
          detail="Fetching the latest extension data"
          className="mb-8"
        />

        <div className="mb-14 flex flex-col gap-8 lg:mb-20 lg:flex-row lg:items-center lg:gap-12">
          <LoadingBone className="h-32 w-32 shrink-0 rounded-[var(--anslation-ds-radius-lg)] md:h-40 md:w-40" />
          <div className="w-full flex-1 space-y-5">
            <div className="flex flex-wrap gap-3">
              <LoadingBone className="h-7 w-44 rounded-full" />
              <LoadingBone className="h-7 w-16 rounded-full" />
            </div>
            <LoadingBone className="h-12 w-full max-w-2xl rounded-[var(--anslation-ds-radius)] sm:h-14" />
            <div className="space-y-3">
              <LoadingBone className="h-5 w-full max-w-3xl rounded-full" />
              <LoadingBone className="h-5 w-4/5 max-w-2xl rounded-full" />
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <LoadingBone className="h-12 w-40 rounded-[var(--anslation-ds-radius)]" />
              <LoadingBone className="h-12 w-36 rounded-[var(--anslation-ds-radius)]" />
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-10 lg:col-span-8">
            <section>
              <div className="mb-6 flex items-center gap-3">
                <LoadingBone className="h-10 w-10 rounded-[var(--anslation-ds-radius)]" />
                <LoadingBone className="h-8 w-48 rounded-[var(--anslation-ds-radius)]" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-5">
                    <LoadingBone className="mb-4 h-8 w-8 rounded-full" />
                    <LoadingBone className="h-5 w-4/5 rounded-full" />
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <LoadingBone className="h-8 w-64 max-w-full rounded-[var(--anslation-ds-radius)]" />
              <LoadingBone className="h-4 w-full rounded-full" />
              <LoadingBone className="h-4 w-11/12 rounded-full" />
              <LoadingBone className="h-4 w-3/4 rounded-full" />
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="rounded-[var(--anslation-ds-radius)] border border-(--border) bg-(--card) p-6 shadow-[var(--anslation-ds-shadow-sm)]">
              <LoadingBone className="mb-6 h-5 w-48 rounded-full" />
              <div className="space-y-5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between gap-4 border-b border-dashed border-(--border) pb-4 last:border-0 last:pb-0">
                    <LoadingBone className="h-5 w-28 rounded-full" />
                    <LoadingBone className="h-5 w-16 rounded-full" />
                  </div>
                ))}
              </div>
              <LoadingBone className="mt-8 h-24 rounded-[var(--anslation-ds-radius)]" />
            </div>
          </aside>
        </div>
      </main>
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

  if (variant === "article") {
    return <RouteArticleSkeleton />;
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
