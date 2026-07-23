import { TEMPLATES } from "../../lib/templates";
import EditorClient from "./EditorClient";
import { notFound } from "next/navigation";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { shouldDeferBulkPrerendering } from "@/lib/buildPrerenderPolicy";

export const dynamic = "force-static";

export async function generateStaticParams() {
  if (shouldDeferBulkPrerendering()) return [];
  return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const t = TEMPLATES.find((x) => x.slug === slug);
  if (!t) {
    return createPageMetadata({
      title: "Editor — Mockly",
      path: `/prank-socialmedia/editor/${slug}`,
    });
  }
  return createPageMetadata({
    title: `${t.name} — Mockly Editor`,
    description: t.short,
    path: `/prank-socialmedia/editor/${slug}`,
  });
}

export default async function Page({ params }) {
  const { slug } = await params;
  const t = TEMPLATES.find((x) => x.slug === slug);
  if (!t) notFound();
  return <EditorClient slug={slug} />;
}
