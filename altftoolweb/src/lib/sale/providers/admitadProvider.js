import { getServerEnv } from "@altftool/core/env";
import { AffiliateProvider } from "./affiliateProvider.js";
import { fetchWithRetry } from "../httpClient.js";
import { toSaleApiError } from "../errors.js";

const ADMITAD_TOKEN_ENDPOINT = "https://api.admitad.com/token/";
const ADMITAD_API_BASE = "https://api.admitad.com";

/**
 * Admitad affiliate network provider.
 * Activates once ADMITAD_CLIENT_ID / ADMITAD_CLIENT_SECRET / ADMITAD_WEBSITE_ID
 * are set — until then `isConfigured()` is false and calls resolve to [].
 */
export class AdmitadProvider extends AffiliateProvider {
  constructor() {
    super("admitad");
    this.clientId = getServerEnv("ADMITAD_CLIENT_ID");
    this.clientSecret = getServerEnv("ADMITAD_CLIENT_SECRET");
    this.websiteId = getServerEnv("ADMITAD_WEBSITE_ID");
    this._accessToken = null;
  }

  isConfigured() {
    return Boolean(this.clientId && this.clientSecret && this.websiteId);
  }

  async _getAccessToken() {
    if (this._accessToken) return this._accessToken;

    // Admitad's OAuth token endpoint expects form-encoded data rather than
    // JSON, so this uses a direct fetch instead of the JSON-body fetchWithRetry helper.
    const body = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      grant_type: "client_credentials",
      scope: "public_data advcampaigns_for_website",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new Error("Request timed out.")), 10000);

    let res;
    try {
      res = await fetch(ADMITAD_TOKEN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
        signal: controller.signal,
      });
    } catch (error) {
      throw toSaleApiError(error, { provider: this.name });
    } finally {
      clearTimeout(timeout);
    }

    if (!res.ok) {
      throw toSaleApiError({ status: res.status }, { provider: this.name });
    }

    const data = await res.json();
    this._accessToken = data.access_token;
    return this._accessToken;
  }

  async _authorizedGet(path, params = {}) {
    const token = await this._getAccessToken();
    const url = new URL(`${ADMITAD_API_BASE}${path}`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") url.searchParams.set(key, value);
    });

    return fetchWithRetry(url, {
      provider: this.name,
      timeoutMs: 10000,
      retries: 1,
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  /**
   * @param {{ query?: string, page?: number }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async searchDeals({ query = "", page = 1 } = {}) {
    const data = await this._authorizedGet("/advcampaigns/", {
      website: this.websiteId,
      name: query,
      limit: 20,
      offset: (Math.max(1, page) - 1) * 20,
    });

    return (data.results || []).map((raw) => this._toOffer(raw, "deal"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getCoupons({ query = "", merchantId = "" } = {}) {
    const data = await this._authorizedGet("/coupons/", {
      website: this.websiteId,
      advcampaign: merchantId || undefined,
      name: query || undefined,
      limit: 20,
    });

    return (data.results || []).map((raw) => this._toOffer(raw, "coupon"));
  }

  /**
   * @param {{ query?: string, merchantId?: string }} params
   * @returns {Promise<import("../types.js").AffiliateOffer[]>}
   */
  async getOffers({ query = "", merchantId = "" } = {}) {
    const data = await this._authorizedGet("/promocodes/", {
      website: this.websiteId,
      advcampaign: merchantId || undefined,
      name: query || undefined,
      limit: 20,
    });

    return (data.results || []).map((raw) => this._toOffer(raw, "deal"));
  }

  _toOffer(raw, offerType) {
    return {
      id: `admitad-${raw.id || raw.pk || Math.random().toString(36).slice(2)}`,
      title: raw.name || raw.title || "Admitad offer",
      store: raw.advcampaign?.name || raw.advertiser || "Admitad merchant",
      description: raw.description || "",
      url: raw.gotolink || raw.landing_url || raw.url || "#",
      code: raw.promocode || raw.code || null,
      discount: raw.discount || null,
      offerType,
      expiresAt: raw.date_end || raw.expires_at || null,
      provider: this.name,
    };
  }
}
