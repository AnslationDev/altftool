/**
 * Public, read-only, no-key JSON: the exam photograph and signature upload
 * specs, with every record's provenance intact.
 *
 * Cached exactly like the other static text routes on this site (llms.txt,
 * ai.txt): prerendered once and revalidated daily, because the underlying
 * records change when a conducting body issues a new notification — a few times
 * a year, not a few times an hour.
 *
 * Terms and field documentation: /open-data.
 */

import { getSiteUrl } from "@/platform/seo/generateMetadata";
import {
  OPEN_DATA_CACHE_CONTROL,
  OPEN_DATA_CORS_HEADERS,
  buildExamSpecDataset,
} from "@/app/open-data/data/openData";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  // Pretty-printed on purpose. This is meant to be opened in a browser tab and
  // read by a person deciding whether to trust it, and the provenance block is
  // the part they came to look at.
  const body = JSON.stringify(buildExamSpecDataset(getSiteUrl()), null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": OPEN_DATA_CACHE_CONTROL,
      ...OPEN_DATA_CORS_HEADERS,
    },
  });
}
