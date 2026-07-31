export const DEFAULT_CHANNELS = [
  { id: "paid_search", name: "Paid Search (Google Ads)", budget: 3000, cpc: 1.5, ctr: 3.5, convRate: 2.2, color: "rgba(13, 148, 136, 1.0)" },
  { id: "paid_social", name: "Paid Social (Meta/TikTok)", budget: 4000, cpc: 0.8, ctr: 2.0, convRate: 1.8, color: "rgba(20, 184, 166, 1.0)" },
  { id: "influencer", name: "Influencer Marketing", budget: 1500, cpc: 2.5, ctr: 1.5, convRate: 3.0, color: "rgba(6, 182, 212, 1.0)" },
  { id: "email", name: "Email Marketing", budget: 500, cpc: 0.2, ctr: 6.0, convRate: 4.5, color: "rgba(34, 211, 238, 1.0)" },
  { id: "seo_content", name: "SEO & Content Creation", budget: 800, cpc: 0.5, ctr: 4.0, convRate: 2.5, color: "rgba(45, 212, 191, 1.0)" },
  { id: "events", name: "Offline & Events", budget: 200, cpc: 5.0, ctr: 1.0, convRate: 5.0, color: "rgba(94, 234, 212, 1.0)" }
];

export const PRESETS = [
  {
    name: "Lead Generation",
    description: "Prioritize high-intent keyword searches and retargeting channels to capture active prospects.",
    allocations: { paid_search: 45, paid_social: 25, influencer: 5, email: 15, seo_content: 8, events: 2 }
  },
  {
    name: "Brand Awareness",
    description: "Focus on video engagement, major key opinion leaders, and community touchpoints to spread the word.",
    allocations: { paid_search: 10, paid_social: 45, influencer: 25, email: 5, seo_content: 5, events: 10 }
  },
  {
    name: "Product Launch",
    description: "A comprehensive balanced blend to build simultaneous buzz, search authority, and trial activations.",
    allocations: { paid_search: 25, paid_social: 30, influencer: 20, email: 10, seo_content: 10, events: 5 }
  }
];

export const DEFAULT_TASKS = [
  { id: 1, text: "Define overall target audience and buyer persona avatars", completed: true, phase: "creative" },
  { id: 2, text: "Design ad creatives and write persuasive landing page copy", completed: false, phase: "creative" },
  { id: 3, text: "Set up tracking pixels (Google Tag Manager, Meta Pixel)", completed: false, phase: "setup" },
  { id: 4, text: "Launch initial A/B test variations across search & social channels", completed: false, phase: "launch" },
  { id: 5, text: "Conduct weekly budget review & reallocate funds to winning ads", completed: false, phase: "scale" }
];

export const fmt = (n, d = 0) => (+n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtU = (n) => "$" + fmt(n, 0);
