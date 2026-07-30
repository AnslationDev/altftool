import { AdmitadProvider } from "./admitadProvider.js";
import { ImpactProvider } from "./impactProvider.js";
import { CJProvider } from "./cjProvider.js";
import { AwinProvider } from "./awinProvider.js";

export { AffiliateProvider } from "./affiliateProvider.js";
export { AdmitadProvider, ImpactProvider, CJProvider, AwinProvider };

/** All affiliate providers, instantiated once per process. */
const providers = [new AdmitadProvider(), new ImpactProvider(), new CJProvider(), new AwinProvider()];

/** @returns {import("./affiliateProvider.js").AffiliateProvider[]} only providers with credentials set */
export function getConfiguredAffiliateProviders() {
  return providers.filter((provider) => provider.isConfigured());
}

/**
 * Run `searchDeals` across every configured affiliate provider concurrently.
 * Unconfigured or failing providers contribute an empty array — they never
 * throw and never block the other providers.
 *
 * @param {{ query: string, page?: number }} params
 * @returns {Promise<import("../types.js").AffiliateOffer[]>}
 */
export async function searchAllAffiliateDeals(params) {
  const results = await Promise.all(
    getConfiguredAffiliateProviders().map((provider) => provider.safeCall("searchDeals", params)),
  );
  return results.flat();
}
