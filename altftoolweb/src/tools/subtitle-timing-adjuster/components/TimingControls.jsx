export default function TimingControls({
  offsetMs,
  setOffsetMs,
  scalePct,
  setScalePct,
  startAtCue,
  setStartAtCue,
  endAtCue,
  setEndAtCue,
}) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--background) p-4">
      <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide">Advanced Timing Controls</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <input value={offsetMs} onChange={(e) => setOffsetMs(e.target.value)} type="number" placeholder="Offset ms (+/-)" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
        <input value={scalePct} onChange={(e) => setScalePct(e.target.value)} type="number" placeholder="Scale % (100)" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
        <input value={startAtCue} onChange={(e) => setStartAtCue(e.target.value)} type="number" placeholder="Start cue index" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
        <input value={endAtCue} onChange={(e) => setEndAtCue(e.target.value)} type="number" placeholder="End cue index (optional)" className="px-3 py-2 rounded-lg border border-(--border) bg-(--card) focus:outline-none focus:ring-2 focus:ring-(--primary)" />
      </div>
    </div>
  );
}
