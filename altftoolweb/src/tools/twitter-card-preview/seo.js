const seo = {
  intro:
    "Twitter Card Preview shows how a link will appear as an X (Twitter) card and checks the underlying meta tags against X's Cards markup reference. It applies the documented limits — twitter:card must be summary, summary_large_image, app or player; titles are cut at 70 characters and descriptions at 200; card images must be under 5 MB and no larger than 4096 px on a side. It is for developers, SEO specialists and marketers who want to see the card before a post goes out.",
  useCases: [
    "Checking a blog post's card before publishing, so the headline is not cut mid-word at 70 characters",
    "Debugging why a link shows a small square thumbnail instead of the wide image you expected",
    "Generating a correct set of twitter: and og: meta tags to paste into a page head",
  ],
  benefits: [
    ["Spec-accurate limits", "Title, description, image dimension and file-size checks follow X's published card requirements."],
    ["Open Graph fallbacks shown", "When a twitter: tag is missing the tool reports which og: tag X will use instead."],
    ["Ready-to-paste markup", "One button copies a complete twitter: plus og: meta block with the values properly escaped."],
  ],
  faqs: [
    [
      "What is the character limit for a Twitter card title and description?",
      "70 characters for the title and 200 for the description — X truncates anything longer with an ellipsis. Aim for around 55-60 characters of title so the card reads cleanly on a narrow phone, where fewer characters are shown before wrapping.",
    ],
    [
      "What image size should a Twitter card use?",
      "For summary_large_image, use a 2:1 image at least 300 × 157 px — 1200 × 600 px is the common choice — and keep it under 5 MB. The small summary card crops to a square and needs at least 144 × 144 px. Neither card accepts an image larger than 4096 px on a side.",
    ],
    [
      "Why is my Twitter card not showing an image?",
      "The usual causes are a missing or misspelled twitter:card tag, an image URL that is relative or served over plain HTTP rather than HTTPS, an unsupported format, or an image over the 5 MB limit. This tool flags each of those as a blocking issue rather than a warning.",
    ],
    [
      "Do I still need Open Graph tags if I have Twitter card tags?",
      "Yes, keep both. X falls back to og:title, og:description and og:image when the matching twitter: tag is missing, and other platforms such as LinkedIn, WhatsApp and Slack read Open Graph only. The copy button here outputs both sets together.",
    ],
  ],
};

export default seo;
