/**
 * Types & Constants for ALTFTool Backlink Marketplace
 * Location: src/app/altflinking/types.js
 */

export const ORDER_STATUS = {
  PENDING_ACCEPTANCE: "PENDING_ACCEPTANCE",
  ACCEPTED: "ACCEPTED",
  DELIVERED_PENDING_VERIFICATION: "DELIVERED_PENDING_VERIFICATION",
  VERIFIED_LIVE: "VERIFIED_LIVE",
  DISPUTED: "DISPUTED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

export const WEBSITE_STATUS = {
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
  UNDER_REVIEW: "UNDER_REVIEW",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  PAUSED: "PAUSED",
};

export const LINK_TYPES = {
  GUEST_POST: "GUEST_POST",
  LINK_INSERTION: "LINK_INSERTION",
};

export const NICHES = [
  "Technology",
  "SaaS & Software",
  "Finance & Crypto",
  "Health & Wellness",
  "Marketing & SEO",
  "Business & Startups",
  "E-Commerce",
  "Lifestyle & Travel",
  "Real Estate",
  "Gaming & Tech",
];

export const SORT_OPTIONS = [
  { label: "Highest DR", value: "dr_desc" },
  { label: "Most Organic Traffic", value: "traffic_desc" },
  { label: "Lowest Price (Guest Post)", value: "price_asc" },
  { label: "Lowest Turnaround Time (TAT)", value: "tat_asc" },
  { label: "Newly Verified", value: "newest" },
];
