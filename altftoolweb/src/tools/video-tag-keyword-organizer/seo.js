const seo = {
  title: "YouTube Tag Organizer with 500-Character Limit Check",
  metaDescription:
    "Keep channel keywords in named groups, build a per-video tag set, strip duplicates, and see which tags overflow the 500-character field.",
  steps: [
    "Edit the Keyword groups textarea — one group per line as \"Group name: tag, tag, tag\" — then tick the group buttons this video needs.",
    "Set the Character budget (it defaults to the 500-character tags-field limit) — the counter includes the commas between tags, the way the field counts them.",
    "Review \"Tags in this set\" against \"Left out — no room\", then press Copy tags to copy the comma-separated string that fits.",
  ],
  intro:
    "Video Tag Keyword Organizer keeps a channel's keywords in named groups — core, topic, long tail, brand — and builds a per-video tag set from the groups you tick. It removes case-insensitive duplicates, counts characters exactly the way the tags field does (every tag plus the commas between them) and shows which tags will not fit inside the 500-character limit rather than truncating them silently. Aimed at creators and channel managers who reuse the same keyword blocks across dozens of uploads.",
  useCases: [
    "Keep one core keyword block for the channel and add only the topic group that matches each new video.",
    "See how much of the 500-character budget a long-tail phrase costs before you commit to it.",
    "Catch the same keyword typed two ways across groups instead of paying for it twice.",
    "Hand an editor a copy-ready comma-separated tag string that already fits the limit.",
  ],
  benefits: [
    ["Counts like the platform does", "Characters include the separating commas, so the number you see is the number the field will accept."],
    ["Nothing is silently dropped", "Tags that do not fit are listed separately so you can decide what to cut."],
    ["Reusable groups", "Define a keyword block once and apply it to every video in the series."],
  ],
  faqs: [
    [
      "How many characters can YouTube video tags be?",
      "The tags field accepts 500 characters in total, and the commas separating the tags count towards that. That works out to roughly 25 to 35 tags of average length, so the budget runs out faster than most people expect once long-tail phrases are added.",
    ],
    [
      "How many tags should a YouTube video have?",
      "There is no magic number; what matters is that the tags fit inside the 500-character budget and describe the video accurately. A practical set is 10 to 20 tags: a few broad terms, the exact phrase from your title, two or three long-tail variants and any common misspellings.",
    ],
    [
      "Do video tags still matter for ranking?",
      "They are a minor signal. YouTube has said tags play a limited role because the title, description, thumbnail and viewer behaviour carry far more weight — tags mainly help with spellings and phrasings the title cannot include. Do not spend an hour on tags and ten minutes on the title.",
    ],
    [
      "Should I reuse the same tags on every video?",
      "Reusing a small core block is fine and keeps a channel's topic consistent, but every video should also carry tags specific to its own subject. If two videos share nearly all their tags, neither is telling the platform what makes it different.",
    ],
  ],
};

export default seo;
