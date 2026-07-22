import {
  LayoutDashboard,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Video,
  Clapperboard,
  Sailboat,
  Palette,
  Zap,
  Type,
  Feather,
  Bot,
  Layers,
  Film,
  Play,
  Aperture,
  Sun,
  Waves,
  BookOpen,
  ScrollText,
  Baby,
  MessageSquare,
  Megaphone,
  Camera,
  Shapes,
  Package,
  Building2,
  Sofa,
  PersonStanding,
  Flower2,
  Swords,
  Shirt,
  Sparkle,
  Stethoscope,
  Activity,
  Utensils,
  Plane,
  Home,
  Youtube,
  Instagram,
  Music2,
  Linkedin,
  Facebook,
  MousePointerClick,
  RectangleHorizontal,
  BarChart3,
  Box,
  Gamepad2,
  Grid2x2,
  Hexagon,
  Mountain,
  Cpu,
  Rocket,
  History,
  Heart,
  FolderOpen,
  Users,
  TrendingUp,
  Bookmark,
  Settings,
} from "lucide-react";

export const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", slug: "dashboard", icon: LayoutDashboard, kind: "utility", description: "Your creative command center" },
    ],
  },
  {
    label: "Prompt Studio",
    items: [
      { label: "Prompt Generator", slug: "prompt-generator", icon: Sparkles, kind: "core", controls: ["image", "camera", "advanced"], badge: "AI", description: "Turn any idea into a pro prompt" },
      { label: "Prompt Optimizer", slug: "prompt-optimizer", icon: Wand2, kind: "core", controls: ["image", "camera", "advanced"], description: "Refine & score an existing prompt" },
      { label: "Image Prompt", slug: "image-prompt", icon: ImageIcon, kind: "core", controls: ["image", "camera", "advanced"] },
      { label: "Video Prompt", slug: "video-prompt", icon: Video, kind: "core", controls: ["video", "camera", "story", "audio"] },
      { label: "Cinema Prompt", slug: "cinema-prompt", icon: Clapperboard, kind: "core", controls: ["video", "camera", "story", "audio"], description: "Short film & cinematic shots" },
    ],
  },
  {
    label: "AI Models",
    items: [
      { label: "Midjourney", slug: "midjourney", icon: Sailboat, kind: "model", modelId: "midjourney" },
      { label: "OpenArt", slug: "openart", icon: Palette, kind: "model", modelId: "openart", badge: "★" },
      { label: "Flux", slug: "flux", icon: Zap, kind: "model", modelId: "flux", badge: "New" },
      { label: "Ideogram", slug: "ideogram", icon: Type, kind: "model", modelId: "ideogram" },
      { label: "Leonardo", slug: "leonardo", icon: Feather, kind: "model", modelId: "leonardo" },
      { label: "DALL·E", slug: "dalle", icon: Bot, kind: "model", modelId: "dalle" },
      { label: "Stable Diffusion", slug: "stable-diffusion", icon: Layers, kind: "model", modelId: "sd" },
      { label: "Runway", slug: "runway", icon: Film, kind: "model", modelId: "runway" },
      { label: "Pika", slug: "pika", icon: Play, kind: "model", modelId: "pika" },
      { label: "Kling", slug: "kling", icon: Aperture, kind: "model", modelId: "kling" },
      { label: "Luma", slug: "luma", icon: Sun, kind: "model", modelId: "luma" },
      { label: "Hailuo", slug: "hailuo", icon: Waves, kind: "model", modelId: "hailuo" },
    ],
  },
  {
    label: "Story & Script",
    items: [
      { label: "Story Generator", slug: "story-generator", icon: BookOpen, kind: "core", controls: ["story"] },
      { label: "Script Generator", slug: "script-generator", icon: ScrollText, kind: "core", controls: ["story"] },
      { label: "Children Book", slug: "children-book", icon: Baby, kind: "category", categorySlug: "children-book", controls: ["image", "story"] },
      { label: "Comic Generator", slug: "comic-generator", icon: MessageSquare, kind: "category", categorySlug: "comic", controls: ["image", "story"] },
    ],
  },
  {
    label: "Commercial & Brand",
    items: [
      { label: "Commercial Ads", slug: "commercial-ads", icon: Megaphone, kind: "category", categorySlug: "commercial-ads", controls: ["image", "commerce"] },
      { label: "Product Photography", slug: "product-photography", icon: Camera, kind: "category", categorySlug: "product-photography", controls: ["image", "camera", "commerce"] },
      { label: "Logo Prompt", slug: "logo", icon: Shapes, kind: "category", categorySlug: "logo", controls: ["image", "commerce"] },
      { label: "Packaging Prompt", slug: "packaging", icon: Package, kind: "category", categorySlug: "packaging", controls: ["image", "commerce"] },
    ],
  },
  {
    label: "Design & Space",
    items: [
      { label: "Architecture", slug: "architecture", icon: Building2, kind: "category", categorySlug: "architecture", controls: ["image", "camera"] },
      { label: "Interior Design", slug: "interior-design", icon: Sofa, kind: "category", categorySlug: "interior-design", controls: ["image", "camera"] },
    ],
  },
  {
    label: "Characters & Style",
    items: [
      { label: "Character Builder", slug: "character-builder", icon: PersonStanding, kind: "category", categorySlug: "character-builder", controls: ["image", "advanced"] },
      { label: "Anime Prompt", slug: "anime", icon: Flower2, kind: "category", categorySlug: "anime", controls: ["image", "advanced"] },
      { label: "Fantasy Prompt", slug: "fantasy", icon: Swords, kind: "category", categorySlug: "fantasy", controls: ["image", "advanced"] },
      { label: "Fashion Prompt", slug: "fashion", icon: Shirt, kind: "category", categorySlug: "fashion", controls: ["image", "camera", "commerce"] },
      { label: "Beauty Prompt", slug: "beauty", icon: Sparkle, kind: "category", categorySlug: "beauty", controls: ["image", "camera", "commerce"] },
    ],
  },
  {
    label: "Healthcare",
    items: [
      { label: "Healthcare Prompt", slug: "healthcare", icon: Stethoscope, kind: "category", categorySlug: "healthcare", controls: ["image"] },
      { label: "Medical Illustration", slug: "medical-illustration", icon: Activity, kind: "category", categorySlug: "medical-illustration", controls: ["image"] },
    ],
  },
  {
    label: "Lifestyle",
    items: [
      { label: "Food Photography", slug: "food-photography", icon: Utensils, kind: "category", categorySlug: "food-photography", controls: ["image", "camera"] },
      { label: "Travel", slug: "travel", icon: Plane, kind: "category", categorySlug: "travel", controls: ["image", "camera"] },
      { label: "Real Estate", slug: "real-estate", icon: Home, kind: "category", categorySlug: "real-estate", controls: ["image", "camera"] },
    ],
  },
  {
    label: "Social & Ads",
    items: [
      { label: "YouTube Thumbnail", slug: "youtube-thumbnail", icon: Youtube, kind: "category", categorySlug: "youtube-thumbnail", controls: ["image", "commerce"] },
      { label: "Instagram Post", slug: "instagram-post", icon: Instagram, kind: "category", categorySlug: "instagram-post", controls: ["image", "commerce"] },
      { label: "TikTok Video", slug: "tiktok-video", icon: Music2, kind: "category", categorySlug: "tiktok-video", controls: ["video", "audio", "story"] },
      { label: "LinkedIn Creative", slug: "linkedin-creative", icon: Linkedin, kind: "category", categorySlug: "linkedin-creative", controls: ["image", "commerce"] },
      { label: "Facebook Ads", slug: "facebook-ads", icon: Facebook, kind: "category", categorySlug: "facebook-ads", controls: ["image", "commerce"] },
      { label: "Google Ads", slug: "google-ads", icon: MousePointerClick, kind: "category", categorySlug: "google-ads", controls: ["image", "commerce"] },
      { label: "Banner Ads", slug: "banner-ads", icon: RectangleHorizontal, kind: "category", categorySlug: "banner-ads", controls: ["image", "commerce"] },
      { label: "Infographics", slug: "infographics", icon: BarChart3, kind: "category", categorySlug: "infographics", controls: ["image", "commerce"] },
    ],
  },
  {
    label: "3D, Game & Worlds",
    items: [
      { label: "3D Render", slug: "3d-render", icon: Box, kind: "category", categorySlug: "3d-render", controls: ["image", "advanced"] },
      { label: "Gaming", slug: "gaming", icon: Gamepad2, kind: "category", categorySlug: "gaming", controls: ["image", "advanced"] },
      { label: "Pixel Art", slug: "pixel-art", icon: Grid2x2, kind: "category", categorySlug: "pixel-art", controls: ["image"] },
      { label: "NFT", slug: "nft", icon: Hexagon, kind: "category", categorySlug: "nft", controls: ["image", "advanced"] },
      { label: "Fantasy World", slug: "fantasy-world", icon: Mountain, kind: "category", categorySlug: "fantasy-world", controls: ["image", "advanced"] },
      { label: "Cyberpunk", slug: "cyberpunk", icon: Cpu, kind: "category", categorySlug: "cyberpunk", controls: ["image", "advanced"] },
      { label: "Sci-Fi", slug: "sci-fi", icon: Rocket, kind: "category", categorySlug: "sci-fi", controls: ["image", "advanced"] },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Prompt History", slug: "history", icon: History, kind: "library" },
      { label: "Favorites", slug: "favorites", icon: Heart, kind: "library" },
      { label: "Collections", slug: "collections", icon: FolderOpen, kind: "library" },
      { label: "Community", slug: "community", icon: Users, kind: "library" },
      { label: "Trending Prompts", slug: "trending", icon: TrendingUp, kind: "library" },
      { label: "Saved Prompt", slug: "saved", icon: Bookmark, kind: "library" },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", slug: "settings", icon: Settings, kind: "utility" }],
  },
];

/** Flat lookup of every studio tool by slug. */
export const NAV_ITEMS_BY_SLUG = Object.fromEntries(
  NAV_GROUPS.flatMap((g) => g.items).map((i) => [i.slug, i])
);

export const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

export function studioHref(slug) {
  return slug === "dashboard" ? "/imgprompt/studio" : `/imgprompt/studio/${slug}`;
}
