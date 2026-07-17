// Landing Page CMS — data model + section-type registry (single source of
// truth). Phase 1 defines the shapes; later phases add each section's editor
// (admin) and renderer (public) keyed by `type`.

export const LANDER_STATUSES = ["draft", "published", "scheduled", "archived"];

export const STATUS_META = {
  draft: { label: "Draft", tone: "var(--muted)" },
  published: { label: "Published", tone: "var(--success)" },
  scheduled: { label: "Scheduled", tone: "var(--info)" },
  archived: { label: "Archived", tone: "var(--warning)" },
};

// Every section a page can hold. `group` powers the "Add section" picker.
export const SECTION_TYPES = [
  { type: "hero", label: "Hero", group: "Core" },
  { type: "banner", label: "Banner", group: "Core" },
  { type: "intro", label: "Introduction", group: "Core" },
  { type: "features", label: "Features", group: "Content" },
  { type: "stats", label: "Statistics", group: "Content" },
  { type: "benefits", label: "Benefits", group: "Content" },
  { type: "steps", label: "How it Works", group: "Content" },
  { type: "gallery", label: "Screenshot Gallery", group: "Media" },
  { type: "video", label: "Video", group: "Media" },
  { type: "testimonials", label: "Testimonials", group: "Social" },
  { type: "faq", label: "FAQ", group: "Content" },
  { type: "cta", label: "Call to Action", group: "Core" },
  { type: "relatedTools", label: "Related Tools", group: "ALTFTool" },
  { type: "blogRecommend", label: "Blog Recommendations", group: "ALTFTool" },
  { type: "text", label: "Text Block", group: "Basic" },
  { type: "image", label: "Image", group: "Basic" },
  { type: "customHtml", label: "Custom HTML", group: "Advanced" },
  { type: "embed", label: "Embed", group: "Advanced" },
  { type: "ads", label: "Ad Slot", group: "Advanced" },
];

export function sectionLabel(type) {
  return SECTION_TYPES.find((s) => s.type === type)?.label || type;
}

let sectionSeq = 0;
export function makeSectionId() {
  return `s_${Date.now().toString(36)}_${(sectionSeq++).toString(36)}`;
}

function defaultProps(type) {
  switch (type) {
    case "hero":
      return { heading: "", subheading: "", description: "", primaryLabel: "", primaryUrl: "", secondaryLabel: "", secondaryUrl: "", image: "", badge: "", align: "left" };
    case "cta":
      return { heading: "", description: "", buttonLabel: "", buttonUrl: "" };
    case "faq":
      return { items: [] };
    case "features":
    case "benefits":
    case "stats":
    case "steps":
    case "testimonials":
    case "gallery":
      return { items: [] };
    case "text":
      return { html: "" };
    case "image":
      return { url: "", alt: "" };
    case "video":
      return { url: "", poster: "" };
    case "customHtml":
    case "embed":
      return { html: "" };
    case "ads":
      return { placement: "" };
    default:
      return {};
  }
}

export function makeSection(type) {
  return { id: makeSectionId(), type, hidden: false, props: defaultProps(type) };
}

// A brand-new landing page document (before any Firestore timestamps).
export function newLanderDoc({ title = "", slug = "" } = {}) {
  return {
    title,
    slug,
    status: "draft",
    seo: { metaTitle: title, metaDescription: "", canonical: "", ogImage: "", noIndex: false, noFollow: false, keywords: [] },
    theme: { mode: "auto", brandColor: "", accent: "", radius: "", containerWidth: "" },
    sections: [],
    ads: { placements: {} },
    schema: { faq: true, breadcrumbs: true, article: false, organization: true },
    publishAt: null,
    expireAt: null,
    analytics: { views: 0, clicks: 0 },
  };
}
