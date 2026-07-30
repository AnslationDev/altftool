import { getEmbeddableTools } from "@/app/embed/embedRegistry";

/**
 * The full embeddable-widget index, for the /embed hub's picker to fetch on
 * demand.
 *
 * The hub used to receive all of them as server-rendered props — about 160 KiB
 * of JSON in the initial payload, on the one page whose whole job is to turn a
 * visitor into an embed. The page now ships a small seed slice and asks for this
 * only when someone actually searches or filters past it.
 *
 * Static and long-cached: the list changes when the registry changes, i.e. at
 * deploy time. It is deliberately under /api/, which robots.txt disallows —
 * this is data for our own page, not a document to index. /embed is the
 * crawlable surface.
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  return new Response(JSON.stringify({ widgets: getEmbeddableTools() }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
