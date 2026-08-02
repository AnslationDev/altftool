import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCategories } from "./data/service";

/**
 * /n8n/category/[slug] and /n8n/node/[slug] both call notFound() for a slug
 * that is not in the generated data — /n8n/category/ai is the live example,
 * plausible next to ai-chatbot, ai-rag and ai-summarization but not a real
 * category. Without this boundary those URLs fell back to the site-wide 404,
 * which sends a visitor who wanted an n8n workflow back to the generic route
 * list. The h1 is a literal, not derived from the slug or from any lookup, so
 * it is in the server-rendered markup even when the data module is empty.
 */
export default function N8nNotFound() {
  const categories = getCategories().slice(0, 8);

  return (
    <main className="min-h-screen bg-(--color-background)">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-(--color-primary)">
          404
        </p>
        <h1 className="mt-2 text-2xl font-extrabold text-(--color-foreground) sm:text-3xl">
          That n8n workflow page does not exist
        </h1>
        <p className="mt-3 text-sm leading-6 text-(--color-muted-foreground) sm:text-base">
          The category or node in this URL is not one we have templates for. The
          full library is still one click away.
        </p>

        {categories.length > 0 && (
          <>
            <h2 className="mt-10 text-sm font-semibold text-(--color-foreground)">
              Popular categories
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/n8n/category/${category.slug}`}
                    className="inline-flex rounded-full border border-(--color-border) bg-(--color-card) px-3 py-1.5 text-xs font-medium text-(--color-foreground) transition-colors duration-200 hover:border-(--color-primary) hover:text-(--color-primary) focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--color-primary)/35 motion-reduce:transition-none"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        <Link
          href="/n8n"
          className="mt-10 inline-flex h-10 items-center gap-2 rounded-lg bg-(--color-primary) px-4 text-sm font-semibold text-(--color-primary-foreground) transition-colors duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-(--color-primary)/35 motion-reduce:transition-none"
        >
          <ArrowLeft className="h-4 w-4" />
          All n8n workflows
        </Link>
      </div>
    </main>
  );
}
