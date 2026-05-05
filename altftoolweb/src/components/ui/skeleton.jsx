"use client";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function SkeletonBlock({ className = "", children }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        "relative overflow-hidden bg-(--muted) dark:bg-(--card) rounded-[inherit]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/2 translate-x-[-120%] animate-skeleton-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent will-change-transform dark:via-white/15" />
      </div>
      {children}
    </div>
  );
}

export function SkeletonLine({ className = "" }) {
  return <SkeletonBlock className={cx("h-4 rounded-full", className)} />;
}

export function SectionHeaderSkeleton({
  centered = true,
  className = "",
  titleWidth = "w-56",
  subtitleWidth = "w-80",
}) {
  return (
    <div className={cx(centered ? "section-header" : "", className)}>
      <SkeletonLine className={cx("h-9 max-w-full", titleWidth)} />
      <SkeletonLine className={cx("mt-4 h-5 max-w-full", subtitleWidth)} />
    </div>
  );
}

export function HeroBannerSkeleton() {
  return (
    <section>
      <SkeletonBlock className="h-[180px] sm:h-[260px] md:h-[320px] lg:h-[420px] xl:h-[520px] rounded-xl sm:rounded-2xl" />
      <div className="mt-6 flex justify-center gap-4">
        <SkeletonBlock className="h-2 w-8 rounded-full" />
        <SkeletonBlock className="h-2 w-2 rounded-full" />
        <SkeletonBlock className="h-2 w-2 rounded-full" />
      </div>
    </section>
  );
}

export function TrendingSkeleton({ cards = 3 }) {
  return (
    <div className="flex flex-col gap-6">
      <SectionHeaderSkeleton titleWidth="w-72" subtitleWidth="w-96" />
      <div className="overflow-hidden">
        <div className="flex">
          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="w-full shrink-0 px-[8px] sm:w-1/2 sm:px-[10px] lg:w-1/3 lg:px-[12px]"
            >
              <SkeletonBlock className="aspect-[43/24] rounded-xl">
                <div className="absolute inset-x-5 bottom-4 space-y-2">
                  <SkeletonLine className="h-4 w-16" />
                  <SkeletonLine className="h-6 w-36" />
                  <SkeletonLine className="h-4 w-24" />
                </div>
              </SkeletonBlock>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FeatureBrandSkeleton() {
  return (
    <section className="space-y-7">
      <SectionHeaderSkeleton titleWidth="w-72" subtitleWidth="w-80" />

      <div className="flex gap-3 overflow-x-auto no-scrollbar lg:justify-center md:gap-12">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock
            key={index}
            className="h-10 w-24 shrink-0 rounded-full"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <SkeletonBlock className="min-h-[300px] rounded-lg lg:col-span-1" />
        <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBlock key={index} className="aspect-video rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}

export function DiscoverBrandsSkeleton() {
  return (
    <div className="mx-auto px-4 text-center sm:px-6">
      <SectionHeaderSkeleton titleWidth="w-80" subtitleWidth="w-72" />
      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3 md:gap-0">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="relative flex h-full flex-col gap-3 rounded-xl bg-(--card) px-6 py-6 text-left shadow-sm sm:px-8 sm:py-8 md:rounded-none md:bg-transparent md:px-10 md:py-10 md:shadow-none"
          >
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-8 w-8 rounded-full" />
              <SkeletonLine className="h-5 w-40" />
            </div>
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 w-11/12" />
            {index !== 2 ? (
              <div className="absolute right-0 top-1/2 hidden h-24 w-px -translate-y-1/2 bg-(--border) md:block" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SearchExploreSkeleton() {
  return (
    <section className="overflow-hidden rounded-lg bg-(--search-buysmart) px-4 pb-0 pt-6 sm:px-6 lg:px-10">
      <div className="section-container max-w-7xl">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <div className="w-full space-y-3">
              <SkeletonLine className="h-10 w-72 max-w-full" />
              <SkeletonLine className="h-5 w-80 max-w-full" />
            </div>
            <SkeletonBlock className="h-[58px] w-full max-w-full rounded-full sm:max-w-xl lg:max-w-2xl" />
          </div>
          <div className="flex items-end justify-center lg:justify-end">
            <SkeletonBlock className="h-[240px] w-full max-w-[220px] rounded-3xl sm:max-w-xs md:max-w-md lg:max-w-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function AlphabetFilterSkeleton() {
  return (
    <div className="relative mx-auto flex flex-col items-start rounded-lg lg:items-center">
      <SectionHeaderSkeleton titleWidth="w-72" subtitleWidth="w-80" />
      <div className="flex w-full gap-1 overflow-x-auto py-3 no-scrollbar sm:gap-1.5 sm:py-4">
        {["All", "0-9", "A", "B", "C", "D", "E", "F", "G", "H"].map((item) => (
          <SkeletonBlock
            key={item}
            className="h-[28px] w-[30px] shrink-0 rounded-md sm:h-[32px] sm:w-[34px] md:h-[36px] md:w-[38px] lg:h-[40px] lg:w-[42px] xl:h-[42px] xl:w-[44px]"
          />
        ))}
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="group w-full">
      <div className="relative h-[280px] w-full sm:h-[300px] md:h-[320px] lg:h-[340px] xl:h-[360px]">
        <div className="relative flex h-full flex-col overflow-hidden rounded-[20px]">
          <SkeletonBlock className="h-[240px] w-full rounded-[16px] sm:h-[260px] md:h-[280px] lg:h-[300px] xl:h-[320px]" />
          <div className="mt-2 flex flex-col gap-2">
            <SkeletonLine className="mx-auto h-6 w-3/4" />
            <SkeletonLine className="mx-auto h-6 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CategoriesSkeleton({ cards = 5 }) {
  return (
    <div className="flex justify-center gap-8 bg-[var(--background)] text-[var(--foreground)]">
      <section className="flex-1 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SkeletonBlock className="h-11 w-full rounded-full sm:w-56" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SkeletonLine className="h-4 w-16" />
            <SkeletonBlock className="h-11 w-full rounded-full sm:w-40" />
          </div>
        </div>

        <div className="grid min-w-[280px] flex-1 grid-cols-2 gap-5 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: cards }).map((_, index) => (
            <CategoryCardSkeleton key={index} />
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <SkeletonBlock className="h-[40px] w-28 rounded-full sm:h-[48px] sm:w-[135px]" />
            <div className="flex items-center gap-3 sm:gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonBlock
                  key={index}
                  className="h-[28px] w-5 rounded-full sm:h-[40px] sm:w-6 md:h-[45px]"
                />
              ))}
            </div>
            <SkeletonBlock className="h-[40px] w-28 rounded-full sm:h-[48px] sm:w-[135px]" />
          </div>
          <SkeletonLine className="h-5 w-52" />
        </div>
      </section>
    </div>
  );
}

export function AcademyHeroSkeleton() {
  return (
    <section className="section relative w-full">
      <div className="relative w-full aspect-[16/8] px-2 lg:px-4 xl:px-6 xl:aspect-[21/10]">
        <SkeletonBlock className="h-full w-full rounded-xl" />
      </div>

      <div className="relative z-20 mx-auto hidden w-[99%] rounded-xl bg-blue-700 px-4 py-5 lg:-mt-18 lg:block lg:w-[90%] lg:px-10 lg:py-7 xl:w-[86%] xl:px-12 xl:py-8 2xl:w-[88%]">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 lg:grid-cols-4 lg:gap-x-5 2xl:gap-x-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              {index !== 0 ? (
                <div className="hidden h-10 w-px shrink-0 bg-white/20 lg:block" />
              ) : null}
              <SkeletonBlock className="h-12 w-12 shrink-0 rounded-full bg-white/15" />
              <div className="space-y-2">
                <SkeletonBlock className="h-4 w-20 rounded-full bg-white/15" />
                <SkeletonBlock className="h-3 w-28 rounded-full bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeaturedAcademiesSkeleton() {
  return (
    <section className="section bg-white">
      <div className="flex gap-3 overflow-x-auto no-scrollbar sm:gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="min-w-[280px] shrink-0 p-1 sm:p-5">
            <SkeletonBlock className="h-12 w-[160px] rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function LearningPlatformSkeleton() {
  return (
    <section className="section">
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16 xl:gap-28">
        <div>
          <SkeletonLine className="h-10 w-80 max-w-full" />
          <SkeletonLine className="mt-3 h-10 w-64 max-w-full" />
          <SkeletonLine className="mt-6 h-5 w-full max-w-[620px]" />
          <div className="mt-[clamp(1.25rem,3vw,2rem)] space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <SkeletonBlock className="h-10 w-10 rounded-full" />
                <SkeletonLine className="h-5 w-72 max-w-full" />
              </div>
            ))}
          </div>
          <SkeletonBlock className="mt-7 h-12 w-44 rounded-xl" />
        </div>
        <div className="flex justify-center">
          <SkeletonBlock className="h-[420px] w-full max-w-[clamp(200px,40vw,500px)] rounded-[32px]" />
        </div>
      </div>
    </section>
  );
}

export function ExplorePlatformSkeleton() {
  return (
    <section className="section">
      <div className="flex flex-col gap-2 sm:gap-5">
        <SectionHeaderSkeleton centered={false} titleWidth="w-80" subtitleWidth="w-[28rem]" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-full rounded-xl border border-(--border) p-5 shadow-[0px_12px_24px_0px_#0F172A05] sm:rounded-2xl sm:p-6"
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <SkeletonBlock className="h-14 w-14 rounded-xl" />
                <SkeletonLine className="h-5 w-40" />
                <SkeletonLine className="h-4 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AcademyCardSkeleton() {
  return (
    <div className="min-w-[calc(100vw-2rem)] rounded-2xl border border-[var(--border)] p-5 shadow-[0px_12px_24px_0px_#0F172A05] sm:min-w-0 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <SkeletonBlock className="h-10 w-32 rounded-lg sm:h-12 sm:w-36" />
        <SkeletonBlock className="h-[28px] w-14 rounded-full" />
      </div>
      <SkeletonBlock className="mb-3 h-8 w-28 rounded-full" />
      <div className="mb-4 space-y-2 lg:mb-6">
        <SkeletonLine className="h-6 w-40" />
        <SkeletonLine className="h-4 w-full" />
        <SkeletonLine className="h-4 w-11/12" />
        <SkeletonLine className="h-4 w-3/4" />
      </div>
      <div className="mb-4 flex flex-wrap gap-2 lg:mb-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonBlock key={index} className="h-7 w-20 rounded-full" />
        ))}
      </div>
      <div className="mb-4 h-px w-full bg-(--border)" />
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <SkeletonLine className="h-3 w-16" />
          <SkeletonLine className="h-5 w-20" />
        </div>
        <SkeletonBlock className="h-11 w-36 rounded-xl" />
      </div>
    </div>
  );
}

export function AcademyResultsSkeleton({ cards = 6 }) {
  return (
    <section id="academy-project" className="section">
      <div className="overflow-hidden">
        <div className="flex gap-3 overflow-x-auto no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {Array.from({ length: cards }).map((_, index) => (
            <div
              key={index}
              className="w-[85%] shrink-0 snap-start sm:w-auto"
            >
              <AcademyCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
