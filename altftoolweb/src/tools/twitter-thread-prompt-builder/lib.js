/**
 * Twitter (X) Thread Prompt Builder.
 *
 * Computes the real per-post character budget for a numbered thread — the
 * 280-character limit minus the "n/total " numbering overhead — and writes
 * the thread prompt with those budgets, a hook style and one CTA embedded.
 */

/**
 * The standard post limit on X for non-premium accounts is 280 characters
 * (doubled from 140 in November 2017). Premium subscribers can post longer,
 * but a thread written to 280 works for every account and reads better.
 */
export const TWEET_MAX_CHARS = 280;

/**
 * X's t.co wrapper makes every link count as a fixed 23 characters against
 * the limit, regardless of the link's real length.
 */
export const TCO_LINK_CHARS = 23;

/** Threads below 3 posts are just posts; beyond 25 completion collapses. */
export const LIMITS = {
  posts: { min: 3, max: 25 },
};

/**
 * Ordinary English averages about five letters per word plus a space,
 * so ~6 characters per word when converting character budgets to words.
 */
export const AVERAGE_CHARS_PER_WORD = 6;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const HOOK_STYLES = [
  {
    id: "payoff",
    label: "Payoff promise — say exactly what the reader gets",
    directive:
      "Post 1 names the concrete outcome of reading to the end ('By post 9 you'll know how to X'). No 'a thread 🧵' filler as the opener.",
  },
  {
    id: "contrarian",
    label: "Contrarian — open against the consensus",
    directive:
      "Post 1 states the consensus in a clause, then flatly disagrees. Post 2 must immediately show the receipts.",
  },
  {
    id: "number",
    label: "Numbered list — N things, one per post",
    directive:
      "Post 1 states the count and the stakes ('7 mistakes that cost me X'). Each body post is one item, self-contained, quotable alone.",
  },
  {
    id: "story",
    label: "Story — open mid-scene",
    directive:
      "Post 1 drops the reader into the most tense moment, past tense, first person. Chronology starts in post 2.",
  },
  {
    id: "question",
    label: "Question — name the dilemma",
    directive:
      "Post 1 asks the exact question the target reader is stuck on and promises the answer by the final post.",
  },
];

function toInt(value) {
  const number = Number(String(value).replace(/,/g, "").trim());
  return Number.isFinite(number) ? Math.round(number) : NaN;
}

export function getHookStyle(hookStyleId) {
  return HOOK_STYLES.find((style) => style.id === hookStyleId) || null;
}

/**
 * Characters consumed by "n/total " numbering at the head of each post,
 * at its widest (the final post, e.g. "12/12 " = 6 characters).
 */
export function numberingOverhead(postCount) {
  const digits = String(postCount).length;
  return digits * 2 + 2; // both numbers at max width + "/" + trailing space
}

/**
 * Compute per-post character budgets for a numbered thread.
 * @returns {{error:string}|object}
 */
export function planThread({ postCount, includeLink } = {}) {
  const posts = toInt(postCount);
  if (Number.isNaN(posts)) return { error: "Enter the number of posts as a whole number." };
  if (posts < LIMITS.posts.min || posts > LIMITS.posts.max) {
    return {
      error: `A thread needs between ${LIMITS.posts.min} and ${LIMITS.posts.max} posts. Below ${LIMITS.posts.min} write a single post instead.`,
    };
  }

  const overhead = numberingOverhead(posts);
  const perPost = TWEET_MAX_CHARS - overhead;
  // The final post carries the CTA; a link there costs a flat 23 characters.
  const finalPostChars = includeLink ? perPost - TCO_LINK_CHARS : perPost;
  const bodyPosts = posts - 2; // minus hook and final post
  const maxThreadChars = perPost * (posts - 1) + finalPostChars;

  return {
    posts,
    overhead,
    perPost,
    finalPostChars,
    bodyPosts,
    maxThreadChars,
    approxMaxWords: Math.round(maxThreadChars / AVERAGE_CHARS_PER_WORD),
    includeLink: Boolean(includeLink),
    warnings:
      posts > 15
        ? [
            `${posts} posts is a long thread — completion drops steeply after ~15 posts. Cut to the strongest points if you can.`,
          ]
        : [],
  };
}

export function measureText(text) {
  if (typeof text !== "string" || text.trim().length === 0) {
    return { characters: 0, words: 0, approxTokens: 0 };
  }
  return {
    characters: text.length,
    words: text.trim().split(/\s+/).length,
    approxTokens: Math.max(1, Math.ceil(text.length / AVERAGE_CHARS_PER_TOKEN)),
  };
}

/**
 * Write the thread prompt, embedding the per-post character budgets.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildThreadPrompt({ topic, audience, hookStyleId, cta, notes, plan } = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid post count first." };
  const style = getHookStyle(hookStyleId);
  if (!style) return { error: "Choose a hook style." };
  const subject = typeof topic === "string" && topic.trim() ? topic.trim() : "";
  if (!subject) return { error: "Enter what the thread teaches or argues." };
  const reader =
    typeof audience === "string" && audience.trim() ? audience.trim() : "people in my field";
  const ctaText = typeof cta === "string" && cta.trim() ? cta.trim() : "";
  if (!ctaText) return { error: "Enter the one CTA for the final post." };
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    `Write a ${plan.posts}-post X (Twitter) thread. Follow every character budget below exactly.`,
    "",
    `TOPIC: ${subject}`,
    `TARGET READER: ${reader}`,
    "",
    "CHARACTER BUDGETS:",
    `- Number every post "n/${plan.posts} " at the start. That numbering costs ${plan.overhead} characters at its widest, leaving ${plan.perPost} of the ${TWEET_MAX_CHARS}-character limit per post. No post may exceed ${plan.perPost} characters of content.`,
  ];
  if (plan.includeLink) {
    lines.push(
      `- The final post contains one link. X counts any link as a flat ${TCO_LINK_CHARS} characters (t.co wrapping), so the final post gets ${plan.finalPostChars} characters of text plus the link.`,
    );
  }
  lines.push(
    "",
    "STRUCTURE:",
    `- Post 1 — HOOK. ${style.label.split("—")[0].trim()} style: ${style.directive}`,
    `- Posts 2-${plan.posts - 1} — BODY (${plan.bodyPosts} posts). One idea per post; each post must be quotable on its own with no pronoun pointing at a previous post. End posts on a reason to tap "show more", not on a completed thought.`,
    `- Post ${plan.posts} — CLOSE. One-line recap of the payoff, then exactly one CTA: ${ctaText}. No second ask.`,
    "",
    "RULES:",
    "- Plain text; at most one hashtag in the whole thread, in the final post, only if genuinely useful.",
    "- No '🧵' as content and no 'thread below'. The numbering already says it is a thread.",
    "- Concrete over abstract: numbers, names and steps, not adjectives.",
    "- Do not invent statistics, dates or events — write [fact needed] where a real detail must be inserted.",
    "- Output each post on its own line, prefixed with its number.",
  );
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, style, ...measureText(text) };
}
