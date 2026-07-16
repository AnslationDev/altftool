export const SUPPORTED_FORMATS = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/tiff",
];

export const FILE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".tiff"];

export const ANALYSIS_CHECKS = [
  {
    id: "noise",
    name: "Noise Consistency",
    description:
      "Evaluates the statistical distribution of pixel noise across the image. Authentic photographs exhibit organic, variable noise patterns while AI-generated images often produce unnaturally uniform noise.",
    weight: 15,
  },
  {
    id: "compression",
    name: "Compression Artifacts",
    description:
      "Examines JPEG quantization blocks and double-compression indicators. Real camera JPEGs follow predictable compression patterns that differ from AI-generated outputs.",
    weight: 12,
  },
  {
    id: "metadata",
    name: "Metadata Presence",
    description:
      "Checks for authentic EXIF metadata including camera model, lens info, GPS coordinates, and exposure settings. AI images typically carry minimal or synthetic metadata.",
    weight: 10,
  },
  {
    id: "lighting",
    name: "Lighting Consistency",
    description:
      "Analyzes brightness distribution across image regions to verify physically plausible lighting. AI-generated images may contain impossible or contradictory light sources.",
    weight: 18,
  },
  {
    id: "texture",
    name: "Texture Consistency",
    description:
      "Measures local texture complexity and gradient patterns. AI images sometimes display repetitive textures or artificially smooth regions that differ from natural photography.",
    weight: 15,
  },
  {
    id: "edges",
    name: "Edge Consistency",
    description:
      "Detects and evaluates edge sharpness uniformity throughout the image. Inconsistent edge rendering can indicate AI generation or digital manipulation.",
    weight: 12,
  },
  {
    id: "color",
    name: "Color Distribution",
    description:
      "Analyzes color channel histograms and gradient smoothness. AI-generated images may produce suspiciously smooth color transitions or unnatural color distributions.",
    weight: 10,
  },
  {
    id: "faces",
    name: "Face Detection",
    description:
      "Identifies potential face regions using skin-tone detection and geometric analysis. Flags unusual proportions or artifacts common in AI-generated faces.",
    weight: 8,
  },
];

export const RISK_LEVELS = {
  SAFE: {
    label: "Likely Authentic",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  SUSPICIOUS: {
    label: "Possibly AI Generated",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  RISKY: {
    label: "Likely AI Generated",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  INCONCLUSIVE: {
    label: "Analysis Inconclusive",
    color: "text-[var(--muted-foreground)]",
    bg: "bg-[var(--muted)]",
  },
  ERROR: {
    label: "Unable to Analyze",
    color: "text-red-600",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
};

export const REPORT_SECTIONS = [
  "Summary",
  "Detailed Analysis",
  "Technical Details",
  "Recommendations",
];
