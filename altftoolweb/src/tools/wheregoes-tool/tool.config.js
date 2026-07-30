// The slug keeps its historic "wheregoes-tool" form (the URL is indexed and
// ranks), but the display name does not: WhereGoes is a third-party product,
// and using it as the name of ours put a competitor's brand in the <title>, the
// H1, the SoftwareApplication JSON-LD and every tool card on the site while
// leaving the page unable to rank for what people actually search — "url
// redirect checker". packages/core/src/productSuiteCatalog.js already labels
// this route generically ("Redirect Inspector"), so this brings the catalogue
// into line. `name` and `description` here are the source of truth for
// src/platform/registry/toolMetaMap.js, which the `generate:registry` prebuild
// step regenerates.
const toolConfig = {
  slug: "wheregoes-tool",
  name: "URL Redirect Checker",
  category: ["Web", "Developer", "Network"],
  description: "Check where a URL redirects — every hop, status code, response time, and headers.",
  icon: "link",
  iconColor: "text-teal-600",
};

export default toolConfig;
