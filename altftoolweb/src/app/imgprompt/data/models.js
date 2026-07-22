export const AI_MODELS = [
  { id: "openart", name: "OpenArt", slug: "openart", medium: "image", vendor: "OpenArt", tagline: "The final canvas — every Imaginnex prompt is tuned to paste straight into OpenArt.", accent: "#8b5cf6", strengths: ["Model mixing", "Character consistency", "Community models", "Upscaling"], controls: ["image", "camera", "advanced"], popularity: 98, badge: "Popular" },
  { id: "midjourney", name: "Midjourney", slug: "midjourney", medium: "image", vendor: "Midjourney", tagline: "Best-in-class aesthetics with --ar, --stylize, --chaos and --weird control.", accent: "#22d3ee", strengths: ["Artistic quality", "Lighting", "Stylize control", "Coherence"], controls: ["image", "camera", "advanced"], popularity: 96, badge: "Popular" },
  { id: "flux", name: "Flux", slug: "flux", medium: "image", vendor: "Black Forest Labs", tagline: "Razor-sharp photorealism and flawless text rendering from natural language.", accent: "#f472b6", strengths: ["Photorealism", "Legible text", "Prompt adherence", "Hands"], controls: ["image", "camera", "advanced"], popularity: 92, badge: "New" },
  { id: "ideogram", name: "Ideogram", slug: "ideogram", medium: "image", vendor: "Ideogram", tagline: "The typography king — logos, posters and in-image text that actually reads.", accent: "#fb923c", strengths: ["Typography", "Logos", "Posters", "Color"], controls: ["image", "commerce"], popularity: 86 },
  { id: "leonardo", name: "Leonardo", slug: "leonardo", medium: "image", vendor: "Leonardo.Ai", tagline: "Game-ready assets, characters and concept art with fine element control.", accent: "#34d399", strengths: ["Game assets", "Concept art", "Elements", "Consistency"], controls: ["image", "camera", "advanced"], popularity: 84 },
  { id: "dalle", name: "DALL·E 3", slug: "dalle", medium: "image", vendor: "OpenAI", tagline: "Understands complex, conversational prompts and long descriptive scenes.", accent: "#60a5fa", strengths: ["Prompt comprehension", "Scenes", "Safety", "Composition"], controls: ["image", "commerce"], popularity: 88 },
  { id: "sd", name: "Stable Diffusion", slug: "stable-diffusion", medium: "image", vendor: "Stability AI", tagline: "Open, controllable, LoRA-friendly — the power user's diffusion workhorse.", accent: "#a78bfa", strengths: ["Open weights", "LoRA / ControlNet", "Custom models", "Flexibility"], controls: ["image", "camera", "advanced"], popularity: 90 },
  { id: "runway", name: "Runway Gen-3", slug: "runway", medium: "video", vendor: "Runway", tagline: "Cinematic text-to-video with camera moves and motion brush control.", accent: "#f87171", strengths: ["Cinematics", "Camera motion", "Consistency", "Image-to-video"], controls: ["video", "camera", "story"], popularity: 93, badge: "Popular" },
  { id: "pika", name: "Pika", slug: "pika", medium: "video", vendor: "Pika Labs", tagline: "Fast, playful video with expressive lip-sync and creative effects.", accent: "#c084fc", strengths: ["Speed", "Lip-sync", "Effects", "Social clips"], controls: ["video", "audio", "story"], popularity: 82 },
  { id: "kling", name: "Kling", slug: "kling", medium: "video", vendor: "Kuaishou", tagline: "Long-form, physically-accurate motion with up to 2-minute generations.", accent: "#2dd4bf", strengths: ["Long clips", "Physics", "Realism", "Motion"], controls: ["video", "camera", "story"], popularity: 87, badge: "New" },
  { id: "luma", name: "Luma Dream Machine", slug: "luma", medium: "video", vendor: "Luma AI", tagline: "Smooth, dreamlike shots with natural camera language and keyframes.", accent: "#38bdf8", strengths: ["Smooth motion", "Keyframes", "Camera language", "Realism"], controls: ["video", "camera", "story"], popularity: 85 },
  { id: "hailuo", name: "Hailuo MiniMax", slug: "hailuo", medium: "video", vendor: "MiniMax", tagline: "Striking cinematic motion and character expression from short prompts.", accent: "#fbbf24", strengths: ["Expression", "Cinematic", "Prompt economy", "Detail"], controls: ["video", "story"], popularity: 80 },
];

export const MODELS_BY_ID = Object.fromEntries(AI_MODELS.map((m) => [m.id, m]));

export const IMAGE_MODELS = AI_MODELS.filter((m) => m.medium === "image");
export const VIDEO_MODELS = AI_MODELS.filter((m) => m.medium === "video");

export function getModel(id) {
  return (id && MODELS_BY_ID[id]) || MODELS_BY_ID.openart;
}
