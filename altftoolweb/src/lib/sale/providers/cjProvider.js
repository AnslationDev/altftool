import { getServerEnv } from "@altftool/core/env";
import { AffiliateProvider } from "./affiliateProvider.js";
import { fetchWithRetry } from "../httpClient.js";

const CJ_API_BASE = "https://ads.api.cj.com";

/**
 * CJ Affiliate (Commission Junction) provider.
 * Activates once CJ_API_TOKEN / CJ_WEBSITE_ID / CJ_COMPANY_ID are set.
 */
export class CJProvider extends AffiliateProvider {
  constructor() {
    super("cj");
    this.apiToken = getServerEnv("CJ_API_TOKEN");
    this.websiteId = getServerEnv("CJ_WEBSITE_ID");
    this.companyId = getServerEnv("CJ_COMPANY_ID");
  }

  isConfigured() {
    return Boolean(this.apiToken && this.websiteId && this.companyId);
  }

  async _get(path, params = {}) {
    const url = new URL(`${CJ_API_BASE}${path}`);
    url.searchParams.set("website-id", this.websiteId);
    url.searchParams.set("company-id", this.companyId);
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
    const data = await this._get("/v2/product-search", {
      keywords: query,
      "page-number": page,
    });

    return (data.products || []).map((raw) => this._toOffer(raw, "deal"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getCoupons({ query = "", merchantId = "" } = {}) {
    const data = await this._get("/v2/link-search", {
      keywords: query,
      "advertiser-ids": merchantId || undefined,
      "link-type": "Coupon",
    });

    return (data.links || []).map((raw) => this._toOffer(raw, "coupon"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getOffers({ query = "", merchantId = "" } = {}) {
    const data = await this._get("/v2/link-search", {
      keywords: query,
      "advertiser-ids": merchantId || undefined,
      "link-type": "Banner",
    });

    return (data.links || []).map((raw) => this._toOffer(raw, "deal"));
  }

  _toOffer(raw, offerType) {
    return {
      id: `cj-${raw.id || raw.linkId || Math.random().toString(36).slice(2)}`,
      title: raw.title || raw.name || "CJ offer",
      store: raw.advertiserName || "CJ merchant",
      description: raw.description || "",
      url: raw.clickUrl || raw.link || "#",
      code: raw.couponCode || null,
      discount: raw.discount || null,
      offerType,
      expiresAt: raw.endDate || null,
      provider: this.name,
    };
  }
}
