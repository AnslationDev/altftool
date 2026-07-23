import { SaleApiError } from "../errors.js";

/**
 * Base interface every affiliate network provider must implement.
 * Subclasses only need to override `isConfigured()` and the three
 * data methods — everything else (credential gating, error shape)
 * is handled here so a missing/incomplete provider degrades to an
 * empty result instead of breaking the merge pipeline.
 */
export class AffiliateProvider {
  /** @param {string} name */
  constructor(name) {
    if (new.target === AffiliateProvider) {
      throw new TypeError("AffiliateProvider is abstract and cannot be instantiated directly.");
    }
    this.name = name;
  }

  /**
   * Whether this provider has the credentials it needs to make live calls.
   * Subclasses must override this.
   * @returns {boolean}
   */
  isConfigured() {
    return false;
  }

  /**
   * Search deals/products for a query.
   * @param {{ query: string, page?: number }} _params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async searchDeals(_params) {
    throw new SaleApiError(`${this.name}.searchDeals() is not implemented.`, {
      status: 501,
      code: "upstream_error",
      provider: this.name,
    });
  }

  /**
   * Fetch active coupon codes for a merchant/query.
   * @param {{ query?: string, merchantId?: string }} _params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getCoupons(_params) {
    throw new SaleApiError(`${this.name}.getCoupons() is not implemented.`, {
      status: 501,
      code: "upstream_error",
      provider: this.name,
    });
  }

  /**
   * Fetch general promotional offers (non-coupon) for a merchant/query.
   * @param {{ query?: string, merchantId?: string }} _params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  // eslint-disable-next-line no-unused-vars
  async getOffers(_params) {
    throw new SaleApiError(`${this.name}.getOffers() is not implemented.`, {
      status: 501,
      code: "upstream_error",
      provider: this.name,
    });
  }

  /**
   * Safe wrapper — returns [] instead of throwing when the provider
   * isn't configured, so callers can fan out across all providers
   * without per-provider try/catch.
   * @param {"searchDeals"|"getCoupons"|"getOffers"} method
   * @param {Record<string, unknown>} [params]
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async safeCall(method, params = {}) {
    if (!this.isConfigured()) return [];

    try {
      return (await this[method](params)) || [];
    } catch {
      return [];
    }
  }
}
