const seo = {
  title: "Social Alt Text Writer: LinkedIn & X Limits",
  metaDescription:
    "Scores a draft against the platform field limit and the 125-character screen reader guideline, flagging \"image of\", file names, hashtags and emoji.",
  steps: [
    "Choose Where the image will be posted and paste your draft into Your alt text — LinkedIn caps at 120 characters and X at 1,000.",
    "Read the Alt text score out of 100 with the flags for \"image of\" openers, leftover file names, hashtags and emoji; the score updates as you type.",
    "Press Copy alt text, or fill Main subject, What they are doing and Where it happens to have a first sentence assembled for you.",
  ],
  intro:
    "Social Alt Text Writer scores a draft image description against the platform's own field limit and the long-standing 125-character screen reader guideline, then names each thing that would make it awkward to listen to. It flags redundant openers like \"image of\", leftover file names, hashtags, all-caps runs, emoji pile-ups and keyword repetition, and it can assemble a first draft from the subject, the action, the setting and any words printed in the picture. WCAG 2.2 success criterion 1.1.1 requires a text alternative for non-text content; this tool helps you write one that is actually useful.",
  useCases: [
    "Check a LinkedIn image description fits the 120-character field before the post goes out.",
    "Rewrite alt text that still says \"IMG_2043.jpg\" after a bulk upload.",
    "Turn a campaign brief into a usable description when you cannot see the image yourself.",
    "Strip hashtags and emoji out of alt text that was pasted in from the caption.",
  ],
  benefits: [
    ["Platform-aware limits", "Checks against the published field limit where one exists and the 125-character guideline where it does not."],
    ["Named problems, named fixes", "Every flag says what is wrong and what to change, rather than giving a bare score."],
    ["Draft assembler", "Builds a first sentence from subject, action, setting and on-image text so you are never starting from a blank field."],
  ],
  faqs: [
    [
      "How long should alt text be?",
      "Keep it under about 125 characters. That figure is a working guideline rather than a WCAG rule — it comes from screen readers that historically stopped announcing an alt attribute around that length. If the image genuinely needs more explanation, put the detail in a visible caption or a long description and keep the alt attribute short.",
    ],
    [
      "Should alt text start with \"image of\"?",
      "No. Screen readers already announce that the element is an image, so \"image of a woman cycling\" is heard as \"image, image of a woman cycling\". Lead with the subject instead. The one exception is when the medium matters — \"Oil painting of...\" or \"Pencil sketch of...\" tells the listener something real.",
    ],
    [
      "What is the alt text character limit on each platform?",
      "X accepts up to 1,000 characters in its image description field and LinkedIn caps alt text at 120 characters. Instagram and Facebook do not publish a figure for custom alt text, so the 125-character guideline is the safer target on both.",
    ],
    [
      "Do decorative images need alt text?",
      "No — a purely decorative image should carry an empty alt attribute (alt=\"\") so screen readers skip it entirely. Describing a background flourish or a divider line just adds noise. On social platforms, leaving the field blank on a decorative graphic has the same effect.",
    ],
  ],
};

export default seo;
