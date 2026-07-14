"use client";

export default function Description() {
  return (
    <section className="mx-auto mt-10 max-w-3xl text-[var(--muted-foreground)]">
      <h2 className="mb-2 text-lg font-semibold text-[var(--foreground)]">How to play</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed">
        <li>Swap two adjacent candies to line up 3 or more of the same kind.</li>
        <li>Drag a candy with mouse or finger, or tap one then tap a neighbor.</li>
        <li>Bigger matches and chained cascades earn bonus points — chase the combo!</li>
        <li>Reach the target score before you run out of moves (or time in Timed mode).</li>
        <li>Six candy colors each have a unique shape, so the game stays fair for color-blind players.</li>
      </ul>
    </section>
  );
}
