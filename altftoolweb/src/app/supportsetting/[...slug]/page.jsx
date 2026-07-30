import { redirect } from "next/navigation";
import SupportClient from "../SupportClient";
import { createPageMetadata } from "@/platform/seo/generateMetadata";
import { isKnownSupportSettingPath } from "@/platform/navigation/exactRouteManifest";
// ../data/routes pulls in all four platform catalogues (~2 MB). The lightweight
// exact-route manifest validates the URL before routeShape turns its verified
// segments into client state; the client loads catalogues through dynamic
// imports. See ../data/routeShape.js.
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
  const path = `/supportsetting/${(slug || []).join("/")}`;
  const { title, description } = describeSlugShape(slug || []);
  return createPageMetadata({
    title,
    description,
    path,
    keywords: ["AltFTool support", "settings", "help center", "troubleshooting"],
    noindex: !isKnownSupportSettingPath(path),
  });
}

export default async function SupportSettingSlugPage({ params }) {
  const { slug } = await params;
  const segments = slug || [];

  // The proxy rejects unknown paths before rendering. Keep this lightweight
  // server-side fallback for direct component execution or a future matcher
  // change; never import the multi-megabyte Support Settings catalogues here.
  if (!isKnownSupportSettingPath(`/supportsetting/${segments.join("/")}`)) {
    redirect("/supportsetting");
  }

  const { activeId, platformOverride } = resolveSlugShape(segments);
  return <SupportClient initialActiveId={activeId} initialPlatformOverride={platformOverride} />;
}
