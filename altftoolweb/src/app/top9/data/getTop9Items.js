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
