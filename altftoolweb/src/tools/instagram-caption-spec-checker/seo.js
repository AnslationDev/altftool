const seo = {
  title: "Instagram Caption Checker: 2,200 Chars, 30",
  metaDescription:
    "Check a caption against the 2,200-character and 30-hashtag limits, see where the feed cuts it at ~125 characters, and catch duplicate or numeric tags.",
  steps: [
    "Paste your post text into the \"Your caption\" box — nothing is uploaded, the caption stays in your browser.",
    "Read Characters used against the 2,200 cap and the Hashtags row against 30, then press Tidy to strip repeated tags and trailing blank lines.",
    "Check \"What the feed shows\" for the text that lands before the \"... more\" cut at roughly 125 characters, then press Copy caption.",
  ],
  intro:
    "Instagram Caption Spec Checker measures a caption against the platform's published limits — 2,200 characters and 30 hashtags per post — and shows where the feed collapses it behind the \"... more\" link at roughly 125 characters. It also catches the things that silently cost reach: hashtags repeated in different cases (Instagram treats them as the same tag but each still counts towards the 30), all-numeric tags that never become links, URLs that are not clickable in a caption, and trailing blank lines that get stripped on save.",
  useCases: [
    "Confirm a long story-style caption fits inside 2,200 characters before you paste it into the app.",
    "Find the duplicate #Kolkata and #kolkata eating two of your 30 hashtag slots.",
    "Rewrite the opening so the hook lands before the feed truncates the caption.",
    "Check a bulk-scheduled caption for links that will not be clickable once posted.",
  ],
  benefits: [
    ["Real published limits", "Checks the 2,200-character cap and the 30-hashtag cap rather than rules of thumb."],
    ["Shows the fold", "Splits the caption at the truncation point so you can see exactly what a scrolling reader gets."],
    ["One-tap tidy", "Removes repeated hashtags, collapses long blank runs and strips the trailing whitespace Instagram deletes anyway."],
  ],
  faqs: [
    [
      "What is the Instagram caption character limit?",
      "2,200 characters, including spaces, emoji and hashtags. Anything longer is rejected rather than truncated, so a caption pasted from a document has to be cut before it will post. The visible portion in the feed is far shorter — around 125 characters before the \"... more\" link.",
    ],
    [
      "How many hashtags can you use on an Instagram post?",
      "30 per post, counted across the caption and any comments you add. Going over the limit can stop the caption saving at all on some clients. Case does not create a new tag — #Diwali and #diwali are the same hashtag, but each occurrence still uses one of your 30 slots.",
    ],
    [
      "Should hashtags go in the caption or the first comment?",
      "Both count towards the same 30-tag limit and both are indexed, so it is a presentation choice rather than a reach one. Putting a large block in the first comment keeps the caption readable in the feed; keeping a few relevant tags in the caption reads more naturally when the block is short.",
    ],
    [
      "Why are links in my Instagram caption not clickable?",
      "Instagram does not hyperlink URLs written in a caption — they render as plain text a reader would have to retype. Use the link in your bio, a link sticker in stories, or the link option available to some accounts, and reference it in the caption instead of pasting the URL.",
    ],
  ],
};

export default seo;
