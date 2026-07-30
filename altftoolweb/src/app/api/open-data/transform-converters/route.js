/**
 * Public, read-only, no-key JSON: the /transform converter index.
 *
 * Only what a consumer needs — slug, title, category, from, to, url. The
 * manifest's `status`, `engine`, `lib`, `uses` and `blocked_reason` fields are
 * build bookkeeping and are not served; see the note in
 * src/app/open-data/data/openData.js.
 *
 * Terms and field documentation: /open-data.
 */

import { getSiteUrl } from "@/platform/seo/generateMetadata";
import {
  OPEN_DATA_CACHE_CONTROL,
  OPEN_DATA_CORS_HEADERS,
  buildTransformConverterDataset,
} from "@/app/open-data/data/openData";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = JSON.stringify(
    buildTransformConverterDataset(getSiteUrl()),
    null,
    2,
  );

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": OPEN_DATA_CACHE_CONTROL,
      ...OPEN_DATA_CORS_HEADERS,
    },
  });
}
