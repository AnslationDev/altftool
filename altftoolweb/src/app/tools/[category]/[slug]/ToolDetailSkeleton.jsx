"use client";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Bone({ className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "relative overflow-hidden rounded-[var(--anslation-ds-radius)] bg-(--muted)",
        className,
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1/2 translate-x-[-120%] animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/45 to-transparent dark:via-white/15" />
    </div>
  );
}

function AdSkeleton() {
  return (
    <div className="hidden xl:block w-[250px] shrink-0">
      <div className="sticky top-24 rounded-[8px] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)]">
        <Bone className="h-[280px]" />
      </div>
    </div>
  );
}

// Every tool loads through `next/dynamic(..., { ssr: false })`, so THIS is the
// markup a visitor arriving from a mobile search result actually paints first —
// the real tool only appears once its chunk downloads and hydrates.
//
// The previous version stacked a centred title block, three full-width stat
// cards, two form panels and two 256px panes: ~1,556px on a 390px phone. It
// filled the entire 844px viewport with grey bones, so the first screen showed
// none of the tool, and the swap to the real widget collapsed the page by a
// four-figure pixel count.
//
// This version is one compact app-shaped card (~478px on a 390px phone): it
// fits inside the fold, reads as "an app is starting" rather than a wall of
// placeholder, and leaves the layout shift on hand-off far smaller.
export function ToolModuleSkeleton() {
  return (
    <div
      role="status"
      aria-label="Preparing workspace"
      className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[8px] border border-(--border) bg-(--card) p-4 shadow-[var(--anslation-ds-shadow-sm)] sm:gap-5 sm:p-5"
    >
      <span className="sr-only">Preparing workspace</span>
      <div className="space-y-2.5">
        <Bone className="h-7 w-56 max-w-full rounded-[8px]" />
        <Bone className="h-3.5 w-72 max-w-full rounded-full" />
      </div>
      {/* Stat/summary row: 3 across on every width so it stays one line on a
          phone instead of stacking into 386px of bones. */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[var(--anslation-ds-radius)] border border-(--border) p-3">
            <Bone className="h-3 w-full rounded-full" />
            <Bone className="mt-3 h-5 w-3/4 rounded-[8px]" />
          </div>
        ))}
      </div>
      {/* The workspace body — one reserved surface rather than four panels. */}
      <Bone className="h-44 w-full rounded-[var(--anslation-ds-radius)] sm:h-56" />
      <div className="grid gap-2.5 sm:grid-cols-2 sm:gap-4">
        <Bone className="h-11 w-full rounded-[8px]" />
        <Bone className="h-11 w-full rounded-[8px]" />
      </div>
    </div>
  );
}

// Route-level loading shell. Mirrors ToolDetailChrome's real order and spacing
// so a client-side navigation does not shuffle the page when the route lands:
// workspace first, breadcrumb trail last, and the same pt-2 mobile / py-10
// desktop padding.
export default function ToolDetailLoadingShell() {
  return (
    <main className="w-full bg-(--background) px-4 pb-6 pt-2 text-(--foreground) sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full gap-6 lg:gap-8">
        <AdSkeleton />
        <div className="min-w-0 flex-1">
          <ToolModuleSkeleton />
          <Bone className="mx-auto mt-8 h-28 w-full max-w-6xl rounded-[8px]" />
          <div className="mx-auto mt-10 flex w-full max-w-6xl items-center gap-2 border-t border-(--border) pt-5">
            <Bone className="h-4 w-16 rounded-full" />
            <Bone className="h-4 w-24 rounded-full" />
            <Bone className="h-4 w-40 rounded-full" />
          </div>
        </div>
        <AdSkeleton />
      </div>
    </main>
  );
}
