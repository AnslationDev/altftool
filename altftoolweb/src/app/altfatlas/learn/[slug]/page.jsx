import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock } from "lucide-react";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { GUIDE_BY_SLUG, GUIDE_SLUGS, GUIDES } from "../guides";
import {
  AnswerBlock,
  AtlasSection,
  Breadcrumbs,
} from "../../_components/Shell";

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) return createPageMetadata({ title: "Guide not found" });

  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/altfatlas/learn/${slug}`,
    type: "article",
    publishedTime: guide.updated,
    modifiedTime: guide.updated,
  });
}

export default async function AtlasGuidePage({ params }) {
  const { slug } = await params;
  const guide = GUIDE_BY_SLUG[slug];
  if (!guide) notFound();

  const others = GUIDES.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        id={`altf-atlas-guide-${slug}-schema`}
        data={[
          createArticleJsonLd({
            path: `/altfatlas/learn/${slug}`,
            headline: guide.title,
            description: guide.description,
            datePublished: guide.updated,
            dateModified: guide.updated,
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Atlas", path: "/altfatlas" },
            { name: "Guides", path: "/altfatlas/learn" },
            { name: guide.title, path: `/altfatlas/learn/${slug}` },
          ]),
        ]}
      />

      <AtlasSection className="py-8 sm:py-10">
        <Breadcrumbs
          trail={[
            { name: "Atlas", path: "/altfatlas" },
            { name: "Guides", path: "/altfatlas/learn" },
            { name: guide.title, path: `/altfatlas/learn/${slug}` },
          ]}
        />

        <article className="mt-6 max-w-3xl">
          <p className="afa-eyebrow flex items-center gap-1.5">
            <Clock className="h-3 w-3" aria-hidden="true" />
            {guide.readMinutes} min read · updated {guide.updated}
          </p>

          <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {guide.title}
          </h1>

          <div className="mt-5">
            <AnswerBlock>{guide.intro}</AnswerBlock>
          </div>

          <div className="mt-10 grid gap-10">
            {guide.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold tracking-tight text-foreground">
                  {section.heading}
                </h2>
                <div className="mt-3 grid gap-4">
                  {section.body.map((paragraph, index) => (
                    <p
                      key={`${section.heading}-${index}`}
                      className="text-pretty leading-relaxed text-muted-foreground"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {guide.takeaways?.length ? (
            <div className="mt-10 rounded-lg border border-border bg-card p-5">
              <h2 className="afa-eyebrow">In short</h2>
              <ul className="mt-3 grid gap-2">
                {guide.takeaways.map((takeaway) => (
                  <li
                    key={takeaway}
                    className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                    {takeaway}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </article>

        {others.length ? (
          <div className="mt-12 max-w-3xl border-t border-border pt-8">
            <p className="afa-eyebrow">More guides</p>
            <ul className="mt-3 grid gap-2">
              {others.map((item) => (
                <li key={item.slug}>
                  <Link
                    href={`/altfatlas/learn/${item.slug}`}
                    prefetch={false}
                    className="block rounded-md border border-border px-4 py-3 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </AtlasSection>
    </>
  );
}
