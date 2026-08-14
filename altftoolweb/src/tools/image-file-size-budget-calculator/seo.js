const seo = {
  title: "Image Budget Calculator: KB per Hero and Other Image",
  metaDescription:
    "Split a total page image budget in KB across hero and supporting images — heroes take half — for a per-image KB target in WebP/AVIF, JPEG or PNG.",
  steps: [
    "Type the page's image count into 'Number of images', which opens on 12, and the ceiling into 'Total image budget KB', which opens on 1200.",
    "Set 'Hero/large images' — 2 by default — and pick WebP/AVIF, JPEG or PNG under 'Target format'; the Image budget panel rewrites as you type.",
    "The panel prints the format target, the total KB, and 'Hero images' beside 'Other images' with a per-image KB figure each, heroes sharing half the budget; press Copy output or Reset.",
  ],
  intro:
    "The Image File Size Budget Calculator subtracts your HTML, CSS, JS and font weight from a total page weight budget, then works out how many images fit in what is left using width x height x DPR squared x bits-per-pixel x a format factor, divided by 8. It estimates a photographic JPEG at 1.0 bit per pixel by default and scales that by format — WebP at 0.70, AVIF at 0.50, PNG-8 at 1.5 and PNG-24 at 8.0 of a comparable JPEG — then reports transfer time on Slow 3G, Fast 3G, 4G and broadband. It is for front-end and performance work where a design calls for a gallery and someone has to say whether the budget survives it.",
  useCases: [
    "A designer wants twelve full-width hero-style photos on a landing page and you need to show, before build starts, that the page blows a 1,000 KB budget with any format except AVIF.",
    "You are deciding whether shipping 2x retina exports is worth it, and want the number that shows a DPR of 2 quadruples pixel count and therefore roughly quadruples every image's bytes.",
    "A stakeholder asks how long the page takes on a bad mobile connection, and you need the figure at the 400 kbps Slow 3G preset rather than a guess.",
  ],
  benefits: [
    [
      "Budgets what is actually left, not the whole page",
      "Code and font weight comes off the top first, so the image allowance is the real remainder rather than the headline budget.",
    ],
    [
      "Compares all five formats at once",
      "The same image is priced as JPEG, WebP, AVIF, PNG-8 and PNG-24 side by side, with how many of each fit in the remaining budget.",
    ],
    [
      "Turns bytes into seconds",
      "Transfer time for the planned set is shown against four connection speeds, including the DevTools and Lighthouse mobile throttling presets.",
    ],
  ],
  faqs: [
    [
      "How do you estimate an image's file size before exporting it?",
      "Multiply pixel count by bits per pixel and divide by 8, then apply a format factor. This calculator uses 1.0 bit per pixel as the planning default for a photographic JPEG at quality 75-85 — real photos land roughly between 0.5 bpp for flat, simple images and 1.5 bpp for dense texture, so adjust the bpp field to match your content.",
    ],
    [
      "How much smaller is WebP or AVIF than JPEG?",
      "This tool models WebP lossy at 0.70 of a comparable JPEG, sitting mid-band in the 25-34% saving its authors report, and AVIF at 0.50, roughly half a comparable JPEG. PNG-24 goes the other way at about 8x a JPEG for a photograph, which is why lossless PNG is only sensible for flat graphics.",
    ],
    [
      "What is a reasonable page weight budget?",
      "The tool offers 500 KB as an aggressive mobile-first target, 1,000 KB as the figure performance teams most commonly set for a content page, and 2,000 KB for a deliberately media-heavy page. Pick the one that matches your audience's connections rather than your office wifi.",
    ],
    [
      "Why does a device pixel ratio of 2 cost so much?",
      "Because DPR scales both width and height, so it squares: a 2x export has four times the pixels of a 1x export and, at the same bits per pixel, roughly four times the bytes. That is usually the single biggest lever on a gallery page, ahead of switching format.",
    ],
  ],
};

export default seo;
