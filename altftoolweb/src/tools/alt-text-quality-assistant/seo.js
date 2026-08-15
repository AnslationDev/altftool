const seo = {
  title: "Alt-Text Checker: Purpose-First, W3C-Aligned",
  metaDescription:
    "Classify the image as decorative, informative, functional or complex, then W3C-aligned rules flag empty alt, 'image of', filenames and duplicated text.",
  steps: [
    "Choose the image's purpose in this context — decorative, informative, functional, complex, text-image or unclear — and the current alt state.",
    "Paste the exact alt value, the essential information users need and any nearby visible text or caption, then press Review entered alt.",
    "Read the outcome with its error and review-cue counts and each finding, copy the draft built from your own notes, or download the counts-only report.",
  ],
  intro:
    "The Alt-Text Quality Assistant checks alt text against the thing that actually decides whether it is right — the image's purpose in this exact context — by asking you to classify it as decorative, informative, functional, complex, text-in-image or undecided, record the current alt state (missing, empty or present), and enter the essential information or the control's action. It then runs W3C-aligned rules over what you entered: empty alt on a meaningful image, a generic value like \"image of\", a filename used as alt, alt that duplicates nearby text, a complex image with no longer equivalent, and a word-overlap check against the information you said the image carries. It reviews text and context only — it never looks at the pixels, and a clean result is not a claim of WCAG conformance.",
  useCases: [
    "You are auditing a page before launch and need to decide whether a decorative hero banner should have alt=\"\" or a description",
    "You wrote alt text for a revenue chart and want to check whether a one-line alt can carry it or whether the page needs a longer equivalent in nearby text",
    "You inherited a template where every icon link has alt=\"icon.svg\" and need a defensible list of which ones are errors and which need a human to look",
  ],
  benefits: [
    ["Purpose first, wording second", "The same photo needs different alt in different places, so the review is driven by the six purpose types rather than a generic style checklist."],
    ["Separates errors from judgement calls", "Findings are graded error or review, and the outcome is one of needs-change, needs-human-review, or no configured cue triggered."],
    ["States what it cannot know", "It reports plainly that word overlap misses synonyms, tone and accuracy, and that zero findings does not establish conformance."],
  ],
  faqs: [
    [
      "When should an image have empty alt text?",
      "When it is purely decorative — it adds no information and performs no function that is not already available in text. Use an explicitly empty alt=\"\" rather than omitting the attribute, because a missing attribute leaves screen readers to fall back on the filename. The assistant flags a missing attribute as an error and an empty alt on a meaningful image as an error too.",
    ],
    [
      "How long should alt text be?",
      "WCAG sets no universal character limit. This tool flags alt over 200 characters for review, not as a failure — the question it asks is whether a concise alt plus a longer equivalent nearby would communicate more clearly than one very long string.",
    ],
    [
      "Should alt text start with \"image of\"?",
      "Usually not. Screen readers already announce the image role, so the prefix is redundant; the tool flags it for review rather than as an error, because occasionally the distinction matters — a painting versus a photograph of the same scene, for instance. An alt that is only \"image\" or \"photo of\" with nothing after it is flagged as an error.",
    ],
    [
      "Can a tool tell me whether my alt text is good?",
      "No — and this one says so. It applies rules to the purpose, state and context you enter, and its word-overlap heuristic requires 50% of the meaningful words you listed to appear in the alt (25% for complex images) before it stays quiet. It cannot judge synonyms, accuracy, tone or whether a description makes sense to a real user, and it never inspects the image itself.",
    ],
  ],
};

export default seo;
