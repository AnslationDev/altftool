import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createArticleJsonLd,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";
import { GUIDES, findGuide } from "../guides";

export const revalidate = 86400;

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) return createPageMetadata({ title: "Not found", path: `/ideas/learn/${slug}` });

  return createPageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/ideas/learn/${slug}`,
    keywords: guide.keywords,
  });
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const guide = findGuide(slug);
  if (!guide) notFound();

  const related = (guide.related ?? []).map(findGuide).filter(Boolean);

  return (
    <>
      <JsonLd
        id={`altf-ideas-guide-${slug}`}
        data={[
          createArticleJsonLd({
            path: `/ideas/learn/${slug}`,
            headline: guide.title,
            description: guide.description,
            datePublished: "2026-03-14",
            dateModified: guide.updated,
            author: "AltF Ideas",
          }),
          createFaqJsonLd({ path: `/ideas/learn/${slug}`, questions: guide.faqs }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Ideas", path: "/ideas" },
            { name: "Learn", path: "/ideas/learn" },
            { name: guide.title, path: `/ideas/learn/${slug}` },
          ]),
        ]}
      />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 py-5 font-mono text-xs text-muted-foreground">
          <Link href="/ideas" className="hover:text-primary">Ideas</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <Link href="/ideas/learn" className="hover:text-primary">Learn</Link>
          <span aria-hidden="true" className="opacity-40">/</span>
          <span className="text-foreground">{guide.title}</span>
        </nav>

        <header className="border-b border-border pb-8">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-primary">
            Guide
          </span>
          <h1 className="mt-3 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-tight tracking-[-0.03em] text-foreground">
            {guide.title}
          </h1>
          <p className="mt-4 text-[clamp(1rem,1.3vw,1.0625rem)] leading-relaxed text-muted-foreground">
            {guide.description}
          </p>
          <p className="mt-3 font-mono text-xs text-muted-foreground">
            Updated {guide.updated} · {guide.readingMinutes} min read
          </p>
        </header>

        <article className="py-8">
          {/* Answer-first block — self-contained, written to be lifted verbatim. */}
          <div className="afi-answer mb-8 rounded-lg border border-border bg-canvas p-5">
            <p className="text-[0.9375rem] leading-relaxed text-foreground">
              <strong>In short:</strong> {guide.answer}
            </p>
          </div>

          {guide.sections.map((section) => (
            <section key={section.h} className="border-b border-border py-8 first:pt-0">
              <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
                {section.h}
              </h2>

              {section.p?.map((paragraph) => (
                <p key={paragraph} className="mb-3 max-w-[68ch] leading-relaxed text-muted-foreground">
                  {paragraph}
                </p>
              ))}

              {section.list ? (
                <ul className="max-w-[68ch]">
                  {section.list.map((item) => (
                    <li key={item} className="flex gap-3 py-2 leading-relaxed text-muted-foreground">
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}

              {section.table ? (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full border-collapse text-sm">
                    <caption className="sr-only">{section.table.caption}</caption>
                    <thead>
                      <tr className="bg-canvas">
                        {section.table.head.map((h) => (
                          <th
                            key={h}
                            scope="col"
                            className="whitespace-nowrap px-3.5 py-3 text-left font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row) => (
                        <tr key={row[0]} className="border-t border-border">
                          <th scope="row" className="px-3.5 py-3 text-left font-medium text-foreground">
                            {row[0]}
                          </th>
                          {row.slice(1).map((cell) => (
                            <td key={cell} className="px-3.5 py-3 text-muted-foreground">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </section>
          ))}

          <section className="border-b border-border py-8">
            <h2 className="mb-4 text-[1.375rem] font-semibold tracking-tight text-foreground">
              Questions
            </h2>
            {guide.faqs.map((faq, i) => (
              <details key={faq.question} className="border-b border-border" open={i === 0}>
                <summary className="cursor-pointer list-none py-4 text-[0.9375rem] font-medium text-foreground marker:hidden hover:text-primary">
                  {faq.question}
                </summary>
                <div className="max-w-[68ch] pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              </details>
            ))}
          </section>

          <section className="flex flex-wrap items-center justify-between gap-4 py-8">
            <div className="flex flex-wrap gap-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/ideas/learn/${r.slug}`}
                  className="rounded-sm border border-border bg-surface-soft px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:border-border-strong hover:text-foreground"
                >
                  {r.title}
                </Link>
              ))}
            </div>
            <Link
              href="/ideas/browse"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-[0.9375rem] font-semibold text-primary-foreground transition hover:bg-primary-hover"
            >
              Browse scored ideas →
            </Link>
          </section>
        </article>
      </div>
    </>
  );
}
