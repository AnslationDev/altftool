/**
 * LinkedIn Post Prompt Builder.
 *
 * Sizes a hook / story / takeaway post to a target character count inside
 * LinkedIn's limits, then writes the drafting prompt with those character
 * budgets and the see-more fold rule embedded.
 */

/** LinkedIn's hard character limit for a feed post (not an article). */
export const LINKEDIN_POST_MAX_CHARS = 3000;

/**
 * The feed truncates a post behind "…see more" after roughly 210 characters
 * on desktop and roughly 140 on mobile. The hook must earn the click within
 * the mobile fold, so 140 is the governing number here.
 */
export const SEE_MORE_FOLD_DESKTOP_CHARS = 210;
export const SEE_MORE_FOLD_MOBILE_CHARS = 140;

/** Common practitioner range for hashtags on a LinkedIn post. */
export const HASHTAG_MIN = 3;
export const HASHTAG_MAX = 5;

/**
 * Ordinary English averages about five letters per word plus a space,
 * so ~6 characters per word when converting character budgets to words.
 */
export const AVERAGE_CHARS_PER_WORD = 6;

/**
 * Mean silent reading rate for English non-fiction, 238 words per minute
 * (Brysbaert, 2019, meta-analysis of 190 reading-rate studies).
 */
export const READING_WORDS_PER_MINUTE = 238;

/** Block sizing rules of thumb, in characters. */
export const HOOK_SHARE = 0.15;
export const MIN_HOOK_CHARS = 60;
export const TAKEAWAY_SHARE = 0.18;
export const MIN_TAKEAWAY_CHARS = 80;
export const MIN_STORY_CHARS = 40;

/** About four characters per token for ordinary English prose. */
export const AVERAGE_CHARS_PER_TOKEN = 4;

export const LIMITS = {
  targetChars: { min: 200, max: LINKEDIN_POST_MAX_CHARS },
};

export const HOOK_STYLES = [
  {
    id: "result",
    label: "Specific result — lead with a number",
    directive:
      "Open with the concrete outcome and the timeframe (a real figure, not a rounded boast). No context before the number.",
  },
  {
    id: "contrarian",
    label: "Contrarian — challenge the common advice",
    directive:
      "State the widely-given advice in half a sentence, then contradict it flatly. The disagreement must be one the story actually supports.",
  },
  {
    id: "confession",
    label: "Confession — admit the mistake",
    directive:
      "Open with the mistake in first person, past tense, no softening. The cost of the mistake appears within the fold.",
  },
  {
    id: "question",
    label: "Question — name the reader's dilemma",
    directive:
      "Ask the exact question the target reader is already asking themselves. It must be answerable by the takeaway, not rhetorical.",
  },
  {
    id: "direct",
    label: "Direct address — call out who this is for",
    directive:
      "First line names the reader ('If you manage a team of engineers…') so everyone else scrolls past and the right people stop.",
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
 * Allocate a target character count across hook, story and takeaway.
 * @returns {{error:string}|object}
 */
export function planLinkedInPost({ targetChars } = {}) {
  const target = toInt(targetChars);
  if (Number.isNaN(target)) {
    return { error: "Enter the target post length in characters." };
  }
  if (target < LIMITS.targetChars.min || target > LIMITS.targetChars.max) {
    return {
      error: `Post length must be between ${LIMITS.targetChars.min} and ${LIMITS.targetChars.max} characters (LinkedIn's post limit is ${LINKEDIN_POST_MAX_CHARS}).`,
    };
  }

  // The hook must fit inside the mobile fold whatever the share works out to.
  const hook = Math.max(
    MIN_HOOK_CHARS,
    Math.min(SEE_MORE_FOLD_MOBILE_CHARS, Math.round(target * HOOK_SHARE)),
  );
  const takeaway = Math.max(MIN_TAKEAWAY_CHARS, Math.round(target * TAKEAWAY_SHARE));
  const story = target - hook - takeaway;

  if (story < MIN_STORY_CHARS) {
    return {
      error: `Only ${Math.max(0, story)} characters remain for the story after the hook and takeaway. Raise the target length.`,
    };
  }

  const approxWords = Math.round(target / AVERAGE_CHARS_PER_WORD);
  return {
    target,
    hook,
    story,
    takeaway,
    approxWords,
    readingSeconds: Math.max(1, Math.round((approxWords / READING_WORDS_PER_MINUTE) * 60)),
    charsLeftOfLimit: LINKEDIN_POST_MAX_CHARS - target,
    warnings:
      target > 2000
        ? [
            "Posts over ~2,000 characters are a real read in the feed — every paragraph has to re-earn attention. Consider trimming.",
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
 * Write the LinkedIn drafting prompt, embedding the character budgets.
 * @returns {{error:string}|{text:string, plan:object}}
 */
export function buildLinkedInPrompt({
  topic,
  audience,
  hookStyleId,
  takeawayGoal,
  notes,
  plan,
} = {}) {
  if (!plan || plan.error) return { error: plan?.error || "Set a valid character budget first." };
  const style = getHookStyle(hookStyleId);
  if (!style) return { error: "Choose a hook style." };
  const subject = typeof topic === "string" && topic.trim() ? topic.trim() : "";
  if (!subject) return { error: "Describe the story or point the post is about." };
  const reader =
    typeof audience === "string" && audience.trim() ? audience.trim() : "professionals in my field";
  const goal = typeof takeawayGoal === "string" ? takeawayGoal.trim() : "";
  const extra = typeof notes === "string" ? notes.trim() : "";

  const lines = [
    "Write a LinkedIn post. Follow every character budget below exactly.",
    "",
    `WHAT THE POST IS ABOUT: ${subject}`,
    `WHO SHOULD STOP SCROLLING: ${reader}`,
    "",
    `STRUCTURE — total at most ${plan.target} characters (LinkedIn caps posts at ${LINKEDIN_POST_MAX_CHARS}):`,
    `1. HOOK — first ${plan.hook} characters. ${style.label.split("—")[0].trim()} style: ${style.directive} The feed folds the post behind "…see more" at about ${SEE_MORE_FOLD_MOBILE_CHARS} characters on mobile, so the hook must work standing alone.`,
    `2. STORY — about ${plan.story} characters. One concrete situation with a visible turn: what was tried, what broke or worked, and one detail only someone who was there would know. Paragraphs of 1-2 sentences with a blank line between them.`,
    `3. TAKEAWAY — about ${plan.takeaway} characters. ${goal ? `The reader should walk away with: ${goal}.` : "State the transferable lesson as an instruction the reader can apply this week."} End with one question that invites replies from the target reader, not a generic "Thoughts?".`,
    "",
    "RULES:",
    `- ${HASHTAG_MIN}-${HASHTAG_MAX} hashtags at the very end, all specific to the topic; no #motivation-grade filler.`,
    "- No links in the body (mention any resource in words; a link can go in the first comment).",
    "- First person, plain English, no corporate phrasing ('thrilled to announce', 'humbled').",
    "- Do not invent numbers, clients or events — write [detail needed] where a real fact must be inserted.",
    "- No engagement bait ('Like if you agree', 'Follow me for more').",
  ];
  if (extra) lines.push(`- ${extra}`);

  const text = lines.join("\n");
  return { text, plan, style, ...measureText(text) };
}
