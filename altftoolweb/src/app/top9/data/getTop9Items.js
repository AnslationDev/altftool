import { blogs } from "./blogs";
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
  return [
    ...blogs,
    ...trending,
    ...(tabData?.featured || []),
    ...(tabData?.popular || []),
    ...(tabData?.latest || []),
    ...(autoLists || []),
    ...featuredBlocks,
  ].filter((item) => item?.slug);
}

export function getTop9Item(slug) {
  return getTop9Items().find((item) => item.slug === slug) || null;
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

// Returns the stored date as a plain calendar date (YYYY-MM-DD), which is a
// valid schema.org Date. The previous .toISOString() reintroduced a clock and
// a timezone the source never had: "May 11, 2026" parses to local midnight, so
// on any machine east of UTC (the build hosts run IST) it serialised as
// 2026-05-10T18:30:00.000Z — a datePublished one day earlier than the date the
// page prints. Reading the local parts back keeps the published date identical
// to the visible one wherever the build runs.
export function getTop9PublishedDate(item) {
  const value = String(item?.date || "").trim();
  if (!value) return null;

  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;

  const parsed = new Date(timestamp);
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${parsed.getFullYear()}-${month}-${day}`;
}
