import { notFound } from "next/navigation";
import { getToolBySlug } from "@/app/transform/_lib/manifest";
import { isEmbeddable } from "../../../embedRegistry";
import WidgetShell from "../../WidgetShell";
import { buildWidgetMetadata } from "../../widgetMetadata";
import TransformShell from "@/app/transform/_components/TransformShell";

/**
 * Widget document for a /transform converter: /embed/widget/transform/<slug>.
 *
 * The real workspace, not a preview. TransformShell is the same client
 * component the public /transform/<slug> page mounts, given the same
 * serialisable subset of the manifest record — so the widget cannot drift from
 * the page it credits.
 *
 * Server-engine converters (34 of the 64) POST to /transform/api/<slug>. That
 * request is issued by THIS document, so it resolves against altftool.com and
 * is same-origin no matter whose page the iframe sits on: no CORS preflight, no
 * cookies involved, and the widget's own CSP (`frame-ancestors *`, set for
 * /embed/widget/:path+ in next.config.mjs) sets no connect-src. A host page's
 * CSP does not apply inside the frame. Both engines therefore work here, which
 * is why the embeddable set is not narrowed to browser-engine converters.
 *
 * Deliberately no generateStaticParams: 64 prerendered iframe documents would
 * cost Amplify artifact size for pages that are noindex by design, so they
 * render on demand.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildWidgetMetadata(`transform/${slug}`);
}

export default async function TransformWidgetPage({ params, searchParams }) {
  const { slug } = await params;
  const id = `transform/${slug}`;
  if (!isEmbeddable(id)) notFound();

  const tool = getToolBySlug(slug);
  const { theme } = (await searchParams) || {};

  // Only serialisable fields cross into the client shell — the same subset the
  // public converter page passes.
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

  return (
    <WidgetShell id={id} theme={theme}>
      <TransformShell tool={clientTool} />
    </WidgetShell>
  );
}
