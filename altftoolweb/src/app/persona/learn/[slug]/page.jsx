import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { GUIDES, GUIDE_BY_SLUG } from "../guides";
import { PersonaSection, SectionHeading, Stamp } from "../../_components/Shell";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];

  if (!guide) {
    return createPageMetadata({
      title: "Guide not found",
      path: `/persona/learn/${slug}`,
      noindex: true,
    });
  }

  return createPageMetadata({
    title: guide.title,
    description: `${guide.dek} ${guide.intro}`.slice(0, 300),
    path: `/persona/learn/${guide.slug}`,
    type: "article",
    publishedTime: guide.updated,
    modifiedTime: guide.updated,
  });
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) notFound();

  const others = GUIDES.filter((entry) => entry.slug !== guide.slug);

  return (
    <main>
      <JsonLd
        id={`persona-guide-${guide.slug}-jsonld`}
        data={[
          createArticleJsonLd({
            path: `/persona/learn/${guide.slug}`,
            headline: guide.title,
            description: guide.dek,
            datePublished: guide.updated,
            dateModified: guide.updated,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Persona", path: "/persona" },
            { name: "Guides", path: "/persona/learn" },
            { name: guide.title, path: `/persona/learn/${guide.slug}` },
          ]),
        ]}
      />

      <article>
        <div className="border-b border-border">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
            <Stamp>
              <Link href="/persona/learn" prefetch={false} className="hover:underline">
                Guides
              </Link>{" "}
              · {guide.minutes} min read · updated {guide.updated}
            </Stamp>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {guide.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {guide.dek}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="text-lg leading-relaxed text-foreground">{guide.intro}</p>

          {guide.sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="mt-4 text-[16px] leading-[1.75] text-muted-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>
          ))}

          <div className="psn-accent-panel mt-12 rounded-xl p-6">
            <Stamp style={{ color: "var(--psn-accent-text)" }}>In short</Stamp>
            <ul className="mt-3 space-y-2">
              {guide.takeaways.map((item) => (
                <li key={item} className="flex gap-3 text-[15px] leading-relaxed text-foreground">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: "var(--psn-accent)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/persona/studio"
            prefetch={false}
            className="mt-8 inline-flex items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            style={{ background: "var(--psn-accent)" }}
          >
            Build a persona with this in mind
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </article>

      <PersonaSection tone="plate">
        <SectionHeading eyebrow="Keep reading" title="Other guides" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((entry) => (
            <Link
              key={entry.slug}
              href={`/persona/learn/${entry.slug}`}
              prefetch={false}
              className="psn-sheet rounded-xl p-5 transition hover:border-[var(--psn-accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Stamp>{entry.minutes} min</Stamp>
              <p className="mt-1 font-semibold text-foreground">{entry.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {entry.dek}
              </p>
            </Link>
          ))}
        </div>
      </PersonaSection>
    </main>
  );
}
