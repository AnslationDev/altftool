const seo = {
  title: "YouTube Tag Organizer: Dedupe & Fit 500 Chars",
  metaDescription:
    "Dedupes pasted tags, groups them broad, specific and long-tail, and trims to YouTube's 500-character field, counting commas and quotes like the API does.",
  steps: [
    "Paste your list into 'Your tags (commas or new lines)', add 'Brand / channel terms (kept first)' and pick a Video type.",
    "Watch characters used against the 500-character tags field — commas and the quotes around multi-word tags are counted, as the YouTube Data API does.",
    "Check the mix against the video-type target and the 'Kept tags, in order' list, then click Copy tags.",
  ],
  intro:
    "YouTube Tag Organizer takes a pasted tag list, removes case-insensitive duplicates, groups every tag as brand, broad, specific or long-tail, and trims the set to YouTube's 500-character tags field. It counts characters the way the YouTube Data API does — the commas between tags count, and any tag containing a space is wrapped in quotes that count too — so the number you see is the number the field will actually use.",
  useCases: [
    "Clean up a tag list copied from three old videos before reusing it on a new upload.",
    "Find out how many of your tags are silently being cut because the list is over 500 characters.",
    "Shift a tutorial's tag mix toward phrase tags and a Shorts upload's toward broader single words.",
    "Protect brand and channel tags from being dropped when the list has to be trimmed.",
  ],
  benefits: [
    [
      "Accurate character maths",
      "Commas and the quotes around multi-word tags are counted, not ignored, so nothing gets truncated on upload.",
    ],
    [
      "Duplicates gone",
      "Case-insensitive matching removes \"SEO\", \"seo\" and \"#SEO\" down to one tag.",
    ],
    [
      "Mix you can see",
      "Broad, specific and long-tail counts are compared against a target for the video type you picked.",
    ],
  ],
  faqs: [
    [
      "How many characters can YouTube tags use?",
      "The tags field holds 500 characters in total across all tags. The separating commas count toward that total, and the YouTube Data API wraps any tag containing a space in double quotes, so a two-word tag costs its length plus two.",
    ],
    [
      "How many tags should a YouTube video have?",
      "There is no required number — most channels land somewhere between 8 and 20 within the 500-character budget. What matters more is that the tags describe what the video is actually about; YouTube has said tags play a minimal role in discovery and mainly help with common misspellings.",
    ],
    [
      "Do YouTube tags still help ranking?",
      "Only marginally. YouTube's own creator guidance describes tags as useful mostly for spelling variations of your topic, with the title, description, thumbnail and viewer behaviour carrying far more weight. Treat the tags field as tidy metadata, not a growth lever.",
    ],
    [
      "What is the difference between broad, specific and long-tail tags?",
      "This tool classifies by word count: one word is broad (\"cooking\"), two words is specific (\"pasta recipe\"), three or more is long-tail (\"how to make fresh pasta\"). Long-tail tags match the way people phrase real searches; broad tags cover the general topic area.",
    ],
  ],
};

export default seo;
