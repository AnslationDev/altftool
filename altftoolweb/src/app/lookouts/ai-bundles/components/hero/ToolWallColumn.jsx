import ToolWallCard from "./ToolWallCard";

/**
 * One continuously-scrolling column: the item list is rendered twice back to
 * back, then animated exactly -50% up (or down) so the loop point is
 * invisible — the classic seamless CSS marquee trick.
 */
export default function ToolWallColumn({ items, duration, reverse = false }) {
  return (
    <div className="aib-marquee-track h-full overflow-hidden">
      <div
        className={`aib-marquee-col flex flex-col gap-4 ${reverse ? "aib-marquee-reverse" : ""}`}
        style={{ "--aib-marquee-duration": `${duration}s` }}
      >
        {[...items, ...items].map((tool, index) => (
          <ToolWallCard key={`${tool.name}-${tool.domain}-${index}`} tool={tool} />
        ))}
      </div>
    </div>
  );
}
