import Link from "next/link";
import { buildToolSeoContent } from "./toolSeoContent";
import { getRelatedTools } from "./toolRouteUtils";

/**
 * Server-rendered SEO content for tool pages.
 *
 * The interactive widget (<ToolClient>) is a client component, so before
 * hydration Google only saw a skeleton ("Preparing workspace"). That thin
 * first-load HTML is why tool pages landed in "Discovered/Crawled – currently
 * not indexed". This component renders the unique per-tool content
 * (heading, intro, how-to, benefits, FAQ, related tools) on the SERVER so the
 * raw page source contains real, indexable content.
 */
export default function ToolSeoSection({ slug, tool, category = "all" }) {
  const seo = buildToolSeoContent(slug, tool);
  const related = getRelatedTools(slug, 6);

  return (
    <section
      aria-label={`About ${seo.name}`}
      className="mx-auto w-full max-w-5xl px-4 py-10 text-(--foreground)"
    >
      <header>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {seo.name}
        </h1>
        <p className="mt-3 max-w-3xl text-(--muted-foreground)">
          {tool?.description || seo.summary}
        </p>
      </header>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">About {seo.name}</h2>
        <p className="mt-2 max-w-3xl">{seo.intro}</p>
        <p className="mt-3 max-w-3xl text-(--muted-foreground)">{seo.summary}</p>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">How to use {seo.name}</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          {seo.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Why use {seo.name}</h2>
        <ul className="mt-3 grid gap-4 sm:grid-cols-3">
          {seo.examples.map((example, index) => (
            <li
              key={index}
              className="rounded-lg border border-(--border) p-4"
            >
              <h3 className="font-medium">{example.title}</h3>
              <p className="mt-1 text-sm text-(--muted-foreground)">
                {example.body}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {seo.useCases?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold">Common use cases</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            {seo.useCases.map((useCase, index) => (
              <li key={index}>{useCase}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xl font-semibold">Frequently asked questions</h2>
        <dl className="mt-3 space-y-4">
          {seo.faqs.map((faq, index) => (
            <div key={index}>
              <dt className="font-medium">{faq.question}</dt>
              <dd className="mt-1 text-(--muted-foreground)">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>

      {related.length > 0 && (
        <nav aria-label="Related tools" className="mt-8">
          <h2 className="text-xl font-semibold">Related tools</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/tools/all/${item.slug}`}
                  className="inline-block rounded-full border border-(--border) px-3 py-1 text-sm hover:bg-(--muted)"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </section>
  );
}
