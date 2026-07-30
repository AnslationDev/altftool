import { notFound } from "next/navigation";
import { isEmbeddable } from "../../embedRegistry";
import WidgetShell from "../WidgetShell";
import { buildWidgetMetadata } from "../widgetMetadata";
import EmbedToolClient from "./EmbedToolClient";

/**
 * The launch widget family: one /tools/all tool per document.
 *
 * The route stays a single dynamic segment on purpose. Live iframes on
 * third-party sites point at /embed/widget/<toolSlug>, so this path and this
 * slug space must keep resolving exactly as they always have. Families added
 * later get their own namespaced route (widget/transform/[slug],
 * widget/exam-photo/[slug]) — a static segment can never be captured by this
 * one-segment [slug], so the two cannot collide even where a slug is shared.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return buildWidgetMetadata(slug);
}

export default async function EmbedToolPage({ params, searchParams }) {
  const { slug } = await params;
  if (!isEmbeddable(slug)) notFound();

  const { theme } = (await searchParams) || {};

  return (
    <WidgetShell id={slug} theme={theme}>
      <EmbedToolClient slug={slug} />
    </WidgetShell>
  );
}
