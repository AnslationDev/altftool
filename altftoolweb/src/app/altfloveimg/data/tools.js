import {
  Minimize2,
  Scaling,
  Crop,
  RotateCw,
  Image as ImageIcon,
  FileImage,
  Repeat,
  Stamp,
  SlidersHorizontal,
  Smile,
  Eraser,
  Sparkles,
} from "lucide-react";

export const BASE = "/altfloveimg";

/**
 * Tool registry — single source of truth for the homepage showcase,
 * cross-tool navigation and per-tool metadata.
 * `category`: organize | convert | create | ai
 */
export const TOOLS = [
  {
    slug: "compress",
    name: "Compress Image",
    tagline: "Shrink JPG, PNG & WEBP",
    description:
      "Reduce file size dramatically while keeping crisp quality. Batch process and compare before/after instantly.",
    icon: Minimize2,
    category: "organize",
    accent: "#14B8A6",
    badge: "Popular",
  },
  {
    slug: "resize",
    name: "Resize Image",
    tagline: "Pixel-perfect dimensions",
    description:
      "Set exact width and height, scale by percentage, or lock the aspect ratio with a live preview.",
    icon: Scaling,
    category: "organize",
    accent: "#38BDF8",
  },
  {
    slug: "crop",
    name: "Crop Image",
    tagline: "Free & social presets",
    description:
      "Crop freely or snap to Instagram, Facebook, LinkedIn and YouTube ratios with an interactive frame.",
    icon: Crop,
    category: "organize",
    accent: "#0D9488",
  },
  {
    slug: "rotate",
    name: "Rotate & Flip",
    tagline: "Straighten in one click",
    description:
      "Rotate by 90°, 180° or 270° and flip horizontally or vertically. Perfect orientation, every time.",
    icon: RotateCw,
    category: "organize",
    accent: "#06B6D4",
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG",
    tagline: "Lossless conversion",
    description: "Convert JPG photos to high-quality PNG files right in your browser.",
    icon: ImageIcon,
    category: "convert",
    accent: "#14B8A6",
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG",
    tagline: "Smaller, shareable files",
    description: "Flatten PNGs onto a background and export compact JPG images.",
    icon: FileImage,
    category: "convert",
    accent: "#38BDF8",
  },
  {
    slug: "webp-to-jpg",
    name: "WEBP to JPG",
    tagline: "Universal compatibility",
    description: "Turn modern WEBP images into widely supported JPG files instantly.",
    icon: Repeat,
    category: "convert",
    accent: "#0D9488",
  },
  {
    slug: "jpg-to-webp",
    name: "JPG to WEBP",
    tagline: "Next-gen compression",
    description: "Convert JPG to WEBP for dramatically smaller files with great quality.",
    icon: Repeat,
    category: "convert",
    accent: "#14B8A6",
  },
  {
    slug: "watermark",
    name: "Watermark Image",
    tagline: "Protect your work",
    description:
      "Add text or image watermarks with full control over position, size, opacity and rotation.",
    icon: Stamp,
    category: "create",
    accent: "#06B6D4",
  },
  {
    slug: "editor",
    name: "Image Editor",
    tagline: "Adjust like a pro",
    description:
      "Fine-tune brightness, contrast, saturation, exposure, blur and sharpen with real-time preview.",
    icon: SlidersHorizontal,
    category: "create",
    accent: "#14B8A6",
    badge: "New",
  },
  {
    slug: "meme",
    name: "Meme Generator",
    tagline: "Top & bottom text",
    description:
      "Create classic memes with customizable fonts, colors and stroke, then export in one click.",
    icon: Smile,
    category: "create",
    accent: "#38BDF8",
  },
  {
    slug: "background-remover",
    name: "Background Remover",
    tagline: "Clean cutouts",
    description:
      "Remove image backgrounds with a premium, guided workflow. AI-ready architecture.",
    icon: Eraser,
    category: "ai",
    accent: "#38BDF8",
    badge: "AI",
  },
  {
    slug: "upscaler",
    name: "Image Upscaler",
    tagline: "Enhance & enlarge",
    description:
      "Upscale and sharpen images up to 4× with a fast canvas-based resample and detail-preserving sharpen.",
    icon: Sparkles,
    category: "create",
    accent: "#0D9488",
    badge: "Enhance",
  },
];

export const CATEGORIES = [
  { id: "all", label: "All tools" },
  { id: "organize", label: "Optimize" },
  { id: "convert", label: "Convert" },
  { id: "create", label: "Create & Edit" },
  { id: "ai", label: "AI Tools" },
];

export function getTool(slug) {
  return TOOLS.find((t) => t.slug === slug);
}

export function relatedTools(slug, count = 3) {
  const current = getTool(slug);
  if (!current) return TOOLS.slice(0, count);
  const sameCat = TOOLS.filter(
    (t) => t.slug !== slug && t.category === current.category
  );
  const others = TOOLS.filter(
    (t) => t.slug !== slug && t.category !== current.category
  );
  return [...sameCat, ...others].slice(0, count);
}

/** Social / aspect-ratio crop presets */
export const CROP_PRESETS = [
  { id: "free", label: "Free", ratio: null, hint: "Any size" },
  { id: "square", label: "Square", ratio: 1, hint: "1:1" },
  { id: "instagram-portrait", label: "Instagram Portrait", ratio: 4 / 5, hint: "4:5" },
  { id: "instagram-story", label: "Instagram Story", ratio: 9 / 16, hint: "9:16" },
  { id: "facebook-cover", label: "Facebook Cover", ratio: 820 / 312, hint: "820×312" },
  { id: "linkedin-banner", label: "LinkedIn Banner", ratio: 1584 / 396, hint: "1584×396" },
  { id: "youtube-thumb", label: "YouTube Thumbnail", ratio: 16 / 9, hint: "16:9" },
];
