const seo = {
  title: "YouTube Title Length & Thumbnail Overlap Tester",
  metaDescription:
    "Measures a title against the 100-character field and the ~60 characters a listing shows, then reports which thumbnail words the title already repeats.",
  steps: [
    "Type the Video title into its box and the words burned into the image into Thumbnail text.",
    "Set Canvas font px, Canvas width and Listing cut chars, which default to 96, 1280 and 60.",
    "Read the status — Clean pairing, Tighten it or Needs rewrite — with Title length, Repeated words, Combined ideas and Screen text px, then press Copy.",
  ],
  intro:
    "The Thumbnail Title Length Tester measures a video title against the 100 character title field and the roughly 60 characters a listing shows before it truncates, then compares the title's content words with the words burned into the thumbnail. It reports what percentage of the thumbnail's wording the title already carries, which words appear only in one place, and whether the thumbnail text is still legible once the image is scaled to the 210 pixel search-result size. Aimed at creators and editors deciding whether a thumbnail is adding a second idea or just echoing the first.",
  useCases: [
    "Trim a 90 character title so the promise still lands inside the first 60 characters shown in search results.",
    "Decide whether the thumbnail should read \"IT SOUNDS BETTER\" instead of repeating the price already stated in the title.",
    "Check that 40px thumbnail text will still be readable when the image renders at 210 pixels wide in a search row.",
    "Compare two packaging drafts and pick the pair that covers the most distinct ideas between title and thumbnail.",
  ],
  benefits: [
    ["Counts duplication, not vibes", "Reports the exact words shared between title and thumbnail after stopwords and plurals are folded."],
    ["Legibility from geometry", "Derives the minimum canvas font size from the smallest display width rather than quoting a rule of thumb."],
    ["Shows the visible title", "Renders the part of the title that survives truncation so you can see what a viewer actually reads."],
  ],
  faqs: [
    [
      "How long can a YouTube video title be?",
      "100 characters is the hard limit of the title field. Practical length is much shorter: desktop search and the suggested-video rail clip titles with an ellipsis at roughly 60 characters, so the hook needs to land well before the limit.",
    ],
    [
      "How many words should thumbnail text have?",
      "Around three to five words. Past that the phrase stops being scannable at the size a thumbnail is actually displayed, and the words compete with the image for the same fraction of a second of attention.",
    ],
    [
      "How big should thumbnail text be on a 1280 x 720 canvas?",
      "At least about 61px. A desktop search-result thumbnail is roughly 210 pixels wide, so canvas text is scaled by 210/1280; to land at the ~10 pixel floor where bold display text is still readable you need 10 x 1280 / 210, which rounds up to 61px.",
    ],
    [
      "Should thumbnail text repeat the video title?",
      "No. The title and the thumbnail are shown together in every listing, so repeating a word spends two slots on one idea. Use the thumbnail for the thing the title cannot say - a result, a face, a number, a contradiction - and this tool reports what share of the thumbnail's words the title has already used.",
    ],
  ],
};

export default seo;
