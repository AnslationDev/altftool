export const DEFAULT_EMAIL = {
  sender: "AltF Tools",
  inbox: "maria@company.com",
  subject: "Your weekly marketing report is ready",
  preview: "See campaign highlights, open-rate trends, and next-step recommendations for this week.",
};

export const PREVIEW_CLIENTS = [
  {
    key: "gmailMobile",
    label: "Gmail Mobile",
    subjectLimit: 38,
    previewLimit: 72,
  },
  {
    key: "gmailDesktop",
    label: "Gmail Desktop",
    subjectLimit: 68,
    previewLimit: 96,
  },
  {
    key: "appleMail",
    label: "Apple Mail",
    subjectLimit: 46,
    previewLimit: 82,
  },
  {
    key: "outlook",
    label: "Outlook",
    subjectLimit: 54,
    previewLimit: 88,
  },
];

const spamWords = [
  "free",
  "guarantee",
  "urgent",
  "winner",
  "cash",
  "limited time",
  "act now",
  "risk-free",
  "click here",
  "100%",
];

const weakWords = [
  "newsletter",
  "update",
  "important",
  "announcement",
  "reminder",
];

export function truncateText(value, limit) {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
}

export function analyzeSubject(subject, preview) {
  const trimmedSubject = subject.trim();
  const trimmedPreview = preview.trim();
  const subjectLength = trimmedSubject.length;
  const previewLength = trimmedPreview.length;
  const wordCount = trimmedSubject ? trimmedSubject.split(/\s+/).length : 0;
  const hasQuestion = trimmedSubject.includes("?");
  const hasNumber = /\d/.test(trimmedSubject);
  const hasPersonalization = /\{.*?\}|\[.*?\]|%.*?%/.test(trimmedSubject);
  const hasEmoji = /[\u{1F300}-\u{1FAFF}]/u.test(trimmedSubject);
  const spamHits = spamWords.filter((word) => trimmedSubject.toLowerCase().includes(word));
  const weakHits = weakWords.filter((word) => trimmedSubject.toLowerCase().includes(word));

  let score = 100;
  if (subjectLength < 30) score -= 10;
  if (subjectLength > 55) score -= 18;
  if (wordCount > 10) score -= 8;
  if (!trimmedPreview) score -= 12;
  else if (previewLength < 40) score -= 8;
  if (previewLength > 95) score -= 8;
  score -= spamHits.length * 9;
  score -= weakHits.length * 3;
  if (hasNumber) score += 5;
  if (hasQuestion) score += 3;
  if (hasPersonalization) score += 4;
  if (hasEmoji) score += 2;

  return {
    score: Math.max(0, Math.min(100, score)),
    subjectLength,
    previewLength,
    wordCount,
    spamHits,
    weakHits,
    hasNumber,
    hasQuestion,
    hasPersonalization,
    hasEmoji,
  };
}

export function scoreLabel(score) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs polish";
  return "Risky";
}

export function createVariants(subject) {
  const base = subject.trim() || DEFAULT_EMAIL.subject;
  const clean = base.replace(/[.!?]+$/g, "");

  return [
    clean,
    `${clean}: what changed this week`,
    `New: ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`,
    `3 quick takeaways from ${clean.charAt(0).toLowerCase()}${clean.slice(1)}`,
    `Can you review ${clean.charAt(0).toLowerCase()}${clean.slice(1)}?`,
  ];
}
