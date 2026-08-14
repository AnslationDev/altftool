const seo = {
  title: "Twitter Card Image Generator: PNG Plus Meta Tags",
  metaDescription:
    "Draw a summary (1:1) or large-image (2:1) card at the size X accepts, download the PNG, and copy twitter:card tags trimmed to 70 and 200 characters.",
  steps: [
    "Choose Card type — 'Summary card — 1:1, 800x800' or 'Summary card with large image — 2:1, 1200x600' — then fill Title, Description, Site handle, 'Image URL that will go in twitter:image' and Image alt text; the counters turn red at 70, 200 and 420 characters.",
    "Set Background colour, Text colour and Accent colour, and the canvas redraws live at the exact export size shown above it as 'Card image to export'.",
    "Press Download PNG to save x-card-summary_large_image-1200x600.png, and use Copy result in the Meta tags panel to copy the twitter:card and Open Graph block.",
  ],
  intro:
    "A Twitter (X) card image generator draws the preview image a link needs at exactly the dimensions the platform accepts, and writes the matching twitter:card meta tags. X supports two card types that still render a preview: the summary card, which takes a 1:1 image of at least 144 x 144 px, and summary_large_image, which takes a 2:1 image of at least 300 x 157 px; both cap at 4096 px per edge and 5 MB. Titles are cut at 70 characters and descriptions at 200, so the tool trims them for you and shows the count as you type.",
  useCases: [
    "Making a 1200 x 600 px large-image card for a blog post when you have no designer and no time.",
    "Checking whether an existing 1200 x 628 hero image will render cleanly as a large card or get cropped.",
    "Generating the twitter:card, twitter:title and Open Graph tags to paste into a page head.",
    "Trimming a long headline to the 70 characters X will actually display before it truncates.",
  ],
  benefits: [
    [
      "Correct size by construction",
      "The canvas is created at the platform's recommended pixel size, so the export never needs resizing.",
    ],
    [
      "Limits enforced live",
      "Character counters for title, description and alt text turn red the moment X would cut the text.",
    ],
    [
      "Nothing leaves the browser",
      "The image is drawn and downloaded locally — no upload, no account, no watermark.",
    ],
  ],
  faqs: [
    [
      "What size should a Twitter card image be?",
      "For summary_large_image use a 2:1 image; 1200 x 600 px is exact and the widely used 1200 x 628 also renders fine. The minimum is 300 x 157 px. For the plain summary card use a 1:1 image, minimum 144 x 144 px, with 800 x 800 a safe choice. Both types cap at 4096 px on either edge and 5 MB, and accept JPG, PNG, WEBP and GIF.",
    ],
    [
      "How long can a twitter:title be?",
      "70 characters. Anything longer is truncated in the rendered card, so put the important words first. The twitter:description field allows 200 characters and twitter:image:alt allows 420.",
    ],
    [
      "Why is my card not showing on X?",
      "The usual causes are a missing or non-absolute twitter:image URL, an image below the minimum size, an image over 5 MB, a page that blocks the crawler in robots.txt, or a cached old version of the card. X caches card data, so a link shared before you fixed the tags can keep showing the old preview for some time.",
    ],
    [
      "Do I still need Open Graph tags if I have twitter:card tags?",
      "Yes, keep both. X falls back to og:title, og:description and og:image when the matching twitter:* tag is absent, and other platforms such as LinkedIn, Slack and WhatsApp read Open Graph only. Note the attribute differs: twitter:* tags use name= while og:* tags use property=.",
    ],
  ],
};

export default seo;
