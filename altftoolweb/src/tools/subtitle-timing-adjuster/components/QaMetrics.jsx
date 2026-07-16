export default function QaMetrics({ qa }) {
  if (!qa) return null;

  return (
    <div className="rounded-xl border border-(--border) bg-(--background) p-4">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">QA Metrics</h3>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="rounded-lg border border-(--border) bg-(--card) p-3"><p className="text-xs text-(--muted-foreground)">Cues</p><p className="font-bold text-xl">{qa.count}</p></div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-3"><p className="text-xs text-(--muted-foreground)">Overlaps</p><p className="font-bold text-xl">{qa.overlaps}</p></div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-3"><p className="text-xs text-(--muted-foreground)">Short &lt;0.7s</p><p className="font-bold text-xl">{qa.shortCues}</p></div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-3"><p className="text-xs text-(--muted-foreground)">CPS Warnings</p><p className="font-bold text-xl">{qa.cpsWarnings}</p></div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-3"><p className="text-xs text-(--muted-foreground)">First Cue</p><p className="font-bold text-xs">{qa.first}</p></div>
        <div className="rounded-lg border border-(--border) bg-(--card) p-3"><p className="text-xs text-(--muted-foreground)">Last Cue</p><p className="font-bold text-xs">{qa.last}</p></div>
      </div>
    </div>
  );
}
