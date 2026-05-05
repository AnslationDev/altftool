import { normalizeBuySmartCategory } from "@altftool/core/buysmart";
import fallbackBrands from "./categories.json";

export const fallbackBuySmartOffers = fallbackBrands.map((brand, index) =>
  normalizeBuySmartCategory({
    audience: index % 3 === 0 ? "Students" : "All shoppers",
    cashback: index % 3 === 1 ? "Up to 7% cash back" : "",
    category: ["Fashion", "Technology", "Travel", "Rewards"][index % 4],
    couponCode: index % 3 === 2 ? "SMART10" : "",
    discount: index % 2 === 0 ? "Up to 20% off" : "Cash back ready",
    exclusive: index % 4 === 0,
    expiresAt: "",
    featured: index < 4,
    link: brand.url,
    offerType: index % 3 === 0 ? "student" : index % 3 === 1 ? "cashback" : "coupon",
    priority: Math.max(0, 20 - index),
    status: "active",
    successRate: index < 6 ? 98 : 92,
    terms: "Offer availability can vary by region and merchant tracking rules.",
    title: brand.name,
    verificationStatus: index < 8 ? "verified" : "pending",
    verified: index < 8,
    workingVotes: Math.max(3, 24 - index),
    failedVotes: index % 5,
  }),
);
