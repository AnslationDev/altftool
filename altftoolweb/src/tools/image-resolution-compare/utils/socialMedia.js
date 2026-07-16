export const SOCIAL_PLATFORMS = [
  { name: "Instagram Post", width: 1080, height: 1080, aspect: "1:1" },
  { name: "Instagram Story", width: 1080, height: 1920, aspect: "9:16" },
  { name: "Instagram Reel Cover", width: 1080, height: 1920, aspect: "9:16" },
  { name: "Facebook Post", width: 1200, height: 630, aspect: "1.91:1" },
  { name: "LinkedIn Banner", width: 1584, height: 396, aspect: "4:1" },
  { name: "YouTube Thumbnail", width: 1280, height: 720, aspect: "16:9" },
  { name: "Pinterest Pin", width: 1000, height: 1500, aspect: "2:3" },
  { name: "X/Twitter Post", width: 1200, height: 675, aspect: "16:9" },
  { name: "TikTok Cover", width: 1080, height: 1920, aspect: "9:16" },
  { name: "WhatsApp Status", width: 1080, height: 1920, aspect: "9:16" },
  { name: "Facebook Cover", width: 820, height: 312, aspect: "2.63:1" },
  { name: "LinkedIn Post", width: 1200, height: 1200, aspect: "1:1" },
];

export function checkSocialCompatibility(width, height) {
  return SOCIAL_PLATFORMS.map((p) => {
    const wMatch = width >= p.width * 0.8 && width <= p.width * 1.5;
    const hMatch = height >= p.height * 0.8 && height <= p.height * 1.5;
    const aspectRatio = width / height;
    const expectedAspect = p.width / p.height;
    const aspectMatch = Math.abs(aspectRatio - expectedAspect) / expectedAspect < 0.3;

    const score = [wMatch, hMatch, aspectMatch].filter(Boolean).length / 3;
    return {
      platform: p.name,
      width: p.width,
      height: p.height,
      aspect: p.aspect,
      compatible: score >= 0.67,
      score: Math.round(score * 100),
      warnings: [],
    };
  });
}

export function getRecommendations(analysis) {
  const recs = [];

  if (analysis.width < 1920 && analysis.width > 0) {
    recs.push({ type: "resolution", text: "Consider higher resolution for print quality", priority: "medium" });
  }
  if (analysis.sharpness < 40) {
    recs.push({ type: "sharpness", text: "Image appears soft — apply sharpening", priority: "high" });
  }
  if (analysis.noise > 30) {
    recs.push({ type: "noise", text: "Visible noise detected — reduce ISO or apply denoising", priority: "medium" });
  }
  if (analysis.compressionRatio > 20) {
    recs.push({ type: "compression", text: "High compression ratio — consider less compression for better quality", priority: "medium" });
  }
  if (analysis.brightness < 25) {
    recs.push({ type: "brightness", text: "Image is too dark — increase exposure", priority: "low" });
  } else if (analysis.brightness > 80) {
    recs.push({ type: "brightness", text: "Image is too bright — reduce exposure", priority: "low" });
  }
  if (analysis.contrast < 30) {
    recs.push({ type: "contrast", text: "Low contrast — adjust levels for more punch", priority: "low" });
  }
  if (analysis.blurScore < 50) {
    recs.push({ type: "blur", text: "Blur detected — check focus or use sharper lens", priority: "high" });
  }
  if (analysis.dpi < 150) {
    recs.push({ type: "dpi", text: "Low DPI — image may appear pixelated in print", priority: "medium" });
  }
  if (analysis.megapixels < 2 && analysis.megapixels > 0) {
    recs.push({ type: "resolution", text: "Very low resolution — consider upscaling", priority: "high" });
  }

  const useCases = [];
  if (analysis.width >= 1920 && analysis.height >= 1080) useCases.push("HD Wallpaper");
  if (analysis.width >= 3840 && analysis.height >= 2160) useCases.push("4K Wallpaper");
  if (analysis.width >= 300 && analysis.width <= 1200) useCases.push("Web/Social Media");
  if (analysis.megapixels >= 12) useCases.push("Print (Large)");
  if (analysis.megapixels >= 8 && analysis.megapixels < 12) useCases.push("Print (Medium)");
  if (analysis.megapixels >= 2 && analysis.megapixels < 8) useCases.push("Print (Small)");
  if (analysis.width <= 400) useCases.push("Thumbnail");

  return { recommendations: recs, useCases };
}
