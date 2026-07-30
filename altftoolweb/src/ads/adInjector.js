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
  if (!Array.isArray(items) || !Array.isArray(ads)) return items ?? [];
  if (!items.length || !ads.length) return items;

  const result = [...items];
  const usedPositions = new Set();

  // Never more ads than results. Drawing positions out of the array as it grew
  // let a one-result list end up carrying four creatives; capping against the
  // original length keeps the page a list of results with ads in it rather than
  // the other way round.
  const slotCount = items.length;
  const adsToUse = ads.slice(0, Math.min(maxAds, slotCount));

  adsToUse.forEach((ad, index) => {
    let position;
    let attempts = 0;

    // Never position 0. The listing grid is a single column below 700px, so
    // index 0 puts a 300px-tall creative above the first result the visitor
    // came for. Same guard injectRandomFeedAds already uses. Positions are
    // indexes into the ORIGINAL list; the splice below shifts by however many
    // ads already sit ahead of the slot.
    if (usedPositions.size >= slotCount) return;
    do {
      position = Math.floor(Math.random() * slotCount) + 1;
      attempts++;
      if (attempts > 20) return; // safety break
    } while (usedPositions.has(position));

    let ahead = 0;
    for (const taken of usedPositions) if (taken < position) ahead += 1;
    usedPositions.add(position);

    result.splice(position + ahead, 0, {
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

