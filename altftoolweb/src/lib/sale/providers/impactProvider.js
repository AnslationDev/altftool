import { getServerEnv } from "@altftool/core/env";
import { AffiliateProvider } from "./affiliateProvider.js";
import { fetchWithRetry } from "../httpClient.js";

const IMPACT_API_BASE = "https://api.impact.com";

/**
 * Impact.com (Impact Radius) affiliate network provider.
 * Activates once IMPACT_ACCOUNT_SID / IMPACT_AUTH_TOKEN / IMPACT_PROGRAM_ID are set.
 */
export class ImpactProvider extends AffiliateProvider {
  constructor() {
    super("impact");
    this.accountSid = getServerEnv("IMPACT_ACCOUNT_SID");
    this.authToken = getServerEnv("IMPACT_AUTH_TOKEN");
    this.programId = getServerEnv("IMPACT_PROGRAM_ID");
  }

  isConfigured() {
    return Boolean(this.accountSid && this.authToken && this.programId);
  }

  _authHeader() {
    const credentials = Buffer.from(`${this.accountSid}:${this.authToken}`).toString("base64");
    return `Basic ${credentials}`;
  }

  async _get(path, params = {}) {
    const url = new URL(`${IMPACT_API_BASE}/Advertisers/${this.programId}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });

    return fetchWithRetry(url, {
      provider: this.name,
      timeoutMs: 10000,
      retries: 1,
      headers: { Authorization: this._authHeader(), Accept: "application/json" },
    });
  }

  /**
   * @param {{ query?: string, page?: number }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async searchDeals({ query = "", page = 1 } = {}) {
    const data = await this._get("/Catalogs/ItemSearch", {
      Query: query,
      Page: page,
    });

    return (data.Items || []).map((raw) => this._toOffer(raw, "deal"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getCoupons({ query = "" } = {}) {
    const data = await this._get("/PromotionalItems", { PromotionType: "COUPON", Query: query });
    return (data.PromotionalItems || []).map((raw) => this._toOffer(raw, "coupon"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getOffers({ query = "" } = {}) {
    const data = await this._get("/PromotionalItems", { PromotionType: "OFFER", Query: query });
    return (data.PromotionalItems || []).map((raw) => this._toOffer(raw, "deal"));
  }

  _toOffer(raw, offerType) {
    return {
      id: `impact-${raw.Id || raw.CampaignId || Math.random().toString(36).slice(2)}`,
      title: raw.Name || raw.Title || "Impact offer",
      store: raw.CampaignName || raw.AdvertiserName || "Impact merchant",
      description: raw.Description || "",
      url: raw.TrackingUrl || raw.Url || "#",
      code: raw.Code || raw.CouponCode || null,
      discount: raw.Discount || null,
      offerType,
      expiresAt: raw.EndDate || null,
      provider: this.name,
    };
  }
}
