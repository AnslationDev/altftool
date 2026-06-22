export default function AppsLoading() {
  return (
    <main className="min-h-screen bg-[#fbfcff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-6 h-16 max-w-xl animate-pulse rounded-lg bg-slate-200" />
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-64 animate-pulse rounded-lg bg-white shadow-sm" />
          ))}
        </div>
      </div>
    </main>
  );
}
