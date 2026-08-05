// No generateMetadata here on purpose. layout.jsx already resolves the
// record and builds metadata from the brand name, description, image and keywords; Next takes the deepest
// segment's metadata, so the hardcoded title that used to live here
// overrode all of it and every URL in this family shipped the same one.

import dealData from "../../(data)/db.json";
import { findBrandByUrlKey } from "@/app/exclusivedeals/lib/brandSlug";

import PageView from "./PageView";

/**
 * Resolve the brand's real name on the server and hand it to the client view.
 *
 * db.json is only ever imported by server components (this file and the two
 * layouts), so it stays out of the client bundle; only the resolved string
 * crosses the boundary. Without it BrandDetail title-cased the URL segment for
 * its H1, which spelled "boAt" as "Boat" and printed "1" on the numeric-id
 * URLs that still resolve — while <title> carried the correct name all along.
 */
export default async function Page(props) {
  const { slug, id } = await props.params;
  const category = (dealData.categories || []).find((item) => item.slug === slug);
  const brand = findBrandByUrlKey(category, id);

  return <PageView brandName={brand?.brandName || brand?.name || ""} />;
}
