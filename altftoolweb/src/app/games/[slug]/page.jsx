import { redirect } from "next/navigation";
import { toolMetaMap } from "@/platform/registry/toolMetaMap";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const label = String(slug || "games").replace(/-/g, " ");

  return {
    title: `${label}`,
    robots: { index: false, follow: true },
  };
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
