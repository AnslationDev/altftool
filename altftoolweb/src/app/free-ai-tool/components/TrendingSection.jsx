import { getTrendingTools } from "../data/tools";
import CarouselCard from "./CarouselCard";
import ScrollCarousel from "./ScrollCarousel";

export default function TrendingSection() {
  const tools = getTrendingTools();

  return (
    <ScrollCarousel
      id="trending"
      eyebrow="Hot this week"
      title="Trending free AI tools"
      subtitle="The tools creators are opening the most right now, across every category."
    >
      {tools.map((tool) => (
        <CarouselCard key={`${tool.name}-${tool.domain}`} tool={tool} />
      ))}
    </ScrollCarousel>
  );
}
