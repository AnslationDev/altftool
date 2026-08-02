import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import WorkflowPreview from "./WorkflowPreview";
import DownloadButton from "./DownloadButton";
import NodeBadge from "../components/NodeBadge";
import WorkflowCard from "../components/WorkflowCard";
import Markdown from "../components/Markdown";
import { getWorkflowBySlug, getRelated, getAllWorkflows } from "../data/service";
import { deriveNodeDetails } from "../data/nodeInfo";
import { shortIntro, cleanDescription, metaTitle, stripEmojis } from "../data/text";
import JsonLd from "@/platform/seo/JsonLd";
import {
  absoluteUrl,
  createPageMetadata,
  createBreadcrumbJsonLd,
  getSiteUrl,
} from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";
import { getRelatedContent, RelatedContentSection } from "@/platform/linking";

export const dynamic = "force-static";
export const revalidate = 3600;

export function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return getAllWorkflows().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const wf = getWorkflowBySlug(slug);
  if (!wf) {
    return createPageMetadata({
      title: "Workflow Not Found",
      description: "The requested n8n workflow does not exist.",
      path: `/n8n/${slug}`,
      noindex: true,
    });
  }
  return createPageMetadata({
    title: `${metaTitle(wf.title, 44)} | n8n Workflow`,
    description: shortIntro(wf.description, 200),
    path: `/n8n/${slug}`,
  });
}

// Read the raw workflow JSON from /public to derive the Node Details section.
async function readWorkflowJson(slug) {
  try {
    const file = path.join(process.cwd(), "public", "n8n", "workflows", `${slug}.json`);
    return JSON.parse(await fs.readFile(file, "utf8"));
  } catch {
    return null;
  }
}

export default async function Page({ params }) {
  const { slug } = await params;
  const wf = getWorkflowBySlug(slug);
  if (!wf) notFound();

  const related = getRelated(slug, 4);
  const wfJson = await readWorkflowJson(slug);
  const nodeDetails = wfJson ? deriveNodeDetails(wfJson) : [];
  const relatedItems = getRelatedContent({
    source: {
      href: `/n8n/${slug}`,
      title: wf.title,
      description: shortIntro(wf.description, 200),
      tags: wf.categories.map((c) => c.name),
      section: "n8n",
    },
    slots: [
      { sections: ["tools", "blogs"], limit: 3 },
      { sections: ["products", "experiences", "hubs"], limit: 3, minScore: 0 },
    ],
  });

  // Subject entity for the workflow itself. The page previously described
  // nothing but its own breadcrumb, so answer engines had no node for the
  // thing the URL is about. SoftwareSourceCode is what this actually is: a
  // downloadable n8n workflow definition (codeSampleType "template"), not an
  // application a visitor runs here — so no SoftwareApplication/Offer.
  //
  // Every field below comes straight from the imported workflow record.
  // Deliberately NOT emitted: `totalViews` as an interactionStatistic (those
  // views happened on the upstream template listing, not on this page, so
  // publishing them here would misattribute them), `nodeCount` (it counts raw
  // canvas nodes and disagrees with the node list this page renders), and
  // anything resembling a rating — nothing on this site ever collects one.
  const workflowUrl = absoluteUrl(`/n8n/${slug}`);
  const workflowSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    "@id": `${workflowUrl}#workflow`,
    name: stripEmojis(wf.title),
    description: shortIntro(wf.description, 300),
    url: workflowUrl,
    codeSampleType: "template",
    runtimePlatform: "n8n",
    targetProduct: { "@type": "SoftwareApplication", name: "n8n" },
    // The template's real creator, credited above the intro so the markup and
    // the graph say the same thing. Omitted entirely if a record ever lands
    // without one rather than falling back to the site as author.
    ...(wf.author?.name ? { author: { "@type": "Person", name: wf.author.name } } : {}),
    ...(wf.createdAt ? { dateCreated: wf.createdAt } : {}),
    keywords: [
      ...wf.categories.map((c) => c.name),
      ...wf.nodes.map((n) => n.name),
    ].join(", "),
    isAccessibleForFree: true,
    inLanguage: "en",
    associatedMedia: {
      "@type": "MediaObject",
      name: `${slug}.json`,
      contentUrl: absoluteUrl(wf.jsonPath),
      encodingFormat: "application/json",
    },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    isPartOf: { "@id": `${getSiteUrl()}/#website` },
    mainEntityOfPage: { "@type": "WebPage", "@id": workflowUrl },
  };

  return (
    <>
      <JsonLd
        id={`n8n-${slug}-schema`}
        data={[
          workflowSchema,
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "n8n Workflows", path: "/n8n" },
            // Match the visible trail, which renders the title emoji-stripped.
            { name: stripEmojis(wf.title), path: `/n8n/${slug}` },
          ]),
        ]}
      />
      <main className="min-h-screen bg-(--color-background)">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-(--color-muted-foreground)">
            <Link href="/n8n" className="hover:text-(--color-primary)">
              n8n Workflows
            </Link>
            <ChevronRight size={13} />
            <span className="truncate text-(--color-foreground)">{stripEmojis(wf.title)}</span>
          </nav>

          {/* Title + categories */}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight text-(--color-foreground) sm:text-4xl">
            {stripEmojis(wf.title)} <span className="text-(--color-muted-foreground)">- n8n Workflow</span>
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {wf.categories.map((c) => (
              <Link
                key={c.slug}
                href={`/n8n/category/${c.slug}`}
                className="rounded-md bg-(--color-primary)/10 px-3 py-1 text-xs font-medium text-(--color-primary) hover:bg-(--color-primary)/20"
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Creator credit. These templates are third-party work and the hub
              cards already name the author, but the detail page credited nobody
              — which also left the schema's author invisible to readers. */}
          {wf.author?.name ? (
            <p className="mt-4 text-sm text-(--color-muted-foreground)">
              Template by{" "}
              <span className="font-medium text-(--color-foreground)">{wf.author.name}</span>
            </p>
          ) : null}

          {/* Short intro */}
          <p className="mt-5 text-base leading-relaxed text-(--color-foreground)">
            {shortIntro(wf.description, 240)}
          </p>

          {/* Preview */}
          <section className="mt-10">
            <h2 className="mb-3 text-xl font-bold text-(--color-foreground)">Workflow Preview</h2>
            <WorkflowPreview jsonPath={wf.jsonPath} />
          </section>

          {/* Download CTA */}
          <section className="mt-8 rounded-2xl border border-(--color-border) bg-(--color-card) p-6">
            <h2 className="text-lg font-bold text-(--color-foreground)">Ready to automate?</h2>
            <p className="mt-1 mb-4 text-sm text-(--color-muted-foreground)">
              Download this n8n workflow template and start using it instantly.
            </p>
            <DownloadButton jsonPath={wf.jsonPath} slug={wf.slug} />
          </section>

          {/* Nodes used */}
          <section className="mt-10">
            <h2 className="mb-3 text-xl font-bold text-(--color-foreground)">
              n8n Nodes Used ({wf.nodes.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {wf.nodes.map((n) => (
                <Link
                  key={n.slug}
                  href={`/n8n/node/${n.slug}`}
                  className="flex items-center gap-2 rounded-full border border-(--color-border) bg-(--color-card) px-3 py-1.5 text-xs font-medium text-(--color-foreground) hover:border-(--color-primary)"
                >
                  <NodeBadge name={n.name} size={18} /> {n.name}
                </Link>
              ))}
            </div>
          </section>

          {/* Overview — rendered from the workflow's Markdown description */}
          {cleanDescription(wf.description).trim() && (
            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold text-(--color-foreground)">Overview</h2>
              <Markdown>{cleanDescription(wf.description)}</Markdown>
            </section>
          )}

          {/* Node Details */}
          {nodeDetails.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-xl font-bold text-(--color-foreground)">Node Details</h2>
              <div className="space-y-3">
                {nodeDetails.map((n, i) => (
                  <p key={i} className="text-sm leading-relaxed text-(--color-foreground)">
                    <span className="font-semibold">{n.name}</span>{" "}
                    <span className="text-(--color-muted-foreground)">({n.typeName}):</span>{" "}
                    {n.description}
                  </p>
                ))}
              </div>
            </section>
          )}

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-xl font-bold text-(--color-foreground)">
                Related n8n Workflows
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((w) => (
                  <WorkflowCard key={w.slug} workflow={w} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Cross-section discovery band (site-wide internal linking engine) */}
        <RelatedContentSection
          title="More from AltFTool"
          items={relatedItems}
          path={`/n8n/${slug}`}
          jsonLdName="More from AltFTool"
        />
      </main>
    </>
  );
}
