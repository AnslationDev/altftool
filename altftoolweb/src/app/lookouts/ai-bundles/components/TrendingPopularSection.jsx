import { getEditorsPickTools, getPopularTools, getTrendingTools } from "../data/tools";
import CarouselCard from "./CarouselCard";
import Reveal from "./Reveal";
import ScrollCarousel from "./ScrollCarousel";

/** Section 2 — Trending, Most Popular, and Editor's Choice carousels. */
export default function TrendingPopularSection() {
  const trending = getTrendingTools();
  const popular = getPopularTools(12);
  const editorsPicks = getEditorsPickTools();

  return (
    <section id="trending" aria-label="Trending and popular AI tools" className="scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-16">
        <Reveal>
          <ScrollCarousel eyebrow="Hot this week" title="Trending today" subtitle="The tools people are opening the most right now, across every category.">
            {trending.map((tool) => (
              <CarouselCard key={`${tool.name}-${tool.domain}`} tool={tool} showCategory />
            ))}
          </ScrollCarousel>
        </Reveal>

        <Reveal>
          <ScrollCarousel eyebrow="Most-used" title="Most popular AI tools" subtitle="Highest-rated, most widely adopted tools across the whole directory.">
            {popular.map((tool) => (
              <CarouselCard key={`${tool.name}-${tool.domain}`} tool={tool} showCategory />
            ))}
          </ScrollCarousel>
        </Reveal>

        <Reveal>
          <ScrollCarousel eyebrow="Hand-picked" title="Editor's choice" subtitle="Standout tools our editors personally recommend in each category.">
            {editorsPicks.map((tool) => (
              <CarouselCard key={`${tool.name}-${tool.domain}`} tool={tool} showCategory />
            ))}
          </ScrollCarousel>
        </Reveal>
      </div>
    </section>
  );
}
