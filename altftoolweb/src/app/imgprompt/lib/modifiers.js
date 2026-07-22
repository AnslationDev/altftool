/** Modifier libraries used to synthesize believable demo prompt cards. */

export const CAMERAS = [
  "Sony A7R V", "Canon EOS R5", "Hasselblad X2D 100C", "Nikon Z9",
  "Leica M11", "Phase One XF IQ4", "RED Komodo 6K", "ARRI Alexa 35",
  "Fujifilm GFX 100 II", "Blackmagic URSA 12K",
];

export const LENSES = [
  "85mm f/1.4 portrait lens", "35mm f/1.8 prime", "24-70mm f/2.8 zoom",
  "50mm f/1.2 bokeh lens", "14mm ultra-wide", "100mm macro lens",
  "135mm f/1.8 telephoto", "anamorphic 40mm", "tilt-shift 24mm", "fisheye 8mm",
];

export const LIGHTING = [
  "soft cinematic rim lighting", "golden hour backlight", "dramatic chiaroscuro",
  "studio softbox lighting", "neon volumetric glow", "moody low-key lighting",
  "high-key beauty lighting", "Rembrandt lighting", "bioluminescent ambience",
  "split hard-shadow lighting", "overcast diffused daylight", "candle-lit warmth",
];

export const COMPOSITION = [
  "rule of thirds", "centered symmetrical composition", "golden ratio framing",
  "leading lines", "dynamic diagonal composition", "extreme close-up",
  "wide establishing shot", "low-angle hero shot", "over-the-shoulder framing",
  "negative space minimalism", "bird's-eye view", "dutch angle",
];

export const MOODS = [
  "ethereal and dreamlike", "bold and energetic", "serene and minimal",
  "dark and mysterious", "warm and nostalgic", "futuristic and clean",
  "luxurious and elegant", "playful and vibrant", "epic and cinematic",
  "intimate and emotional",
];

export const PALETTES = [
  "muted earth tones", "vibrant neon accents", "monochromatic blues",
  "warm sunset gradient", "pastel dream palette", "high-contrast black & gold",
  "teal and orange cinematic", "iridescent holographic", "moody desaturated",
  "rich jewel tones",
];

export const ART_STYLES = [
  "hyperrealistic", "cinematic photography", "editorial fashion",
  "concept art", "3D octane render", "anime illustration",
  "oil painting", "watercolor", "flat vector", "cyberpunk digital art",
  "studio product render", "isometric 3D",
];

export const RENDER_STYLES = [
  "Unreal Engine 5", "Octane render", "Redshift", "V-Ray",
  "ray-traced global illumination", "subsurface scattering", "physically based rendering",
];

export const QUALITY_BOOSTERS = [
  "ultra-detailed", "8K resolution", "sharp focus", "professional color grading",
  "photorealistic textures", "intricate details", "award-winning", "masterpiece",
  "highly detailed", "trending on ArtStation",
];

export const DEFAULT_NEGATIVES = [
  "blurry", "low quality", "distorted", "deformed", "extra fingers",
  "bad anatomy", "watermark", "text artifacts", "jpeg artifacts",
  "oversaturated", "duplicate", "cropped", "low resolution", "grainy",
];

/** Video-specific motion language. */
export const CAMERA_MOVES = [
  "slow dolly-in", "sweeping crane shot", "handheld tracking shot",
  "orbiting drone shot", "smooth gimbal glide", "whip pan", "push-in on subject",
  "parallax reveal",
];

export const TRANSITIONS = [
  "match cut", "whip-pan transition", "cross dissolve", "morph transition",
  "hard cut", "light-leak transition",
];

/** Category-specific keyword flavor to make each tool feel bespoke. */
export const CATEGORY_FLAVOR = {
  "product-photography": ["seamless studio backdrop", "commercial product hero shot", "reflective surface", "soft gradient background"],
  "commercial-ads": ["advertising campaign key visual", "bold hero product", "copy space for headline", "premium brand aesthetic"],
  logo: ["vector logo mark", "minimal geometric", "flat design", "scalable brand identity", "clean negative space"],
  packaging: ["premium packaging mockup", "die-line ready", "matte finish", "foil-stamped accents", "on-shelf realism"],
  architecture: ["architectural visualization", "modern minimalist structure", "glass and concrete", "dramatic sky", "context landscaping"],
  "interior-design": ["interior design render", "curated furniture", "natural light through windows", "cozy modern aesthetic"],
  healthcare: ["clean clinical aesthetic", "trustworthy medical tone", "soft blue palette", "professional healthcare setting"],
  "medical-illustration": ["accurate medical illustration", "labeled cross-section", "anatomically correct", "textbook clarity"],
  anime: ["anime key visual", "cel-shaded", "expressive eyes", "dynamic pose", "Studio-quality lineart"],
  fantasy: ["epic fantasy scene", "mythical atmosphere", "intricate armor", "magical lighting", "sweeping vista"],
  cyberpunk: ["cyberpunk cityscape", "neon signage", "rain-slicked streets", "holographic ads", "chrome and neon"],
  "sci-fi": ["science fiction concept", "sleek futuristic tech", "alien world", "atmospheric depth"],
  "youtube-thumbnail": ["bold expressive face", "high-contrast colors", "clickbait energy", "large readable focal point"],
  "food-photography": ["appetizing food styling", "steam and freshness", "shallow depth of field", "rustic props"],
  fashion: ["high-fashion editorial", "couture styling", "vogue aesthetic", "confident pose"],
  beauty: ["flawless skin retouching", "glowing complexion", "beauty campaign", "soft glam"],
  gaming: ["AAA game concept art", "stylized character", "epic environment", "splash art"],
  "pixel-art": ["16-bit pixel art", "limited palette", "crisp pixels", "retro game sprite"],
  nft: ["generative NFT collectible", "unique traits", "iconic profile picture", "vibrant background"],
  "3d-render": ["photoreal 3D render", "soft studio lighting", "clay-to-final polish", "subsurface detail"],
  "real-estate": ["real estate photography", "wide-angle interior", "bright and airy", "twilight exterior"],
  travel: ["breathtaking travel photograph", "iconic landmark", "golden hour", "wanderlust mood"],
};

export function flavorFor(categorySlug) {
  if (!categorySlug) return [];
  return CATEGORY_FLAVOR[categorySlug] ?? [];
}
