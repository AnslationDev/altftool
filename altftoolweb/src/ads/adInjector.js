/**
 * Inject ads into a list in a layout-safe way
 *
 * @param {Array} items - original content list
 * @param {Array} ads - ads from useAds()
 * @param {Object} options
 * @param {number} options.interval - insert after N items
 * @param {"pair" | "single"} options.mode - how ads are grouped
 */
export function injectAds(
  items,
  ads,
  { interval = 4, mode = "pair" } = {}
) {
  if (!Array.isArray(items) || !Array.isArray(ads)) return items ?? [];
  if (ads.length === 0 || interval < 1) return items;

  const result = [...items];
  let offset = 0;
  let groupIndex = 0;

  if (mode === "pair") {
    for (let i = 0; i < ads.length; i += 2) {
      let pair = ads.slice(i, i + 2);

      // normalize odd → duplicate last
      if (pair.length === 1) {
        pair = [pair[0], pair[0]];
      }

      const position = (groupIndex + 1) * interval + offset;
      if (position >= result.length) break;

      result.splice(position, 0, {
        type: "ad-pair",
        id: `ad-pair-${groupIndex}`,
        pairIndex: groupIndex, //  add paiIndex to run infinte adds loop and if you don't want then remove
        ads: pair.map((a, idx) => ({
          ...a.content,
          _duplicated: pair.length === 2 && a === pair[0] && idx === 1,
        })),
      });

      offset++;
      groupIndex++;
    }
  }

  if (mode === "single") {
    ads.forEach((ad, i) => {
      const position = (i + 1) * interval + offset;
      if (position >= result.length) return;

      result.splice(position, 0, {
        type: "ad-single",
        id: `ad-single-${i}`,
        ad: ad.content,
      });

      offset++;
    });
  }

  return result;
}



export function injectRandomAds(items, ads, maxAds = 3) {
  if (!items.length || !ads.length) return items;

  const result = [...items];
  const usedPositions = new Set();

  const adsToUse = ads.slice(0, maxAds);

  adsToUse.forEach((ad, index) => {
    let position;

    do {
      position = Math.floor(Math.random() * result.length);
    } while (usedPositions.has(position));

    usedPositions.add(position);

    result.splice(position, 0, {
      type: "ad-single",
      id: `ext-ad-${index}`,
      ad: ad.content,
    });
  });

  return result;
}

export function injectRandomFeedAds(items, ads, maxAds = 3) {
  if (!Array.isArray(items) || !Array.isArray(ads)) return items ;
  if (!items.length || !ads.length) return items;

  const result = [...items];
  const usedPositions = new Set();

  const adsToUse = ads.slice(0, maxAds);

  adsToUse.forEach((ad, index) => {
    let position;
    let attempts = 0;

    do {
      position = Math.floor(Math.random() * (result.length - 1)) + 1;
      attempts++;
      if (attempts > 20) return; // safety break
    } while (
      usedPositions.has(position) ||
      result[position - 1]?.type === "ad-single" ||
      result[position]?.type === "ad-single"
    );

    usedPositions.add(position);

    result.splice(position, 0, {
      type: "ad-single",
      id: `news-ad-${index}`,
      ad: ad.content,
    });
  });

  return result;
}

