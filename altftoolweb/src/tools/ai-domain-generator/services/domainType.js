// Domain styles
export const DomainStyle = {
  BRANDABLE: "brandable",
  SEO: "seo",
  SHORT: "short",
  STARTUP: "startup",
};

// TLD structure (reference object)
export const TLD_DEFAULT = {
  tld: "",
  label: "",
  enabled: true,
  reasonDisabled: "",
};

// Availability types
export const Availability = {
  AVAILABLE: "available",
  TAKEN: "taken",
  PREMIUM: "premium",
  UNKNOWN: "unknown",
};

// Domain result structure
export const DomainResult_DEFAULT = {
  id: "",
  name: "",
  sld: "",
  tld: "",
  style: DomainStyle.BRANDABLE,
  availability: Availability.UNKNOWN,
  priceHint: "",
  checkedAt: null,
  error: "",
};

// Domain details structure
export const DomainDetails_DEFAULT = {
  domain: "",
  length: 0,
  keywordBreakdown: [],
  brandScore: 0,
  similar: [],
};
