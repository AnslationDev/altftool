import SupportClient from "../SupportClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
// ../data/routes pulls in all four platform catalogues (~2 MB) purely to
// validate ids this route then hands to the client, which loads those
// catalogues itself through dynamic imports. routeShape parses the same URLs
// without them; an id that does not resolve lands on the same landing view
// it always did. See ../data/routeShape.js.
import { resolveSlugShape, describeSlugShape } from "../data/routeShape";

/**
 * Catch-all deep-link route for every Support Settings destination that
 * isn't the bare home page — one Windows/macOS/Android/iOS setting, one
 * device guide, a device's landing page, a Help & Tools page, or an AI
 * Tools page. See ../data/routes.js for the full URL scheme and why a
 * single catch-all (rather than a page per content type) is what keeps
 * every one of the 700+ OS settings and 150+ device settings linkable
 * without a hand-maintained route per id.
 *
 * This route renders the exact same <SupportClient /> the plain
 * /supportsetting page does — it isn't a different page, just the same
 * app told what to open on load via initialActiveId /
 * initialPlatformOverride. Everything past that (sidebar, search, master-
 * detail navigation) is unchanged; SupportClient keeps the URL in sync
 * with whatever the visitor clicks next.
 */
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const { title, description } = describeSlugShape(slug || []);
  return createPageMetadata({
    title,
    description,
    path: `/supportsetting/${(slug || []).join("/")}`,
    keywords: ["AltFTool support", "settings", "help center", "troubleshooting"],
  });
}

export default async function SupportSettingSlugPage({ params }) {
  const { slug } = await params;
  const { activeId, platformOverride } = resolveSlugShape(slug || []);

  return <SupportClient initialActiveId={activeId} initialPlatformOverride={platformOverride} />;
}
