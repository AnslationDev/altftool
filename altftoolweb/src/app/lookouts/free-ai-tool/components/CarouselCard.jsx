import ToolCard from "./ToolCard";

/** Fixed-width, snap-aligned slot for a ToolCard inside a ScrollCarousel row. */
export default function CarouselCard({ tool }) {
  return (
    <div className="w-[15.5rem] shrink-0 snap-start sm:w-72">
      <ToolCard tool={tool} />
    </div>
  );
}
