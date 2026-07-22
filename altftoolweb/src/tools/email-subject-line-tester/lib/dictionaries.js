// Deterministic word/pattern lists driving every score in scoringEngine.js.
// Nothing here is randomised — the same subject line always produces the same
// matches, which is what makes the analyzer's output reproducible.

export const SPAM_WORDS = [
  "free", "100% free", "act now", "apply now", "buy now", "order now",
  "call now", "click here", "click below", "don't delete", "don't hesitate",
  "urgent", "act immediately", "amazing", "incredible deal", "cash bonus",
  "cash back", "cashback", "congratulations", "you've been selected",
  "winner", "you won", "prize", "risk free", "no risk", "no cost",
  "no obligation", "no catch", "guarantee", "guaranteed", "satisfaction guaranteed",
  "money back", "refund", "credit card", "no credit check", "eliminate debt",
  "get out of debt", "consolidate debt", "double your", "extra income",
  "earn extra cash", "work from home", "be your own boss", "make money",
  "additional income", "cancel at any time", "limited time", "while supplies last",
  "act fast", "hurry", "don't miss out", "one time", "once in a lifetime",
  "exclusive deal", "special promotion", "miracle", "breakthrough",
  "lowest price", "best price", "discount", "% off", "save big", "save up to",
  "sale ends", "flash sale", "clearance", "unsubscribe", "opt in", "this isn't spam",
  "dear friend", "dear valued customer", "as seen on", "print out and send",
  "urgent response needed", "important information regarding",
];

export const URGENCY_WORDS = [
  "today only", "ends tonight", "ends today", "last chance", "final hours",
  "final call", "final notice", "hurry", "don't miss", "don't wait",
  "act now", "act fast", "expires", "expiring", "deadline", "limited time",
  "limited spots", "while supplies last", "almost gone", "selling out",
  "closing soon", "last day", "24 hours", "few hours left", "time is running out",
  "before it's too late", "won't last",
];

export const POWER_WORDS = [
  "exclusive", "proven", "secret", "guaranteed", "instantly", "effortless",
  "revolutionary", "essential", "ultimate", "surprising", "unlock", "discover",
  "new", "boost", "save", "easy", "free", "powerful", "unforgettable",
  "irresistible", "remarkable", "extraordinary", "game-changing", "must-have",
  "insider", "confidential", "little-known", "unbelievable", "effective",
  "simple", "fast", "smart", "proven results", "no-brainer",
];

export const PERSONALIZATION_WORDS = [
  "you", "your", "you're", "yours", "you'll", "you've", "you'd",
];

export const PERSONALIZATION_MERGE_TAG_PATTERNS = [
  /\{\{?\s*first[_ ]?name\s*\}?\}/i,
  /\{\{?\s*name\s*\}?\}/i,
  /%\s*first[_ ]?name\s*%/i,
  /%\s*name\s*%/i,
  /\[\s*first[_ ]?name\s*\]/i,
  /\[\s*name\s*\]/i,
];

export const CURIOSITY_WORDS = [
  "secret", "surprising", "you won't believe", "revealed", "why", "how",
  "what if", "the truth about", "nobody tells you", "hidden", "behind the scenes",
  "sneak peek", "what happened when", "here's why", "little known",
];

export const TRUST_WORDS = [
  "verified", "official", "certified", "authentic", "trusted", "secure",
  "confirmed", "guaranteed", "no spam", "privacy", "unsubscribe anytime",
];

// A small deterministic sentiment lexicon — enough to classify the dominant
// emotional register of a short subject line without needing an ML model.
export const POSITIVE_WORDS = [
  "amazing", "awesome", "great", "love", "happy", "excited", "wonderful",
  "best", "delight", "delighted", "joy", "fantastic", "fun", "success",
  "win", "wins", "winning", "celebrate", "celebration", "thrilled", "boost",
  "improve", "improved", "grow", "growth", "unlock", "reward", "rewards",
  "gift", "bonus", "welcome", "congratulations", "thank you", "thanks",
];

export const NEGATIVE_WORDS = [
  "sorry", "problem", "issue", "warning", "alert", "error", "fail", "failed",
  "miss", "missed", "missing you", "lost", "losing", "worried", "concern",
  "risk", "danger", "trouble", "declined", "rejected", "cancel", "cancelled",
  "overdue", "expire", "expired", "suspend", "suspended", "final notice",
];

// Regex covering the common emoji ranges (not every plane, but enough for
// realistic subject-line usage: emoticons, symbols, transport, dingbats).
export const EMOJI_REGEX =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2190}-\u{21FF}\u{2B00}-\u{2BFF}]/gu;

export const EMAIL_STOP_WORDS = new Set([
  "a", "an", "the", "of", "to", "in", "on", "for", "with", "and", "or",
  "is", "are", "at", "by", "your", "you", "it", "this", "that",
]);
