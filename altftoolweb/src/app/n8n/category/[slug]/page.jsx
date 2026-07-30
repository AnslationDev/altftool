import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import WorkflowCard from "../../components/WorkflowCard";
import {
  getCategoryBySlug,
  getCategories,
  getWorkflowsByCategory,
} from "../../data/service";
import { stripEmojis } from "../../data/text";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createCollectionPageJsonLd,
  createItemListJsonLd,
  createPageMetadata,
} from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";
export const revalidate = 3600;

const description = (name) =>
  `Browse the best free n8n ${name} workflows. Copy JSON and import into your n8n instance.`;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getCategories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) {
    return createPageMetadata({
      title: "Category Not Found",
      description: "The requested n8n category does not exist.",
      path: `/n8n/category/${slug}`,
      noindex: true,
    });
  }
  return createPageMetadata({
    title: `Best ${cat.name} n8n Workflows`,
    description: description(cat.name),
    path: `/n8n/category/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();
  const items = getWorkflowsByCategory(slug).sort((a, b) => b.totalViews - a.totalViews);
  const path = `/n8n/category/${slug}`;

  return (
    <>
      {/* The grid below is the whole page, but it carried no entity at all —
          only /n8n and /n8n/[slug] described themselves. */}
      <JsonLd
        id={`n8n-category-${slug}-schema`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `Best ${cat.name} n8n Workflows`,
            description: description(cat.name),
          }),
          createItemListJsonLd({
            path,
            name: `${cat.name} n8n workflows`,
            // Same order as the grid: most-viewed first.
            items: items.map((w) => ({
              name: stripEmojis(w.title),
              path: `/n8n/${w.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "n8n Workflows", path: "/n8n" },
            { name: cat.name, path },
          ]),
        ]}
      />
      <main className="min-h-screen bg-(--color-background)">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <nav className="flex items-center gap-1 text-xs text-(--color-muted-foreground)">
            <Link href="/n8n" className="hover:text-(--color-primary)">n8n Workflows</Link>
            <ChevronRight size={13} />
            <span className="text-(--color-foreground)">{cat.name}</span>
          </nav>

          <h1 className="mt-4 text-2xl font-extrabold text-(--color-foreground) sm:text-3xl">
            Best Free {items.length} n8n {cat.name} Workflows
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((w) => (
              <WorkflowCard key={w.slug} workflow={w} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
