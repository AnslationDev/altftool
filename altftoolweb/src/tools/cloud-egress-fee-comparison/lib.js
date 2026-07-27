/**
 * Internet egress (data-transfer-out) price comparison across major clouds
 * and CDNs.
 *
 * Every rate below is the provider's published pay-as-you-go list price for
 * data transferred out to the internet from a primary US/EU region, taken from
 * each provider's public pricing page. Tier bands are applied to the volume
 * remaining AFTER the provider's monthly free allowance. Rates change and vary
 * by region — treat results as estimates for comparison, not quotes.
 */

export const PROVIDERS = [
  {
    id: "aws",
    name: "AWS (EC2 / S3 to internet)",
    // aws.amazon.com/ec2/pricing — Data Transfer: first 100 GB/month free
    // across services, then $0.09 up to 10 TB, $0.085 next 40 TB,
    // $0.07 next 100 TB, $0.05 beyond (us-east-1).
    freeGb: 100,
    tiers: [
      { uptoGb: 10240, ratePerGb: 0.09 },
      { uptoGb: 51200, ratePerGb: 0.085 },
      { uptoGb: 153600, ratePerGb: 0.07 },
      { uptoGb: Infinity, ratePerGb: 0.05 },
    ],
  },
  {
    id: "azure",
    name: "Microsoft Azure (routed via Microsoft network)",
    // azure.microsoft.com/pricing/details/bandwidth — first 100 GB/month free,
    // then $0.087 up to 10 TB, $0.083 next 40 TB, $0.07 next 100 TB,
    // $0.05 next 350 TB (North America/Europe zones).
    freeGb: 100,
    tiers: [
      { uptoGb: 10240, ratePerGb: 0.087 },
      { uptoGb: 51200, ratePerGb: 0.083 },
      { uptoGb: 153600, ratePerGb: 0.07 },
      { uptoGb: Infinity, ratePerGb: 0.05 },
    ],
  },
  {
    id: "gcp",
    name: "Google Cloud (premium tier)",
    // cloud.google.com/vpc/network-pricing — premium tier egress to internet
    // (from North America): $0.12/GB up to 1 TB, $0.11 next 9 TB, $0.08 beyond 10 TB.
    freeGb: 0,
    tiers: [
      { uptoGb: 1024, ratePerGb: 0.12 },
      { uptoGb: 10240, ratePerGb: 0.11 },
      { uptoGb: Infinity, ratePerGb: 0.08 },
    ],
  },
  {
    id: "oracle",
    name: "Oracle Cloud (OCI)",
    // oracle.com/cloud/networking/pricing — first 10 TB/month of outbound
    // data transfer free, then $0.0085/GB.
    freeGb: 10240,
    tiers: [{ uptoGb: Infinity, ratePerGb: 0.0085 }],
  },
  {
    id: "cloudfront",
    name: "Amazon CloudFront (CDN)",
    // aws.amazon.com/cloudfront/pricing — always-free tier of 1 TB/month,
    // then North America rates: $0.085 up to 10 TB, $0.080 next 40 TB,
    // $0.060 next 100 TB, $0.040 next 350 TB.
    freeGb: 1024,
    tiers: [
      { uptoGb: 10240, ratePerGb: 0.085 },
      { uptoGb: 51200, ratePerGb: 0.08 },
      { uptoGb: 153600, ratePerGb: 0.06 },
      { uptoGb: Infinity, ratePerGb: 0.04 },
    ],
  },
  {
    id: "bunny",
    name: "Bunny CDN (standard, EU/NA)",
    // bunny.net/pricing — standard network Europe & North America tier
    // lists $0.01/GB; other continents and volume tiers differ.
    freeGb: 0,
    tiers: [{ uptoGb: Infinity, ratePerGb: 0.01 }],
  },
  {
    id: "cloudflare",
    name: "Cloudflare (R2 / Workers / Pages)",
    // developers.cloudflare.com/r2/pricing — egress to the internet is $0.
    freeGb: 0,
    tiers: [{ uptoGb: Infinity, ratePerGb: 0 }],
  },
];

/** Tiered cost for one provider: free allowance first, then tier bands. */
export function providerEgressCost(provider, gb) {
  const billable = Math.max(0, gb - provider.freeGb);
  let remaining = billable;
  let prev = 0;
  let cost = 0;
  for (const tier of provider.tiers) {
    const bandSize = tier.uptoGb - prev;
    const inBand = Math.min(remaining, bandSize);
    if (inBand <= 0) break;
    cost += inBand * tier.ratePerGb;
    remaining -= inBand;
    prev = tier.uptoGb;
  }
  return cost;
}

/**
 * Compare monthly internet egress cost across all providers.
 *
 * @param {object} input
 * @param {number} input.monthlyGb  Outbound traffic to the internet per month, GB.
 * @returns {object} { rows, cheapest, dearest, spread } or { error }.
 */
export function compareEgressCosts({ monthlyGb }) {
  const gb = Number(monthlyGb);
  if (!Number.isFinite(gb) || gb < 0) {
    return { error: "Monthly outbound traffic must be zero or more GB." };
  }

  const rows = PROVIDERS.map((provider) => {
    const cost = providerEgressCost(provider, gb);
    return {
      id: provider.id,
      name: provider.name,
      freeGb: provider.freeGb,
      cost,
      effectivePerGb: gb > 0 ? cost / gb : 0,
    };
  }).sort((a, b) => a.cost - b.cost);

  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];

  return {
    monthlyGb: gb,
    rows,
    cheapest,
    dearest,
    spread: dearest.cost - cheapest.cost,
  };
}
