import {
  Briefcase,
  Clapperboard,
  Code2,
  FileText,
  Globe,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  Mail,
  Megaphone,
  MessageSquare,
  Mic,
  Microscope,
  Music,
  Palette,
  PenLine,
  Presentation,
  TrendingUp,
  Users,
  Workflow,
  Zap,
} from "lucide-react";

// Pricing labels are display strings, not just flags: "FREE" = fully free
// forever, "FREE + PAID" = real free tier with paid upgrades, "PAID" = no
// meaningful free tier (subscription only). Kept honest per tool rather than
// forcing everything into a "free" bucket.
//
// dealType drives the "Free Subscriptions & Coupons" section tabs:
// "Free Forever" | "Free Trial" | "Paid Only".
const tool = (name, domain, tagline, rating, pricing = "FREE + PAID", popular = false, dealType = "Free Trial", url) => ({
  name,
  domain,
  tagline,
  rating,
  pricing,
  popular,
  dealType,
  url: url || `https://${domain}`,
});

export const TOOL_CATEGORIES = [
  {
    id: "chatbots",
    label: "AI Chatbots",
    icon: MessageSquare,
    hue: ["#7c3aed", "#2563eb"],
    blurb: "Conversational assistants for research, writing, and everyday questions.",
    tools: [
      tool("ChatGPT", "chatgpt.com", "OpenAI's flagship assistant for chat, research, and code — free to use.", 4.9, "FREE + PAID", true, "Free Forever"),
      tool("Claude", "claude.ai", "Anthropic's thoughtful AI assistant with a generous free daily quota.", 4.9, "FREE + PAID", true, "Free Forever"),
      tool("Gemini", "gemini.google.com", "Google's multimodal assistant with live web knowledge, free to use.", 4.7, "FREE", false, "Free Forever"),
      tool("Perplexity", "perplexity.ai", "Conversational answer engine that cites its sources on every reply.", 4.8, "FREE + PAID", true, "Free Trial"),
      tool("Microsoft Copilot", "copilot.microsoft.com", "Free GPT-class chat built into Windows, Edge, and Microsoft 365.", 4.5, "FREE", false, "Free Forever"),
      tool("Character.AI", "character.ai", "Chat with millions of AI personas and custom characters, free.", 4.4, "FREE + PAID", false, "Free Forever"),
      tool("Poe", "poe.com", "One subscription, every model — GPT, Claude, Gemini, and more.", 4.3, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "image-generators",
    label: "AI Image Generators",
    icon: ImageIcon,
    hue: ["#a855f7", "#ec4899"],
    blurb: "Turn text prompts into artwork, photos, and illustrations.",
    tools: [
      tool("Midjourney", "midjourney.com", "The gold standard for painterly, high-fidelity AI art.", 4.8, "PAID", true, "Paid Only"),
      tool("Bing Image Creator", "bing.com", "Microsoft's free DALL·E-powered image generator, no subscription needed.", 4.4, "FREE", false, "Free Forever", "https://www.bing.com/images/create"),
      tool("Ideogram", "ideogram.ai", "Best-in-class AI images with clean, readable text rendering.", 4.7, "FREE + PAID", true, "Free Forever"),
      tool("Leonardo AI", "leonardo.ai", "Free daily credits for stylized art, portraits, and game assets.", 4.7, "FREE + PAID", true, "Free Trial"),
      tool("Adobe Firefly", "firefly.adobe.com", "Commercially-safe generative fill and art trained on licensed content.", 4.6, "FREE + PAID", false, "Free Forever"),
      tool("Clipdrop", "clipdrop.co", "Stability AI's free-to-try image toolbox: generate, upscale, relight.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("Playground AI", "playground.com", "Free unlimited AI image generation with a powerful in-browser editor.", 4.5, "FREE", false, "Free Forever"),
    ],
  },
  {
    id: "video-generators",
    label: "AI Video Generators",
    icon: Clapperboard,
    hue: ["#f43f5e", "#fb923c"],
    blurb: "Generate cinematic clips, avatars, and animations from text.",
    tools: [
      tool("Runway", "runwayml.com", "Pioneering Gen-3 video model with a free tier to start creating.", 4.6, "FREE + PAID", true, "Free Trial"),
      tool("Pika", "pika.art", "Playful text-to-video generation with fun effects and remixing.", 4.5, "FREE + PAID", true, "Free Trial"),
      tool("Luma Dream Machine", "lumalabs.ai", "Dreamlike cinematic video from text and image prompts, free daily.", 4.6, "FREE + PAID", false, "Free Forever"),
      tool("Kling AI", "klingai.com", "High-quality realistic video generation with daily free credits.", 4.7, "FREE + PAID", true, "Free Trial"),
      tool("Synthesia", "synthesia.io", "Turn text into talking-avatar videos in 140+ languages.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("HeyGen", "heygen.com", "Studio-quality AI avatar and dubbing videos from plain text.", 4.7, "FREE + PAID", true, "Free Trial"),
    ],
  },
  {
    id: "coding-assistants",
    label: "AI Coding Assistants",
    icon: Code2,
    hue: ["#22c55e", "#14b8a6"],
    blurb: "Autocomplete, refactor, and ship code faster with an AI pair programmer.",
    tools: [
      tool("GitHub Copilot", "github.com", "AI pair programmer with a free tier for individual developers.", 4.8, "FREE + PAID", true, "Free Forever", "https://github.com/features/copilot"),
      tool("Cursor", "cursor.com", "The AI-first code editor with agent mode for whole-codebase edits.", 4.8, "FREE + PAID", true, "Free Trial"),
      tool("Claude Code", "claude.com", "Anthropic's agentic coding assistant for the terminal and IDE.", 4.8, "FREE + PAID", true, "Free Trial"),
      tool("Windsurf", "windsurf.com", "Agentic IDE that plans, edits, and tests across your codebase.", 4.6, "FREE + PAID", false, "Free Trial"),
      tool("Amazon Q Developer", "aws.amazon.com", "Free-tier AI coding companion with unlimited chat for individuals.", 4.4, "FREE + PAID", false, "Free Forever"),
      tool("Replit AI", "replit.com", "Build and deploy full apps with an AI agent, free to start.", 4.4, "FREE + PAID", false, "Free Forever"),
      tool("Tabnine", "tabnine.com", "Private, personalized code completion with a free individual plan.", 4.3, "FREE + PAID", false, "Free Forever"),
    ],
  },
  {
    id: "writing",
    label: "AI Writing",
    icon: PenLine,
    hue: ["#38bdf8", "#6366f1"],
    blurb: "Draft, rewrite, and polish any kind of text in seconds.",
    tools: [
      tool("Jasper", "jasper.ai", "Enterprise-grade AI content and brand voice at scale.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("Copy.ai", "copy.ai", "Free-forever plan for marketing copy, emails, and workflows.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Writesonic", "writesonic.com", "SEO-friendly articles, ads, and rewrites with a free trial.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Grammarly", "grammarly.com", "AI writing coach for grammar, tone, and clarity everywhere you type.", 4.7, "FREE + PAID", true, "Free Forever"),
      tool("QuillBot", "quillbot.com", "Paraphrasing, grammar, and summarizing with a solid free tier.", 4.5, "FREE + PAID", false, "Free Forever"),
      tool("Sudowrite", "sudowrite.com", "AI co-writer built for novelists and long-form fiction.", 4.4, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "design",
    label: "AI Design",
    icon: Palette,
    hue: ["#d946ef", "#f43f5e"],
    blurb: "AI copilots for every kind of visual and product design.",
    tools: [
      tool("Canva AI", "canva.com", "Magic Studio: design, edit, and generate for free in one editor.", 4.7, "FREE + PAID", true, "Free Forever"),
      tool("Figma AI", "figma.com", "AI-assisted design, prototyping, and asset generation inside Figma.", 4.6, "FREE + PAID", false, "Free Forever"),
      tool("Uizard", "uizard.com", "Turn sketches and prompts into clickable UI mockups.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Framer AI", "framer.com", "Generate a full, publish-ready website from a text prompt.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Recraft", "recraft.ai", "Generate editable vector art, icons, and brand mockups.", 4.6, "FREE + PAID", false, "Free Trial"),
      tool("Looka", "looka.com", "AI logo maker with full brand kits and mockups.", 4.5, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "marketing",
    label: "AI Marketing",
    icon: Megaphone,
    hue: ["#fb923c", "#f43f5e"],
    blurb: "Campaigns, ad creatives, and copy that convert.",
    tools: [
      tool("HubSpot AI", "hubspot.com", "AI campaign assistant baked into HubSpot's free CRM tools.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Mailchimp AI", "mailchimp.com", "Free-tier email marketing with built-in AI content generation.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("AdCreative.ai", "adcreative.ai", "Conversion-focused ad creatives and copy generated in seconds.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Ocoya", "ocoya.com", "AI content and scheduling for social and marketing campaigns.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Predis.ai", "predis.ai", "Turn one line into branded social posts, reels, and ad creatives.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Simplified", "simplified.com", "All-in-one AI design, video, and copy suite for marketers.", 4.3, "FREE + PAID", false, "Free Forever"),
    ],
  },
  {
    id: "seo",
    label: "AI SEO",
    icon: TrendingUp,
    hue: ["#eab308", "#84cc16"],
    blurb: "Rank higher with AI-assisted research, audits, and content scoring.",
    tools: [
      tool("Surfer SEO", "surferseo.com", "AI content editor that scores pages against top-ranking competitors.", 4.6, "FREE + PAID", true, "Free Trial"),
      tool("Ahrefs Webmaster Tools", "ahrefs.com", "Free site audit and backlink checker from Ahrefs.", 4.7, "FREE", true, "Free Forever", "https://ahrefs.com/webmaster-tools"),
      tool("SE Ranking", "seranking.com", "AI-assisted rank tracking, audits, and content optimization.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Frase", "frase.io", "Research, outline, and optimize articles with AI in one flow.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("MarketMuse", "marketmuse.com", "AI content planning and topic authority scoring.", 4.2, "FREE + PAID", false, "Free Trial"),
      tool("NeuronWriter", "neuronwriter.com", "SERP-driven content optimization with an affordable free trial.", 4.3, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "productivity",
    label: "AI Productivity",
    icon: Zap,
    hue: ["#10b981", "#84cc16"],
    blurb: "Automate the busywork and reclaim your day.",
    tools: [
      tool("Notion AI", "notion.so", "Draft, summarize, and auto-fill across your connected workspace.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Motion", "usemotion.com", "AI calendar that plans your entire day and task list automatically.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("Reclaim.ai", "reclaim.ai", "Auto-schedules focus time, habits, and meetings around your day.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Superhuman", "superhuman.com", "AI-triaged inbox built for speed — free trial for power users.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("Mem AI", "mem.ai", "Self-organizing notes that resurface what matters automatically.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Taskade", "taskade.com", "Free AI outliner, tasks, and agents in one collaborative app.", 4.4, "FREE", false, "Free Forever"),
    ],
  },
  {
    id: "automation",
    label: "AI Automation",
    icon: Workflow,
    hue: ["#0ea5e9", "#6366f1"],
    blurb: "No-code and agentic workflows that connect your whole stack.",
    tools: [
      tool("Zapier AI", "zapier.com", "Connect thousands of apps with AI-built no-code workflows.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Make", "make.com", "Visual automation builder with a generous free operations tier.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("n8n", "n8n.io", "Open-source workflow automation you can self-host for free.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Bardeen", "bardeen.ai", "Browser-based automations and AI agents triggered in one click.", 4.3, "FREE + PAID", false, "Free Forever"),
      tool("UiPath", "uipath.com", "Enterprise-grade RPA with a free Community edition for individuals.", 4.3, "FREE + PAID", false, "Free Forever"),
      tool("Pipedream", "pipedream.com", "Connect APIs and build event-driven workflows with a free dev tier.", 4.4, "FREE + PAID", false, "Free Forever"),
    ],
  },
  {
    id: "website-builders",
    label: "AI Website Builders",
    icon: Globe,
    hue: ["#06b6d4", "#3b82f6"],
    blurb: "Generate a full, publish-ready site from a prompt.",
    tools: [
      tool("Framer AI", "framer.com", "Generate a full, animated, publish-ready site from one prompt.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Durable", "durable.co", "Builds a complete small-business website in under a minute.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("10Web", "10web.io", "AI WordPress builder that generates a full site from a prompt.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Wix ADI", "wix.com", "Answer a few questions and Wix designs your whole site.", 4.4, "FREE + PAID", true, "Free Forever"),
      tool("Hostinger AI Builder", "hostinger.com", "Budget-friendly AI site builder with built-in hosting.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Notion Sites", "notion.so", "Publish a free public website straight from your Notion pages.", 4.4, "FREE", false, "Free Forever", "https://www.notion.so/product/sites"),
    ],
  },
  {
    id: "voice",
    label: "AI Voice",
    icon: Mic,
    hue: ["#06b6d4", "#8b5cf6"],
    blurb: "Lifelike text-to-speech, dubbing, and voice cloning.",
    tools: [
      tool("ElevenLabs", "elevenlabs.io", "The most realistic AI voices and cloning, with a free monthly quota.", 4.9, "FREE + PAID", true, "Free Forever"),
      tool("Murf AI", "murf.ai", "Studio-quality voiceovers for videos and presentations.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("PlayHT", "play.ht", "Ultra-realistic voice generation and cloning with a free API tier.", 4.5, "FREE + PAID", false, "Free Forever"),
      tool("Speechify", "speechify.com", "Listen to any text with natural, celebrity-grade AI voices.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("WellSaid Labs", "wellsaidlabs.com", "Broadcast-quality voice avatars for enterprise narration.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("TTSMaker", "ttsmaker.com", "100% free text-to-speech in 100+ languages, no signup needed.", 4.3, "FREE", false, "Free Forever"),
    ],
  },
  {
    id: "music",
    label: "AI Music",
    icon: Music,
    hue: ["#f472b6", "#fb7185"],
    blurb: "Compose full songs and royalty-free soundtracks.",
    tools: [
      tool("Suno", "suno.com", "Generate complete songs with vocals from a single text prompt.", 4.8, "FREE + PAID", true, "Free Forever"),
      tool("Udio", "udio.com", "Studio-grade AI music creation with free daily song generations.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("AIVA", "aiva.ai", "Emotional soundtrack composition for films, games, and trailers.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Soundraw", "soundraw.io", "Royalty-free AI music tailored to mood, genre, and length.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Boomy", "boomy.com", "Create and release original AI-generated songs in seconds.", 4.2, "FREE + PAID", false, "Free Forever"),
      tool("Beatoven.ai", "beatoven.ai", "Custom, royalty-free background scores for videos and podcasts.", 4.2, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "presentations",
    label: "AI Presentations",
    icon: Presentation,
    hue: ["#8b5cf6", "#ec4899"],
    blurb: "Beautiful decks generated from a single prompt.",
    tools: [
      tool("Gamma", "gamma.app", "Stunning decks, docs, and sites generated from a single prompt.", 4.8, "FREE + PAID", true, "Free Forever"),
      tool("Tome", "tome.app", "Narrative-driven AI presentations with rich embedded media.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Beautiful.ai", "beautiful.ai", "Slides that auto-design themselves as you type.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("SlidesAI", "slidesai.io", "Turn any block of text into a full Google Slides deck.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Decktopus", "decktopus.com", "AI presentation generator with built-in analytics and forms.", 4.3, "FREE + PAID", false, "Free Forever"),
      tool("Plus AI", "plusai.com", "AI slide generation that works right inside Google Slides.", 4.3, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "pdf",
    label: "AI PDF",
    icon: FileText,
    hue: ["#0ea5e9", "#14b8a6"],
    blurb: "Chat with, summarize, and edit any PDF instantly.",
    tools: [
      tool("ChatPDF", "chatpdf.com", "Upload a PDF and chat with it — free daily usage, no signup.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("PDF.ai", "pdf.ai", "Chat with, summarize, and extract data from any PDF.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Humata", "humata.ai", "Ask questions across hundreds of PDFs at once with citations.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Adobe Acrobat AI Assistant", "acrobat.adobe.com", "Summarize and query PDFs with Adobe's built-in AI assistant.", 4.5, "FREE + PAID", true, "Free Trial"),
      tool("iLovePDF", "ilovepdf.com", "Free AI-assisted PDF tools: merge, compress, convert, and edit.", 4.6, "FREE", false, "Free Forever"),
      tool("Smallpdf", "smallpdf.com", "AI-powered PDF editing, e-signing, and conversion suite.", 4.5, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "research",
    label: "AI Research",
    icon: Microscope,
    hue: ["#6366f1", "#22d3ee"],
    blurb: "Search, summarize, and cite sources across the web and papers.",
    tools: [
      tool("Perplexity", "perplexity.ai", "Cited answer engine that searches the live web for you.", 4.8, "FREE + PAID", true, "Free Forever"),
      tool("Elicit", "elicit.com", "AI research assistant that summarizes and extracts data from papers.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Consensus", "consensus.app", "Search 200M+ papers and get AI-summarized, evidence-based answers.", 4.4, "FREE + PAID", false, "Free Forever"),
      tool("SciSpace", "scispace.com", "Simplify, chat with, and discover academic papers using AI.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("You.com", "you.com", "AI search assistant blending chat, agents, and cited web results.", 4.3, "FREE + PAID", false, "Free Forever"),
      tool("NotebookLM", "notebooklm.google", "Google's AI research notebook that grounds answers in your own sources.", 4.6, "FREE", true, "Free Forever"),
    ],
  },
  {
    id: "meetings",
    label: "AI Meetings",
    icon: Users,
    hue: ["#f59e0b", "#f97316"],
    blurb: "Transcribe, summarize, and search every meeting automatically.",
    tools: [
      tool("Otter.ai", "otter.ai", "Real-time meeting transcription with 300 free minutes monthly.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Fireflies.ai", "fireflies.ai", "Record, transcribe, and search every meeting automatically, free.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Fathom", "fathom.video", "Free AI notetaker that records, transcribes, and highlights calls.", 4.7, "FREE + PAID", true, "Free Forever"),
      tool("tl;dv", "tldv.io", "Free meeting recorder with AI summaries for Zoom and Meet.", 4.5, "FREE + PAID", false, "Free Forever"),
      tool("Granola", "granola.ai", "AI notes that blend your typing with what was actually said.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("Read AI", "read.ai", "Meeting summaries, sentiment, and action items across your calendar.", 4.3, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "email",
    label: "AI Email",
    icon: Mail,
    hue: ["#3b82f6", "#06b6d4"],
    blurb: "Draft, triage, and clean up your inbox automatically.",
    tools: [
      tool("Superhuman", "superhuman.com", "AI-triaged inbox and instant replies for power email users.", 4.5, "FREE + PAID", false, "Free Trial"),
      tool("Shortwave", "shortwave.com", "AI email client with auto-summaries and a generous free plan.", 4.4, "FREE + PAID", true, "Free Forever"),
      tool("Gmail (Gemini)", "gmail.com", "Free AI-assisted replies, summaries, and drafting inside Gmail.", 4.5, "FREE", true, "Free Forever"),
      tool("SaneBox", "sanebox.com", "AI inbox triage that filters distractions into folders automatically.", 4.3, "FREE + PAID", false, "Free Trial"),
      tool("Fyxer AI", "fyxer.com", "Auto-drafts replies and organizes your inbox while you focus.", 4.2, "FREE + PAID", false, "Free Trial"),
      tool("Missive", "missive.app", "Shared team inbox with built-in AI drafting and summaries.", 4.3, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "education",
    label: "AI Education",
    icon: GraduationCap,
    hue: ["#6366f1", "#a855f7"],
    blurb: "Study smarter with AI tutors, quiz makers, and explainers.",
    tools: [
      tool("Khanmigo", "khanmigo.ai", "Khan Academy's AI tutor for students and teachers.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Duolingo Max", "duolingo.com", "AI-powered language practice with explain-my-answer and roleplay.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Coursera Coach", "coursera.org", "AI study assistant built into Coursera's free and paid courses.", 4.3, "FREE + PAID", false, "Free Forever"),
      tool("Quizizz AI", "quizizz.com", "Generate interactive quizzes from any topic or text, free.", 4.5, "FREE + PAID", true, "Free Forever"),
      tool("Socratic", "socratic.org", "Snap a photo of homework and get a free AI-guided explanation.", 4.3, "FREE", false, "Free Forever"),
      tool("Photomath", "photomath.com", "Step-by-step AI math explanations from a photo of the problem.", 4.5, "FREE + PAID", true, "Free Forever"),
    ],
  },
  {
    id: "resume-builders",
    label: "AI Resume Builders",
    icon: Briefcase,
    hue: ["#14b8a6", "#0ea5e9"],
    blurb: "Stand-out, ATS-ready resumes and cover letters.",
    tools: [
      tool("Kickresume", "kickresume.com", "AI resume and cover letter writer with pro templates.", 4.6, "FREE + PAID", true, "Free Trial"),
      tool("Teal", "tealhq.com", "Free resume builder plus job tracking and keyword matching.", 4.6, "FREE + PAID", true, "Free Forever"),
      tool("Rezi", "rezi.ai", "ATS-optimized resume generation with instant scoring.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Novoresume", "novoresume.com", "Clean, ATS-friendly resume templates with AI content suggestions.", 4.4, "FREE + PAID", false, "Free Forever"),
      tool("Enhancv", "enhancv.com", "Design-forward resumes with an AI improvement coach.", 4.4, "FREE + PAID", false, "Free Trial"),
      tool("Zety", "zety.com", "Guided AI resume and cover letter builder with expert content.", 4.3, "FREE + PAID", false, "Free Trial"),
    ],
  },
  {
    id: "translation",
    label: "AI Translation",
    icon: Languages,
    hue: ["#22c55e", "#06b6d4"],
    blurb: "Translate text, speech, and documents with near-human accuracy.",
    tools: [
      tool("DeepL", "deepl.com", "The gold standard for nuanced, natural machine translation.", 4.8, "FREE + PAID", true, "Free Forever"),
      tool("Google Translate", "translate.google.com", "Instant free translation across 240+ languages and dialects.", 4.7, "FREE", true, "Free Forever"),
      tool("Microsoft Translator", "translator.microsoft.com", "Free real-time text and speech translation across 100+ languages.", 4.4, "FREE", false, "Free Forever"),
      tool("Reverso", "reverso.net", "Contextual translation with real usage examples, free to use.", 4.4, "FREE + PAID", false, "Free Forever"),
      tool("Papago", "papago.naver.com", "Naver's AI translator, especially strong for Korean and Asian languages.", 4.4, "FREE", false, "Free Forever"),
      tool("Immersive Translate", "immersivetranslate.com", "Bilingual web, PDF, and video-subtitle translation overlay.", 4.6, "FREE + PAID", true, "Free Trial"),
    ],
  },
];

export const TOTAL_TOOLS = TOOL_CATEGORIES.reduce((sum, category) => sum + category.tools.length, 0);
export const TOTAL_CATEGORIES = TOOL_CATEGORIES.length;
export const TOTAL_FREE_TOOLS = TOOL_CATEGORIES.reduce(
  (sum, category) => sum + category.tools.filter((item) => item.pricing !== "PAID").length,
  0,
);

// Real students-eligible programs only (GitHub Student Pack, Notion/Canva/
// Microsoft education plans, Khan Academy, Duolingo) — kept as a short,
// defensible curated list rather than tagging every tool.
const STUDENT_FRIENDLY_KEYS = [
  ["GitHub Copilot", "github.com"],
  ["Notion AI", "notion.so"],
  ["Canva AI", "canva.com"],
  ["Microsoft Copilot", "copilot.microsoft.com"],
  ["Khanmigo", "khanmigo.ai"],
  ["Duolingo Max", "duolingo.com"],
];

const TRENDING_KEYS = [
  ["ChatGPT", "chatgpt.com"],
  ["Claude", "claude.ai"],
  ["Suno", "suno.com"],
  ["Cursor", "cursor.com"],
  ["ElevenLabs", "elevenlabs.io"],
  ["Perplexity", "perplexity.ai"],
  ["Gamma", "gamma.app"],
  ["Ideogram", "ideogram.ai"],
  ["HeyGen", "heygen.com"],
  ["DeepL", "deepl.com"],
];

const EDITORS_PICK_KEYS = [
  ["Claude", "claude.ai"],
  ["Notion AI", "notion.so"],
  ["GitHub Copilot", "github.com"],
  ["Canva AI", "canva.com"],
  ["Khanmigo", "khanmigo.ai"],
  ["Fathom", "fathom.video"],
  ["Runway", "runwayml.com"],
  ["Kickresume", "kickresume.com"],
];

// Illustrative community engagement figures for the "Community Favorites"
// section — directional, not live analytics.
const MOST_SAVED_KEYS = [
  ["ChatGPT", "chatgpt.com", { saves: 128000 }],
  ["Claude", "claude.ai", { saves: 94500 }],
  ["Notion AI", "notion.so", { saves: 81200 }],
  ["Suno", "suno.com", { saves: 76800 }],
  ["ElevenLabs", "elevenlabs.io", { saves: 68300 }],
  ["Canva AI", "canva.com", { saves: 65100 }],
  ["GitHub Copilot", "github.com", { saves: 61900 }],
  ["DeepL", "deepl.com", { saves: 54200 }],
  ["Perplexity", "perplexity.ai", { saves: 52700 }],
  ["Otter.ai", "otter.ai", { saves: 41300 }],
];

const MOST_VISITED_KEYS = [
  ["ChatGPT", "chatgpt.com", { visits: 2400000 }],
  ["Gemini", "gemini.google.com", { visits: 1150000 }],
  ["Claude", "claude.ai", { visits: 980000 }],
  ["Perplexity", "perplexity.ai", { visits: 870000 }],
  ["Canva AI", "canva.com", { visits: 760000 }],
  ["Grammarly", "grammarly.com", { visits: 690000 }],
  ["GitHub Copilot", "github.com", { visits: 640000 }],
  ["Suno", "suno.com", { visits: 590000 }],
  ["DeepL", "deepl.com", { visits: 510000 }],
  ["Notion AI", "notion.so", { visits: 470000 }],
];

function findTool(name, domain) {
  for (const category of TOOL_CATEGORIES) {
    for (const item of category.tools) {
      if (item.name === name && item.domain === domain) {
        return { ...item, categoryId: category.id, categoryLabel: category.label, hue: category.hue };
      }
    }
  }
  return null;
}

function collectByKeys(keys) {
  const results = [];
  for (const entry of keys) {
    const [name, domain, extra] = entry;
    const found = findTool(name, domain);
    if (found) results.push(extra ? { ...found, ...extra } : found);
  }
  return results;
}

export function getTrendingTools() {
  return collectByKeys(TRENDING_KEYS);
}

export function getEditorsPickTools() {
  return collectByKeys(EDITORS_PICK_KEYS);
}

export function getStudentFriendlyTools() {
  return collectByKeys(STUDENT_FRIENDLY_KEYS);
}

export function getMostSavedTools() {
  return collectByKeys(MOST_SAVED_KEYS);
}

export function getMostVisitedTools() {
  return collectByKeys(MOST_VISITED_KEYS);
}

export function getHighestRatedTools(limit = 10) {
  return dedupeTools(getAllTools())
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getPopularTools(limit = 12) {
  return dedupeTools(getAllTools())
    .filter((item) => item.popular)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);
}

export function getAllTools() {
  const results = [];
  for (const category of TOOL_CATEGORIES) {
    for (const item of category.tools) {
      results.push({ ...item, categoryId: category.id, categoryLabel: category.label, hue: category.hue });
    }
  }
  return results;
}

// A handful of tools (Perplexity, Framer AI, Superhuman) are intentionally
// cross-listed under more than one category. Cross-category views should
// still count them once, so this keeps only the first occurrence.
function dedupeTools(items) {
  const seen = new Set();
  const results = [];
  for (const item of items) {
    const key = `${item.name}|${item.domain}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push(item);
  }
  return results;
}

export function getToolsByDealType(dealType) {
  return getAllTools().filter((item) => item.dealType === dealType);
}

export function searchTools(query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return dedupeTools(getAllTools()).filter((item) => {
    const haystack = `${item.name} ${item.tagline} ${item.categoryLabel}`.toLowerCase();
    return haystack.includes(q);
  });
}

export function getToolOfTheDay() {
  const pool = getPopularTools(30);
  if (!pool.length) return null;
  const dayIndex = new Date().getDate() % pool.length;
  return pool[dayIndex];
}
