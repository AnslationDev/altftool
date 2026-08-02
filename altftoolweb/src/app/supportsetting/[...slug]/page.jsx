import SupportClient from "../SupportClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { resolveSlug, describeSlug } from "../data/routes";

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
  const segments = slug || [];
  // Any string under /supportsetting/ used to answer 200, `index, follow`, with
  // a self-referencing canonical and an empty <main> — /supportsetting/foo and
  // /supportsetting/asdkjh-not-real were both indexable, so the family was an
  // unbounded soft-404 farm.
  //
  // describeSlug already calls resolveSlug internally and knows whether the path
  // matched anything, so it reports that rather than this file resolving twice.
  // Calling resolveSlug here directly cost 2.6 MiB of artifact — it pulled the
  // 700+ settings dataset into the metadata bundle as well as the page's, and
  // the build failed the size gate at 182.64 MiB against a 181.00 ceiling.
  const { title, description, resolved } = describeSlug(segments);

  return createPageMetadata({
    title,
    description,
    path: `/supportsetting/${segments.join("/")}`,
    keywords: ["AltFTool support", "settings", "help center", "troubleshooting"],
    noindex: !resolved,
  });
}

export default async function SupportSettingSlugPage({ params }) {
  const { slug } = await params;
  const segments = slug || [];
  const { activeId, platformOverride } = resolveSlug(segments);
  // SupportClient returns a skeleton until `pageReady` flips on the client, and
  // every heading in this family lives inside that gate — so the served HTML of
  // each of these URLs had no <h1>. /supportsetting itself already renders an
  // sr-only <h1> for exactly this reason; this is the same fix for the ~700
  // deep-link URLs, naming the destination the URL actually opens.
  const { heading } = describeSlug(segments);

  return (
    <>
      <h1 className="sr-only">{heading}</h1>
      <SupportClient initialActiveId={activeId} initialPlatformOverride={platformOverride} />
    </>
  );
}
