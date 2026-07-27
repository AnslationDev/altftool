// Serves the IndexNow key file. IndexNow verifies ownership by fetching the
// keyLocation URL declared in the submission and checking it contains the key.
//
// Served from a route rather than public/ so the key stays an environment
// variable and can be rotated without a commit. Returns 404 when unconfigured,
// which is the correct answer — there is no key to verify.

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
