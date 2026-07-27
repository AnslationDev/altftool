const seo = {
  intro:
    "The Ad Banner Size Finder lists the exact pixel dimensions, aspect ratio and file-size cap of every standard ad placement across Google Display, Meta, LinkedIn, X, Pinterest, TikTok and YouTube, and matches any custom artwork you already have to the nearest standard slot. It is built for designers and media buyers who need to know whether a 1200x630 hero image can be reused as a Google responsive display asset before uploading it. The catalogue follows the IAB Standard Ad Unit Portfolio for display units and each network's own published creative specification for social placements.",
  useCases: [
    "Check the four Google Display sizes with the most inventory (300x250, 728x90, 160x600, 320x50) before briefing a banner set.",
    "Find out that a 1200x630 blog hero is 1.91:1 and therefore drops straight into a Google responsive display landscape asset and a LinkedIn single image ad.",
    "Confirm that a Meta Stories creative must be 1080x1920 at 9:16 rather than the 1080x1350 used for the feed.",
  ],
  benefits: [
    ["Ratio in lowest terms", "Reduces width:height with Euclid's algorithm, so 300x250 shows as 6:5 rather than a decimal."],
    ["Nearest-slot matching", "Ranks the catalogue by log-distance on aspect ratio and area, so the top result is the size your artwork fits with the least cropping."],
    ["File caps included", "Shows the 150 KB Google uploaded-image ceiling and the 5 MB responsive and social ceilings next to each size."],
  ],
  faqs: [
    [
      "What are the most common banner ad sizes?",
      "The four highest-inventory Google Display sizes are 300x250 (medium rectangle), 728x90 (leaderboard), 160x600 (wide skyscraper) and 320x50 (mobile banner). Adding 300x600 half page and 336x280 large rectangle covers almost all remaining desktop placements.",
    ],
    [
      "What is the maximum file size for a Google display banner?",
      "150 KB for an uploaded image display ad. Responsive display assets are far more generous at 5120 KB (5 MB), which is also the ceiling Meta, LinkedIn and X publish for image ads.",
    ],
    [
      "What size should a Facebook or Instagram ad be?",
      "1080x1080 (1:1) for feed, 1080x1350 (4:5) for the tallest feed crop, and 1080x1920 (9:16) for Stories and Reels. Keep logos and headlines inside the middle of a 9:16 frame so the app's own interface does not cover them.",
    ],
    [
      "Should I export banners at 2x for high-density screens?",
      "Yes for social and responsive placements, where the network resizes your upload anyway. For fixed IAB units the served slot is measured in CSS pixels, so a 728x90 leaderboard exported at 1456x180 looks sharper but must still compress under the 150 KB cap.",
    ],
  ],
};

export default seo;
