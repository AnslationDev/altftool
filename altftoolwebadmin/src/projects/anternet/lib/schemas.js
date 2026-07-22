"use client";

/**
 * Anternet — schema-driven module definitions.
 * Each collection describes its fields once; the generic CollectionManager
 * renders lists, forms and validation from this.
 *
 * Field types: text · textarea · number · boolean · select · tags · list ·
 *              keyvalue · image · objectlist · group · color · background
 * select options: array OR "dynamic:quizcategories" (loaded live).
 * "background" stores { mode: solid|gradient|image, color?, gradientStart?,
 * gradientEnd?, direction?, imageUrl? } — set allowImage:true to offer the
 * image mode (used only by the Wallet Card).
 */

export const PRIZE_TYPES = ["coins", "coupon", "fail"];

/**
 * Video Sections — "Add Video" source modes. Existing keys (videoId, title,
 * channel, views, duration, reward) are reused as-is across every mode for
 * backward compatibility; only videoType/description/thumbnailUrl/
 * uploadedVideoUrl/externalVideoUrl are new. Legacy rows saved before this
 * feature (no videoType, just a videoId) are treated as "youtube" at render
 * and save time — see ui.jsx VideoListInput and CollectionManager.save().
 */
export const VIDEO_MODES = {
  youtube: {
    label: "YouTube ID",
    icon: "▶️",
    fields: [
      { key: "videoId", label: "YouTube ID", type: "text" },
      { key: "title", label: "Title", type: "text" },
      { key: "channel", label: "Channel Name", type: "text" },
      { key: "views", label: "Views Label", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "reward", label: "Reward Coins", type: "text" },
    ],
  },
  upload: {
    label: "Upload Video",
    icon: "⬆️",
    fields: [
      { key: "uploadedVideoUrl", label: "Upload Video (MP4, MOV, WebM)", type: "videoupload", folder: "videosections" },
      { key: "thumbnailUrl", label: "Thumbnail Upload", type: "thumbnailupload", folder: "videosections" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "channel", label: "Channel Name", type: "text" },
      { key: "views", label: "Views Label", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "reward", label: "Reward Coins", type: "text" },
    ],
  },
  url: {
    label: "Video URL",
    icon: "🔗",
    fields: [
      { key: "externalVideoUrl", label: "Video URL", type: "videourl" },
      { key: "thumbnailUrl", label: "Thumbnail Upload (optional)", type: "thumbnailupload", folder: "videosections" },
      { key: "title", label: "Title", type: "text" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "channel", label: "Channel Name", type: "text" },
      { key: "views", label: "Views Label", type: "text" },
      { key: "duration", label: "Duration", type: "text" },
      { key: "reward", label: "Reward Coins", type: "text" },
    ],
  },
};

/** Fixed direction set for the "background" field's gradient mode — kept in
 * sync by hand with GRADIENT_POINTS in the app's src/utils/cmsBackground.jsx
 * (no shared package exists between the two repos). */
export const GRADIENT_DIRECTIONS = [
  { value: "to-right", label: "Left → Right" },
  { value: "to-bottom", label: "Top → Bottom" },
  { value: "to-bottom-right", label: "Diagonal ↘ (top-left → bottom-right)" },
  { value: "to-top-right", label: "Diagonal ↗ (bottom-left → top-right)" },
];

const idField = { key: "id", label: "ID", type: "text", required: true, isId: true, pattern: /^[a-z0-9]+(-[a-z0-9]+)*$/, hint: "kebab-case, unique, immutable after create" };

export const COLLECTIONS = {
  banners: {
    label: "Home Banners", icon: "🖼️", collection: "banners",
    listColumns: ["title", "placement", "order", "active"],
    fields: [
      idField,
      { key: "placement", label: "Placement", type: "select", options: ["playandwin", "qubic-hero"], default: "playandwin", hint: "Which carousel shows this banner" },
      { key: "tag", label: "Tag / Eyebrow", type: "text", hint: "Featured / New / Hot" },
      { key: "title", label: "Title", type: "text", required: true, max: 60 },
      { key: "description", label: "Description", type: "textarea", max: 140 },
      { key: "imageUrl", label: "Banner Image", type: "image", folder: "banners", hint: "JPG/PNG 1200×600 (2:1)" },
      { key: "ctaLabel", label: "Button Label", type: "text" },
      { key: "ctaAction", label: "Button Action", type: "text", hint: "screen id or https:// link" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  tasks: {
    label: "Tasks", icon: "\u2705", collection: "tasks",
    listColumns: ["title", "section", "category", "coins", "rating", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Route / Feature Name", type: "text", readOnly: true,
        hint: "Identifies which app route this icon belongs to \u2014 admin reference only, not shown in the app, and cannot be edited here." },
      { key: "image", label: "Card Image URL", type: "text", hint: "https:// icon/image for grid cards" },
      { key: "imageUrl", label: "Card Image (upload)", type: "image", folder: "tasks", hint: "Overrides Image URL" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  quizcategories: {
    label: "Quiz Categories", icon: "🗂", collection: "quizcategories",
    listColumns: ["name", "order", "active"],
    guards: [{ collection: "questions", field: "category", message: "questions still reference this category" }],
    fields: [
      idField,
      { key: "name", label: "Name", type: "text", required: true, max: 40 },
      { key: "description", label: "Description", type: "textarea", max: 140 },
      { key: "icon", label: "Icon URL", type: "text", hint: "https:// small icon image" },
      { key: "imageUrl", label: "Icon (upload)", type: "image", folder: "quiz", hint: "Overrides Icon URL" },
      { key: "colorFrom", label: "Card Gradient From", type: "text", hint: "#134E4A" },
      { key: "colorTo", label: "Card Gradient To", type: "text", hint: "#2DD4BF" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  questions: {
    label: "Quiz Questions", icon: "❓", collection: "questions",
    listColumns: ["question", "category", "coins", "active"],
    fields: [
      idField,
      { key: "question", label: "Question", type: "textarea", required: true, max: 240 },
      { key: "options", label: "Answer Options", type: "list", required: true, hint: "One option per line (2–6 options)" },
      { key: "correctAnswer", label: "Correct Answer", type: "text", required: true, hint: "Must exactly match one option" },
      { key: "category", label: "Category", type: "select", options: "dynamic:quizcategories", required: true },
      { key: "coins", label: "Reward Coins", type: "number", min: 0, default: 10 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  spinprizes: {
    label: "Spin Prizes", icon: "🎡", collection: "spinprizes",
    listColumns: ["label", "type", "value", "code", "order", "active"],
    fields: [
      idField,
      { key: "label", label: "Wheel Label", type: "text", required: true, max: 30 },
      { key: "type", label: "Prize Type", type: "select", options: PRIZE_TYPES, required: true },
      { key: "value", label: "Coin Value", type: "number", min: 0, default: 0, hint: "Only for type=coins" },
      { key: "code", label: "Coupon Code", type: "text", hint: "Only for type=coupon" },
      { key: "img", label: "Segment Icon URL", type: "text", hint: "https:// image URL shown on the wheel" },
      { key: "imageUrl", label: "Segment Icon (upload)", type: "image", folder: "spin", hint: "Overrides Icon URL" },
      { key: "weight", label: "Win Weight", type: "number", min: 0, default: 1, hint: "Higher = more likely" },
      { key: "order", label: "Wheel Position", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (on wheel)", type: "boolean", default: true },
    ],
  },

  videosections: {
    label: "Video Sections", icon: "🎬", collection: "videosections",
    listColumns: ["title", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Section Title", type: "text", required: true, max: 60, hint: "Trendy / Educational / Travel…" },
      { key: "videos", label: "Videos", type: "videolist", modes: VIDEO_MODES },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  earningtasks: {
    label: "Earning Tasks", icon: "🪙", collection: "earningtasks",
    listColumns: ["title", "reward", "action", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 50 },
      { key: "desc", label: "Description", type: "textarea", required: true, max: 140 },
      { key: "reward", label: "Reward Label", type: "text", required: true, hint: "+50" },
      { key: "action", label: "Action Key", type: "text", required: true, hint: "videos / games / feedback / invite / daily / social / profile" },
      { key: "icon", label: "Icon URL", type: "text", hint: "https:// image URL" },
      { key: "imageUrl", label: "Icon (upload)", type: "image", folder: "earning", hint: "Overrides Icon URL" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },
  ads: {
    label: "Ads & Promotions", icon: "📣", collection: "ads",
    listColumns: ["title", "placement", "cta", "order", "active"],
    fields: [
      idField,
      { key: "placement", label: "Placement", type: "select", options: ["home-refer-earn", "home-ttt", "home-inline"], required: true, hint: "Where in the app this promo shows" },
      { key: "badge", label: "Badge Text", type: "text", hint: "FEATURED" },
      { key: "title", label: "Title", type: "text", max: 60 },
      { key: "subtitle", label: "Subtitle", type: "text", max: 100 },
      { key: "cta", label: "Button Label", type: "text", hint: "PLAY NOW" },
      { key: "action", label: "Action", type: "text", hint: "screen id (tictactoe / referral) or https:// link" },
      { key: "imageUrl", label: "Banner Image", type: "image", folder: "ads", hint: "Full-bleed banner image" },
      { key: "order", label: "Priority (lowest first)", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active", type: "boolean", default: true },
    ],
  },

  arenas: {
    label: "Featured Arenas", icon: "🏟", collection: "arenas",
    listColumns: ["title", "badgeText", "players", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Arena Title", type: "text", required: true, max: 40 },
      { key: "imageUrl", label: "Arena Image", type: "image", folder: "khokho" },
      { key: "players", label: "Players Label", type: "text", hint: "1,240" },
      { key: "badgeText", label: "Badge Text", type: "text", hint: "HOT QUIZ / RAPID QUIZ / LIVE" },
      { key: "badgeIcon", label: "Badge Icon", type: "select", options: ["fire", "lightning-bolt", "circle-medium", "star", "trophy"] },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
      { key: "questions", label: "Questions", type: "objectlist", item: [
        { key: "question", label: "Question", type: "text", required: true },
        { key: "options", label: "Options", type: "list", required: true, hint: "one per line, 2-6" },
        { key: "correctAnswer", label: "Correct Answer", type: "text", required: true, hint: "must match one option" },
      ] },
    ],
  },

  notifications: {
    label: "Notifications", icon: "🔔", collection: "notifications",
    listColumns: ["title", "type", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 80 },
      { key: "body", label: "Message", type: "textarea", required: true, max: 240 },
      { key: "type", label: "Type", type: "select", options: ["info", "promo", "update", "warning"], default: "info" },
      { key: "action", label: "Tap Action", type: "text", hint: "screen id or https:// link (optional)" },
      { key: "order", label: "Priority (lowest first)", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (visible in app)", type: "boolean", default: true },
    ],
  },

  pages: {
    label: "CMS Pages", icon: "📄", collection: "pages",
    listColumns: ["title", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Page Title", type: "text", required: true, max: 60 },
      { key: "sections", label: "Sections", type: "objectlist", item: [
        { key: "title", label: "Section Title", type: "text" },
        { key: "content", label: "Content", type: "textarea" },
        { key: "icon", label: "Icon", type: "select", options: ["Database", "Info", "Lock", "UserCheck", "Shield"] },
        { key: "color", label: "Accent Colour", type: "text" },
      ] },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  winners: {
    label: "Winners", icon: "🏆", collection: "winners",
    listColumns: ["name", "prize", "order", "active"],
    fields: [
      idField,
      { key: "name", label: "Name", type: "text", required: true, max: 40 },
      { key: "prize", label: "Prize Label", type: "text", required: true, max: 30, hint: "₹500" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  quickearn: {
    label: "Quick Earn Cards", icon: "⚡", collection: "quickearn",
    listColumns: ["screenName", "order", "active"],
    fields: [
      idField,
      { key: "imageUrl", label: "Card Image", type: "image", folder: "quickearn", hint: "Full-bleed card image" },
      { key: "screenName", label: "Opens Screen", type: "select", options: ["feedback", "tasks", "video", "referral"], required: true },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  trendingtasks: {
    label: "Trendy Tasks", icon: "🔥", collection: "trendingtasks",
    listColumns: ["title", "badge", "points", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 40, hint: "Use \\n for a line break" },
      { key: "subtitle", label: "Subtitle / Description", type: "textarea", max: 100 },
      { key: "imageUrl", label: "Icon Image", type: "image", folder: "trendingtasks", hint: "Small square icon" },
      { key: "points", label: "Reward Coins", type: "number", min: 0, default: 0 },
      { key: "time", label: "Time Label", type: "text", hint: "2 min" },
      { key: "badge", label: "Badge", type: "select", options: ["HOT", "NEW", "LUCKY"], default: "HOT" },
      { key: "background", label: "Card Background", type: "background", folder: "trendingtasks", hint: "Leave blank to use the default purple gradient" },
      { key: "titleColor", label: "Title Color", type: "color", hint: "Leave blank for white" },
      { key: "subtitleColor", label: "Subtitle / Time / Reward Text Color", type: "color", hint: "Leave blank for white" },
      { key: "buttonTextColor", label: "Button Text Color", type: "color", hint: "Leave blank for white" },
      { key: "buttonText", label: "Button Text", type: "text", default: "Start Mission" },
      { key: "route", label: "Navigation / Action", type: "text", required: true,
        hint: "Screen id (referral, feedback, aiquiz, snakegame, tasks, spin, video, …) or an https:// link" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0, hint: "Drag rows in the list above to reorder" },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  explorecards: {
    label: "Recommended Cards", icon: "🎮", collection: "explorecards",
    listColumns: ["screenName", "size", "order", "active"],
    fields: [
      idField,
      { key: "imageUrl", label: "Card Image", type: "image", folder: "explorecards", hint: "Full-bleed game card" },
      { key: "screenName", label: "Opens Screen", type: "select", options: ["spin", "slidingpuzzle", "aiquiz", "snakegame"], required: true },
      { key: "size", label: "Card Size", type: "select", options: ["short", "tall"], default: "short" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  homecategories: {
    label: "Explore Categories", icon: "🧭", collection: "homecategories",
    listColumns: ["title", "hint", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 30 },
      { key: "hint", label: "Subtitle", type: "text", max: 40, hint: "Watch & earn" },
      { key: "imageUrl", label: "Icon Image", type: "image", folder: "homecategories", hint: "Square icon" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  bonusladdertiers: {
    label: "Bonus Ladder Tiers", icon: "🪜", collection: "bonusladdertiers",
    listColumns: ["label", "coins", "threshold", "order", "active"],
    fields: [
      idField,
      { key: "label", label: "Tier Name", type: "text", required: true, max: 20, hint: "Bronze / Silver / Gold" },
      { key: "title", label: "Internal Title (claim key)", type: "text", required: true, hint: "Stable unique name used to track claims — do not rename after launch" },
      { key: "coins", label: "Reward Coins", type: "number", min: 0, default: 0 },
      { key: "threshold", label: "Goal Fraction (0-1)", type: "number", min: 0, max: 1, hint: "0.2 = 20% of daily goal" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  /* ------------------------------- Wallet ------------------------------- */
  wallet_earnmore: {
    label: "Earn More Cards", icon: "🪙", collection: "wallet_earnmore",
    listColumns: ["title", "rewardText", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 40 },
      { key: "subtitle", label: "Subtitle", type: "text", max: 60 },
      { key: "rewardText", label: "Reward Text", type: "text", required: true, hint: "+20 coins" },
      { key: "progressLabel", label: "Progress Value (label)", type: "text", hint: "3 / 5 — leave blank to hide the progress row" },
      { key: "progressFill", label: "Progress Bar Fill (0–1)", type: "number", min: 0, max: 1, step: 0.05, hint: "0.6 = 60% filled" },
      { key: "icon", label: "Icon URL", type: "text", hint: "https:// small icon image" },
      { key: "imageUrl", label: "Icon (upload)", type: "image", folder: "wallet_earnmore", hint: "Overrides Icon URL" },
      { key: "background", label: "Card Background", type: "background", hint: "Leave blank for the default lavender card" },
      { key: "titleColor", label: "Title Color", type: "color" },
      { key: "bodyTextColor", label: "Subtitle / Reward / Progress Text Color", type: "color" },
      { key: "borderRadius", label: "Border Radius (px)", type: "number", min: 0, hint: "Leave blank for the default (20px)" },
      { key: "action", label: "Navigation / Action", type: "text", required: true,
        hint: "Screen id (video, tasks, spin, referral, …) or an https:// link" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0, hint: "Drag rows in the list above to reorder" },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  /* ------------------------------ Kho Kho ------------------------------ */
  khokho_rules: {
    label: "Kho Kho Rules", icon: "📜", collection: "khokho_rules",
    listColumns: ["title", "icon", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 60 },
      { key: "text", label: "Text", type: "textarea", required: true, max: 240 },
      { key: "icon", label: "Icon", type: "select", options: ["Check", "Timer", "Info", "XCircle", "Wifi", "Lock", "ShieldAlert", "Smartphone", "RotateCcw", "Zap", "Shield", "Database", "UserCheck"] },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  khokho_categories: {
    label: "Kho Kho Categories", icon: "🗂", collection: "khokho_categories",
    listColumns: ["name", "icon", "color", "order", "active"],
    fields: [
      idField,
      { key: "name", label: "Name", type: "text", required: true, max: 40 },
      { key: "icon", label: "Icon", type: "text", hint: "Icon name (earth / cash / flask)" },
      { key: "color", label: "Color", type: "text", hint: "#7C3AED" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  khokho_questions: {
    label: "Kho Kho Questions", icon: "❓", collection: "khokho_questions",
    listColumns: ["question", "category", "featured", "order", "active"],
    fields: [
      idField,
      { key: "category", label: "Category", type: "text", required: true, hint: "matches a khokho_categories name" },
      { key: "question", label: "Question", type: "text", required: true, max: 240 },
      { key: "options", label: "Answer Options", type: "list", required: true, hint: "One option per line (usually 4)" },
      { key: "correctAnswer", label: "Correct Answer", type: "text", required: true, hint: "Must exactly match one option" },
      { key: "featured", label: "Featured", type: "boolean", default: false, hint: "shows in Featured Questions" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  khokho_banners: {
    label: "Kho Kho Banners", icon: "🖼️", collection: "khokho_banners",
    listColumns: ["title", "action", "order", "active"],
    fields: [
      idField,
      { key: "imageUrl", label: "Banner Image", type: "image", folder: "khokho" },
      { key: "title", label: "Title", type: "text", max: 60 },
      { key: "action", label: "Action", type: "text", hint: "screen id or https:// link" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },

  khokho_livesessions: {
    label: "Kho Kho Live Sessions", icon: "🎥", collection: "khokho_livesessions",
    listColumns: ["title", "hostName", "status", "order", "active"],
    fields: [
      idField,
      { key: "title", label: "Title", type: "text", required: true, max: 60 },
      { key: "hostName", label: "Host Name", type: "text" },
      { key: "hostAvatar", label: "Host Avatar", type: "image", folder: "khokho" },
      { key: "scheduledTimestamp", label: "Scheduled Timestamp", type: "number", min: 0, hint: "epoch ms" },
      { key: "prizePool", label: "Prize Pool", type: "text" },
      { key: "maxWatchers", label: "Max Watchers", type: "number", min: 0 },
      { key: "status", label: "Status", type: "select", options: ["scheduled", "live", "ended"], default: "scheduled" },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
      { key: "questions", label: "Questions", type: "objectlist", item: [
        { key: "question", label: "Question", type: "text", required: true },
        { key: "options", label: "Options", type: "list", required: true },
        { key: "correctIdx", label: "Correct option index (0-based)", type: "number" },
        { key: "durationSec", label: "Duration (sec)", type: "number", default: 10 },
      ] },
    ],
  },

  khokho_livequestions: {
    label: "Kho Kho Live Questions", icon: "❔", collection: "khokho_livequestions",
    listColumns: ["question", "sessionId", "order", "active"],
    fields: [
      idField,
      { key: "sessionId", label: "Session ID", type: "text", required: true, hint: "khokho_livesessions id" },
      { key: "question", label: "Question", type: "text", required: true, max: 240 },
      { key: "options", label: "Answer Options", type: "list", required: true, hint: "One option per line (usually 4)" },
      { key: "correctIdx", label: "Correct Answer Index", type: "number", min: 0, hint: "0-based index" },
      { key: "durationSec", label: "Duration (sec)", type: "number", min: 0, default: 10 },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
    ],
  },
};

/* ------------------------- Settings (single documents) ------------------------- */
export const SETTINGS = {
  app: {
    label: "App Config", icon: "⚙️", docId: "app",
    fields: [
      { key: "appName", label: "App Name", type: "text" },
      { key: "maintenanceMode", label: "Maintenance Mode", type: "boolean" },
      { key: "maintenanceMessage", label: "Maintenance Message", type: "textarea", max: 200 },
      { key: "latestVersion", label: "Latest App Version", type: "text", hint: "1.0.0" },
      { key: "minSupportedVersion", label: "Min Supported Version", type: "text", hint: "Older versions see force-update screen" },
      { key: "updateUrl", label: "Update URL", type: "text", hint: "Play Store / App Store link" },
      { key: "supportEmail", label: "Support Email", type: "text" },
    ],
  },
  features: {
    label: "Feature Flags", icon: "🚩", docId: "features",
    fields: [
      { key: "flags", label: "Flags", type: "keyvalue", hint: "e.g. luckySpinEnabled → true / false" },
    ],
  },
  integrations: {
    label: "API Keys & Integrations", icon: "🔑", docId: "integrations",
    fields: [
      { key: "youtubeApiKey", label: "YouTube Data API Key", type: "text", hint: "Used by the Reels/Shorts search" },
      { key: "extra", label: "Other Keys", type: "keyvalue", hint: "name \u2192 value (available to the app as integrations.extra)" },
    ],
  },
  rewards: {
    label: "Reward Rules", icon: "🎁", docId: "rewards",
    fields: [
      { key: "dailyLoginCoins", label: "Daily Login Coins", type: "number", min: 0 },
      { key: "videoWatchCoins", label: "Video Watch Coins (per 30s)", type: "number", min: 0 },
      { key: "referralCoins", label: "Referral Coins", type: "number", min: 0 },
      { key: "quizCorrectCoins", label: "Quiz Correct Answer Coins", type: "number", min: 0 },
      { key: "spinCooldownMinutes", label: "Spin Cooldown (minutes)", type: "number", min: 0 },
      { key: "coinToInrRate", label: "Coins per ₹1", type: "number", min: 0 },
    ],
  },
  watchandearn: {
    label: "Watch & Earn", icon: "▶️", docId: "watchandearn",
    fields: [
      { key: "title", label: "Section Title", type: "text", hint: "Watch & Earn" },
      { key: "videoId", label: "YouTube Video ID", type: "text", hint: "aqz-KE-bpKQ" },
      { key: "rewardCoins", label: "Reward Coins", type: "number", min: 0 },
      { key: "durationLabel", label: "Duration Label", type: "text", hint: "30 sec" },
    ],
  },
  mysterygift: {
    label: "Mystery Gift", icon: "🎁", docId: "mysterygift",
    fields: [
      { key: "earningLabel", label: "Earning Label", type: "text", hint: "Mystery Gift Box" },
      { key: "cooldownHours", label: "Cooldown (hours)", type: "number", min: 0 },
      { key: "rewardMin", label: "Reward Min (× step)", type: "number", min: 0 },
      { key: "rewardMax", label: "Reward Max (× step)", type: "number", min: 0 },
      { key: "rewardStep", label: "Reward Step (coins)", type: "number", min: 1 },
      { key: "imageUrl", label: "Gift Box Image", type: "image", folder: "mysterygift" },
      { key: "lottieUrl", label: "Reward Lottie URL", type: "text", hint: "https:// .lottie / .json" },
    ],
  },
  bonusladder: {
    label: "Bonus Ladder Config", icon: "🪜", docId: "bonusladder",
    fields: [
      { key: "dailyGoal", label: "Daily Goal (coins)", type: "number", min: 1 },
      { key: "coinIconUrl", label: "Coin Icon URL", type: "text", hint: "https://" },
      { key: "trophyIconUrl", label: "Trophy Icon URL", type: "text", hint: "https://" },
    ],
  },

  /* ------------------------------- Wallet -------------------------------- */
  wallet: {
    label: "Wallet Page", icon: "👛", docId: "wallet",
    fields: [
      { key: "cardBackground", label: "Wallet Card Background", type: "background", allowImage: true, folder: "wallet",
        hint: "Image keeps today's background picture; Solid/Gradient replaces it" },
      { key: "cardBorderRadius", label: "Wallet Card Border Radius (px)", type: "number", min: 0, hint: "Leave blank for the default (30px)" },
      { key: "coinToInrRate", label: "Coin → ₹ Conversion Rate", type: "number", min: 0, default: 0.1, hint: "1 coin = ₹ this amount. Drives the balance math AND the conversion text below." },
      { key: "conversionTextTemplate", label: "Coin Conversion Text", type: "text", default: "1 Coin = ₹{rate}", hint: "{rate} is replaced with the value above" },
      { key: "minWithdrawal", label: "Minimum Withdrawal Amount (₹)", type: "number", min: 0, default: 500, required: true, hint: "Drives the progress bar math (real balance ÷ this)" },
      { key: "progressCaption", label: "Progress Bar Label", type: "text", default: "Minimum Withdrawal", hint: "Small caption under the ₹ progress amount" },
      { key: "withdrawalStatusText", label: "Withdrawal Status Text", type: "text", default: "Withdrawals processed within 24 hrs" },
      { key: "redeemButtonText", label: "Redeem Cash Button Text", type: "text", default: "Redeem Cash" },
      { key: "transferButtonText", label: "Transfer UPI Button Text", type: "text", default: "Transfer UPI" },
      { key: "paymentIcons", label: "Payment Method Icons", type: "objectlist", item: [
        { key: "imageUrl", label: "Icon", type: "image", folder: "wallet" },
        { key: "label", label: "Label (admin reference only)", type: "text" },
      ] },
      { key: "bottomInfoText", label: "Bottom Info Text (optional 2nd line)", type: "text" },
    ],
  },

  /* ------------------------------ Kho Kho ------------------------------ */
  khokho_splash: {
    label: "Splash", icon: "✨", docId: "khokho_splash",
    fields: [
      { key: "tagline", label: "Tagline", type: "text", hint: "Play. Win. Earn." },
      { key: "subtitle", label: "Subtitle", type: "text" },
      { key: "durationSec", label: "Duration (sec)", type: "number", min: 0 },
      { key: "logoUrl", label: "Logo URL", type: "text", hint: "https://" },
    ],
  },
  khokho_home: {
    label: "Home", icon: "🏠", docId: "khokho_home",
    fields: [
      { key: "liveQuizLabel", label: "Live Quiz Label", type: "text", hint: "NEXT LIVE QUIZ" },
      { key: "joinButtonText", label: "Join Button Text", type: "text", hint: "JOIN THE ARENA" },
      { key: "featuredTitle", label: "Featured Title", type: "text", hint: "FEATURED ARENAS" },
    ],
  },
  khokho_rewards: {
    label: "Rewards", icon: "🎁", docId: "khokho_rewards",
    fields: [
      { key: "prizePool", label: "Prize Pool", type: "text" },
      { key: "winnerReward", label: "Winner Reward", type: "number", min: 0 },
      { key: "livesPerGame", label: "Lives Per Game", type: "number", min: 0 },
      { key: "shareReward", label: "Share Reward", type: "number", min: 0 },
    ],
  },
  khokho_leaderboard: {
    label: "Leaderboard", icon: "🏆", docId: "khokho_leaderboard",
    fields: [
      { key: "title", label: "Title", type: "text", hint: "Leaderboard" },
      { key: "subtitle", label: "Subtitle", type: "text", hint: "Real-time Arena" },
    ],
  },
  khokho_settings: {
    label: "Settings", icon: "⚙️", docId: "khokho_settings",
    fields: [
      { key: "questionDurationSec", label: "Question Duration (sec)", type: "number", min: 0 },
      { key: "revealDelaySec", label: "Reveal Delay (sec)", type: "number", min: 0 },
      { key: "defaultLives", label: "Default Lives", type: "number", min: 0 },
    ],
  },
};

/* ------------------------------ Validation ------------------------------ */
export function validate(fields, values) {
  const errors = {};
  for (const f of fields) {
    const v = values[f.key];
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
    if (f.required && empty) { errors[f.key] = "Required"; continue; }
    if (empty) continue;
    if (f.pattern && typeof v === "string" && !f.pattern.test(v)) errors[f.key] = "Invalid format (kebab-case only)";
    if (f.max && typeof v === "string" && v.length > f.max) errors[f.key] = `Max ${f.max} characters`;
    if (f.type === "number") {
      const n = Number(v);
      if (Number.isNaN(n)) errors[f.key] = "Must be a number";
      else if (f.min !== undefined && n < f.min) errors[f.key] = `Min ${f.min}`;
      else if (f.max !== undefined && n > f.max) errors[f.key] = `Max ${f.max}`;
    }
    if (f.url && typeof v === "string" && !(v.startsWith("/") || v.startsWith("https://")))
      errors[f.key] = "Must start with / or https://";
  }
  return errors;
}

/** Resolves a video row's effective mode — legacy rows (no videoType, just a videoId) are "youtube". */
export function videoRowType(row) {
  return row.videoType || (row.videoId ? "youtube" : undefined);
}

// Accepts any well-formed http(s) URL — YouTube/Vimeo links, direct mp4/mov/webm
// files, and also CDN/Drive/Dropbox/signed URLs that don't carry a recognizable
// host or file extension. Being permissive here is intentional: an admin's real
// video link should never get silently rejected by an over-eager regex.
const VIDEO_URL_RE = /^https?:\/\/\S+\.\S+/i;

/**
 * Cross-field validation for videosections' per-video rows, keyed by row index.
 * Only flags rows that are genuinely unusable (no source at all) — never blocks
 * a save because of formatting guesses, and one bad row never poisons the rest.
 */
export function validateVideoList(rows = []) {
  const errors = {};
  rows.forEach((row, i) => {
    const type = videoRowType(row);
    if (!type) { errors[i] = "Select a video source (YouTube ID, Upload Video, or Video URL)"; return; }
    if (type === "youtube" && !String(row.videoId || "").trim()) errors[i] = "YouTube ID is required";
    if (type === "upload" && !String(row.uploadedVideoUrl || "").trim()) errors[i] = "Upload a video file";
    if (type === "url") {
      const url = String(row.externalVideoUrl || "").trim();
      if (!url) errors[i] = "Video URL is required";
      else if (!VIDEO_URL_RE.test(url)) errors[i] = "Enter a valid URL starting with http:// or https://";
    }
  });
  return errors;
}
