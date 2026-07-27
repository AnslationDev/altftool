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
 * Facts true of every ALTF Love IMG tool. Verified against
 * ../lib/imageProcessing.js (Canvas + File API only — no upload endpoint
 * exists anywhere in this route family).
 */
export const FAMILY_FACTS = {
  accepts: "PNG, JPEG, WebP, GIF and BMP files",
  processing:
    "In your browser. Images are decoded and re-encoded with the Canvas API on your own device — nothing is uploaded to AltFTool.",
  price: "Free. No account, no install, no watermark added to your image.",
  requirements: "Any modern desktop or mobile browser with JavaScript enabled.",
};

/**
 * Tool registry — single source of truth for the homepage showcase,
 * cross-tool navigation and per-tool metadata.
 * `category`: organize | convert | create | ai
 *
 * `answer` is the self-contained sentence printed under each tool's H1 and
 * reused as the schema.org description: it must say what the tool does and
 * where the processing happens, and must be quotable without any context.
 * `notDoes` lists honest limits. Every claim in both fields was checked
 * against the tool's own client component — never add a capability the code
 * does not implement.
 */
export const TOOLS = [
  {
    slug: "compress",
    name: "Compress Image",
    tagline: "Shrink JPG, PNG & WEBP",
    description:
      "Reduce file size dramatically while keeping crisp quality. Batch process and compare before/after instantly.",
    answer:
      "Compress Image shrinks JPG, PNG and WebP pictures by re-encoding them at a quality level you choose, entirely inside your browser. Compress several images at once, see the before-and-after size for each, and download them individually or as a ZIP.",
    input: "PNG, JPEG, WebP, GIF and BMP files (several at a time)",
    output: "Smaller JPG, PNG or WebP files, singly or as a ZIP",
    notDoes: [
      "Does not compress losslessly — lowering the quality slider does discard image data.",
      "Does not output AVIF or JPEG XL.",
    ],
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
    answer:
      "Resize Image changes a picture's width and height to exact pixel values or a percentage of the original, with an optional aspect-ratio lock and a live preview. The resizing runs on your own device, so the image is never uploaded.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "A resized JPG, PNG or WebP",
    notDoes: [
      "Does not invent detail when enlarging — an upscaled small photo will look soft.",
      "Does not change the framing; use Crop Image for that.",
    ],
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
    answer:
      "Crop Image lets you drag a frame over a picture and keep only that area, either freehand or locked to a social preset such as 1:1, Instagram 4:5 and 9:16, Facebook cover, LinkedIn banner or a 16:9 YouTube thumbnail. The crop is applied in your browser and downloads straight away.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "The cropped image",
    notDoes: [
      "Does not detect faces or subjects automatically — you position the frame.",
      "A preset fixes the aspect ratio; it does not force the result to an exact pixel size.",
    ],
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
    answer:
      "Rotate & Flip turns a picture by 90°, 180° or 270° and mirrors it horizontally or vertically, re-encoding the actual pixels in your browser. The corrected image downloads immediately, with no upload step.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "The rotated or flipped image",
    notDoes: [
      "Does not straighten a small tilt at an arbitrary angle — rotation is in 90° steps.",
      "Does not merely flip the EXIF orientation flag; the pixels themselves are rotated.",
    ],
    icon: RotateCw,
    category: "organize",
    accent: "#06B6D4",
  },
  {
    slug: "upscaler",
    name: "Image Upscaler",
    tagline: "Enlarge up to 4×",
    description:
      "Enlarge images 2×, 3× or 4× with high-quality resampling and adjustable sharpening.",
    answer:
      "Image Upscaler enlarges a picture 2×, 3× or 4× using high-quality canvas resampling followed by an adjustable sharpening pass, and exports the result as a PNG. It runs on your own device, so the image is never uploaded.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "A PNG enlarged 2×, 3× or 4×",
    notDoes: [
      "Does not use an AI super-resolution model — it resamples and sharpens, so it cannot invent detail that is missing from the source.",
      "Does not remove JPEG artefacts or noise; sharpening can make them more visible.",
    ],
    icon: Sparkles,
    category: "organize",
    accent: "#0D9488",
  },
  {
    slug: "jpg-to-png",
    name: "JPG to PNG",
    tagline: "Lossless conversion",
    description: "Convert JPG photos to high-quality PNG files right in your browser.",
    answer:
      "JPG to PNG converts JPG photos into PNG files in your browser, writing the PNG losslessly so nothing further is thrown away. Convert a batch at once and download the results as a ZIP.",
    input: "JPG files (several at a time)",
    output: "PNG files, singly or as a ZIP",
    notDoes: [
      "Does not restore quality already lost to JPEG compression — PNG only preserves what is there.",
      "Does not add transparency; a JPG has no alpha channel to recover.",
      "Usually produces a larger file than the JPG source.",
    ],
    icon: ImageIcon,
    category: "convert",
    accent: "#14B8A6",
  },
  {
    slug: "png-to-jpg",
    name: "PNG to JPG",
    tagline: "Smaller, shareable files",
    description: "Flatten PNGs onto a background and export compact JPG images.",
    answer:
      "PNG to JPG converts PNG images to compact JPG files in your browser, flattening any transparency onto a solid background and letting you set the JPEG quality. Convert several at once and download them as a ZIP.",
    input: "PNG files (several at a time)",
    output: "JPG files, singly or as a ZIP",
    notDoes: [
      "Does not keep transparency — JPG has no alpha channel, so transparent areas are filled in.",
      "Does not convert losslessly; JPG encoding always discards some data.",
    ],
    icon: FileImage,
    category: "convert",
    accent: "#38BDF8",
  },
  {
    slug: "webp-to-jpg",
    name: "WEBP to JPG",
    tagline: "Universal compatibility",
    description: "Turn modern WEBP images into widely supported JPG files instantly.",
    answer:
      "WEBP to JPG converts WebP images into JPG files that older software and devices can open, with a quality slider and batch conversion. The conversion happens in your browser and never uploads the picture.",
    input: "WebP files (several at a time)",
    output: "JPG files, singly or as a ZIP",
    notDoes: [
      "Does not keep transparency — transparent WebP areas are flattened onto a background.",
      "Does not convert animated WebP; only the first frame is exported.",
    ],
    icon: Repeat,
    category: "convert",
    accent: "#0D9488",
  },
  {
    slug: "jpg-to-webp",
    name: "JPG to WEBP",
    tagline: "Next-gen compression",
    description: "Convert JPG to WEBP for dramatically smaller files with great quality.",
    answer:
      "JPG to WEBP converts JPG photos into WebP, which usually stores the same picture in a noticeably smaller file, with a quality slider and batch conversion. Everything runs in your browser, so no image is uploaded.",
    input: "JPG files (several at a time)",
    output: "WebP files, singly or as a ZIP",
    notDoes: [
      "Does not recover quality lost to the original JPEG compression.",
      "Does not produce lossless WebP; the quality slider controls a lossy encode.",
    ],
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
    answer:
      "Watermark Image stamps your own text or logo onto a picture, with control over size, opacity, rotation, which corner it sits in, and whether it tiles across the whole image. The watermark is rendered into the picture in your browser and the marked file downloads to your device.",
    input: "PNG, JPEG, WebP, GIF and BMP files, plus a logo image if you use one",
    output: "The watermarked image",
    notDoes: [
      "Does not remove an existing watermark.",
      "Does not embed an invisible or forensic watermark — the mark is visible pixels.",
    ],
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
    answer:
      "Image Editor adjusts brightness, contrast, saturation, exposure, blur, sharpening, greyscale and sepia on a picture with a real-time preview, then exports the edited file. All of the processing happens in your browser on your own device.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "The adjusted image as JPG, PNG or WebP",
    notDoes: [
      "Does not offer layers, masks, brushes or selective edits — adjustments apply to the whole image.",
      "Does not keep an editing history or save a project file.",
    ],
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
    answer:
      "Meme Generator adds classic top and bottom caption text to your own picture, with adjustable font size, colour and outline stroke and a live preview. The captions are rendered into the image in your browser and exported in one click.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "An image with the captions rendered into it",
    notDoes: [
      "Does not include a meme template library — you supply the picture.",
      "Does not create animated GIF memes.",
    ],
    icon: Smile,
    category: "create",
    accent: "#38BDF8",
  },
  {
    slug: "background-remover",
    name: "Background Remover",
    tagline: "Clean cutouts",
    description:
      "Cut the subject out of a photo and export a transparent PNG. The segmentation model runs on your device.",
    answer:
      "Background Remover cuts the subject out of a photo and exports it as a transparent PNG, running an image-segmentation model directly on your device with WebAssembly. Your picture is never uploaded — only the model files are downloaded, once, on first use.",
    input: "PNG, JPEG, WebP, GIF and BMP files",
    output: "A PNG with a transparent background",
    notDoes: [
      "Does not need an API key or account, because there is no server-side AI call.",
      "The first run downloads the model files, so it is slower than later runs.",
      "Does not reliably cut out fine detail such as loose hair, fur or glass.",
    ],
    icon: Eraser,
    category: "ai",
    accent: "#38BDF8",
    badge: "AI",
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
