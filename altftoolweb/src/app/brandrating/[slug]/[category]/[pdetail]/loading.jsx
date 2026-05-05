function TopBarSkeleton() {
  return (
    <section className="section">
      <div className="w-full flex flex-col lg:flex-row lg:items-center xl:justify-between gap-3">
        <div className="h-11 w-11 rounded-full bg-[var(--muted)] animate-pulse" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-28 rounded-full bg-[var(--muted)] animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}

function DetailHeroSkeleton() {
  return (
    <section className="section">
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6 sm:gap-8 md:gap-10 lg:gap-16 items-start">
        <div>
          <div className="h-[220px] sm:h-[300px] md:h-[360px] lg:h-[480px] rounded-2xl bg-[var(--muted)] animate-pulse" />
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[70px] sm:h-[90px] md:h-[110px] rounded-xl bg-[var(--muted)] animate-pulse" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-10 w-4/5 rounded bg-[var(--muted)] animate-pulse" />
          <div className="h-5 w-40 rounded bg-[var(--muted)] animate-pulse" />
          <div className="h-5 w-56 rounded bg-[var(--muted)] animate-pulse" />
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-[var(--muted)] animate-pulse" />
            <div className="h-4 w-11/12 rounded bg-[var(--muted)] animate-pulse" />
            <div className="h-4 w-4/5 rounded bg-[var(--muted)] animate-pulse" />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:gap-5 pt-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 rounded-full bg-[var(--muted)] animate-pulse" />
                <div className="h-4 w-16 rounded bg-[var(--muted)] animate-pulse" />
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <div className="h-12 w-36 rounded bg-[var(--muted)] animate-pulse" />
            <div className="h-[52px] w-full sm:w-40 rounded-full bg-[var(--muted)] animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ThreeRowTextSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-full rounded bg-[var(--muted)] animate-pulse" />
      <div className="h-4 w-11/12 rounded bg-[var(--muted)] animate-pulse" />
      <div className="h-4 w-4/5 rounded bg-[var(--muted)] animate-pulse" />
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="rounded-2xl p-6 sm:p-7 lg:p-8 border border-(--border) bg-(--background)">
      <div className="h-14 w-14 rounded-full bg-[var(--muted)] animate-pulse -mt-12 mb-6" />
      <ThreeRowTextSkeleton />
      <div className="h-px my-5 bg-(--border)" />
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-4 w-24 rounded bg-[var(--muted)] animate-pulse" />
          <div className="h-3 w-20 rounded bg-[var(--muted)] animate-pulse" />
        </div>
        <div className="h-4 w-20 rounded bg-[var(--muted)] animate-pulse" />
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex flex-col relative">
      <TopBarSkeleton />
      <div className="flex flex-col">
        <DetailHeroSkeleton />

        <section className="w-full section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-20 items-start">
            <div className="space-y-5">
              <div className="h-10 w-64 rounded bg-[var(--muted)] animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-[var(--muted)] animate-pulse" />
                  <div className="flex-1 pt-1">
                    <div className="h-4 w-32 rounded bg-[var(--muted)] animate-pulse mb-3" />
                    <ThreeRowTextSkeleton />
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div className="aspect-[4/3] rounded-2xl bg-[var(--muted)] animate-pulse" />
              <div className="flex justify-center gap-3 mt-5">
                <div className="w-10 h-10 rounded-full bg-[var(--muted)] animate-pulse" />
                <div className="w-10 h-10 rounded-full bg-[var(--muted)] animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="h-[200px] sm:h-[300px] md:h-[360px] lg:h-[432px] rounded-[30px] bg-[var(--muted)] animate-pulse" />
        </section>

        <section className="w-full section">
          <div className="h-10 w-96 max-w-full rounded bg-[var(--muted)] animate-pulse mx-auto mb-8" />
          <div className="space-y-4 max-w-4xl mx-auto">
            <ThreeRowTextSkeleton />
            <ThreeRowTextSkeleton />
            <ThreeRowTextSkeleton />
          </div>
        </section>

        <section className="section w-full flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <div className="h-10 w-56 rounded bg-[var(--muted)] animate-pulse mx-auto mb-4" />
            <div className="h-5 w-80 rounded bg-[var(--muted)] animate-pulse mx-auto" />
          </div>
          <div className="flex gap-4 w-full overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-[240px] min-w-[240px] h-[313px] rounded-lg border border-(--border) p-[10px]">
                <div className="h-[116px] rounded-xl bg-[var(--muted)] animate-pulse mb-4" />
                <div className="space-y-3">
                  <div className="h-6 w-32 rounded bg-[var(--muted)] animate-pulse" />
                  <div className="h-4 w-20 rounded bg-[var(--muted)] animate-pulse" />
                  <div className="h-4 w-40 rounded bg-[var(--muted)] animate-pulse" />
                  <div className="h-10 w-full rounded-full bg-[var(--muted)] animate-pulse mt-6" />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="mb-8 text-center">
            <div className="h-10 w-64 rounded bg-[var(--muted)] animate-pulse mx-auto mb-4" />
            <div className="h-5 w-72 rounded bg-[var(--muted)] animate-pulse mx-auto" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <ReviewSkeleton key={i} />
            ))}
          </div>
        </section>

        <section className="section w-full flex justify-center">
          <div className="w-full flex flex-col gap-[20px] sm:gap-[50px] mb-12">
            <div className="text-center">
              <div className="h-10 w-72 rounded bg-[var(--muted)] animate-pulse mx-auto mb-4" />
              <div className="h-5 w-64 rounded bg-[var(--muted)] animate-pulse mx-auto" />
            </div>
            <div className="flex flex-col gap-[14px] sm:gap-[20px]">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="w-full border border-(--border) rounded-[18px] p-5">
                  <div className="h-5 w-2/3 rounded bg-[var(--muted)] animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
