// Serves the IndexNow key file. IndexNow verifies ownership by fetching the
// keyLocation URL declared in the submission and checking it contains the key.
//
// Served from a route rather than public/ so an ALTFT_INDEXNOW_KEY override can
// rotate the key without a deploy. getIndexNowKey() falls back to the committed
// default, so this normally returns 200; the 404 branch survives only as a
// guard for the impossible case of no usable key at all.

import { getIndexNowKey } from "@/platform/seo/indexNow";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = getIndexNowKey();

  if (!key) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(key, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
