"use client";

export default function Description() {
  return (
    <section className="mx-auto mt-10 max-w-3xl text-(--muted-foreground)">
      <h2 className="mb-2 text-lg font-semibold text-(--foreground)">
        About this card trick
      </h2>
      <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed">
        <li>
          <span className="font-medium text-(--foreground)">Pick a Card</span> —
          memorise one card from the spread, watch them turn face down, then tap
          your card for a glowing reveal.
        </li>
        <li>
          <span className="font-medium text-(--foreground)">Prediction</span> — a
          sealed prediction appears to read your mind as the forced card is
          revealed.
        </li>
        <li>
          <span className="font-medium text-(--foreground)">Memory</span> — study
          a card for a few seconds, then find it again among the decoys. Build
          your best streak.
        </li>
        <li>
          Use <span className="font-medium text-(--foreground)">Free Play</span>{" "}
          to shuffle, draw, or pull a random card with satisfying animations.
        </li>
        <li>
          Everything runs locally: slick Web Audio beeps, confetti, and your
          preferences (sound, card style, high score) are saved in your browser.
        </li>
      </ul>
    </section>
  );
}
