const seo = {
  title: "Tweet Screenshot Styler: 1080px SVG Quote Cards",
  metaDescription:
    "Typeset your own post as a quote card at 1080x1080, 1080x1350, 1080x1920 or 1200x675 and download it as SVG. Counts truncate like X: 1,299 shows 1.2K.",
  steps: [
    "Paste the post text, then fill Display name, Handle, Post date and the Replies, Reposts and Likes counts.",
    "Choose an Export size: Square post 1080 x 1080, Story / Reel 1080 x 1920 or Link card 1200 x 675.",
    "Body type auto-sizes to fit the card; press SVG to download quote-card-square.svg, or Copy result for the text.",
  ],
  intro:
    "Tweet Screenshot Styler typesets a post you have written into a quote graphic at real platform export sizes — 1080 × 1080 and 1080 × 1350 for Instagram feed, 1080 × 1920 for stories and reels, and 1200 × 675 for a summary-large-image link card. It wraps the text, picks the largest type size that still fits the space between the header and the footer, and renders engagement counts the way X does, truncating rather than rounding so 1,299 shows as 1.2K. Everything is drawn in the browser and downloads as a vector SVG.",
  useCases: [
    "Turn a post that did well into a carousel slide without a blurry phone screenshot.",
    "Produce the same quote at square, portrait and story sizes for one campaign.",
    "Show a customer quote on a landing page with type that stays sharp at any scale.",
    "Check how a 280-character post reflows before you commit to the design.",
  ],
  benefits: [
    ["Type that fits", "The body size is chosen automatically as the largest that still fits the card, so nothing overflows."],
    ["Real export sizes", "Presets match published Instagram feed, story and link-card dimensions rather than approximations."],
    ["Vector output", "Downloads as SVG, so it stays crisp on retina screens and can be re-coloured later."],
  ],
  faqs: [
    [
      "What size should a quote graphic be for Instagram?",
      "1080 × 1080 pixels for a square feed post and 1080 × 1350 for the taller portrait crop, which occupies more screen and generally holds attention longer. Stories and reels use 1080 × 1920, and a link preview card is 1200 × 675 at the 1.91:1 ratio.",
    ],
    [
      "How many characters can an X post have?",
      "280 characters on a free account and up to 25,000 for X Premium subscribers. Links count as a fixed 23 characters regardless of their real length, and images and quoted posts do not consume characters at all.",
    ],
    [
      "Why does X show 1.2K instead of 1.3K for 1,299 likes?",
      "Because the count is truncated to one decimal place rather than rounded, so anything from 1,200 to 1,299 displays as 1.2K. This tool copies that behaviour so a rebuilt graphic matches the original screenshot.",
    ],
    [
      "Can I make a graphic from someone else's post?",
      "Technically yes, but the words remain theirs. Credit the author visibly, do not alter the wording, and check the platform's brand guidelines before reproducing official logos or interface elements in paid marketing — several platforms restrict that use.",
    ],
  ],
};

export default seo;
