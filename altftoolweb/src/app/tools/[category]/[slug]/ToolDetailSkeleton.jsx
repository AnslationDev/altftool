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
      <div className="sticky top-24 rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-3 shadow-[var(--anslation-ds-shadow-sm)]">
        <Bone className="h-[280px]" />
      </div>
    </div>
  );
}

export function ToolModuleSkeleton() {
  return (
    <div
      role="status"
      aria-label="Preparing workspace"
      className="mx-auto w-full max-w-5xl rounded-[var(--anslation-ds-radius-lg)] border border-(--border) bg-(--card) p-5 shadow-[var(--anslation-ds-shadow-sm)]"
    >
      <span className="sr-only">Preparing workspace</span>
      <div className="mb-6 space-y-3 text-center">
        <Bone className="mx-auto h-9 w-72 max-w-full rounded-xl" />
        <Bone className="mx-auto h-4 w-80 max-w-full rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="rounded-[var(--anslation-ds-radius)] border border-(--border) p-4">
            <Bone className="h-4 w-32 rounded-full" />
            <Bone className="mt-4 h-7 w-24 rounded-lg" />
            <Bone className="mt-3 h-3 w-40 rounded-full" />
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="space-y-3 rounded-[var(--anslation-ds-radius)] border border-(--border) p-4">
          <Bone className="h-5 w-44 rounded-full" />
          <Bone className="h-10 w-full rounded-lg" />
          <Bone className="h-10 w-full rounded-lg" />
          <Bone className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-3 rounded-[var(--anslation-ds-radius)] border border-(--border) p-4">
          <Bone className="h-5 w-40 rounded-full" />
          <Bone className="h-28 rounded-lg" />
          <Bone className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <Bone className="h-64 rounded-[var(--anslation-ds-radius)]" />
        <Bone className="h-64 rounded-[var(--anslation-ds-radius)]" />
      </div>
    </div>
  );
}

export default function ToolDetailLoadingShell() {
  return (
    <main className="w-full bg-(--background) px-4 py-6 text-(--foreground) sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto flex w-full gap-6 lg:gap-8">
        <AdSkeleton />
        <div className="min-w-0 flex-1">
          <div className="mx-auto mb-4 flex w-full max-w-5xl items-center gap-2">
            <Bone className="h-4 w-16 rounded-full" />
            <Bone className="h-4 w-24 rounded-full" />
            <Bone className="h-4 w-40 rounded-full" />
          </div>
          <ToolModuleSkeleton />
          <Bone className="mx-auto mt-8 h-28 w-full max-w-5xl rounded-[var(--anslation-ds-radius-lg)]" />
        </div>
        <AdSkeleton />
      </div>
    </main>
  );
}
