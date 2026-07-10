import DEFAULTS from "./defaults.json";

/**
 * Schema-driven content model for the GrowVibe website.
 * Every section of the live site maps to one Firestore doc at
 * projects/growvibe/content/{key}. Field types drive the generic editor:
 *  - text | textarea | image | toggle
 *  - list  : array of objects (itemFields describes each object)
 *  - slist : array of plain strings
 */
export { DEFAULTS };

const linkFields = [
  { key: "label", label: "Label", type: "text" },
  { key: "href", label: "Link", type: "text" },
];

export const SECTIONS = {
  /* ---------------- Global ---------------- */
  navbar: {
    label: "Navbar",
    fields: [
      { key: "links", label: "Menu Links", type: "list", itemFields: linkFields },
      { key: "ctaText", label: "CTA Button Text", type: "text" },
      { key: "ctaLink", label: "CTA Button Link", type: "text" },
    ],
  },
  footer: {
    label: "Footer",
    fields: [
      { key: "description", label: "Brand Description", type: "textarea" },
      { key: "address", label: "Address", type: "textarea" },
      { key: "email", label: "Email", type: "text" },
      { key: "phone", label: "Phone", type: "text" },
      { key: "hours", label: "Working Hours", type: "text" },
      { key: "newsletterTitle", label: "Newsletter Title", type: "text" },
      { key: "newsletterText", label: "Newsletter Text", type: "textarea" },
      { key: "copyright", label: "Copyright Line", type: "text" },
      {
        key: "socials",
        label: "Social Links",
        type: "list",
        itemFields: [
          { key: "label", label: "Platform", type: "text" },
          { key: "url", label: "URL", type: "text" },
        ],
      },
    ],
  },

  /* ---------------- Home ---------------- */
  "home-hero": {
    label: "Hero",
    fields: [
      { key: "tickerText", label: "Ticker Text", type: "text" },
      { key: "tickerHighlight", label: "Ticker Highlight", type: "text" },
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headingDark", label: "Heading (dark part)", type: "text" },
      { key: "headingBlue", label: "Heading (blue part)", type: "textarea" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "button1Text", label: "Button 1 Text", type: "text" },
      { key: "button1Link", label: "Button 1 Link", type: "text" },
      { key: "button2Text", label: "Button 2 Text", type: "text" },
      { key: "button2Link", label: "Button 2 Link", type: "text" },
      { key: "rating", label: "Rating (e.g. 4.9/5)", type: "text" },
      { key: "ratingText", label: "Rating Text", type: "text" },
      {
        key: "stats",
        label: "Hero Stat Cards",
        type: "list",
        itemFields: [
          { key: "label", label: "Label", type: "text" },
          { key: "value", label: "Value", type: "text" },
          { key: "note", label: "Note (green)", type: "text" },
        ],
      },
    ],
  },
  "home-services": {
    label: "Services Section",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headingDark", label: "Heading (dark part)", type: "text" },
      { key: "headingGray", label: "Heading (gray part)", type: "textarea" },
      { key: "featuredChartLabel", label: "Featured Chart Label", type: "text" },
      { key: "featuredChartBadge", label: "Featured Chart Badge", type: "text" },
      { key: "consultTitle", label: "Consultation Title", type: "text" },
      { key: "consultText", label: "Consultation Text", type: "textarea" },
      { key: "consultButton", label: "Consultation Button", type: "text" },
      { key: "consultImage", label: "Consultation Image", type: "image" },
    ],
  },
  "home-why": {
    label: "Why Choose Us",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headingDark", label: "Heading (dark part)", type: "text" },
      { key: "headingGray", label: "Heading (gray part)", type: "text" },
      {
        key: "reasons",
        label: "Reason Cards",
        type: "list",
        itemFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
      { key: "bannerTitle", label: "Banner Title", type: "text" },
      { key: "bannerText", label: "Banner Text", type: "textarea" },
      { key: "bannerButton", label: "Banner Button", type: "text" },
      { key: "bannerImage", label: "Banner Image", type: "image" },
    ],
  },
  "home-process": {
    label: "Process",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      {
        key: "steps",
        label: "Process Steps",
        type: "list",
        itemFields: [
          { key: "step", label: "Number", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
      { key: "cardTitle", label: "Side Card Title", type: "text" },
      { key: "cardText", label: "Side Card Text", type: "textarea" },
      { key: "cardButton", label: "Side Card Button", type: "text" },
    ],
  },
  "home-stats": {
    label: "Stats Bar",
    fields: [
      {
        key: "stats",
        label: "Counters",
        type: "list",
        itemFields: [
          { key: "prefix", label: "Prefix", type: "text" },
          { key: "value", label: "Number", type: "text" },
          { key: "suffix", label: "Suffix", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
    ],
  },
  "home-testimonials": {
    label: "Testimonials",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "panelTitle", label: "Trusted Panel Title", type: "text" },
      { key: "panelSubtitle", label: "Trusted Panel Subtitle", type: "text" },
      {
        key: "items",
        label: "Testimonials",
        type: "list",
        itemFields: [
          { key: "quote", label: "Quote", type: "textarea" },
          { key: "name", label: "Name", type: "text" },
          { key: "role", label: "Role", type: "text" },
          { key: "avatar", label: "Avatar", type: "image" },
        ],
      },
    ],
  },
  "home-cases-intro": {
    label: "Success Stories Intro",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "headingDark", label: "Heading (dark part)", type: "text" },
      { key: "headingGradient", label: "Heading (gradient part)", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "textarea" },
      { key: "buttonText", label: "Button Text", type: "text" },
    ],
  },
  "home-faq": {
    label: "FAQ",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "cardTitle", label: "Side Card Title", type: "text" },
      { key: "cardText", label: "Side Card Text", type: "text" },
      { key: "cardButton", label: "Side Card Button", type: "text" },
      {
        key: "faqs",
        label: "Questions",
        type: "list",
        itemFields: [
          { key: "q", label: "Question", type: "text" },
          { key: "a", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  "home-cta": {
    label: "Final CTA",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "button1Text", label: "Button 1 Text", type: "text" },
      { key: "button1Link", label: "Button 1 Link", type: "text" },
      { key: "button2Text", label: "Button 2 Text", type: "text" },
      { key: "button2Link", label: "Button 2 Link", type: "text" },
    ],
  },

  /* ---------------- Services ---------------- */
  services: {
    label: "Services",
    fields: [
      {
        key: "items",
        label: "Services (6)",
        type: "list",
        itemLabelKey: "name",
        itemFields: [
          { key: "slug", label: "Slug (URL)", type: "text" },
          { key: "name", label: "Name", type: "text" },
          { key: "tagline", label: "Tagline", type: "text" },
          { key: "short", label: "Short Description", type: "textarea" },
          { key: "description", label: "Full Description", type: "textarea" },
          {
            key: "features",
            label: "Features",
            type: "list",
            itemFields: [
              { key: "title", label: "Title", type: "text" },
              { key: "text", label: "Text", type: "textarea" },
            ],
          },
          {
            key: "process",
            label: "Approach Steps",
            type: "list",
            itemFields: [
              { key: "step", label: "Number", type: "text" },
              { key: "title", label: "Title", type: "text" },
              { key: "text", label: "Text", type: "textarea" },
            ],
          },
          { key: "deliverables", label: "Deliverables", type: "slist" },
          {
            key: "stats",
            label: "Stats",
            type: "list",
            itemFields: [
              { key: "value", label: "Value", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ],
          },
          {
            key: "faqs",
            label: "FAQs",
            type: "list",
            itemFields: [
              { key: "q", label: "Question", type: "text" },
              { key: "a", label: "Answer", type: "textarea" },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------- Case studies ---------------- */
  "case-studies": {
    label: "Case Studies",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heroTitle", label: "Hero Title", type: "textarea" },
      { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea" },
      {
        key: "impact",
        label: "Impact Stats",
        type: "list",
        itemFields: [
          { key: "value", label: "Value", type: "text" },
          { key: "label", label: "Label", type: "text" },
        ],
      },
      {
        key: "items",
        label: "Case Studies",
        type: "list",
        itemLabelKey: "tag",
        itemFields: [
          { key: "slug", label: "Slug", type: "text" },
          { key: "tag", label: "Tag / Client Type", type: "text" },
          { key: "industry", label: "Industry", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "image", label: "Image", type: "image" },
          { key: "imageAlt", label: "Image Alt Text", type: "text" },
          { key: "challenge", label: "The Challenge", type: "textarea" },
          { key: "solution", label: "The Solution", type: "textarea" },
          { key: "services", label: "Services Used", type: "slist" },
          {
            key: "results",
            label: "Results",
            type: "list",
            itemFields: [
              { key: "value", label: "Value", type: "text" },
              { key: "label", label: "Label", type: "text" },
            ],
          },
          {
            key: "quote",
            label: "Client Quote",
            type: "group",
            itemFields: [
              { key: "text", label: "Quote", type: "textarea" },
              { key: "name", label: "Name", type: "text" },
              { key: "role", label: "Role", type: "text" },
            ],
          },
        ],
      },
    ],
  },

  /* ---------------- Blog ---------------- */
  blog: {
    label: "Blog",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heroTitle", label: "Hero Title", type: "text" },
      { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea" },
      {
        key: "posts",
        label: "Posts",
        type: "list",
        itemLabelKey: "title",
        itemFields: [
          { key: "slug", label: "Slug (URL)", type: "text" },
          { key: "category", label: "Category", type: "text" },
          { key: "title", label: "Title", type: "text" },
          { key: "excerpt", label: "Excerpt", type: "textarea" },
          { key: "date", label: "Date", type: "text" },
          { key: "readTime", label: "Read Time", type: "text" },
          { key: "author", label: "Author", type: "text" },
          { key: "authorRole", label: "Author Role", type: "text" },
          { key: "image", label: "Cover Image", type: "image" },
          { key: "imageAlt", label: "Image Alt Text", type: "text" },
          {
            key: "body",
            label: "Article Sections",
            type: "list",
            itemFields: [
              { key: "heading", label: "Heading", type: "text" },
              { key: "text", label: "Paragraph", type: "textarea" },
            ],
          },
          { key: "related", label: "Related Post Slugs", type: "slist" },
        ],
      },
    ],
  },

  /* ---------------- Pages ---------------- */
  pricing: {
    label: "Pricing Page",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heroTitle", label: "Hero Title", type: "text" },
      { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea" },
      {
        key: "plans",
        label: "Plans",
        type: "list",
        itemLabelKey: "name",
        itemFields: [
          { key: "name", label: "Name", type: "text" },
          { key: "tagline", label: "Tagline", type: "textarea" },
          { key: "price", label: "Price", type: "text" },
          { key: "period", label: "Period (e.g. /month)", type: "text" },
          { key: "featured", label: "Most Popular", type: "toggle" },
          { key: "cta", label: "Button Text", type: "text" },
          { key: "features", label: "Features", type: "slist" },
        ],
      },
    ],
  },
  about: {
    label: "About Page",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heroTitle", label: "Hero Title", type: "text" },
      { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea" },
      { key: "storyHeading", label: "Story Heading", type: "text" },
      { key: "storyPara1", label: "Story Paragraph 1", type: "textarea" },
      { key: "storyPara2", label: "Story Paragraph 2", type: "textarea" },
      { key: "storyImage", label: "Story Image", type: "image" },
      {
        key: "values",
        label: "Values",
        type: "list",
        itemFields: [
          { key: "title", label: "Title", type: "text" },
          { key: "text", label: "Text", type: "textarea" },
        ],
      },
    ],
  },
  contact: {
    label: "Contact Page",
    fields: [
      { key: "eyebrow", label: "Eyebrow", type: "text" },
      { key: "heroTitle", label: "Hero Title", type: "text" },
      { key: "heroSubtitle", label: "Hero Subtitle", type: "textarea" },
      { key: "panelTitle", label: "Info Panel Title", type: "text" },
      { key: "panelText", label: "Info Panel Text", type: "textarea" },
    ],
  },
};

export const MODULE_SECTIONS = {
  navbar: ["navbar"],
  footer: ["footer"],
  home: [
    "home-hero",
    "home-services",
    "home-why",
    "home-process",
    "home-stats",
    "home-testimonials",
    "home-cases-intro",
    "home-faq",
    "home-cta",
  ],
  services: ["services"],
  "case-studies": ["case-studies"],
  blog: ["blog"],
  pages: ["about", "pricing", "contact"],
};
