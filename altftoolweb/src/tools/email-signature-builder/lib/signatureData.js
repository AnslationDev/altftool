// Static data driving the signature builder: email-safe fonts, social
// networks, section definitions, the 25+ template presets, and the default
// editor state. Pure data — no DOM, no React — so the HTML generator and the
// UI both import from one source of truth.

export const EMAIL_SAFE_FONTS = [
  { id: "arial", label: "Arial", stack: "Arial, Helvetica, sans-serif" },
  { id: "helvetica", label: "Helvetica", stack: "Helvetica, Arial, sans-serif" },
  { id: "georgia", label: "Georgia", stack: "Georgia, 'Times New Roman', serif" },
  { id: "times", label: "Times New Roman", stack: "'Times New Roman', Times, serif" },
  { id: "verdana", label: "Verdana", stack: "Verdana, Geneva, sans-serif" },
  { id: "tahoma", label: "Tahoma", stack: "Tahoma, Geneva, sans-serif" },
  { id: "trebuchet", label: "Trebuchet MS", stack: "'Trebuchet MS', Helvetica, sans-serif" },
  { id: "palatino", label: "Palatino", stack: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { id: "lucida", label: "Lucida Sans", stack: "'Lucida Sans Unicode', 'Lucida Grande', sans-serif" },
  { id: "courier", label: "Courier New", stack: "'Courier New', Courier, monospace" },
];

export function fontStack(fontId) {
  return (EMAIL_SAFE_FONTS.find((f) => f.id === fontId) || EMAIL_SAFE_FONTS[0]).stack;
}

// Letter-badge icons are used in the exported HTML (self-contained — no
// external image requests, works with images blocked). `badge` is the short
// label drawn inside the colored square.
export const SOCIAL_NETWORKS = [
  { id: "linkedin", label: "LinkedIn", badge: "in", color: "#0A66C2", placeholder: "https://linkedin.com/in/username" },
  { id: "twitter", label: "X (Twitter)", badge: "𝕏", color: "#111111", placeholder: "https://x.com/username" },
  { id: "facebook", label: "Facebook", badge: "f", color: "#1877F2", placeholder: "https://facebook.com/username" },
  { id: "instagram", label: "Instagram", badge: "IG", color: "#E4405F", placeholder: "https://instagram.com/username" },
  { id: "youtube", label: "YouTube", badge: "▶", color: "#FF0000", placeholder: "https://youtube.com/@channel" },
  { id: "github", label: "GitHub", badge: "GH", color: "#181717", placeholder: "https://github.com/username" },
  { id: "tiktok", label: "TikTok", badge: "TT", color: "#010101", placeholder: "https://tiktok.com/@username" },
  { id: "whatsapp", label: "WhatsApp", badge: "WA", color: "#25D366", placeholder: "https://wa.me/911234567890" },
  { id: "telegram", label: "Telegram", badge: "TG", color: "#26A5E4", placeholder: "https://t.me/username" },
  { id: "dribbble", label: "Dribbble", badge: "Dr", color: "#EA4C89", placeholder: "https://dribbble.com/username" },
  { id: "behance", label: "Behance", badge: "Be", color: "#1769FF", placeholder: "https://behance.net/username" },
  { id: "medium", label: "Medium", badge: "M", color: "#000000", placeholder: "https://medium.com/@username" },
];

export const MEETING_SERVICES = [
  { id: "calendly", label: "Calendly", color: "#006BFF", cta: "Book a meeting" },
  { id: "zoom", label: "Zoom", color: "#0B5CFF", cta: "Join my Zoom" },
  { id: "gmeet", label: "Google Meet", color: "#00832D", cta: "Google Meet" },
  { id: "teams", label: "Microsoft Teams", color: "#5059C9", cta: "Teams call" },
];

// Sections that can be toggled and re-ordered (identity block is always on
// top; these stack under it in the order the user sets).
export const ORDERABLE_SECTIONS = [
  { id: "social", label: "Social media icons" },
  { id: "cta", label: "CTA button" },
  { id: "meetings", label: "Meeting buttons" },
  { id: "banner", label: "Promotional banner" },
  { id: "qr", label: "QR code" },
  { id: "disclaimer", label: "Legal disclaimer" },
];

// 26 templates across 5 categories. Each template is a preset over the same
// layout engine: `layout` picks the table structure, the rest feed design
// state. Adding a template = adding one object here.
export const TEMPLATES = [
  // Professional
  { id: "pro-slate", name: "Slate", category: "Professional", layout: "horizontal", accent: "#0F766E", text: "#1F2937", font: "arial", divider: "line", photoShape: "circle" },
  { id: "pro-navy", name: "Navy", category: "Professional", layout: "horizontal", accent: "#1E3A8A", text: "#111827", font: "helvetica", divider: "line", photoShape: "circle" },
  { id: "pro-graphite", name: "Graphite", category: "Professional", layout: "vertical-line", accent: "#374151", text: "#111827", font: "verdana", divider: "line", photoShape: "rounded" },
  { id: "pro-royal", name: "Royal", category: "Professional", layout: "horizontal", accent: "#4338CA", text: "#1F2937", font: "trebuchet", divider: "line", photoShape: "circle" },
  { id: "pro-executive", name: "Executive", category: "Professional", layout: "stacked", accent: "#0F172A", text: "#0F172A", font: "georgia", divider: "line", photoShape: "square" },
  { id: "pro-classic", name: "Classic Serif", category: "Professional", layout: "stacked", accent: "#7C2D12", text: "#292524", font: "times", divider: "line", photoShape: "square" },
  // Modern
  { id: "mod-teal", name: "Teal Pop", category: "Modern", layout: "vertical-line", accent: "#14B8A6", text: "#134E4A", font: "arial", divider: "none", photoShape: "circle" },
  { id: "mod-violet", name: "Violet Edge", category: "Modern", layout: "vertical-line", accent: "#7C3AED", text: "#1E1B4B", font: "trebuchet", divider: "none", photoShape: "circle" },
  { id: "mod-sunset", name: "Sunset", category: "Modern", layout: "horizontal", accent: "#EA580C", text: "#431407", font: "tahoma", divider: "dots", photoShape: "circle" },
  { id: "mod-ocean", name: "Ocean", category: "Modern", layout: "horizontal", accent: "#0284C7", text: "#0C4A6E", font: "helvetica", divider: "dots", photoShape: "rounded" },
  { id: "mod-forest", name: "Forest", category: "Modern", layout: "stacked", accent: "#15803D", text: "#14532D", font: "verdana", divider: "none", photoShape: "circle" },
  { id: "mod-rose", name: "Rose", category: "Modern", layout: "vertical-line", accent: "#E11D48", text: "#4C0519", font: "arial", divider: "none", photoShape: "circle" },
  // Minimal
  { id: "min-mono", name: "Mono", category: "Minimal", layout: "text-only", accent: "#111827", text: "#111827", font: "courier", divider: "none", photoShape: "square" },
  { id: "min-thin", name: "Thin Line", category: "Minimal", layout: "text-only", accent: "#6B7280", text: "#374151", font: "helvetica", divider: "line", photoShape: "square" },
  { id: "min-quiet", name: "Quiet", category: "Minimal", layout: "text-only", accent: "#94A3B8", text: "#475569", font: "arial", divider: "none", photoShape: "square" },
  { id: "min-ink", name: "Ink", category: "Minimal", layout: "stacked", accent: "#000000", text: "#000000", font: "georgia", divider: "line", photoShape: "square" },
  { id: "min-air", name: "Air", category: "Minimal", layout: "text-only", accent: "#64748B", text: "#334155", font: "lucida", divider: "none", photoShape: "square" },
  // Creative
  { id: "cre-bold", name: "Bold Block", category: "Creative", layout: "accent-bar", accent: "#F59E0B", text: "#451A03", font: "trebuchet", divider: "none", photoShape: "rounded" },
  { id: "cre-neon", name: "Neon", category: "Creative", layout: "accent-bar", accent: "#10B981", text: "#064E3B", font: "verdana", divider: "none", photoShape: "circle" },
  { id: "cre-coral", name: "Coral", category: "Creative", layout: "accent-bar", accent: "#F43F5E", text: "#500724", font: "tahoma", divider: "dots", photoShape: "circle" },
  { id: "cre-grape", name: "Grape", category: "Creative", layout: "vertical-line", accent: "#9333EA", text: "#3B0764", font: "trebuchet", divider: "dots", photoShape: "rounded" },
  { id: "cre-citrus", name: "Citrus", category: "Creative", layout: "accent-bar", accent: "#CA8A04", text: "#422006", font: "arial", divider: "none", photoShape: "circle" },
  // Corporate
  { id: "cor-steel", name: "Steel", category: "Corporate", layout: "horizontal", accent: "#475569", text: "#1E293B", font: "arial", divider: "line", photoShape: "square" },
  { id: "cor-banker", name: "Banker", category: "Corporate", layout: "stacked", accent: "#1D4ED8", text: "#172554", font: "georgia", divider: "line", photoShape: "square" },
  { id: "cor-legal", name: "Legal", category: "Corporate", layout: "text-only", accent: "#78350F", text: "#292524", font: "times", divider: "line", photoShape: "square" },
  { id: "cor-enterprise", name: "Enterprise", category: "Corporate", layout: "horizontal", accent: "#0E7490", text: "#164E63", font: "verdana", divider: "line", photoShape: "rounded" },
];

export const TEMPLATE_CATEGORIES = ["Professional", "Modern", "Minimal", "Creative", "Corporate"];

export const DEFAULT_STATE = {
  templateId: "pro-slate",
  personal: {
    fullName: "",
    title: "",
    company: "",
    department: "",
    email: "",
    phone: "",
    mobile: "",
    website: "",
    address: "",
    hours: "",
    tagline: "",
  },
  photo: { src: "", size: 84, shape: "circle", position: "left" },
  logo: { src: "", url: "", width: 110 },
  socials: {},
  cta: { label: "Visit our website", url: "", bg: "#0F766E", color: "#FFFFFF", radius: 6 },
  meetings: { calendly: "", zoom: "", gmeet: "", teams: "" },
  banner: { src: "", url: "", width: 420, alt: "Promotional banner" },
  qr: { mode: "website", custom: "" },
  disclaimer: "",
  design: {
    font: "arial",
    accent: "#0F766E",
    text: "#1F2937",
    fontSize: 13,
    lineHeight: 1.5,
    divider: "line",
    layout: "horizontal",
    iconStyle: "badge",
    width: 480,
  },
  sections: {
    order: ["social", "cta", "meetings", "banner", "qr", "disclaimer"],
    visible: { social: true, cta: false, meetings: false, banner: false, qr: false, disclaimer: false },
  },
};

export function applyTemplate(state, template) {
  return {
    ...state,
    templateId: template.id,
    photo: { ...state.photo, shape: template.photoShape },
    cta: { ...state.cta, bg: template.accent },
    design: {
      ...state.design,
      font: template.font,
      accent: template.accent,
      text: template.text,
      divider: template.divider,
      layout: template.layout,
    },
  };
}

export const SAMPLE_PROFILE = {
  fullName: "Aarav Sharma",
  title: "Head of Growth",
  company: "Anslation",
  department: "Marketing",
  email: "aarav@anslation.com",
  phone: "+91 11 4155 0000",
  mobile: "+91 98100 00000",
  website: "https://www.anslation.com",
  address: "DLF Cyber City, Gurugram, India",
  hours: "Mon–Fri, 9:30–18:30 IST",
  tagline: "Helping brands grow with data-driven marketing.",
};
