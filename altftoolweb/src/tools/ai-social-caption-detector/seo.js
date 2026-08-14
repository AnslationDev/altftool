const seo = {
  title: "AI Caption Detector: 9 Style Signals, 0-100 Score",
  metaDescription:
    "Scores a caption 0-100 on nine tells — em dashes, stock hooks, emoji bullets, hashtag padding, even sentence rhythm — with the matched text shown.",
  steps: [
    "Paste the caption into the Caption box and pick a Platform — Any platform, Instagram, LinkedIn or X / Twitter.",
    "Open Signal breakdown to read each of the nine signals with its points out of its maximum and the exact matched text shown as evidence chips.",
    "The AI signal score card gives the 0-100 total with its band, the rows count words, characters, sentences, em dashes, emoji, hashtags (and how many are generic) and sentence-length variation, and Copy report puts the whole scan on the clipboard.",
  ],
  intro:
    "The AI Social Caption Detector scores a social media caption on nine measurable stylistic tells found in unedited language-model output: em dashes, over-used vocabulary such as delve and tapestry, stock hooks like \"stop scrolling\", the \"not just X, it's Y\" construction, emoji bullet layouts, emoji density, hashtag padding, repeated rule-of-three lists and machine-even sentence rhythm. Each signal carries a fixed weight and the total is normalised to a 0-100 score you can see broken down line by line. It is a style check for editors and social managers, not an authorship classifier.",
  useCases: [
    "Reviewing a batch of scheduled captions before they publish, to catch the ones that still sound like the draft the model produced",
    "Training a junior social executive by showing exactly which phrases and layout habits read as generated",
    "Trimming hashtag padding down from twenty generic reach tags to a handful of topical ones",
  ],
  benefits: [
    ["Transparent scoring", "Every point is attributed to a named signal with the exact matched text."],
    ["Nothing is uploaded", "The caption is analysed in your browser, so client copy stays private."],
    ["Platform aware", "Adds Instagram's 30-hashtag cap, LinkedIn hashtag guidance and the 280-character limit on X."],
  ],
  faqs: [
    [
      "Can this prove a caption was written by AI?",
      "No. It measures style conventions, not provenance, and no tool can prove authorship from text alone. A human who writes in short emoji-led lines with em dashes will score high, and a carefully edited model draft will score low, so treat the result as an editing prompt rather than evidence.",
    ],
    [
      "Why are em dashes treated as an AI tell?",
      "Because the em dash (—) is not on a standard phone keyboard, so most people typing a caption on mobile use a hyphen, comma or full stop instead. Models insert em dashes freely, which makes a caption with several of them stand out stylistically — though desktop writers and anyone using autocorrect substitution use them legitimately too.",
    ],
    [
      "How many hashtags should a caption have?",
      "Instagram allows a maximum of 30 hashtags per post, and LinkedIn's creator guidance suggests around three relevant ones. This tool flags padding above 10 hashtags, or three or more generic reach tags such as #viral or #motivation, because those add bulk without describing the post.",
    ],
    [
      "What does the sentence rhythm score mean?",
      "It is the coefficient of variation of sentence lengths — the standard deviation of words per sentence divided by the mean. Below 0.35 the caption's sentences are unusually similar in length, which is a common trait of generated text; human writing normally mixes a three-word line with a twenty-word one.",
    ],
  ],
};

export default seo;
