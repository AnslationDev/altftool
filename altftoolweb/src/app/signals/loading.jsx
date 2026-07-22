export default function SignalsLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground" aria-busy="true" aria-label="Loading AltF Signals">
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="h-4 w-28 animate-pulse rounded bg-primary-soft" />
          <div className="mt-4 h-10 max-w-2xl animate-pulse rounded bg-card" />
          <div className="mt-3 h-5 max-w-xl animate-pulse rounded bg-card" />
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-lg border border-border bg-card" />)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-28 animate-pulse rounded-lg border border-border bg-card" />
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => <div key={index} className="h-72 animate-pulse rounded-lg border border-border bg-card" />)}
        </div>
      </section>
    </main>
  );
}
