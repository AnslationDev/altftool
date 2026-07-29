import { blogs } from "./blogs";
import { toPublishDate } from "./publishDate";
import { trending } from "../data2/trending";
import {
  autoLists,
  newList,
  secondList,
  tabData,
  thirdList,
} from "../data3/content";

const featuredBlocks = [newList, secondList, thirdList];

export function getTop9Items() {
  const seen = new Set();

  return [
    ...blogs,
    ...trending,
    ...(tabData?.featured || []),
    ...(tabData?.popular || []),
    ...(tabData?.latest || []),
    ...(autoLists || []),
    ...featuredBlocks,
  ].filter((item) => {
    // `greatest-actors` and `hottest-women` each appear in two source blocks.
    // Without this de-dupe, generateStaticParams emits duplicate params and any
    // "N lists" figure derived from this array over-reports by two.
    if (!item?.slug || seen.has(item.slug)) return false;
    seen.add(item.slug);
    return true;
  });
}

export function getTop9Item(slug) {
  return getTop9Items().find((item) => item.slug === slug) || null;
}

/** Distinct lists in this section. Every rendered count must come from here. */
export function getTop9Count() {
  return getTop9Items().length;
}

export function getTop9Title(item) {
  return item?.title || item?.text || "Top 9 List";
}

export function getTop9Description(item) {
  return (
    item?.description ||
    item?.desc ||
    `Explore ${getTop9Title(item)} with a concise ranked list, highlights, and quick context.`
  );
}

export function getTop9Image(item) {
  return item?.img || item?.image || "/assets/logo3.png";
}

export function getTop9Category(item) {
  return item?.cat || item?.prefix || "Top 9 List";
}

/**
 * The ranked entries a list actually carries. Only three lists in this data set
 * have any, and those carry three entries each — so no caller may hardcode
 * "nine picks". Count what this returns instead.
 */
export function getTop9RankedEntries(item) {
  if (!Array.isArray(item?.top)) return [];
  return item.top.map((name) => String(name).trim()).filter(Boolean);
}

/**
 * The list's publish date as YYYY-MM-DD, or null when the source carries none.
 * Never a build date and never a fallback.
 */
export function getTop9PublishedDate(item) {
  return toPublishDate(item?.date);
}
