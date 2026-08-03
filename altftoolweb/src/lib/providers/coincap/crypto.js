import { coinCapIconUrl, getCoinCapClient, withCoinCapAuth } from "./client";

/** "$1.23B" / "$45.67M" / "$3.21" style compact USD formatting for market cap and price. */
function formatUsd(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num < 1) return `$${num.toFixed(4)}`;
  return `$${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

/** Builds a real, data-derived description from the asset's own live price/market cap/24h change — nothing invented. */
function buildDescription(asset) {
  const parts = [];
  const price = formatUsd(asset.priceUsd);
  if (price) parts.push(`Currently trading at ${price}.`);
  const marketCap = formatUsd(asset.marketCapUsd);
  if (marketCap) parts.push(`Market cap: ${marketCap}.`);
  const change = Number(asset.changePercent24Hr);
  if (Number.isFinite(change)) {
    const direction = change >= 0 ? "up" : "down";
    parts.push(`${direction} ${Math.abs(change).toFixed(2)}% over the last 24 hours.`);
  }
  return parts.join(" ") || null;
}

/** Shapes a raw CoinCap asset into what the UI needs. */
function normalizeAsset(asset) {
  return {
    id: asset.id,
    title: `${asset.name} (${asset.symbol})`,
    subtitle: `Rank #${asset.rank}`,
    image: coinCapIconUrl(asset.symbol),
    // No 0-10 rating exists for a crypto asset — the real ranking is
    // CoinCap's own live market-cap rank, already reflected in list
    // order (same idea as Apple Music's chart order: the position IS
    // the ranking, no separate score to fake).
    rating: null,
    description: buildDescription(asset),
    url: asset.id ? `https://coincap.io/assets/${asset.id}` : null,
  };
}

/**
 * Crypto has no genre-style taxonomy the way movies/books do, so this is
 * a single real category — "browse by category" still works the same
 * way (grid, then items), it just offers one card. The assets
 * themselves are always real, live-fetched.
 */
const CRYPTO_CATEGORIES = [
  {
    id: "top",
    label: "Top Cryptocurrency",
    image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=500&q=75",
    description: "The world's top cryptocurrencies, ranked live by market cap.",
  },
];

export function getCryptoCategories() {
  return CRYPTO_CATEGORIES;
}

/**
 * Top crypto assets, ranked by market cap (CoinCap's own real ranking —
 * true offset pagination, same as Geoapify/Foursquare).
 */
export async function getCryptoByCategory(_categoryId, { page = 1, limit = 10 } = {}) {
  const client = getCoinCapClient();
  const offset = (page - 1) * limit;
  const data = await client.get("/assets", { params: withCoinCapAuth({ limit, offset }) });
  const crypto = (data.data || []).map(normalizeAsset);
  return { crypto, hasMore: crypto.length === limit };
}

/** Free-text asset search via CoinCap's own `search` param, same offset pagination. */
export async function searchCrypto(query, { page = 1, limit = 10 } = {}) {
  const trimmed = String(query || "").trim();
  if (!trimmed) return { crypto: [], hasMore: false };

  const client = getCoinCapClient();
  const offset = (page - 1) * limit;
  const data = await client.get("/assets", { params: withCoinCapAuth({ search: trimmed, limit, offset }) });
  const crypto = (data.data || []).map(normalizeAsset);
  return { crypto, hasMore: crypto.length === limit };
}
