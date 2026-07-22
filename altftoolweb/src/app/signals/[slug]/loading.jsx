export default function SignalDetailLoading() {
  return (
    <main id="main-content" className="min-h-screen bg-background text-foreground" aria-busy="true" aria-label="Loading signal research">
      <section className="border-b border-border bg-surface-soft">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="h-4 w-24 animate-pulse rounded bg-primary-soft" />
          <div className="mt-6 h-10 max-w-xl animate-pulse rounded bg-card" />
          <div className="mt-4 h-5 max-w-2xl animate-pulse rounded bg-card" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-24 animate-pulse rounded-lg border border-border bg-card" />)}
          </div>
        </div>
      </section>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="h-96 animate-pulse rounded-lg border border-border bg-card" />
        <div className="h-64 animate-pulse rounded-lg border border-border bg-card" />
      </div>
    </main>
  );
}
