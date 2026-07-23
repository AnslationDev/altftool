import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import WorkflowCard from "../../components/WorkflowCard";
import {
  getCategoryBySlug,
  getCategories,
  getWorkflowsByCategory,
} from "../../data/service";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";
export const revalidate = 3600;

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
    description: `Browse the best free n8n ${cat.name} workflows. Copy JSON and import into your n8n instance.`,
    path: `/n8n/category/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const cat = getCategoryBySlug(slug);
  if (!cat) notFound();
  const items = getWorkflowsByCategory(slug).sort((a, b) => b.totalViews - a.totalViews);

  return (
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
  );
}
