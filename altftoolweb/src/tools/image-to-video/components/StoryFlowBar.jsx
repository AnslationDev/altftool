"use client";

const PHASES = ["Intro", "Build", "Highlight", "CTA"];

export default function StoryFlowBar({ totalSlides, currentSlideIndex }) {
  if (!totalSlides) return null;

  const active = Math.min(
    Math.floor((currentSlideIndex / totalSlides) * PHASES.length),
    PHASES.length - 1
  );

  return (
    <div className="w-full">
      <p className="text-sm font-semibold text-(--foreground) mb-1.5">Story flow</p>
      <div className="flex gap-1.5">
        {PHASES.map((phase, i) => (
          <div key={phase} className="flex-1 flex flex-col items-center gap-1">
            <div className={`
              h-1.5 w-full rounded-full transition-all duration-300
              ${i <= active ? "bg-(--primary)" : "bg-(--border)"}
            `} />
            <span className={`
              text-xs lg:text-sm transition-all
              ${i === active ? "text-(--primary) font-semibold" : "text-(--muted-foreground)"}
            `}>
              {phase}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}