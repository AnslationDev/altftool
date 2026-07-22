"use client";

/**
 * Anternet — schema-driven module definitions.
 * Each collection describes its fields once; the generic CollectionManager
 * renders lists, forms and validation from this.
 *
 * Field types: text · textarea · number · boolean · select · tags · list ·
 *              keyvalue · image · objectlist · group
 * select options: array OR "dynamic:quizcategories" (loaded live).
 */

export const TASK_ICONS = ["ArrowRightToLine", "Film", "RefreshCw", "Users", "FileQuestion", "Gift", "Star", "Trophy", "Gamepad2", "Wallet"];
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
      { key: "title", label: "Title", type: "text", required: true, max: 60 },
      { key: "section", label: "Shown In", type: "select", options: ["grid", "daily"], required: true, hint: "grid = Tasks screen cards \u00b7 daily = home Daily Tasks list" },
      { key: "category", label: "Category Label", type: "text", required: true, hint: "Entertainment / Games / Engagement / Social / Daily Tasks / Knowledge / All" },
      { key: "description", label: "Description", type: "textarea", max: 160 },
      { key: "coins", label: "Reward Coins", type: "number", min: 0 },
      { key: "rating", label: "Rating Label", type: "text", hint: "98% (grid) or 4.8 (daily)" },
      { key: "playCount", label: "Play Count Label", type: "text", hint: "84.6K" },
      { key: "heat", label: "Heat (1-3 flames)", type: "number", min: 0, max: 3 },
      { key: "icon", label: "Icon (Lucide name, daily list)", type: "select", options: TASK_ICONS },
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
      { key: "players", label: "Players Label", type: "text", hint: "1,240" },
      { key: "badgeText", label: "Badge Text", type: "text", hint: "HOT QUIZ / RAPID QUIZ / LIVE" },
      { key: "badgeIcon", label: "Badge Icon", type: "select", options: ["fire", "lightning-bolt", "circle-medium", "star", "trophy"] },
      { key: "order", label: "Sort Order", type: "number", min: 0, default: 0 },
      { key: "active", label: "Active (published)", type: "boolean", default: true },
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
