export default function AppDetailLoading() {
  return (
    <main className="min-h-screen bg-[#fbfcff] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="h-5 w-48 animate-pulse rounded bg-slate-200" />
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.66fr]">
          <div>
            <div className="flex gap-6">
              <div className="h-32 w-32 animate-pulse rounded-[28px] bg-slate-200" />
              <div className="flex-1">
                <div className="h-12 max-w-md animate-pulse rounded-lg bg-slate-200" />
                <div className="mt-4 h-5 max-w-xl animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-8 h-80 animate-pulse rounded-lg bg-white shadow-sm" />
          </div>
          <div className="h-96 animate-pulse rounded-lg bg-white shadow-sm" />
        </div>
      </div>
    </main>
  );
}
