import { getNewlyAddedTools } from "../data/tools";
import CarouselCard from "./CarouselCard";
import ScrollCarousel from "./ScrollCarousel";

export default function NewlyAddedSection() {
  const tools = getNewlyAddedTools();

  return (
    <ScrollCarousel
      id="newly-added"
      eyebrow="Fresh picks"
      title="Newly added to the directory"
      subtitle={`${tools.length} free AI tools added recently — reviewed and confirmed free before listing.`}
    >
      {tools.map((tool) => (
        <CarouselCard key={`${tool.name}-${tool.domain}`} tool={tool} />
      ))}
    </ScrollCarousel>
  );
}
