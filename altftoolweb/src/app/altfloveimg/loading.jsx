export default function Loading() {
  return (
    <div className="ali-scope" style={{ background: "var(--ali-page)" }}>
      <div className="ali-container py-16 sm:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="ali-skeleton h-7 w-44 rounded-full" />
            <div className="ali-skeleton mt-6 h-12 w-full max-w-lg" />
            <div className="ali-skeleton mt-3 h-12 w-2/3 max-w-md" />
            <div className="ali-skeleton mt-6 h-5 w-full max-w-md" />
            <div className="ali-skeleton mt-2 h-5 w-4/5 max-w-sm" />
            <div className="mt-7 flex gap-3">
              <div className="ali-skeleton h-12 w-36 rounded-xl" />
              <div className="ali-skeleton h-12 w-36 rounded-xl" />
            </div>
          </div>
          <div className="ali-skeleton aspect-[4/3] w-full rounded-3xl" />
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ali-skeleton h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
