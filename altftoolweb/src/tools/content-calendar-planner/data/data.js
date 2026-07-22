export const PLATFORMS = {
  blog: {
    id: "blog",
    name: "Blog",
    icon: "FileText",
    color: "text-blue-500",
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.2)",
    badgeClass: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
    defaultTasks: [
      "Keyword Research & SEO Strategy",
      "Draft Outline & Key Sections",
      "Write First Draft Content",
      "Format Layout & Insert Images",
      "Final Proofreading & CMS Publish"
    ]
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "Youtube",
    color: "text-rose-500",
    bg: "rgba(244, 63, 94, 0.1)",
    border: "rgba(244, 63, 94, 0.2)",
    badgeClass: "bg-rose-500/10 text-rose-500 border border-rose-500/20",
    defaultTasks: [
      "Brainstorm Script & Storyboard",
      "Record Video Footage & Audio",
      "A/B Video Editing & Sound FX",
      "Design Clickable Thumbnail",
      "Write Title, Desc & Upload Video"
    ]
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    icon: "Instagram",
    color: "text-pink-500",
    bg: "rgba(236, 72, 153, 0.1)",
    border: "rgba(236, 72, 153, 0.2)",
    badgeClass: "bg-pink-500/10 text-pink-500 border border-pink-500/20",
    defaultTasks: [
      "Draft Hook & Caption Content",
      "Design Visual Carousel or Edit Reel",
      "Research Target Hashtags",
      "Schedule Auto-Publish & Post Story"
    ]
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    icon: "Linkedin",
    color: "text-sky-600",
    bg: "rgba(2, 132, 199, 0.1)",
    border: "rgba(2, 132, 199, 0.2)",
    badgeClass: "bg-sky-600/10 text-sky-600 border border-sky-600/20",
    defaultTasks: [
      "Draft Post Outline & Hook",
      "Create Accompanying PDF Slide Deck",
      "Format for Scanability (Short paras)",
      "Publish or Schedule in Buffer/Loomly"
    ]
  },
  x: {
    id: "x",
    name: "Twitter/X",
    icon: "Twitter",
    color: "text-slate-400",
    bg: "rgba(148, 163, 184, 0.1)",
    border: "rgba(148, 163, 184, 0.2)",
    badgeClass: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
    defaultTasks: [
      "Draft Thread Hook & Story Structure",
      "Write 3-5 Supporting Tweets",
      "Verify Links & Mentions",
      "Schedule Thread Launch"
    ]
  },
  newsletter: {
    id: "newsletter",
    name: "Newsletter",
    icon: "Mail",
    color: "text-amber-500",
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.2)",
    badgeClass: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    defaultTasks: [
      "Select Weekly Theme & Curated Links",
      "Write Editorial Content & CTA",
      "Design Visual Header banner",
      "Run Test Send & Check Links",
      "Schedule Email Campaign"
    ]
  }
};

export const STATUSES = {
  draft: { id: "draft", name: "Draft", badgeClass: "bg-amber-500/10 text-amber-500 border border-amber-500/25" },
  scheduled: { id: "scheduled", name: "Scheduled", badgeClass: "bg-indigo-500/10 text-indigo-500 border border-indigo-500/25" },
  published: { id: "published", name: "Published", badgeClass: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/25" }
};

// Generates today's date formatted as YYYY-MM-DD
export function getRelativeDate(daysOffset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const DEFAULT_POSTS = [
  {
    id: "1",
    title: "10 Marketing Hacks for 2026 Growth",
    platform: "youtube",
    type: "Video",
    publishDate: getRelativeDate(2),
    status: "scheduled",
    budget: 250,
    targetReach: 15000,
    tasks: [
      { id: "yt-1", text: "Brainstorm Script & Storyboard", completed: true },
      { id: "yt-2", text: "Record Video Footage & Audio", completed: true },
      { id: "yt-3", text: "A/B Video Editing & Sound FX", completed: false },
      { id: "yt-4", text: "Design Clickable Thumbnail", completed: false },
      { id: "yt-5", text: "Write Title, Desc & Upload Video", completed: false }
    ],
    notes: "Targeting tech-savvy growth marketers. Focus on short-form hooks!"
  },
  {
    id: "2",
    title: "A Complete Guide to Next-Gen CSS Layouts",
    platform: "blog",
    type: "Article",
    publishDate: getRelativeDate(0),
    status: "published",
    budget: 120,
    targetReach: 5500,
    tasks: [
      { id: "bl-1", text: "Keyword Research & SEO Strategy", completed: true },
      { id: "bl-2", text: "Draft Outline & Key Sections", completed: true },
      { id: "bl-3", text: "Write First Draft Content", completed: true },
      { id: "bl-4", text: "Format Layout & Insert Images", completed: true },
      { id: "bl-5", text: "Final Proofreading & CMS Publish", completed: true }
    ],
    notes: "Rank for CSS grid & Tailwind container queries."
  },
  {
    id: "3",
    title: "Top 5 High-Conversion Email Templates",
    platform: "newsletter",
    type: "Email",
    publishDate: getRelativeDate(4),
    status: "draft",
    budget: 0,
    targetReach: 8000,
    tasks: [
      { id: "nl-1", text: "Select Weekly Theme & Curated Links", completed: true },
      { id: "nl-2", text: "Write Editorial Content & CTA", completed: false },
      { id: "nl-3", text: "Design Visual Header banner", completed: false },
      { id: "nl-4", text: "Run Test Send & Check Links", completed: false },
      { id: "nl-5", text: "Schedule Email Campaign", completed: false }
    ],
    notes: "Send out to all premium newsletter subscribers."
  }
];

export function fmt(num) {
  if (num === "" || isNaN(num) || num === null || num === undefined) return "0";
  return new Intl.NumberFormat("en-US").format(num);
}

export function fmtCurrency(num) {
  if (num === "" || isNaN(num) || num === null || num === undefined) return "$0";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(num);
}
