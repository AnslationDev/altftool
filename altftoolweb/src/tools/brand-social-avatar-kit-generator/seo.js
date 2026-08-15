const seo = {
  title: "Social Profile Picture Sizes: Circle-Safe Avatar",
  metaDescription:
    "Crop one square master to each platform's avatar size — 400px X, 800px YouTube, 512px icon — with the 70.71% circle-safe square drawn on the preview.",
  steps: [
    "Pick a square logo file under \"Source image (square works best)\" — a PNG, JPEG, WebP or SVG.",
    "Frame it with the Zoom, Horizontal position and Vertical position sliders, keeping the wordmark inside the dashed 70.71% safe square, then tick the platforms you need.",
    "Press Download all to save one PNG per platform, named avatar-<platform>-<size>x<size>.png, for example avatar-youtube-800x800.png.",
  ],
  intro:
    "Brand Social Avatar Kit Generator crops one square master image into profile pictures at each platform's recommended upload size and shows the circle-safe area before you export. Because every major network masks a square avatar to a circle, only the centred square of 70.71% of the width — the largest square that fits inside an inscribed circle — is guaranteed to survive; the preview draws that boundary so a wordmark never loses its edges. Cropping and PNG export happen entirely in the browser, so the image is never uploaded.",
  useCases: [
    "Ship one logo mark to X, LinkedIn, YouTube, Discord and a 512 px app icon without opening a design app.",
    "Check whether a horizontal wordmark survives the circular crop before a rebrand goes live.",
    "Re-cut every avatar after a logo refresh, keeping the same framing across all platforms.",
    "Confirm a supplied logo file is large enough for an 800 px YouTube avatar before asking for a new export.",
  ],
  benefits: [
    ["Circle-safe by construction", "The 70.71% safe square is drawn from the geometry of an inscribed circle, not guessed."],
    ["Nothing leaves your device", "Cropping and PNG encoding use the canvas API in your own browser."],
    ["Upscale warnings", "Flags any platform whose target size is larger than the crop you actually have."],
  ],
  faqs: [
    [
      "What size should a social media profile picture be?",
      "Export a square image at least 400 × 400 px for X and LinkedIn, 320 × 320 for Instagram and Facebook, and 800 × 800 for YouTube. Keeping a 1600 × 1600 master covers every current target at 2× so the same file survives the next round of platform changes.",
    ],
    [
      "How much of a square avatar gets cut off by the circle crop?",
      "The corners. A circle inscribed in a square touches all four edges, so the largest square that stays fully visible has a side of 1/√2 — about 70.71% — of the image width, leaving a 14.64% margin on each edge. Anything in that margin can be clipped.",
    ],
    [
      "Should a logo avatar be transparent or have a background?",
      "Give it a solid background. Platforms composite avatars over light and dark chrome, and a transparent PNG can leave a dark mark invisible in dark mode. Export one solid version for social and keep the transparent original as the master.",
    ],
    [
      "Why does my avatar look blurry after upload?",
      "Usually because the source was smaller than the display size and got upscaled, or because the platform re-compressed a JPEG. Upload a PNG at or above the recommended size — this tool flags any platform where your crop is smaller than the target.",
    ],
  ],
};

export default seo;
