import { useMemo, useState } from "react";
import Icon from "../components/Icons.jsx";
import PageHero from "../components/PageHero.jsx";
import {
  Container,
  Reveal,
  SectionHeading,
  Button,
  Pill,
  PostCard,
} from "../components/ui.jsx";
import { img, blogPosts, blogCategories } from "../data/site.js";
import { useActionPopup } from "../components/ActionPopup.jsx";

export default function Blog() {
  const [active, setActive] = useState("All");
  const { trigger, Popup } = useActionPopup();

  const featured = blogPosts.find((p) => p.featured);
  const rest = useMemo(
    () => blogPosts.filter((p) => !p.featured),
    []
  );

  const filtered = useMemo(() => {
    if (active === "All") return rest;
    return rest.filter((p) => p.category === active);
  }, [active, rest]);

  return (
    <>
      <PageHero
        eyebrow="The Lumina Journal"
        title="Ideas, guides & window inspiration"
        description="Design trends, expert guides and inspiration to help you choose, style and care for your windows."
        image={31234051}
        current="Blog"
      />

      {/* FEATURED */}
      <section className="py-20 sm:py-24">
        <Container>
          <Reveal>
            <article className="group grid overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-lg shadow-ink/5 lg:grid-cols-2">
              <div className="relative min-h-56 lg:min-h-full overflow-hidden">
                <img
                  src={img(featured.image, 1100)}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-5 top-5">
                  <Pill className="border-white/30 bg-bronze-600 text-white">
                    Featured
                  </Pill>
                </span>
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <div className="flex items-center gap-3 text-xs text-stone-500">
                  <Pill>{featured.category}</Pill>
                  <span>{featured.date}</span>
                  <span className="h-1 w-1 rounded-full bg-stone-300" />
                  <span>{featured.readTime}</span>
                </div>
                <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  {featured.title}
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-stone-600">
                  {featured.excerpt}
                </p>
                <div className="mt-7 flex items-center justify-between">
                  <span className="text-sm font-medium text-stone-700">
                    By {featured.author}
                  </span>
                  <Button onClick={trigger} variant="outline" size="sm">
                    Read Article
                    <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              </div>
            </article>
          </Reveal>
        </Container>
      </section>

      {/* FILTER + GRID */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <SectionHeading
            align="left"
            eyebrow="Latest Articles"
            title="Explore the journal"
          />

          <Reveal className="mt-8 flex flex-wrap gap-2.5">
            {blogCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                  active === cat
                    ? "bg-bronze-600 text-white shadow-md shadow-bronze-700/20"
                    : "border border-stone-200 bg-white text-stone-600 hover:border-bronze-400 hover:text-bronze-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </Reveal>

          {filtered.length > 0 ? (
            <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((post, i) => (
                <Reveal key={post.title} delay={(i % 3) * 80}>
                  <PostCard post={post} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="mt-16 rounded-3xl border border-dashed border-stone-300 bg-white/50 p-16 text-center">
              <p className="text-lg font-medium text-stone-600">
                No articles in this category yet — check back soon.
              </p>
            </div>
          )}
        </Container>
      </section>

      {/* NEWSLETTER */}
      <section className="pb-24 sm:pb-32">
        <Container>
          <div className="relative overflow-hidden rounded-[2rem] bg-ink p-10 text-center sm:p-16">
            <div className="bg-grid pointer-events-none absolute inset-0 opacity-40" />
            <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-bronze-600/20 blur-3xl" />
            <div className="relative mx-auto max-w-xl">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-bronze-600/20 text-bronze-300 ring-1 ring-bronze-400/30">
                <Icon name="mail" className="h-7 w-7" />
              </span>
              <h2 className="mt-6 font-display text-3xl font-semibold text-white sm:text-4xl">
                Get window wisdom in your inbox
              </h2>
              <p className="mt-4 text-stone-300">
                Monthly design trends, care tips and inspiration. No spam, ever.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
              >
                <input
                  type="email"
                  required
                  placeholder="you@email.com"
                  className="w-full rounded-full border border-white/15 bg-white/10 px-5 py-3.5 text-sm text-white placeholder:text-stone-400 focus:border-bronze-400 focus:outline-none focus:ring-2 focus:ring-bronze-500/40"
                />
                <Button type="submit" size="md" className="shrink-0">
                  Subscribe
                  <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </section>
      <Popup />
    </>
  );
}
