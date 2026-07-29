import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getToolBySlug, getToolSlugs } from "../_lib/manifest";
import TransformShell from "../_components/TransformShell";
import TransformSidebar from "../_components/TransformSidebar";
import JsonLd from "@/platform/seo/JsonLd";
import {
  createBreadcrumbJsonLd,
  createToolJsonLd,
} from "@/platform/seo/generateMetadata";

const TRANSFORM_OG_IMAGE = "/assets/og-default.png";

// The manifest is the complete, closed list of converters.
export const dynamicParams = false;

export function generateStaticParams() {
  return getToolSlugs().map((slug) => ({ slug }));
}

/**
 * Per-tool SEO: unique title, description, canonical, OG + Twitter tags.
 * @param {{ params: Promise<{ slug: string }> }} ctx
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) return {};

  const title = `${tool.title} Converter`;
  const description = tool.description;
  const url = `/transform/${tool.slug}`;

  return {
    title,
    description,
    keywords: tool.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | AltFTool`,
      description,
      url,
      type: "website",
      images: [
        {
          url: TRANSFORM_OG_IMAGE,
          width: 1200,
          height: 630,
          alt: `${tool.title} converter on AltFTool`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | AltFTool`,
      description,
      images: [TRANSFORM_OG_IMAGE],
    },
  };
}

export default async function TransformToolPage({ params }) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);
  if (!tool) notFound();

  // Only serialisable fields cross into the client shell.
  const clientTool = {
    slug: tool.slug,
    title: tool.title,
    description: tool.description,
    category: tool.category,
    from: tool.from,
    to: tool.to,
    engine: tool.engine,
    lib: tool.lib,
  };

  const path = `/transform/${tool.slug}`;

  return (
    <>
      {/* These pages describe software but shipped no page-level entity — only
          the layout's Organization and WebSite — so an answer engine had
          nothing to cite. A /tools page carries SoftwareApplication and a
          breadcrumb; a converter should too. */}
      <JsonLd
        id={`transform-schema-${tool.slug}`}
        data={[
          createToolJsonLd({
            slug: tool.slug,
            path,
            tool: {
              name: `${tool.title} Converter`,
              description: tool.description,
              category: tool.category,
              topics: tool.keywords,
            },
          }),
          createBreadcrumbJsonLd([
            { name: "Home", path: "/" },
            { name: "Transform", path: "/transform" },
            { name: `${tool.title} Converter`, path },
          ]),
        ]}
      />
    <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
      {/* Sidebar navigation */}
      <div className="w-full lg:w-64 shrink-0 lg:sticky lg:top-8 h-fit">
        <TransformSidebar activeSlug={slug} />
      </div>

      {/* Main workspace */}
      <div className="flex-1 min-w-0 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:p-8 dark:border-slate-800 dark:bg-slate-900">
        <TransformShell tool={clientTool} />
      </div>
    </div>
    </>
  );
}
