import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import WorkflowCard from "../../components/WorkflowCard";
import NodeBadge from "../../components/NodeBadge";
import { getAllNodes, getWorkflowsByNode } from "../../data/service";
import { fitMetaDescription, metaTitle, stripEmojis } from "../../data/text";
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

// "built with" rather than "that use", because the count drives the plural and
// "1 template that use the X node" does not agree.
const description = (name, count) =>
  fitMetaDescription(
    `Browse ${count} free n8n workflow template${count === 1 ? "" : "s"} built with the ${name} node.`,
  );

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllNodes().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const node = getAllNodes().find((n) => n.slug === slug);
  if (!node) {
    // Same 70-character floor problem the category route had: this branch
    // answered in 38 characters.
    return createPageMetadata({
      title: "n8n Node Not Found",
      description:
        "That n8n node does not exist. Browse the full AltFTool workflow library instead to find free, importable n8n workflow templates by node or by category.",
      path: `/n8n/node/${slug}`,
      noindex: true,
    });
  }
  return createPageMetadata({
    title: `n8n Workflows with ${metaTitle(node.name, 32)}`,
    description: description(node.name, getWorkflowsByNode(slug).length),
    path: `/n8n/node/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const node = getAllNodes().find((n) => n.slug === slug);
  if (!node) notFound();
  const items = getWorkflowsByNode(slug).sort((a, b) => b.totalViews - a.totalViews);
  const path = `/n8n/node/${slug}`;

  return (
    <>
      {/* Same gap the category pages had: a grid of workflows with no entity
          describing the collection or the node it is filtered by. */}
      <JsonLd
        id={`n8n-node-${slug}-schema`}
        data={[
          createCollectionPageJsonLd({
            path,
            name: `n8n Workflows using ${node.name}`,
            description: description(node.name, items.length),
          }),
          createItemListJsonLd({
            path,
            name: `n8n workflows using ${node.name}`,
            // Same order as the grid: most-viewed first.
            items: items.map((w) => ({
              name: stripEmojis(w.title),
              path: `/n8n/${w.slug}`,
            })),
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "n8n Workflows", path: "/n8n" },
            { name: node.name, path },
          ]),
        ]}
      />
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
    </>
  );
}
