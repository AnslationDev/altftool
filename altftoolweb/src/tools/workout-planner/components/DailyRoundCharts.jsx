function parseMinutes(block) {
  const match = block.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

export default function DailyRoundCharts({ timeline }) {
  const palette = ["var(--success)", "var(--info)", "var(--warning)"];

  return (
    <section className="mt-2">
      <div className="p-5 rounded-lg border border-(--border) bg-(--card)">
        <h3 className="text-xl font-bold mb-4 text-(--foreground)">Daily Round Charts</h3>
        <p className="text-sm text-(--muted-foreground) mb-5">
          Each circle shows warm-up, main block, and cooldown time split for the day.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timeline.map((session) => {
            const warm = parseMinutes(session.blocks[0]);
            const main = parseMinutes(session.blocks[1]);
            const cool = parseMinutes(session.blocks[2]);
            const total = Math.max(1, warm + main + cool);
            const p1 = Math.round((warm / total) * 100);
            const p2 = Math.round((main / total) * 100);
            const p3 = Math.max(0, 100 - p1 - p2);
            const bg = `conic-gradient(${palette[0]} 0% ${p1}%, ${palette[1]} ${p1}% ${p1 + p2}%, ${palette[2]} ${p1 + p2}% 100%)`;

            return (
              <div key={session.day} className="p-4 text-center rounded-lg border border-(--border) bg-(--background)">
                <p className="text-sm font-semibold mb-3">{session.day}</p>
                <div className="mx-auto h-28 w-28 rounded-full relative" style={{ background: bg }}>
                  <div className="absolute inset-4 rounded-full bg-(--background) flex items-center justify-center">
                    <span className="text-xs font-semibold">{total}m</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-(--muted-foreground) space-y-1">
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: palette[0] }} /> Warm-up {p1}%</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: palette[1] }} /> Main {p2}%</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full mr-1" style={{ background: palette[2] }} /> Cooldown {p3}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
