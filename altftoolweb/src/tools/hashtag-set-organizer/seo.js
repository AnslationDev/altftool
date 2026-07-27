const seo = {
  intro:
    "The Hashtag Set Organizer turns a pasted pile of hashtags into one deduplicated, platform-legal block and tells you whether it fits the caption field you are posting into. It applies the published caps directly — 30 hashtags and 2,200 caption characters on Instagram, 280 characters on X, 3,000 on LinkedIn, and the rule that YouTube ignores every hashtag on a video once more than 15 are used. It is built for social media managers and creators who keep reusing the same tag lists across platforms and need to know what will actually publish.",
  useCases: [
    "Clean a 60-hashtag research list down to the 30 Instagram will accept, without losing the best tags to duplicates.",
    "Check whether a 280-character X post still has room for three hashtags once the caption is written.",
    "Split one master hashtag list into three rotation sets so the same block is not pasted on every post.",
  ],
  benefits: [
    ["Catches dead hashtags", "Flags numbers-only tags and tags broken by punctuation or emoji, which never become links."],
    ["Counts the whole field", "Adds caption characters and hashtag characters together, because they share one limit."],
    ["Round-robin rotation", "Deals tags across sets so each set gets a mix instead of a slice of the list."],
  ],
  faqs: [
    [
      "How many hashtags can you put on an Instagram post?",
      "30 is the maximum — Instagram will not publish a post whose caption or first comment contains more. Captions themselves cap at 2,200 characters, and the hashtags count toward that same 2,200, so a long caption leaves less room for tags.",
    ],
    [
      "Why do some of my hashtags not turn into links?",
      "A hashtag stops at the first character that is not a letter, digit or underscore, and a tag made only of digits like #2024 never becomes a clickable link on Instagram or X. Spaces, hyphens, full stops and emoji all end the tag early.",
    ],
    [
      "How many hashtags does YouTube allow?",
      "15. Once a video uses more than 15 hashtags anywhere in the title or description, YouTube ignores all of them, not just the extras. The description field itself holds 5,000 characters.",
    ],
    [
      "Do hashtags count toward the character limit on X?",
      "Yes — on X every hashtag character counts against the 280-character post limit, and there is no separate hashtag cap. This tool subtracts your caption first, then shows how many tags still fit.",
    ],
  ],
};

export default seo;
