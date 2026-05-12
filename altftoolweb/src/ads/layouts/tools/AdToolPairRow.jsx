import { useMemo } from "react";

import AdToolCard from "./AdToolCard";

function getAdContent(ad) {
  return ad?.content || ad;
}

export default function AdPairRow({ ads, categoryname, toolAds, pairIndex = 0 }) {

  const selectedPair = useMemo(() => {
    if (Array.isArray(ads) && ads.length) {
      return ads.map(getAdContent).filter(Boolean);
    }

    if (!toolAds) return [];

    const normalizedCategory = categoryname?.toLowerCase();

    ///Step 1: filter ads
    const categoryAds = toolAds.filter(
      (item) =>
        item.status === "active" &&
        item.categories?.some(
          (cat) =>
            cat.toLowerCase().replace(/\s+/g, "-") === normalizedCategory
        )
    );

    const finalAds =
      categoryAds.length > 0
        ? categoryAds
        : toolAds.filter(
            (item) =>
              item.status === "active" &&
              item.categories?.some(
                (cat) => cat.toLowerCase() === "all"
              )
          );

    if (!finalAds.length) return [];

    // ✅ Step 2: create fixed pairs
    const pairs = [];

    for (let i = 0; i < finalAds.length; i += 2) {
      let first = finalAds[i];
      let second = finalAds[i + 1];

      // 👉 if odd → duplicate last
      if (!second) {
        second = first;
      }

      pairs.push([first, second]);
    }

    //  Step 3: repeat pairs infinitely using modulo
    const pair = pairs[pairIndex % pairs.length];

    return pair;
  }, [ads, toolAds, categoryname, pairIndex]);

  if (!selectedPair?.length) return null;


  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {selectedPair.map((item, i) => (
        <AdToolCard key={i} ad={getAdContent(item)} />
      ))}
    </div>
     
  );
}
