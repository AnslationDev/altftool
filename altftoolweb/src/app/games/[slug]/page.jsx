import { redirect } from "next/navigation";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";
import { createPageMetadata } from "@/platform/seo/generateMetadata";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const normalizedSlug = String(slug || "").trim().toLowerCase();
  const tool = toolMetaMap[normalizedSlug];
  const label = String(slug || "games").replace(/-/g, " ");

  // This route only ever redirects, but it is prerendered, so what it emits is
  // a real HTML document with a meta refresh — /games/2048-game returns 200
  // with a full <head>. Returning a bare metadata object left the root layout's
  // canonical in place, so every one of these stubs told crawlers it was
  // https://www.altftool.com — the homepage. Point the canonical at the page
  // the stub actually sends people to instead, and keep it noindex.
  return createPageMetadata({
    title: tool?.name ? `${tool.name} — moved` : `${label} — moved`,
    description: tool?.description || undefined,
    path: `/games/${normalizedSlug || "index"}`,
    canonical: tool ? `/tools/all/${normalizedSlug}` : "/tools/games",
    noindex: true,
    follow: true,
  });
}

export default async function GameShortcutPage({ params }) {
  const { slug } = await params;
  const normalizedSlug = String(slug || "").trim().toLowerCase();

  // Deep-link straight to the playable tool page when the slug is a real tool
  // (e.g. /games/2048-game -> /tools/all/2048-game); fall back to search.
  if (toolMetaMap[normalizedSlug]) {
    redirect(`/tools/all/${normalizedSlug}`);
  }

  const query = String(slug || "games").replace(/-/g, " ");
  redirect(`/tools/all?search=${encodeURIComponent(query)}`);
}
