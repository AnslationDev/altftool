export const STORAGE_KEY = "altftool_ai_memory_capsule_data";
export const CATEGORIES_KEY = "altftool_ai_memory_capsule_categories";

export const DEFAULT_CATEGORIES = [
  "Personal",
  "Travel",
  "Work",
  "Family",
  "Friends",
  "Health",
  "Learning",
  "Milestones",
  "Daily Life",
  "Creative",
];

export const MOODS = [
  { id: "happy", label: "Happy", emoji: "\u{1F60A}", color: "#16A34A" },
  { id: "excited", label: "Excited", emoji: "\u{1F929}", color: "#F59E0B" },
  { id: "grateful", label: "Grateful", emoji: "\u{1F64F}", color: "#0EA5E9" },
  { id: "calm", label: "Calm", emoji: "\u{1F60C}", color: "#14B8A6" },
  { id: "nostalgic", label: "Nostalgic", emoji: "\u{1F979}", color: "#8B5CF6" },
  { id: "proud", label: "Proud", emoji: "\u{1F4AA}", color: "#F97316" },
  { id: "sad", label: "Sad", emoji: "\u{1F622}", color: "#6366F1" },
  { id: "anxious", label: "Anxious", emoji: "\u{1F630}", color: "#EF4444" },
  { id: "neutral", label: "Neutral", emoji: "\u{1F610}", color: "#6B7280" },
  { id: "inspired", label: "Inspired", emoji: "\u2728", color: "#A855F7" },
];

export const INTENSITY_LEVELS = [
  { id: 1, label: "Faint", width: "20%" },
  { id: 2, label: "Mild", width: "40%" },
  { id: 3, label: "Moderate", width: "60%" },
  { id: 4, label: "Strong", width: "80%" },
  { id: 5, label: "Intense", width: "100%" },
];

export const SENTIMENT_WORDS = {
  positive: [
    "happy","joy","love","amazing","wonderful","beautiful","great",
    "fantastic","awesome","perfect","delighted","thrilled","blessed",
    "grateful","peaceful","calm","serene","exciting","celebrate",
    "accomplish","success","proud","smile","laugh","fun","enjoy",
    "best","glad","hope","inspire","kind","generous","warm",
    "bright","sunny","cheerful","blissful","euphoric","thankful",
    "radiant","vibrant","lively","energetic","creative",
  ],
  negative: [
    "sad","angry","hate","terrible","horrible","awful","bad",
    "miserable","heartbroken","devastated","frustrated","annoyed",
    "disappointed","worried","anxious","stressed","scared","afraid",
    "lonely","lost","confused","pain","hurt","crying","fear",
    "regret","guilty","ashamed","helpless","hopeless","exhausted",
    "overwhelmed","broken","shattered","ruined","failed","defeated",
  ],
  intensifiers: [
    "very","extremely","incredibly","absolutely","totally","completely",
    "really","so","utterly","deeply","profoundly","immensely",
  ],
  diminishers: [
    "slightly","barely","hardly","somewhat","a bit","a little",
    "kind of","sort of","mildly","faintly",
  ],
};

export const TIME_PERIODS = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
];
