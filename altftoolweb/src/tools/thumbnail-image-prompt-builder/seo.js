const seo = {
  intro:
    "This builder composes a high-contrast AI thumbnail prompt that reserves a clean, text-free zone for your headline, then computes the typography maths from where the thumbnail actually renders: on a 1280 x 720 YouTube canvas shown at 168 px in the suggested rail, text needs a cap height of roughly 92 px to stay above the 12 px legibility floor, leaving room for about 24 characters. It is for YouTubers, bloggers and podcasters who want thumbnails that survive at real sizes.",
  useCases: [
    "A YouTuber generating a face-plus-radial-burst base plate with the left side kept empty for a three-word headline",
    "A blogger building a 1200 x 630 Open Graph image and checking the headline fits the 44-character budget at chat-app card size",
    "A podcaster discovering that episode-list artwork at 60 px leaves room for about 8 readable characters, and designing around a mark instead",
  ],
  benefits: [
    ["Text budget, computed", "Characters per line and minimum cap height are derived from each platform's smallest real render size."],
    ["Overlay-aware layout", "Warns when text lands under YouTube's duration badge or the Shorts caption stack."],
    ["Clean plate output", "The prompt orders a text-free image with a reserved zone, because image models garble lettering."],
  ],
  faqs: [
    [
      "What size should a YouTube thumbnail be?",
      "1280 x 720 pixels at a 16:9 ratio, with a minimum width of 640 px and a file size under 2 MB in JPG, PNG, GIF or WebP. Design it for the small end though — in the suggested-videos rail it displays at roughly 168 px wide.",
    ],
    [
      "How much text should I put on a thumbnail?",
      "Three to five words at most, and at YouTube's render sizes only about 24 characters fit legibly (about 12 per line across two lines). Text needs a cap height near 13% of the image height — about 92 px on a 1280 x 720 canvas — to stay readable at 168 px wide.",
    ],
    [
      "Why does my thumbnail text look blurry or unreadable when the video is published?",
      "Because it was designed at full size and the platform shows it at a tenth of that: any text drawn below about 90 px cap height on a 1280 px canvas renders under 12 px in the suggested rail, which is below the practical legibility floor. Redraw the headline bigger and cut it to 3-5 words.",
    ],
    [
      "Can AI image generators create thumbnails with text on them?",
      "Not reliably — diffusion models garble words and letterforms, which looks broken at thumbnail sizes. The working method is to generate a text-free plate with a deliberately empty zone, then typeset the headline in an editor like Canva, Figma or Photoshop.",
    ],
  ],
};

export default seo;
