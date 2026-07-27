const seo = {
  intro:
    "Emoji density is the number of emoji measured against the words around them, and it matters because a screen reader announces each emoji by its Unicode name in the position it appears — so a caption reading 'we just 🚀 shipped it' is heard as 'we just rocket shipped it'. This checker counts emoji as whole grapheme clusters (a flag or a family sequence counts as one, not four), reports emoji per 100 words, and flags the four placements that cause trouble: long runs, emoji inside a sentence, an emoji opening the caption, and the same one repeated. Written for social managers who want emoji to stay decorative rather than load-bearing.",
  useCases: [
    "Check a launch caption before publishing, when enthusiasm has quietly added eleven emoji.",
    "Show a team why an emoji used in place of a word breaks the sentence when it is read aloud.",
    "Compare a caption with and without its emoji to see whether the words still carry the message.",
    "Audit a brand's caption style so accessibility guidance becomes a number rather than an opinion.",
  ],
  benefits: [
    ["Counts what is spoken", "Grapheme-cluster counting, so joined sequences and flags are one emoji each, as announced."],
    ["Placement, not just count", "Separates emoji after a sentence from emoji inside one — the difference that matters."],
    ["Stated thresholds", "Every flag names the limit it crossed, so the result can be argued with rather than trusted blindly."],
  ],
  faqs: [
    [
      "How many emoji should a social caption have?",
      "Keep it to a handful — this tool flags more than five in a single caption. The reason is not taste: each emoji is read out by its name, so a caption with a dozen becomes a spoken list before the message arrives.",
    ],
    [
      "Are emoji bad for accessibility?",
      "Not in themselves. Problems come from placement and volume: emoji inside a sentence interrupt it when announced, long runs read as a string of unrelated words, and an emoji used in place of a word leaves nothing when the name does not fit the sentence. Placing one or two after the sentence is generally fine.",
    ],
    [
      "How does a screen reader read an emoji?",
      "It announces the Unicode name — 'fire', 'red heart', 'party popper'. Skin-tone modifiers are announced too, as in 'thumbs up medium-dark skin tone', and joined sequences like a family emoji are announced as several words. Exact wording varies between screen readers and platforms.",
    ],
    [
      "Should the emoji go at the start or the end of a caption?",
      "The end. An emoji at the start is the first thing announced and the first thing shown in a truncated feed preview, so it spends the most valuable position on a picture name instead of your point.",
    ],
  ],
};

export default seo;
