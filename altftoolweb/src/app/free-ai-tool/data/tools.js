import {
  Briefcase,
  CircleUserRound,
  Clapperboard,
  Clock,
  Code2,
  Eraser,
  FileText,
  Gift,
  GraduationCap,
  Hexagon,
  Image as ImageIcon,
  Languages,
  Megaphone,
  MessageSquare,
  Mic,
  Music,
  Palette,
  PenLine,
  Presentation,
  Rocket,
  ShieldCheck,
  Share2,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
  Wallet,
  Wand2,
  Zap,
} from "lucide-react";

// Pricing labels: "FREE" = fully free / free forever tier, "FREE + PAID" = generous
// free tier with paid upgrades. Kept as display strings so cards render them as-is.
const tool = (name, domain, tagline, rating, pricing = "FREE + PAID", popular = false, url) => ({
  name,
  domain,
  tagline,
  rating,
  pricing,
  popular,
  url: url || `https://${domain}`,
});

export const TOOL_CATEGORIES = [
  {
    id: "image-generation",
    label: "Image Generation",
    icon: ImageIcon,
    hue: ["#8b5cf6", "#d946ef"],
    blurb: "Turn text prompts into stunning artwork, photos, and illustrations.",
    tools: [
      tool("ChatGPT Image", "chatgpt.com", "Generate and edit images conversationally right inside ChatGPT.", 4.8, "FREE + PAID", true),
      tool("Flux AI", "bfl.ai", "State-of-the-art open image model with photorealistic output.", 4.7),
      tool("Ideogram", "ideogram.ai", "Best-in-class AI images with clean, readable text rendering.", 4.7, "FREE + PAID", true),
      tool("Playground AI", "playground.com", "Create and remix AI images with a powerful free editor.", 4.5),
      tool("Mage Space", "mage.space", "Unlimited free Stable Diffusion image generation in the browser.", 4.4, "FREE"),
    ],
  },
  {
    id: "video-generation",
    label: "Video Generation",
    icon: Clapperboard,
    hue: ["#f43f5e", "#fb923c"],
    blurb: "Generate cinematic clips and animations from text or images.",
    tools: [
      tool("Pika", "pika.art", "Playful text-to-video generation with fun effects and remixing.", 4.6, "FREE + PAID", true),
      tool("Kling AI", "klingai.com", "High-quality realistic video generation with daily free credits.", 4.7, "FREE + PAID", true),
      tool("Luma Dream Machine", "lumalabs.ai", "Dreamlike cinematic video from text and image prompts.", 4.6),
      tool("PixVerse", "pixverse.ai", "Fast anime and realistic video generation with free credits.", 4.4),
      tool("Haiper", "haiper.ai", "Creative video model built for smooth, expressive motion.", 4.3),
    ],
  },
  {
    id: "ai-writing",
    label: "AI Writing",
    icon: PenLine,
    hue: ["#38bdf8", "#6366f1"],
    blurb: "Draft, rewrite, and polish any text in seconds.",
    tools: [
      tool("ChatGPT", "chatgpt.com", "The most popular AI assistant for writing anything, free to use.", 4.9, "FREE + PAID", true),
      tool("Claude", "claude.ai", "Nuanced long-form writing with a generous free plan.", 4.9, "FREE + PAID", true),
      tool("Gemini", "gemini.google.com", "Google's multimodal assistant for research-backed writing.", 4.7, "FREE"),
      tool("DeepSeek", "deepseek.com", "Powerful open reasoning model, completely free to chat with.", 4.6, "FREE"),
      tool("Writesonic", "writesonic.com", "Marketing copy, articles, and rewrites with SEO built in.", 4.4),
    ],
  },
  {
    id: "prompt-generator",
    label: "Prompt Generator",
    icon: Wand2,
    hue: ["#a855f7", "#6366f1"],
    blurb: "Discover and generate high-performing prompts for any model.",
    tools: [
      tool("PromptPerfect", "promptperfect.jina.ai", "Auto-craft optimized prompts for GPT, Claude, and image models.", 4.5, "FREE + PAID", true),
      tool("FlowGPT", "flowgpt.com", "Huge community library of ready-to-use prompts and agents.", 4.4, "FREE"),
      tool("PromptHero", "prompthero.com", "Search millions of proven prompts for Midjourney and SD.", 4.5, "FREE + PAID", true),
      tool("Snack Prompt", "snackprompt.com", "Curated, upvoted prompt feed for professionals.", 4.3, "FREE"),
      tool("OpenPrompt", "openprompt.co", "Open community platform to share and fork prompts.", 4.2, "FREE"),
    ],
  },
  {
    id: "prompt-optimizer",
    label: "Prompt Optimizer",
    icon: SlidersHorizontal,
    hue: ["#22d3ee", "#a855f7"],
    blurb: "Refine rough prompts into precise, reliable instructions.",
    tools: [
      tool("PromptPerfect", "promptperfect.jina.ai", "One-click prompt refinement with side-by-side previews.", 4.5, "FREE + PAID", true),
      tool("PromptLayer", "promptlayer.com", "Version, test, and improve prompts like production code.", 4.4),
      tool("PromptFolder", "promptfolder.com", "Organize, template, and reuse your best prompts.", 4.2, "FREE"),
      tool("FlowGPT", "flowgpt.com", "Battle-tested community prompts you can adapt instantly.", 4.4, "FREE"),
      tool("OpenPrompt", "openprompt.co", "Iterate on shared prompts with community feedback.", 4.2, "FREE"),
    ],
  },
  {
    id: "logo-generator",
    label: "Logo Generator",
    icon: Hexagon,
    hue: ["#f59e0b", "#ef4444"],
    blurb: "Brand-ready logos and identity kits in minutes.",
    tools: [
      tool("Looka", "looka.com", "AI logo maker with full brand kits and mockups.", 4.6, "FREE + PAID", true),
      tool("LogoAI", "logoai.com", "Smart logo design engine with instant brand previews.", 4.4),
      tool("Hatchful", "hatchful.shopify.com", "Shopify's free logo maker for ecommerce brands.", 4.3, "FREE"),
      tool("Designs.ai", "designs.ai", "Logo, video, and banner generation in one creative suite.", 4.3),
      tool("Brandmark", "brandmark.io", "Deep-learning logo designs with unlimited free previews.", 4.4),
    ],
  },
  {
    id: "background-remover",
    label: "Background Remover",
    icon: Eraser,
    hue: ["#14b8a6", "#22d3ee"],
    blurb: "Cut out subjects and clean up photos instantly.",
    tools: [
      tool("Remove.bg", "remove.bg", "The classic one-click background remover, free previews.", 4.8, "FREE + PAID", true),
      tool("Clipdrop", "clipdrop.co", "Stability AI's toolbox: remove, relight, upscale, cleanup.", 4.6, "FREE + PAID", true),
      tool("Adobe Express", "adobe.com", "Free background removal backed by Adobe magic.", 4.5, "FREE", false, "https://www.adobe.com/express/feature/image/remove-background"),
      tool("Canva", "canva.com", "Background remover built into the free Canva editor.", 4.7),
      tool("Photoroom", "photoroom.com", "Product photo studio with instant cutouts and scenes.", 4.6),
    ],
  },
  {
    id: "ai-avatar",
    label: "AI Avatar",
    icon: CircleUserRound,
    hue: ["#ec4899", "#8b5cf6"],
    blurb: "Create talking heads, portraits, and digital personas.",
    tools: [
      tool("HeyGen", "heygen.com", "Studio-quality talking avatar videos from plain text.", 4.7, "FREE + PAID", true),
      tool("Leonardo AI", "leonardo.ai", "Gorgeous stylized portraits and character art, free daily credits.", 4.7, "FREE + PAID", true),
      tool("Remaker", "remaker.ai", "Face swap and avatar generation with free daily uses.", 4.3, "FREE"),
      tool("Fotor", "fotor.com", "AI avatars, headshots, and photo enhancement in one editor.", 4.4),
      tool("Akool", "akool.com", "Realistic avatar and face swap platform for creators.", 4.3),
    ],
  },
  {
    id: "ai-voice",
    label: "AI Voice",
    icon: Mic,
    hue: ["#06b6d4", "#3b82f6"],
    blurb: "Lifelike text-to-speech and voice cloning.",
    tools: [
      tool("ElevenLabs", "elevenlabs.io", "The most realistic AI voices, with a free monthly quota.", 4.9, "FREE + PAID", true),
      tool("PlayHT", "play.ht", "Ultra-realistic voice generation and cloning API.", 4.5),
      tool("TTSMaker", "ttsmaker.com", "100% free text-to-speech in 100+ languages.", 4.3, "FREE"),
      tool("Speechify", "speechify.com", "Listen to any text with natural celebrity-grade voices.", 4.5, "FREE + PAID", true),
      tool("Narakeet", "narakeet.com", "Turn scripts and slides into narrated videos with AI voices.", 4.3),
    ],
  },
  {
    id: "ai-music",
    label: "AI Music",
    icon: Music,
    hue: ["#f472b6", "#fb7185"],
    blurb: "Compose full songs and royalty-free soundtracks.",
    tools: [
      tool("Suno", "suno.com", "Generate complete songs with vocals from a text prompt.", 4.8, "FREE + PAID", true),
      tool("Udio", "udio.com", "Studio-grade AI music creation with free daily songs.", 4.6, "FREE + PAID", true),
      tool("AIVA", "aiva.ai", "Emotional soundtrack composition for films and games.", 4.4),
      tool("Soundraw", "soundraw.io", "Royalty-free AI music tailored to mood and genre.", 4.3),
      tool("Beatoven", "beatoven.ai", "Custom background scores for videos and podcasts.", 4.2),
    ],
  },
  {
    id: "ai-coding",
    label: "AI Coding",
    icon: Code2,
    hue: ["#22c55e", "#14b8a6"],
    blurb: "Autocomplete, refactor, and ship code faster.",
    tools: [
      tool("GitHub Copilot", "github.com", "AI pair programmer with a free tier in VS Code.", 4.8, "FREE + PAID", true, "https://github.com/features/copilot"),
      tool("Cursor", "cursor.com", "The AI-first code editor loved by fast-moving teams.", 4.8, "FREE + PAID", true),
      tool("Windsurf", "windsurf.com", "Agentic IDE that plans and edits across your codebase.", 4.6),
      tool("Codeium", "codeium.com", "Free unlimited autocomplete for 70+ languages.", 4.5, "FREE"),
      tool("Tabnine", "tabnine.com", "Private, personalized code completion for teams.", 4.3),
    ],
  },
  {
    id: "seo-tools",
    label: "SEO Tools",
    icon: TrendingUp,
    hue: ["#eab308", "#84cc16"],
    blurb: "Rank higher with AI-assisted research and audits.",
    tools: [
      tool("Ahrefs Webmaster Tools", "ahrefs.com", "Free site audit and backlink checker from Ahrefs.", 4.7, "FREE", true, "https://ahrefs.com/webmaster-tools"),
      tool("SEO Review Tools", "seoreviewtools.com", "50+ free SEO checkers, from authority to content.", 4.3, "FREE"),
      tool("Keyword Surfer", "surferseo.com", "Free Chrome extension for search volume in the SERP.", 4.4, "FREE", false, "https://surferseo.com/keyword-surfer-extension/"),
      tool("Screpy", "screpy.com", "AI web analysis combining SEO, speed, and uptime.", 4.2),
      tool("Rank Math AI", "rankmath.com", "WordPress SEO plugin with AI content assistant.", 4.6, "FREE + PAID", true),
    ],
  },
  {
    id: "marketing",
    label: "Marketing",
    icon: Megaphone,
    hue: ["#fb923c", "#f43f5e"],
    blurb: "Ads, campaigns, and copy that convert.",
    tools: [
      tool("AdCreative", "adcreative.ai", "Conversion-focused ad creatives generated in seconds.", 4.5, "FREE + PAID", true),
      tool("Copy.ai", "copy.ai", "Free-forever plan for marketing copy and workflows.", 4.5, "FREE + PAID", true),
      tool("Ocoya", "ocoya.com", "AI content and scheduling for social campaigns.", 4.3),
      tool("Predis AI", "predis.ai", "Turn one line into branded posts, reels, and ads.", 4.4),
      tool("Simplified", "simplified.com", "All-in-one AI design, video, and copy for marketers.", 4.4),
    ],
  },
  {
    id: "social-media",
    label: "Social Media",
    icon: Share2,
    hue: ["#3b82f6", "#06b6d4"],
    blurb: "Plan, create, and schedule content everywhere.",
    tools: [
      tool("Buffer AI", "buffer.com", "Free scheduling with an AI assistant for post ideas.", 4.6, "FREE + PAID", true),
      tool("Publer", "publer.com", "Schedule everywhere with AI captions and recycling.", 4.4),
      tool("Metricool", "metricool.com", "Analytics, planning, and AI copy in one free dashboard.", 4.5, "FREE + PAID", true),
      tool("Predis AI", "predis.ai", "AI-generated carousels, memes, and video posts.", 4.4),
      tool("FeedHive", "feedhive.com", "AI-powered scheduling with viral post predictions.", 4.4),
    ],
  },
  {
    id: "presentation",
    label: "Presentation",
    icon: Presentation,
    hue: ["#8b5cf6", "#ec4899"],
    blurb: "Beautiful decks generated from a single prompt.",
    tools: [
      tool("Gamma", "gamma.app", "Stunning decks, docs, and sites from one prompt.", 4.8, "FREE + PAID", true),
      tool("Tome", "tome.app", "Narrative-driven AI presentations with rich media.", 4.5),
      tool("Beautiful.ai", "beautiful.ai", "Slides that design themselves as you type.", 4.5),
      tool("Canva AI", "canva.com", "Magic Design turns prompts into full presentations.", 4.7, "FREE + PAID", true),
      tool("SlidesAI", "slidesai.io", "Turn any text into Google Slides automatically.", 4.3),
    ],
  },
  {
    id: "resume-builder",
    label: "Resume Builder",
    icon: FileText,
    hue: ["#0ea5e9", "#14b8a6"],
    blurb: "Stand-out resumes and cover letters, ATS-ready.",
    tools: [
      tool("Kickresume", "kickresume.com", "AI resume and cover letter writer with pro templates.", 4.6, "FREE + PAID", true),
      tool("Resume.io", "resume.io", "Fast, field-tested resume templates with AI phrasing.", 4.5),
      tool("Teal", "tealhq.com", "Free resume builder plus job tracking and keywords.", 4.6, "FREE + PAID", true),
      tool("Enhancv", "enhancv.com", "Design-forward resumes with an AI improvement coach.", 4.4),
      tool("Rezi", "rezi.ai", "ATS-optimized resume generation with instant scoring.", 4.4),
    ],
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    hue: ["#6366f1", "#22d3ee"],
    blurb: "Study smarter with AI tutors and quiz makers.",
    tools: [
      tool("Khanmigo", "khanmigo.ai", "Khan Academy's AI tutor for students and teachers.", 4.6, "FREE + PAID", true),
      tool("Quizizz AI", "quizizz.com", "Generate interactive quizzes from any topic or text.", 4.5, "FREE + PAID", true),
      tool("Notion AI", "notion.so", "Summarize notes and draft study guides in Notion.", 4.6),
      tool("Tutor AI", "tutorai.me", "Type any subject and get a personalized course.", 4.2),
      tool("Studyable", "studyable.app", "Flashcards and essay feedback powered by AI.", 4.2),
    ],
  },
  {
    id: "business",
    label: "Business",
    icon: Briefcase,
    hue: ["#f59e0b", "#f97316"],
    blurb: "Meetings, docs, and ops on autopilot.",
    tools: [
      tool("Notion AI", "notion.so", "Your connected workspace with AI Q&A and writing.", 4.6, "FREE + PAID", true),
      tool("ClickUp AI", "clickup.com", "Project management with AI summaries and standups.", 4.5),
      tool("Fireflies", "fireflies.ai", "Record, transcribe, and search every meeting free.", 4.5, "FREE + PAID", true),
      tool("Otter", "otter.ai", "Real-time meeting notes with 300 free minutes monthly.", 4.5, "FREE"),
      tool("Taskade", "taskade.com", "AI agents, mind maps, and tasks for teams.", 4.4),
    ],
  },
  {
    id: "productivity",
    label: "Productivity",
    icon: Zap,
    hue: ["#10b981", "#84cc16"],
    blurb: "Automate the busywork and reclaim your day.",
    tools: [
      tool("Motion", "usemotion.com", "AI calendar that plans your day automatically.", 4.5, "FREE + PAID", true),
      tool("Mem AI", "mem.ai", "Self-organizing notes that resurface what matters.", 4.3),
      tool("Taskade", "taskade.com", "Free AI outliner, tasks, and agents in one app.", 4.4, "FREE"),
      tool("Notion AI", "notion.so", "Draft, summarize, and auto-fill across your wiki.", 4.6),
      tool("Perplexity", "perplexity.ai", "Answer engine with cited sources, free unlimited quick search.", 4.8, "FREE + PAID", true),
    ],
  },
  {
    id: "chatbots",
    label: "Chatbots",
    icon: MessageSquare,
    hue: ["#7c3aed", "#2563eb"],
    blurb: "The best free AI assistants to talk to.",
    tools: [
      tool("ChatGPT", "chatgpt.com", "OpenAI's flagship assistant — free tier with GPT power.", 4.9, "FREE + PAID", true),
      tool("Claude", "claude.ai", "Anthropic's thoughtful, safety-first AI assistant.", 4.9, "FREE + PAID", true),
      tool("Gemini", "gemini.google.com", "Google's assistant with live web knowledge, free.", 4.7, "FREE"),
      tool("DeepSeek", "deepseek.com", "Free frontier-grade reasoning and coding chat.", 4.6, "FREE"),
      tool("Perplexity", "perplexity.ai", "Conversational search that cites every answer.", 4.8, "FREE"),
    ],
  },
  {
    id: "translation",
    label: "Translation",
    icon: Languages,
    hue: ["#06b6d4", "#22c55e"],
    blurb: "Translate anything with near-human accuracy.",
    tools: [
      tool("DeepL", "deepl.com", "The gold standard for nuanced, natural translation.", 4.8, "FREE + PAID", true),
      tool("Google Translate", "translate.google.com", "Instant free translation across 240+ languages.", 4.7, "FREE"),
      tool("Lingva", "lingva.ml", "Privacy-friendly, ad-free Google Translate front-end.", 4.2, "FREE"),
      tool("LibreTranslate", "libretranslate.com", "Open-source machine translation you can self-host.", 4.1, "FREE"),
      tool("Immersive Translate", "immersivetranslate.com", "Bilingual web, PDF, and subtitle translation.", 4.6, "FREE + PAID", true),
    ],
  },
  {
    id: "design",
    label: "Design",
    icon: Palette,
    hue: ["#d946ef", "#f43f5e"],
    blurb: "AI copilots for every kind of visual design.",
    tools: [
      tool("Canva AI", "canva.com", "Magic Studio: design, edit, and generate for free.", 4.7, "FREE + PAID", true),
      tool("Adobe Firefly", "adobe.com", "Commercially-safe generative fill, text effects, and art.", 4.6, "FREE + PAID", true, "https://firefly.adobe.com"),
      tool("Krea AI", "krea.ai", "Real-time AI canvas and upscaling playground.", 4.6),
      tool("Figma AI", "figma.com", "AI-assisted design and prototyping inside Figma.", 4.5),
      tool("Recraft", "recraft.ai", "Generate editable vector art, icons, and mockups.", 4.6),
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    icon: ShoppingBag,
    hue: ["#f97316", "#eab308"],
    blurb: "Product photos and listings that sell.",
    tools: [
      tool("Flair AI", "flair.ai", "Drag-and-drop AI product photography studio.", 4.5, "FREE + PAID", true),
      tool("Pebblely", "pebblely.com", "40 free product scenes per month, one click each.", 4.4, "FREE + PAID", true),
      tool("SellerPic", "sellerpic.ai", "AI fashion models and product image enhancement.", 4.3),
      tool("Claid", "claid.ai", "Batch-enhance and generate product imagery via API.", 4.3),
      tool("Booth AI", "booth.ai", "Lifestyle product shots from a simple photo upload.", 4.2),
    ],
  },
  {
    id: "finance",
    label: "Finance",
    icon: Wallet,
    hue: ["#16a34a", "#0ea5e9"],
    blurb: "Budgets, forecasts, and money copilots.",
    tools: [
      tool("Datarails AI", "datarails.com", "FP&A chat over your own financial spreadsheets.", 4.4, "FREE + PAID", true),
      tool("Cube", "cubesoftware.com", "Spreadsheet-native planning with AI insights.", 4.3),
      tool("Tiller", "tillerhq.com", "Automated budgeting spreadsheets with AI assist.", 4.4),
      tool("Cleo", "meetcleo.com", "A witty AI money coach that roasts your spending.", 4.5, "FREE + PAID", true),
      tool("Fina", "fina.money", "Flexible personal finance tracking with AI answers.", 4.2),
    ],
  },
];

export const TOTAL_TOOLS = TOOL_CATEGORIES.reduce(
  (sum, category) => sum + category.tools.length,
  0,
);

// Curated picks for the "Trending" and "Newly Added" carousels, referenced by
// [name, domain] rather than a flag on `tool()` so the source list above stays
// a flat catalog and these two curated orders live in one place.
const TRENDING_KEYS = [
  ["ChatGPT", "chatgpt.com"],
  ["Suno", "suno.com"],
  ["Cursor", "cursor.com"],
  ["Ideogram", "ideogram.ai"],
  ["ElevenLabs", "elevenlabs.io"],
  ["Gamma", "gamma.app"],
  ["Canva AI", "canva.com"],
  ["Kling AI", "klingai.com"],
  ["Perplexity", "perplexity.ai"],
  ["DeepL", "deepl.com"],
];

const NEW_KEYS = [
  ["Windsurf", "windsurf.com"],
  ["Krea AI", "krea.ai"],
  ["PixVerse", "pixverse.ai"],
  ["Flux AI", "bfl.ai"],
  ["Rank Math AI", "rankmath.com"],
  ["Predis AI", "predis.ai"],
  ["Immersive Translate", "immersivetranslate.com"],
  ["Fireflies", "fireflies.ai"],
];

function collectByKeys(keys) {
  const order = new Map(keys.map(([name, domain], index) => [`${name}|${domain}`, index]));
  const seen = new Set();
  const results = [];
  for (const category of TOOL_CATEGORIES) {
    for (const item of category.tools) {
      const key = `${item.name}|${item.domain}`;
      // A handful of tools (ChatGPT, Canva AI, Perplexity, Predis AI...) are
      // cross-listed under more than one category — keep only the first match.
      if (order.has(key) && !seen.has(key)) {
        seen.add(key);
        results.push({ ...item, categoryId: category.id, categoryLabel: category.label, hue: category.hue });
      }
    }
  }
  return results.sort((a, b) => order.get(`${a.name}|${a.domain}`) - order.get(`${b.name}|${b.domain}`));
}

export function getTrendingTools() {
  return collectByKeys(TRENDING_KEYS);
}

export function getNewlyAddedTools() {
  return collectByKeys(NEW_KEYS);
}

const EDITORS_PICK_KEYS = [
  ["Claude", "claude.ai"],
  ["Remove.bg", "remove.bg"],
  ["HeyGen", "heygen.com"],
  ["GitHub Copilot", "github.com"],
  ["Notion AI", "notion.so"],
  ["Looka", "looka.com"],
  ["Khanmigo", "khanmigo.ai"],
  ["Kickresume", "kickresume.com"],
];

export function getEditorsPickTools() {
  return collectByKeys(EDITORS_PICK_KEYS);
}

export const VALUE_PROPS = [
  {
    icon: Gift,
    title: "Always free to browse",
    description: "No paywalls, no signup wall — every listing is free to open and try.",
  },
  {
    icon: Clock,
    title: "Updated weekly",
    description: "Fresh free AI tools added every week, so the directory never goes stale.",
  },
  {
    icon: ShieldCheck,
    title: "Hand-picked, not scraped",
    description: "Every tool is reviewed for a genuine free tier before it makes the cut.",
  },
  {
    icon: TrendingUp,
    title: `${TOOL_CATEGORIES.length} categories, zero clutter`,
    description: "From image generation to finance — organized so you find the right tool fast.",
  },
];

// Illustrative persona-based quotes rather than named individuals — no
// fabricated identities, just the kinds of users this directory serves.
export const TESTIMONIALS = [
  {
    role: "Freelance Designer",
    icon: Palette,
    quote: "I bookmark this every time I need a quick AI tool — the categories save me from endless Googling.",
  },
  {
    role: "Indie Hacker",
    icon: Rocket,
    quote: "Found my whole AI stack here in one afternoon. Didn't pay for a single tool to get started.",
  },
  {
    role: "Content Creator",
    icon: Clapperboard,
    quote: "The video and voice categories alone are worth bookmarking this page.",
  },
  {
    role: "Startup Founder",
    icon: Briefcase,
    quote: "We use tools from this list daily for meetings, docs, and marketing — all on free tiers.",
  },
  {
    role: "Student",
    icon: GraduationCap,
    quote: "Great for assignments — the writing and education categories are exactly what I needed.",
  },
  {
    role: "Marketing Lead",
    icon: Megaphone,
    quote: "Cuts our tool research time in half. Everything is organized and actually free to try.",
  },
];

export const FAQS = [
  {
    question: "Are all these AI tools really free?",
    answer:
      "Every tool listed offers a genuinely free way to use it — either a full free plan or a generous free tier. We tag each one FREE or FREE + PAID so you know what to expect before you click.",
  },
  {
    question: "How do you choose which tools to list?",
    answer:
      "We manually review each tool for a real free tier, an active product, and a clear fit with one of our categories before adding it.",
  },
  {
    question: "How often is the directory updated?",
    answer:
      "New tools are added weekly as we find genuinely useful free options — check the Newly Added section for the latest picks.",
  },
  {
    question: "Do I need to create an account to use these tools?",
    answer:
      "Browsing the directory is open to everyone. Opening an actual tool just needs a quick free sign-in with us first — it keeps the directory spam-free and takes a few seconds. The tool itself may then have its own separate free account on its own site.",
  },
  {
    question: "Can I suggest a tool to add?",
    answer:
      "Yes — use the Request a Tool page and we'll review it for the next update.",
  },
  {
    question: "Will you add more categories?",
    answer:
      "Yes, categories grow with the AI tool landscape — if a tool doesn't fit an existing category, we'll consider creating a new one.",
  },
];

export function searchTools(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const seen = new Set();
  const results = [];
  for (const category of TOOL_CATEGORIES) {
    for (const item of category.tools) {
      const haystack = `${item.name} ${item.tagline} ${category.label}`.toLowerCase();
      const key = `${item.name}|${item.domain}`;
      if (haystack.includes(q) && !seen.has(key)) {
        seen.add(key);
        results.push({ ...item, categoryId: category.id, categoryLabel: category.label, hue: category.hue });
      }
    }
  }
  return results;
}
