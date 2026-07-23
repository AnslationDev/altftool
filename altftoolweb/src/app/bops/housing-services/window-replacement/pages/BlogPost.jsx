"use client";

// Helmet removed – not needed for client‑only SPA
import { useParams } from "react-router-dom";
import { blogPosts, img } from "../data/site.js";
import { Container, Reveal, SectionHeading, PostCard } from "../components/ui.jsx";


function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogPost() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => slugify(p.title) === slug);

  if (!post) {
    return (
      <Container>
        <h2 className="text-2xl font-semibold">Post not found</h2>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <Reveal delay={80}>
        <SectionHeading
          eyebrow={post.category}
          title={post.title}
          description={post.excerpt}
          align="left"
        />
      </Reveal>
      <div className="mt-8">
        <img
          src={img(post.image, 1200)}
          alt={post.title}
          className="w-full rounded-xl object-cover"
        />
      </div>
      <article className="mx-auto mt-12 max-w-3xl">
        <div className="text-lg leading-relaxed text-stone-600 sm:text-xl">
          <p className="mb-8">
            When it comes to elevating the design and functionality of your space, fenestration plays a pivotal role. The choices you make regarding materials, glazing, and hardware don't just impact the aesthetics of your property; they fundamentally alter its thermal performance, acoustic insulation, and overall comfort.
          </p>

          <h3 className="mb-5 mt-12 font-display text-2xl font-semibold text-ink sm:text-3xl">
            Understanding the fundamentals
          </h3>
          <p className="mb-6">
            Industry experts agree that longevity and performance should dictate your selection process. While initial costs might tempt a compromise, the long-term savings in energy bills and maintenance invariably justify a premium specification. Furthermore, the integration of advanced sealing technologies ensures that your interiors remain protected against the harshest weather conditions.
          </p>

          <ul className="mb-8 mt-6 list-inside list-disc space-y-3 pl-2 text-stone-700">
            <li>
              <strong className="font-semibold text-ink">Thermal Efficiency:</strong> Look for multi-chambered profiles and low-E coatings to dramatically reduce heat transfer.
            </li>
            <li>
              <strong className="font-semibold text-ink">Acoustic Performance:</strong> Essential for urban environments; laminated or double glazing makes a significant difference in noise reduction.
            </li>
            <li>
              <strong className="font-semibold text-ink">Durability:</strong> High-grade materials resist fading, warping, and corrosion over time, ensuring your investment lasts.
            </li>
          </ul>

          <blockquote className="my-12 border-l-4 border-bronze-500 bg-bronze-50/50 py-6 pl-6 pr-8 text-xl italic leading-relaxed text-stone-700 sm:rounded-r-2xl">
            "The right window doesn't just frame the view—it defines the very atmosphere of the room, controlling light, temperature, and sound with invisible precision."
          </blockquote>

          <p className="mb-6">
            Ultimately, the best approach involves consulting with professionals who understand the specific demands of your local climate and architectural style. By prioritizing quality and expert installation, you guarantee that your investment will pay dividends in comfort and value for decades to come.
          </p>
        </div>
      </article>
    </Container>
  );
}
