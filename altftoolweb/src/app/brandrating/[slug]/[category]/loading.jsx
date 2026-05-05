function PillSkeleton() {
  return <div className="h-[33px] w-[177px] rounded-full bg-[var(--muted)] animate-pulse" />;
}

function CardSkeleton({ featured = false }) {
  return (
    <div
      className={`relative w-[calc(100vw-2rem)] min-w-[calc(100vw-2rem)] sm:w-[90%] sm:min-w-[90%] lg:w-full lg:min-w-0
        rounded-[18px] sm:rounded-[24px] p-3 sm:p-5 lg:p-6
        ${featured ? "bg-[var(--primary)]/12" : "bg-(--background) border border-(--border)"}`}
    >
      <div className="h-6 w-32 rounded bg-[var(--muted)] animate-pulse mb-4" />
      <div className="rounded-2xl bg-(--background) p-3 sm:p-6 lg:p-8">
        <div className="grid gap-5 sm:gap-8 xl:grid-cols-[minmax(0,480px)_1fr] xl:gap-12">
          <div className="h-[220px] sm:h-[280px] rounded-[20px] bg-[var(--muted)] animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 w-48 rounded bg-[var(--muted)] animate-pulse" />
            <div className="h-4 w-3/4 rounded bg-[var(--muted)] animate-pulse" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">[]
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 rounded bg-[var(--muted)] animate-pulse" />
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <div className="h-10 w-28 rounded bg-[var(--muted)] animate-pulse" />
              <div className="h-11 w-full sm:w-36 rounded-full bg-[var(--muted)] animate-pulse" />
              <div className="h-11 w-full sm:w-32 rounded-full bg-[var(--muted)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSkeleton() {
  return (
    <div className="rounded-2xl p-6 sm:p-7 lg:p-8 border border-(--border) bg-(--background)">
      <div className="h-14 w-14 rounded-full bg-[var(--muted)] animate-pulse -mt-12 mb-6" />
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-4 w-11/12 rounded bg-[var(--muted)] animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-[var(--muted)] animate-pulse" />
      </div>
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

function FaqSkeleton() {
  return (
    <div className="w-full border border-(--border) rounded-[18px] p-5">
      <div className="h-5 w-2/3 rounded bg-[var(--muted)] animate-pulse" />
    </div>
  );
}

export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="section w-full flex flex-col bg-(--search-buysmart) min-h-[70vh] md:min-h-[80vh] items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 text-center w-full py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="h-14 w-14 rounded-full bg-[var(--muted)] animate-pulse mx-auto mb-8" />
          <div className="h-12 w-full max-w-2xl rounded bg-[var(--muted)] animate-pulse mx-auto mb-4" />
          <div className="h-5 w-full max-w-3xl rounded bg-[var(--muted)] animate-pulse mx-auto mb-3" />
          <div className="h-5 w-5/6 max-w-2xl rounded bg-[var(--muted)] animate-pulse mx-auto" />
        </div>
      </section>

      <section className="section w-full">
        <div className="text-center px-4 pb-6">
          <div className="h-10 w-72 rounded bg-[var(--muted)] animate-pulse mx-auto mb-4" />
          <div className="h-5 w-full max-w-2xl rounded bg-[var(--muted)] animate-pulse mx-auto" />
        </div>
        <div className="mt-6 md:mt-10 lg:mt-14 w-full lg:max-w-5xl xl:max-w-6xl lg:mx-auto lg:px-6 flex flex-nowrap gap-4 overflow-x-hidden">
          <CardSkeleton />
          <CardSkeleton featured />
          <CardSkeleton />
        </div>
      </section>

      <section className="section w-full flex justify-center">
        <div className="w-full flex flex-col gap-4 sm:gap-6">
          <div className="text-center">
            <div className="h-10 w-64 rounded bg-[var(--muted)] animate-pulse mx-auto mb-4" />
            <div className="h-5 w-full max-w-2xl rounded bg-[var(--muted)] animate-pulse mx-auto" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="h-5 w-20 rounded bg-[var(--muted)] animate-pulse" />
            <PillSkeleton />
          </div>
          <div className="flex flex-col gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} featured={i === 0} />
            ))}
          </div>
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
              <FaqSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
