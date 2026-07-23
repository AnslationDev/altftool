import { getServerEnv } from "@altftool/core/env";
import { AffiliateProvider } from "./affiliateProvider.js";
import { fetchWithRetry } from "../httpClient.js";

const AWIN_API_BASE = "https://api.awin.com";

/**
 * Awin affiliate network provider.
 * Activates once AWIN_API_TOKEN / AWIN_PUBLISHER_ID are set.
 */
export class AwinProvider extends AffiliateProvider {
  constructor() {
    super("awin");
    this.apiToken = getServerEnv("AWIN_API_TOKEN");
    this.publisherId = getServerEnv("AWIN_PUBLISHER_ID");
  }

  isConfigured() {
    return Boolean(this.apiToken && this.publisherId);
  }

  async _get(path, params = {}) {
    const url = new URL(`${AWIN_API_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });

    return fetchWithRetry(url, {
      provider: this.name,
      timeoutMs: 10000,
      retries: 1,
      headers: { Authorization: `Bearer ${this.apiToken}`, Accept: "application/json" },
    });
  }

  /**
   * @param {{ query?: string, page?: number }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async searchDeals({ query = "", page = 1 } = {}) {
    const data = await this._get(`/publishers/${this.publisherId}/promotions`, {
      keyword: query,
      page,
      type: "promotion",
    });

    return (data.promotions || data.data || []).map((raw) => this._toOffer(raw, "deal"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getCoupons({ query = "", merchantId = "" } = {}) {
    const data = await this._get(`/publishers/${this.publisherId}/promotions`, {
      keyword: query,
      advertiserId: merchantId || undefined,
      type: "voucher",
    });

    return (data.promotions || data.data || []).map((raw) => this._toOffer(raw, "coupon"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getOffers({ query = "", merchantId = "" } = {}) {
    const data = await this._get(`/publishers/${this.publisherId}/promotions`, {
      keyword: query,
      advertiserId: merchantId || undefined,
      type: "offer",
    });

    return (data.promotions || data.data || []).map((raw) => this._toOffer(raw, "deal"));
  }

  _toOffer(raw, offerType) {
    return {
      id: `awin-${raw.id || raw.promotionId || Math.random().toString(36).slice(2)}`,
      title: raw.title || raw.description || "Awin offer",
      store: raw.advertiser?.name || raw.advertiserName || "Awin merchant",
      description: raw.description || "",
      url: raw.urlTracking || raw.url || "#",
      code: raw.voucher?.code || raw.code || null,
      discount: raw.voucher?.value || null,
      offerType,
      expiresAt: raw.endDate || null,
      provider: this.name,
    };
  }
}
