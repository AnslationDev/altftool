export default function CompareTable({ items }) {
  return (
    <div className="mt-8">
      {/* Mobile: stacked comparison cards — every column's data visible
          at a glance, no sideways-scrolling table to discover. */}
      <div className="sm:hidden space-y-3">
        {items.map((item) => (
          <div
            key={item.rank}
            className="rounded-2xl border border-border bg-page p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-baseline gap-2.5">
                <span className={`shrink-0 text-lg font-black ${item.rank === 1 ? "text-primary-text" : "text-muted-foreground"}`}>
                  #{item.rank}
                </span>
                <span className="truncate font-bold text-foreground">{item.name}</span>
              </div>
              <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-xs font-bold text-foreground ring-1 ring-border">
                {item.score}/10
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                  BEST FOR
                </p>
                <p className="mt-0.5 text-sm text-foreground capitalize">{item.bestFor}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-widest text-muted-foreground">
                  GLOBAL REACH
                </p>
                <p className="mt-0.5 text-sm text-foreground">{item.globalReach}%</p>
              </div>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground-soft">{item.whyItRanks}</p>
          </div>
        ))}
      </div>

      {/* Tablet & up: the classic comparison table. */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-border text-xs font-semibold tracking-widest text-muted-foreground">
              <th className="py-3 pr-4">RANK</th>
              <th className="py-3 pr-4">NAME</th>
              <th className="py-3 pr-4">BEST FOR</th>
              <th className="py-3 pr-4">SCORE</th>
              <th className="py-3 pr-4">REACH</th>
              <th className="py-3">EDITORIAL VIEW</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.rank} className="border-b border-border">
                <td className="py-4 pr-4 font-bold text-foreground">#{item.rank}</td>
                <td className="py-4 pr-4 font-semibold text-foreground">{item.name}</td>
                <td className="py-4 pr-4 text-foreground-soft capitalize">{item.bestFor}</td>
                <td className="py-4 pr-4 text-foreground">{item.score}/10</td>
                <td className="py-4 pr-4 text-foreground">{item.globalReach}%</td>
                <td className="py-4 text-foreground-soft max-w-xs">{item.whyItRanks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
