const seo = {
  title: "Compare Image Resolution & Quality: 8-Metric Score",
  metaDescription:
    "Score two images on resolution, sharpness, compression, noise and colour out of 100, check 12 social sizes, and export PDF, CSV or JSON.",
  steps: [
    "Drop a file into the Image A zone and a second into Image B — the zones accept SVG, PNG, JPG and GIF.",
    "Read the side-by-side comparison and the 0-100 quality score, which weights resolution and sharpness at 20% each and the other six metrics at 10%.",
    "Check which of the 12 social presets each image fits, then use Export PDF, Export CSV, Export JSON or Export PNG Preview.",
  ],
  intro:
    "Image Resolution Compare puts two images side by side and scores each on eight measured axes — resolution, sharpness, compression, noise, colour, brightness, contrast and dynamic range — weighting resolution and sharpness at 20% apiece and the other six at 10% each to produce a 0-100 quality score. It also reports pixel dimensions, megapixels, aspect ratio, orientation, file size and a compression ratio of uncompressed bytes to actual bytes, and checks both images against 12 social platform size presets. Results export as PDF, CSV or JSON so a comparison can be attached to a brief or a ticket.",
  useCases: [
    "A supplier sends a replacement product photo and you need to show it is genuinely higher quality than the original, not just larger in pixel count.",
    "You are choosing between a lightly compressed 4 MB export and a 400 KB one, and want the compression ratio and sharpness numbers to decide whether the saving costs anything visible.",
    "You have a hero image and need to know which of your two candidates actually fits an Instagram Story at 1080 x 1920 and a YouTube thumbnail at 1280 x 720 without awkward cropping.",
  ],
  benefits: [
    [
      "Two images measured identically",
      "Both files run through the same downscaled sampling and the same eight-metric scoring, so the comparison is like for like rather than eyeballed.",
    ],
    [
      "Separates size from quality",
      "Resolution and sharpness are scored independently, which is how a bigger file that is soft can come out behind a smaller one that is crisp.",
    ],
    [
      "Checks 12 platform sizes at once",
      "Instagram post and story, Facebook post and cover, LinkedIn banner and post, YouTube thumbnail, Pinterest pin, X post, TikTok cover and WhatsApp status.",
    ],
  ],
  faqs: [
    [
      "How is the overall quality score calculated?",
      "As a weighted sum: resolution 20%, sharpness 20%, and compression, noise, colour, brightness, contrast and dynamic range 10% each. Resolution is banded by megapixels — 12 MP or more scores 100, 8 MP scores 80, 4 MP scores 60, 2 MP scores 40 and anything below that scores 20.",
    ],
    [
      "What does the compression ratio tell me?",
      "It divides the uncompressed size (width x height x 3 bytes) by the actual file size, so a ratio of 10 means the file is a tenth of its raw pixel data. Ratios above 10 score well for efficiency, but above 20 the tool flags that you may be giving up visible quality to compression.",
    ],
    [
      "Is a higher resolution image always better?",
      "No. Resolution is only 20% of the score, and an upscaled or out-of-focus image will still lose on sharpness, noise and contrast. That is exactly the case this tool is built for: proving that more pixels have not added more detail.",
    ],
    [
      "How does it decide an image fits a social platform?",
      "It runs three checks per preset — width within 0.8x to 1.5x of the target, height within the same band, and aspect ratio within 30% of the target ratio — and marks the platform compatible when at least two of the three pass. Platforms re-encode uploads, so treat this as a framing check rather than a guarantee of how the final post looks.",
    ],
  ],
};

export default seo;
