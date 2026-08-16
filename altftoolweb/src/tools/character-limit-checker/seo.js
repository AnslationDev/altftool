const seo = {
  title: "Character Limit Checker: 23 Platform Limits",
  metaDescription:
    "Count text against 23 real limits — X 280, Instagram 2,200, meta description 160 — with links weighted as 23 chars and SMS segment billing.",
  steps: [
    "Type or paste into the 'Your text' box and pick one of the 23 presets from the Platform limit menu, or set a Custom limit of your own.",
    "For X posts, leave 'Count every link as 23 characters' ticked so URLs are billed the way t.co shortening bills them.",
    "Watch the characters-remaining figure and SMS segment breakdown; if you are over, press 'Trim to limit' and then Copy text.",
  ],
  "intro": "Character Limit Checker counts your text against 23 real platform limits — X posts at 280, Instagram captions at 2,200, LinkedIn posts at 3,000, YouTube titles at 100, meta descriptions at 160 and more — and shows exactly how many characters you have left as you type. It also weights links the way X does (every URL counts as 23 characters) and works out SMS segment billing in GSM-7 or UCS-2. Useful for social media managers, SEO writers and anyone drafting copy that has to fit.",
  "useCases": [
    "Trim a meta description to 160 characters so Google does not cut it off mid-sentence.",
    "Check a launch post fits X's 280-character limit after link shortening is applied.",
    "See whether a marketing SMS is billed as one segment or three before you send it to a list."
  ],
  "benefits": [
    [
      "Real platform limits",
      "23 presets covering social, video, SEO, ads and messaging, plus a custom limit field for anything else."
    ],
    [
      "Emoji-safe counting",
      "Shows both raw characters and visible characters, so a two-code-unit emoji never surprises you at the limit."
    ],
    [
      "Trim in one click",
      "Over the limit? Cut the text to fit and copy it without leaving the page."
    ]
  ],
  "faqs": [
    [
      "What is the character limit for an X (Twitter) post?",
      "Standard posts are capped at 280 characters. Every link counts as 23 characters regardless of its real length because X rewrites URLs through t.co, and this tool applies that weighting for you."
    ],
    [
      "How long should a meta description be?",
      "Aim for roughly 150-160 characters. Google truncates on pixel width rather than a hard character count, so keeping the key message in the first 120 characters is the safest approach."
    ],
    [
      "Why do emoji use more than one character?",
      "Most platforms count UTF-16 code units, and many emoji — especially those with skin tones or joined sequences — take two or more units each. The 'visible characters' figure shows the human count so you can see the difference."
    ],
    [
      "How many characters fit in one SMS?",
      "A GSM-7 message fits 160 characters in a single segment, then 153 per segment once it splits. Any character outside the GSM alphabet, including most emoji, switches the message to UCS-2 at 70 characters per segment (67 when split)."
    ]
  ]
};

export default seo;
