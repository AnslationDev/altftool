export default function SiteMapLoading() {
  return (
    <main aria-busy="true" aria-label="Loading site map" className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-4 w-32 animate-pulse rounded-md bg-muted" />
          <div className="mt-6 h-10 w-full max-w-xl animate-pulse rounded-md bg-muted" />
          <div className="mt-4 h-5 w-full max-w-2xl animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-11 animate-pulse rounded-md bg-muted" />
        {Array.from({ length: 6 }, (_, index) => (
          <div className="h-20 animate-pulse rounded-lg border border-border bg-card" key={index} />
        ))}
      </div>
    </main>
  );
}
