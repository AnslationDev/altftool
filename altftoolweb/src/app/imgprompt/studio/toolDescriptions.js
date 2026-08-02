/**
 * Search descriptions for the 52 indexable AI Prompt Studio tools.
 *
 * Why this file exists rather than more fields in ../data/navigation.js: the
 * `description` there is the sidebar/workspace subtitle, and the three that
 * had one ("Turn any idea into a pro prompt", 31 chars) were being reused as
 * the meta description. 35 of 52 studio URLs therefore shipped a description
 * under 70 characters — too thin to earn a click — and the remaining fallback
 * had a grammar bug: `${label.toLowerCase()} prompts` turned "Anime Prompt"
 * into "Create and refine anime prompt prompts" and "Midjourney" into
 * "midjourney". Nine tools hit the doubled noun and every model name was
 * lowercased. Keeping the SEO copy here leaves the UI subtitles alone.
 *
 * Each line describes what that tool actually does, read off the studio's own
 * code: the idea box, the Studio Controls its `controls` array unlocks
 * (Creative Direction, Image Parameters, Advanced chaos/stylize, Video &
 * Motion, Voice & Music, Negative Prompt), and the Copy Prompt / negative
 * prompt / Prompt Intelligence output. Controls are not claimed for a tool
 * that does not have them — Pika has no Creative Direction panel, Hailuo has
 * neither that nor Voice & Music, and Story/Script Generator expose only the
 * negative prompt.
 *
 * Length rule (src/platform/seo/generateMetadata.js): trimMetaDescription
 * passes a string under 160 characters ending in . ! or ? through verbatim and
 * truncates anything else, so keep these at 150-158 and end them with a period.
 */
export const STUDIO_TOOL_DESCRIPTIONS = {
  // ---- Prompt Studio (core) ----
  "prompt-generator":
    "Turn a one-line idea into a full AI image prompt. Set art style, camera, lens, lighting and mood, then copy the prompt and its negative prompt.",
  "prompt-optimizer":
    "Paste a rough prompt and rebuild it with camera, lighting and quality detail, then read the Prompt Intelligence score before you spend a generation.",
  "image-prompt":
    "Write still-image prompts for Midjourney, Flux, DALL-E and Stable Diffusion. Set style, lens, lighting, aspect ratio and seed, then copy the result.",
  "video-prompt":
    "Write text-to-video prompts for Runway, Pika, Kling and Luma. Set clip duration, motion level, FPS, transition and camera move, then copy the result.",
  "cinema-prompt":
    "Write cinematic shot prompts: choose the camera move, lens and mood, add voice and music direction, then copy a director-style brief for any video model.",
  "story-generator":
    "Turn a premise into a structured story prompt. Describe the idea, add what to avoid as a negative prompt, and copy a brief your AI writing model can follow.",
  "script-generator":
    "Turn a logline into a scene-by-scene script prompt. Describe the story, add what to avoid as a negative prompt, and copy a brief ready for any AI model.",

  // ---- AI Models ----
  midjourney:
    "Write Midjourney prompts with stylize and chaos handled for you. Set art style, camera, lens, lighting and mood, then copy the prompt and its negatives.",
  openart:
    "Write OpenArt prompts built for model mixing, character consistency and upscaling. Set style, camera, lighting and aspect ratio, then copy and paste.",
  flux: "Write Flux prompts tuned for razor-sharp photorealism and legible in-image text. Set camera, lens, lighting and mood, then copy the finished prompt.",
  ideogram:
    "Write Ideogram prompts for logos, posters and in-image text that actually reads. Set the art style, palette, aspect ratio and resolution, then copy it.",
  leonardo:
    "Write Leonardo.Ai prompts for game assets, characters and concept art. Set style, camera, lens, lighting and stylize level, then copy prompt and negatives.",
  dalle:
    "Write DALL-E 3 prompts as the long, conversational scene descriptions it reads best. Set composition, lighting, mood and aspect ratio, then copy it over.",
  "stable-diffusion":
    "Write Stable Diffusion prompts for LoRA and ControlNet workflows. Set style, camera, lighting, seed, chaos and stylize, then copy prompt and negatives.",
  runway:
    "Write Runway Gen-3 prompts with cinematic camera motion built in. Set clip duration, motion level, FPS, transition and camera move, then copy the result.",
  pika: "Write Pika prompts for fast, playful clips. Set clip duration, motion level, FPS, voice style, narration and music mood, then copy the finished prompt.",
  kling:
    "Write Kling prompts for long, physically believable motion. Set clip length, motion level, FPS, transition and camera move, then copy the finished prompt.",
  luma: "Write Luma Dream Machine prompts in natural camera language. Set clip duration, motion level, FPS, transition and lens, then copy the finished prompt.",
  hailuo:
    "Write Hailuo MiniMax prompts that get striking cinematic motion out of very short text. Set clip duration, motion level, FPS and transition, then copy it.",

  // ---- Story & Script ----
  "children-book":
    "Write children's book illustration prompts. Set the art style, palette, mood and page-friendly aspect ratio, then copy a prompt any image model can render.",
  "comic-generator":
    "Write comic panel prompts. Set the art style, composition, lighting and palette panel by panel, then copy a prompt that keeps the pages looking like a set.",

  // ---- Commercial & Brand ----
  "commercial-ads":
    "Write commercial ad prompts. Set the product framing, lighting, palette, aspect ratio and resolution, then copy a prompt built for campaign-ready visuals.",
  "product-photography":
    "Write product photography prompts. Choose the camera, lens, lighting setup, background palette and aspect ratio, then copy a studio-quality image prompt.",
  logo: "Write logo prompts. Set the art style, palette, composition and a square aspect ratio, then copy a prompt tuned for Ideogram and other typography models.",
  packaging:
    "Write packaging design prompts. Set the material look, lighting, palette, composition and aspect ratio, then copy a mockup-ready prompt for any model.",

  // ---- Design & Space ----
  architecture:
    "Write architecture visualization prompts. Pick the camera, lens, time of day, lighting and mood, then copy an exterior or facade prompt ready to render.",
  "interior-design":
    "Write interior design prompts. Set the room style, palette, lighting, camera and lens, then copy a prompt that renders a finished room in any image model.",

  // ---- Characters & Style ----
  "character-builder":
    "Build AI character prompts. Lock the art style, lighting, mood, framing and seed so the same character stays recognisable across every image you generate.",
  anime:
    "Write anime prompts. Set the art style, palette, composition, lighting, mood and stylize level, then copy a prompt tuned for anime-capable image models.",
  fantasy:
    "Write fantasy art prompts. Set the scene, art style, lighting, palette, mood and chaos level, then copy a prompt ready for any AI image model you use.",
  fashion:
    "Write fashion prompts. Choose the camera, lens, lighting, palette and framing, then copy an editorial or lookbook prompt for any AI image generator.",
  beauty:
    "Write beauty prompts. Set the lighting, palette, close-up framing, camera and lens, then copy a campaign-ready prompt plus the negatives to avoid artefacts.",

  // ---- Healthcare ----
  healthcare:
    "Write healthcare imagery prompts. Set the clinical setting, art style, lighting, palette and composition, then copy a prompt for calm, respectful visuals.",
  "medical-illustration":
    "Write medical illustration prompts. Set the render style, palette, lighting and label-friendly composition, then copy a prompt any AI image model can use.",

  // ---- Lifestyle ----
  "food-photography":
    "Write food photography prompts. Choose the camera, lens, lighting, plating and palette, then copy a menu or social-ready prompt for any AI image model.",
  travel:
    "Write travel photography prompts. Set the destination, time of day, lens, lighting and mood, then copy a prompt that renders postcard-quality scenes.",
  "real-estate":
    "Write real estate photography prompts. Set the property type, camera, lens, natural lighting and mood, then copy a listing-ready prompt for any model.",

  // ---- Social & Ads ----
  "youtube-thumbnail":
    "Write YouTube thumbnail prompts. Set the subject framing, palette, lighting and a 16:9 aspect ratio, then copy a prompt built for high-contrast click appeal.",
  "instagram-post":
    "Write Instagram post prompts. Set the palette, lighting, mood and a square or 4:5 aspect ratio, then copy a feed-ready prompt for any AI image generator.",
  "tiktok-video":
    "Write TikTok video prompts. Set the clip duration, motion level, FPS, transition, voice and music mood, then copy a vertical, hook-first video prompt.",
  "linkedin-creative":
    "Write LinkedIn creative prompts. Set the palette, lighting, composition, aspect ratio and resolution, then copy a clean, professional AI image prompt.",
  "facebook-ads":
    "Write Facebook ad prompts. Set the product framing, palette, lighting, aspect ratio and resolution, then copy a prompt built for paid social creative.",
  "google-ads":
    "Write Google Ads creative prompts. Set the palette, lighting, composition and banner aspect ratio, then copy a prompt sized for display and responsive ads.",
  "banner-ads":
    "Write banner ad prompts. Set the palette, lighting, composition and a wide aspect ratio, then copy a display-banner prompt for any AI image generator.",
  infographics:
    "Write infographic prompts. Set the layout, palette, icon style and label-friendly composition, then copy a prompt that renders clean, readable data visuals.",

  // ---- 3D, Game & Worlds ----
  "3d-render":
    "Write 3D render prompts. Set the material, lighting, lens, palette and stylize level, then copy a prompt that returns clean, product-grade CGI every time.",
  gaming:
    "Write game art prompts. Set the art style, lighting, palette, chaos and stylize levels, then copy a prompt for concept art, assets and key art alike.",
  "pixel-art":
    "Write pixel art prompts. Set the palette, resolution, lighting, composition and seed, then copy a prompt that keeps sprites and scenes crisp, not mushy.",
  nft: "Write NFT art prompts. Set the art style, palette, composition and a fixed seed, then rerun the prompt trait by trait to keep a collection consistent.",
  "fantasy-world":
    "Write fantasy world prompts. Set the landscape, lighting, palette, lens and mood, then copy a prompt for vistas, maps and environment concept art.",
  cyberpunk:
    "Write cyberpunk prompts. Set the neon palette, lighting, lens, mood and chaos level, then copy a prompt for gritty near-future scenes in any image model.",
  "sci-fi":
    "Write sci-fi prompts. Set the scene, lighting, palette, lens and stylize level, then copy a prompt for ships, worlds and hard-science concept art.",
};

/**
 * "Anime Prompt" -> "Anime", so composed copy reads "Anime prompts" and not
 * "Anime Prompt prompts". Labels that are not already prompt-suffixed
 * ("Midjourney", "Prompt Generator") come back unchanged, and the label's own
 * capitalisation is preserved — lowercasing it is what produced "midjourney"
 * and "dall·e" in the old fallback.
 */
export function getPromptSubject(label) {
  return String(label ?? "")
    .replace(/\s+prompts?$/i, "")
    .trim();
}

/**
 * Description for a studio tool, for both its metadata and its JSON-LD.
 *
 * Order matters: the authored line above wins, because `item.description` in
 * navigation.js is a 28-34 character UI subtitle and the seeded
 * `category.description` is a template ("X prompts engineered for stunning,
 * consistent AI results.") repeated across every category.
 */
export function getStudioToolDescription(item) {
  if (!item) return "";
  const authored = Object.hasOwn(STUDIO_TOOL_DESCRIPTIONS, item.slug)
    ? STUDIO_TOOL_DESCRIPTIONS[item.slug]
    : null;
  if (authored) return authored;

  // 131 characters before the subject is spliced in, so even a long new label
  // lands inside the 160-character cap instead of being truncated.
  const subject = getPromptSubject(item.label) || "AI";
  return `Write ${subject} prompts in the AltF AI Prompt Studio. Set art style, camera, lighting and mood, then copy the prompt and its negative prompt.`;
}
