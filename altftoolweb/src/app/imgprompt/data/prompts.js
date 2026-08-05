import { CATEGORIES } from "./categories";
import { seededPick, seededRandom, slugify } from "../lib/utils";
import { ART_STYLES, CAMERAS, LENSES, LIGHTING, MOODS, PALETTES, QUALITY_BOOSTERS } from "../lib/modifiers";

const ASPECTS = ["1:1", "3:4", "4:3", "16:9", "9:16", "3:2", "2:3"];
const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Pro"];

/** Curated, hand-tuned hero prompts (the ones that anchor the library). */
const CONCEPTS = [
  { title: "Iconic Beauty Cover", description: "A high-fashion editorial magazine cover with a striking porcelain-skinned model and sculptural styling.", prompt: "Ultra-realistic high-fashion editorial magazine cover featuring a stunning female model with flawless porcelain skin, emerald green satin opera gloves framing her face, oversized ivory sculptural hat, bold burgundy lips, gold statement earrings, shot on Hasselblad X2D with 85mm f/1.4, soft studio beauty lighting, cream backdrop, Vogue aesthetic, 8K, editorial retouching", negative: "blurry, plastic skin, extra fingers, watermark, low quality", tags: ["Magazine Cover", "Fashion Model", "Portrait"], category: "magazine-cover", model: "flux", aspect: "3:4" },
  { title: "UFO Analysis Infographic", description: "A polished infographic breaking down what a captured UFO might be versus what it actually is.", prompt: "Create a detailed infographic showing what a blurry UFO photo captured on camera might be versus the mundane reality, split-panel diagram, labeled callouts, clean editorial layout, muted documentary color palette, isometric icons, crisp typography, data-visualization style, high clarity", tags: ["Infographic", "Diagram", "Photography"], category: "infographics", model: "ideogram", aspect: "4:3" },
  { title: "Neon Ramen Nightfall", description: "Steaming bowl of ramen in a rain-soaked Tokyo alley drenched in neon.", prompt: "Appetizing bowl of tonkotsu ramen with soft-boiled egg and chashu, steam rising, set on a wooden counter in a rain-slicked Tokyo alley, glowing neon signage bokeh, shot on Sony A7R V with 50mm f/1.2, moody cinematic lighting, teal and orange palette, shallow depth of field, hyper-detailed", tags: ["Food Photography", "Cinematic", "Neon"], category: "food-photography", model: "midjourney", aspect: "3:2" },
  { title: "Sovereign Perfume Hero", description: "Luxury perfume bottle floating above silk with golden light.", prompt: "Luxury perfume glass bottle hero product shot, faceted crystal, floating above rippling black silk, golden rim lighting, water droplets, reflective surface, commercial product photography, seamless gradient backdrop, shot on Phase One, ultra-detailed, premium brand aesthetic, 8K", tags: ["Luxury Product", "Perfume", "Commercial"], category: "perfume", model: "openart", aspect: "4:3" },
  { title: "Cyber Samurai Rain", description: "A lone cyber-samurai under holographic ads in a neon downpour.", prompt: "Lone cyber-samurai standing in a rain-slicked neon Tokyo street, glowing katana, holographic advertisements, chrome armor with neon underglow, cinematic low-angle shot, volumetric fog, cyberpunk digital art, teal and magenta palette, Unreal Engine 5, ultra-detailed", negative: "blurry, low detail, extra limbs, watermark", tags: ["Cyberpunk", "Character", "Sci-Fi"], category: "cyberpunk", model: "sd", aspect: "9:16" },
  { title: "Minimal Mountain Cabin", description: "Architectural viz of a glass cabin cantilevered over a misty valley.", prompt: "Architectural visualization of a minimalist glass and blackened-steel cabin cantilevered over a misty alpine valley, floor-to-ceiling windows, warm interior glow at blue hour, dramatic clouds, context pine forest, shot on 24mm tilt-shift, photoreal V-Ray render, serene mood, 8K", tags: ["Architecture", "Minimalist", "Real Estate"], category: "architecture", model: "openart", aspect: "16:9" },
  { title: "Enchanted Forest Guardian", description: "A towering moss-covered guardian awakening in a bioluminescent forest.", prompt: "Epic fantasy scene of a towering moss-covered stone guardian awakening in a bioluminescent ancient forest, glowing runes, floating spores, godrays through canopy, intricate detail, sweeping wide shot, concept art, ethereal mood, rich jewel tones, trending on ArtStation", tags: ["Fantasy", "Concept Art", "Environment"], category: "fantasy", model: "leonardo", aspect: "16:9" },
  { title: "Anime Skyline Confession", description: "Two students on a rooftop at golden hour, Makoto Shinkai style.", prompt: "Anime key visual of two high-school students on a rooftop at golden hour, wind in hair, sprawling city skyline below, lens flare, Makoto Shinkai style, cel-shaded, expressive eyes, warm nostalgic palette, highly detailed background, emotional mood", tags: ["Anime", "Character", "Cinematic"], category: "anime", model: "midjourney", aspect: "16:9" },
  { title: "Sneaker Levitation Ad", description: "Hero sneaker exploding out of powder against a bold gradient.", prompt: "Commercial advertising key visual of a futuristic sneaker levitating, exploding colored powder and dynamic splashes, bold gradient background, dramatic rim lighting, product hero shot, copy space for headline, shot on Canon EOS R5, ultra-detailed, premium brand aesthetic", tags: ["Commercial Ads", "Product", "Sneaker"], category: "commercial-ads", model: "flux", aspect: "4:3" },
  { title: "MRI Brain Cross-Section", description: "Clean, accurate medical illustration of a brain MRI cross-section.", prompt: "Accurate medical illustration of a human brain MRI cross-section, labeled anatomical regions, soft blue clinical palette, textbook clarity, subtle depth, professional healthcare tone, clean vector-meets-render style, high detail, trustworthy", tags: ["Medical Illustration", "Healthcare", "MRI"], category: "medical-illustration", model: "openart", aspect: "4:3" },
  { title: "Diwali Rooftop Celebration", description: "A joyful Diwali night scene glowing with diyas and fireworks.", prompt: "Vibrant Diwali celebration on a rooftop at night, hundreds of glowing diyas, rangoli patterns, fireworks bursting over the city, family in elegant traditional attire, warm golden bokeh, festive mood, cinematic photography, rich jewel tones, ultra-detailed", tags: ["Diwali", "Festival", "Culture"], category: "diwali", model: "midjourney", aspect: "16:9" },
  { title: "Dream Machine City Flyover", description: "A sweeping cinematic drone flyover of a futuristic city at dusk.", prompt: "Sweeping cinematic drone flyover of a futuristic megacity at dusk, sleek towers with holographic facades, flying vehicles, volumetric clouds, orbiting crane shot, smooth natural motion, teal and orange cinematic palette, epic atmosphere, photoreal", tags: ["Sci-Fi", "Cinematic", "Video"], category: "sci-fi", model: "luma", aspect: "16:9" },
  { title: "Pixar-Style Curious Fox", description: "An adorable stylized fox cub with oversized eyes exploring a meadow.", prompt: "Adorable Pixar-style fox cub with oversized expressive eyes exploring a sunlit meadow, soft subsurface fur, dewdrops, whimsical mood, cinematic soft lighting, 3D render, warm palette, shallow depth of field, character splash art, highly detailed", tags: ["Pixar Style", "3D", "Character"], category: "pixar-style", model: "openart", aspect: "1:1" },
  { title: "Luxury Watch Macro", description: "Extreme macro of a mechanical watch movement in gold light.", prompt: "Extreme macro photograph of a luxury mechanical watch movement, intricate gears and jewels, golden hour reflection, shallow depth of field, 100mm macro lens, studio product lighting, black and gold palette, hyper-detailed textures, premium commercial look", tags: ["Luxury Product", "Macro", "Jewelry"], category: "macro-photography", model: "flux", aspect: "1:1" },
  { title: "Cozy Reading Nook Interior", description: "A warm Scandinavian reading nook bathed in afternoon light.", prompt: "Interior design render of a cozy Scandinavian reading nook, curved bouclé chair, floor lamp, built-in oak bookshelves, large window with sheer curtains, warm afternoon light, plants, natural materials, photoreal, serene mood, 8K", tags: ["Interior Design", "Cozy", "Architecture"], category: "interior-design", model: "openart", aspect: "3:2" },
  { title: "Epic Game Splash Art", description: "A battle-worn warrior queen splash art for a AAA fantasy game.", prompt: "AAA game splash art of a battle-worn warrior queen, ornate glowing armor, wind-torn cape, dramatic backlight, embers and ash, epic low-angle hero shot, stylized concept art, rich jewel tones, intricate details, trending on ArtStation, masterpiece", tags: ["Gaming", "Concept Art", "Character"], category: "gaming", model: "leonardo", aspect: "16:9" },
  { title: "Skincare Product Splash", description: "Clean beauty serum bottle with water splash on marble.", prompt: "Beauty skincare serum bottle on white marble, crystal-clear water splash, fresh green leaf, soft glam beauty lighting, high-key clean aesthetic, commercial product photography, dewy freshness, pastel palette, ultra-detailed, license-ready", tags: ["Beauty", "Product", "Commercial"], category: "beauty", model: "flux", aspect: "4:3" },
  { title: "Retro Pixel Dungeon", description: "A 16-bit pixel-art dungeon crawler scene with torchlight.", prompt: "16-bit pixel art dungeon crawler scene, stone corridor lit by flickering torches, hero sprite, treasure chest, limited retro palette, crisp pixels, atmospheric shadows, nostalgic game aesthetic, detailed tile work", tags: ["Pixel Art", "Gaming", "Retro"], category: "pixel-art", model: "sd", aspect: "16:9" },
  { title: "Wedding Golden Hour Vows", description: "A cinematic wedding portrait in a lavender field at sunset.", prompt: "Cinematic wedding portrait of a couple exchanging vows in a lavender field at golden hour, soft backlight, flowing veil, warm bokeh, shot on 85mm f/1.4, romantic mood, pastel warm palette, editorial detail, emotional, 8K", tags: ["Wedding", "Portrait", "Cinematic"], category: "wedding", model: "midjourney", aspect: "3:2" },
  { title: "EV Concept Studio Reveal", description: "A sleek electric hypercar rotating on a studio turntable.", prompt: "Sleek electric hypercar concept on a studio turntable, glossy midnight-blue paint, dramatic light streaks, reflective floor, rim lighting, automotive commercial photography, cinematic reveal, high-contrast, ultra-detailed reflections, 8K", tags: ["Cars", "Product", "Commercial"], category: "cars", model: "openart", aspect: "16:9" },
];

function makeCard(concept, i) {
  const seed = slugify(concept.title) + i;
  const r = (k) => seededRandom(seed + k);
  return {
    id: `p-${i}`,
    title: concept.title,
    slug: slugify(concept.title) + "-" + i,
    description: concept.description,
    prompt: concept.prompt,
    negativePrompt: concept.negative,
    tags: concept.tags,
    categorySlug: concept.category,
    modelId: concept.model,
    difficulty: DIFFICULTIES[Math.floor(r("df") * DIFFICULTIES.length)],
    aspectRatio: concept.aspect ?? seededPick(seed + "ar", ASPECTS),
    seed,
  };
}

/** Synthesize additional believable cards per category to fill the library. */
function synthesize() {
  const out = [];
  const models = ["openart", "midjourney", "flux", "leonardo", "sd", "ideogram", "dalle"];
  for (const cat of CATEGORIES) {
    const n = 1 + (seededRandom(cat.slug + "n") > 0.5 ? 1 : 0);
    for (let k = 0; k < n; k++) {
      const s = cat.slug + k;
      const style = seededPick(s + "st", ART_STYLES);
      const light = seededPick(s + "li", LIGHTING);
      const cam = seededPick(s + "ca", CAMERAS);
      const lens = seededPick(s + "ln", LENSES);
      const mood = seededPick(s + "mo", MOODS);
      const palette = seededPick(s + "pa", PALETTES);
      const boost = seededPick(s + "b", QUALITY_BOOSTERS);
      const adj = seededPick(s + "adj", ["Ethereal", "Bold", "Dreamlike", "Iconic", "Luminous", "Timeless", "Surreal", "Vivid"]);
      out.push({
        title: `${adj} ${cat.name} ${seededPick(s + "n2", ["Study", "Scene", "Concept", "Series", "Vision", "Feature"])}`,
        description: `${cat.name} prompt with ${mood} styling and ${palette}.`,
        prompt: `${cat.name}, ${style}, ${light}, shot on ${cam} with ${lens}, ${palette} color palette, ${mood} mood, ${boost}, ultra-detailed`,
        tags: [cat.name, cat.group, style.split(" ")[0]],
        category: cat.slug,
        model: seededPick(s + "m", cat.group === "Core Formats" && seededRandom(s + "v") > 0.6 ? ["runway", "luma", "kling"] : models),
        aspect: seededPick(s + "ar", ASPECTS),
      });
    }
  }
  return out;
}

const ALL_CONCEPTS = [...CONCEPTS, ...synthesize()];

export const PROMPTS = ALL_CONCEPTS.map(makeCard);

// Compatibility aliases for existing routes. These are stable curated slices,
// not popularity, engagement or quality rankings.
export const FEATURED_PROMPTS = PROMPTS.slice(0, 8);
export const TRENDING_PROMPTS = PROMPTS.slice(0, 12);
export const TOP_PROMPTS = PROMPTS.slice(0, 12);

export function getPromptsByCategory(slug) {
  return PROMPTS.filter((p) => p.categorySlug === slug);
}

export function getPromptBySlug(slug) {
  return PROMPTS.find((p) => p.slug === slug);
}

export const PROMPTS_BY_ID = Object.fromEntries(PROMPTS.map((p) => [p.id, p]));
