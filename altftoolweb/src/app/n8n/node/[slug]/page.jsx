import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import WorkflowCard from "../../components/WorkflowCard";
import NodeBadge from "../../components/NodeBadge";
import { getAllNodes, getWorkflowsByNode } from "../../data/service";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllNodes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const node = getAllNodes().find((n) => n.slug === slug);
  if (!node) {
    return createPageMetadata({
      title: "Node Not Found",
      description: "The requested n8n node does not exist.",
      path: `/n8n/node/${slug}`,
      noindex: true,
    });
  }
  return createPageMetadata({
    title: `n8n Workflows using the ${node.name} node`,
    description: `Explore free n8n workflow templates that use the ${node.name} node.`,
    path: `/n8n/node/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const node = getAllNodes().find((n) => n.slug === slug);
  if (!node) notFound();
  const items = getWorkflowsByNode(slug).sort((a, b) => b.totalViews - a.totalViews);

  return (
    <main className="min-h-screen bg-(--color-background)">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-(--color-muted-foreground)">
          <Link href="/n8n" className="hover:text-(--color-primary)">n8n Workflows</Link>
          <ChevronRight size={13} />
          <span className="text-(--color-foreground)">{node.name}</span>
        </nav>

        <div className="mt-4 flex items-center gap-3">
          <NodeBadge name={node.name} size={36} />
          <h1 className="text-2xl font-extrabold text-(--color-foreground) sm:text-3xl">
            {items.length} n8n Workflows using {node.name}
          </h1>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((w) => (
            <WorkflowCard key={w.slug} workflow={w} />
          ))}
        </div>
      </div>
    </main>
  );
}
