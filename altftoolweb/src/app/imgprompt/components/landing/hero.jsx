"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Plus, ArrowRight, ChevronLeft, ChevronRight,
  Image as ImageIcon, Video, Clapperboard, BookOpen, Megaphone, Search,
  Camera, Box, Palette, Tag, Rocket, Shirt,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Badge } from "../ui/badge";
import { AnimatedCounter } from "../shared/animated-counter";
import { HeroGraphic } from "./hero-graphic";
import { TOTAL_PROMPTS, CATEGORIES } from "../../data/categories";
import { AI_MODELS } from "../../data/models";

const STATS = [
  { label: "Pro Prompts", value: TOTAL_PROMPTS, compact: true, suffix: "+" },
  { label: "Categories", value: CATEGORIES.length, suffix: "+" },
  { label: "AI Models", value: AI_MODELS.length },
  { label: "Avg. Score", value: 94, suffix: "/100" },
];

/** Rotates through the input's placeholder — purely a hint of what's
 *  possible; typing anything (or nothing) still works. */
const PLACEHOLDER_PHRASES = [
  "Create a cinematic movie trailer...",
  "Generate an AI image prompt...",
  "Write a viral video concept...",
  "Create a story prompt...",
  "Generate a Midjourney prompt...",
];

/** The 7 prompt types this studio is built around. Clicking one instantly
 *  fills the input with the first example (editable) and reveals its
 *  other examples as related-suggestion chips below — clicking a chip
 *  swaps it into the input too. Generate still goes through the exact
 *  same existing ?idea= → Prompt Generator flow regardless of source. */
const PROMPT_CATEGORIES = [
  {
    id: "image", label: "Image Prompt", icon: ImageIcon, accent: "#8b5cf6",
    examples: [
      "Generate an AI image prompt for a futuristic cyberpunk cityscape at night",
      "A hyperrealistic portrait of an elderly fisherman with weathered, sun-kissed skin",
      "A surreal floating island covered in bioluminescent plants under a starry sky",
      "A minimalist product shot of a glass perfume bottle on black marble",
      "An epic fantasy castle carved into a cliffside waterfall at sunrise",
      "A macro photograph of morning dew on a spider's web",
    ],
  },
  {
    id: "video", label: "Video Prompt", icon: Video, accent: "#3b82f6",
    examples: [
      "Write a viral video concept for a 30-second product launch teaser",
      "A slow-motion drone shot flying through a canyon at golden hour",
      "A time-lapse of a city skyline transitioning from day to night",
      "A cinematic close-up of raindrops hitting a window in slow motion",
      "A dynamic action sequence of a skateboarder performing tricks downtown",
      "A dreamy underwater video of a diver swimming through a coral reef",
    ],
  },
  {
    id: "ai", label: "AI Prompt", icon: Sparkles, accent: "#22d3ee",
    examples: [
      "Generate an AI prompt for a breathtaking fantasy landscape at golden hour",
      "Design a witty AI prompt for a talking robot barista in a coffee shop",
      "Create an AI prompt for a serene Japanese zen garden in autumn",
      "Write an AI prompt for a majestic dragon perched on a mountain peak",
      "Generate an AI prompt for a whimsical treehouse village in an enchanted forest",
      "Create an AI prompt for a sleek autonomous vehicle driving through neon rain",
    ],
  },
  {
    id: "cinematic", label: "Cinematic Prompt", icon: Clapperboard, accent: "#d946ef",
    examples: [
      "Create a cinematic movie trailer scene with dramatic lighting and slow motion",
      "A tense standoff between two rivals in a dusty western town at high noon",
      "An emotional reunion scene on a rain-soaked train platform",
      "A sweeping establishing shot of a war-torn city under a blood-red sky",
      "A high-speed car chase through neon-lit city streets at night",
      "A quiet, intimate close-up of a character's face lit by candlelight",
    ],
  },
  {
    id: "story", label: "Story Prompt", icon: BookOpen, accent: "#f59e0b",
    examples: [
      "Create a story prompt about a lighthouse keeper who receives letters from the future",
      "Write a story about twin sisters who discover they can swap dreams",
      "Create a story about a retired detective pulled into one final case",
      "Write a story about a chef who can taste people's memories in their cooking",
      "Create a story about a small town where every mirror leads somewhere different",
      "Write a story about an astronaut who receives a mysterious signal from Earth's past",
    ],
  },
  {
    id: "marketing", label: "Marketing Prompt", icon: Megaphone, accent: "#f43f5e",
    examples: [
      "Write a bold marketing campaign prompt for a premium skincare brand launch",
      "Create a marketing prompt for a Black Friday sale on tech gadgets",
      "Write a marketing prompt for a sustainable fashion brand's new collection",
      "Create a marketing prompt for a fitness app's New Year membership drive",
      "Write a marketing prompt for a luxury travel agency's summer getaway deals",
      "Create a marketing prompt for a plant-based restaurant's grand opening",
    ],
  },
  {
    id: "seo", label: "SEO Prompt", icon: Search, accent: "#10b981",
    examples: [
      "Generate an SEO-optimized content prompt for 'best AI prompt generators 2026'",
      "Write an SEO prompt for a blog post on 'how to start freelancing in 2026'",
      "Create an SEO-optimized prompt for a product page targeting 'organic skincare for sensitive skin'",
      "Generate an SEO prompt for a local landing page targeting 'best coffee shops near me'",
      "Write an SEO prompt for a comparison article: 'Notion vs Todoist for productivity'",
      "Create an SEO-optimized prompt for a how-to guide on 'improving website page speed'",
    ],
  },
  {
    id: "photography", label: "Photography Prompt", icon: Camera, accent: "#0ea5e9",
    examples: [
      "Generate a photography prompt for a golden-hour portrait on a city rooftop",
      "Create a macro photography prompt of dew drops on a rose petal at sunrise",
      "Write a product photography prompt for a matte black perfume bottle on marble",
      "Generate a street photography prompt capturing rain-soaked neon reflections at night",
      "Create a drone photography prompt of a winding coastal highway at dusk",
      "Write a food photography prompt for a rustic pasta dish with steam rising",
    ],
  },
  {
    id: "3d", label: "3D Render Prompt", icon: Box, accent: "#f97316",
    examples: [
      "Generate a 3D render prompt for a floating glass orb with iridescent refractions",
      "Create a 3D render prompt of a minimalist product stand under studio lighting",
      "Write a 3D render prompt for a low-poly fantasy island with waterfalls",
      "Generate a 3D render prompt of an abstract liquid metal sculpture",
      "Create a 3D render prompt for a futuristic sneaker exploded-view diagram",
      "Write a 3D render prompt of a cozy isometric bedroom diorama",
    ],
  },
  {
    id: "anime", label: "Anime Prompt", icon: Palette, accent: "#ec4899",
    examples: [
      "Generate an anime-style prompt for a warrior standing atop a cherry blossom cliff",
      "Create an anime prompt for a magical girl transformation sequence at dusk",
      "Write an anime-style prompt for a slice-of-life scene in a rainy Tokyo café",
      "Generate an anime prompt for a mecha pilot silhouetted against a giant moon",
      "Create an anime-style prompt for two rivals facing off in a neon arena",
      "Write an anime prompt for a spirit fox guiding a lost traveler through a forest",
    ],
  },
  {
    id: "branding", label: "Branding Prompt", icon: Tag, accent: "#6366f1",
    examples: [
      "Generate a branding prompt for a minimalist logo for a specialty coffee roastery",
      "Create a branding prompt for a luxury skincare packaging concept",
      "Write a branding prompt for a bold wordmark for a fintech startup",
      "Generate a branding prompt for an eco-friendly fashion label's visual identity",
      "Create a branding prompt for a mascot logo for a kids' education app",
      "Write a branding prompt for a premium wine label with an art-deco feel",
    ],
  },
  {
    id: "scifi", label: "Sci-Fi Prompt", icon: Rocket, accent: "#22d3ee",
    examples: [
      "Generate a sci-fi prompt for a derelict spaceship drifting past a dying star",
      "Create a sci-fi prompt for a cyberpunk marketplace lit by holographic signs",
      "Write a sci-fi prompt for a terraformed Mars colony at sunrise",
      "Generate a sci-fi prompt for an android awakening in an abandoned lab",
      "Create a sci-fi prompt for a fleet of drones swarming over a megacity skyline",
      "Write a sci-fi prompt for a first-contact scene on an alien shoreline",
    ],
  },
  {
    id: "fashion", label: "Fashion Prompt", icon: Shirt, accent: "#f43f5e",
    examples: [
      "Generate a fashion editorial prompt for a haute couture gown on a windswept dune",
      "Create a fashion prompt for a streetwear campaign shot on a rooftop at dusk",
      "Write a fashion prompt for a minimalist studio shot of avant-garde outerwear",
      "Generate a fashion prompt for a runway show finale with dramatic lighting",
      "Create a fashion prompt for a vintage-inspired editorial in a Parisian café",
      "Write a fashion prompt for a bold accessory close-up on textured silk",
    ],
  },
];

function useTypewriter(items, { typeSpeed = 34, deleteSpeed = 18, pauseMs = 1600 } = {}) {
  const [index, setIndex] = React.useState(0);
  const [text, setText] = React.useState("");
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const current = items[index];

    if (!deleting && text === current) {
      const t = setTimeout(() => setDeleting(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setIndex((i) => (i + 1) % items.length);
      return;
    }
    const t = setTimeout(
      () => setText((prev) => (deleting ? current.slice(0, prev.length - 1) : current.slice(0, prev.length + 1))),
      deleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(t);
  }, [text, deleting, index, items, typeSpeed, deleteSpeed, pauseMs]);

  return text;
}

export function Hero() {
  const router = useRouter();
  const [inputValue, setInputValue] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState(null);
  const categoryScrollRef = React.useRef(null);

  const scrollCategories = (dir) => {
    categoryScrollRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  // No sign-in gate here — browsing and writing a prompt on the landing
  // page is always free. The Prompt Generator page itself only asks the
  // user to sign in at the moment they actually click Generate there.
  const handleGenerate = () => {
    const idea = inputValue.trim();
    router.push(idea ? `/imgprompt/studio/prompt-generator?idea=${encodeURIComponent(idea)}` : "/imgprompt/studio/prompt-generator");
  };

  const handleCategoryClick = (category) => {
    setActiveCategory(category.id);
    setInputValue(category.examples[0]);
  };

  const handleSuggestionClick = (text) => {
    setInputValue(text);
  };

  const typedPlaceholder = useTypewriter(PLACEHOLDER_PHRASES);
  const activeCategoryData = PROMPT_CATEGORIES.find((c) => c.id === activeCategory);

  return (
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-20">
      <HeroGraphic />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Badge variant="secondary" className="mb-6 gap-1.5 py-1.5 pl-1.5 pr-3">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-brand-gradient">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              AI Prompt Intelligence · {CATEGORIES.length}+ categories
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.02] tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl"
          >
            <span className="text-primary">AI Prompt Studio</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground"
          >
            Generate breathtaking Image, Video, Cinematic &amp; Story Prompts — powered by AI Prompt
            Intelligence that scores, explains and perfects every idea instantly.
          </motion.p>
        </div>

        {/* Replit/Base44-style prompt-first input — a large rectangle, not
            a pill, and the hero's only call to action. */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-10 max-w-2xl"
        >
          <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_2px_10px_-2px_rgba(20,20,43,0.06),0_20px_50px_-20px_rgba(20,20,43,0.12)] transition-shadow duration-300 focus-within:border-primary/40 focus-within:shadow-[0_2px_10px_-2px_rgba(124,58,237,0.1),0_20px_50px_-16px_rgba(124,58,237,0.25)] sm:p-6">
            <input
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); setActiveCategory(null); }}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder={typedPlaceholder}
              className="w-full bg-transparent text-base text-foreground placeholder-muted-foreground/60 outline-none sm:text-lg"
            />
            <div className="mt-6 flex items-center justify-between">
              <Plus className="h-5 w-5 text-muted-foreground/50" />
              <button
                onClick={handleGenerate}
                aria-label="Generate prompt"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-gradient text-white shadow-[0_8px_24px_-6px_rgba(124,58,237,0.6)] transition-transform hover:scale-105 active:scale-95"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Category tiles — Replit-style icon row with scroll arrows, now
            with 12 categories (up from 7) so the row is genuinely
            scrollable, each tile tinted with its own accent color and
            filled solid on active/hover for a livelier, more "designed"
            feel than the flat gray tiles this replaced. */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="mx-auto mt-8 flex max-w-3xl items-center gap-2"
        >
          <button
            type="button"
            onClick={() => scrollCategories(-1)}
            aria-label="Scroll categories left"
            className="hidden shrink-0 rounded-full border border-border bg-card p-2 text-muted-foreground shadow-sm transition-colors hover:border-primary/30 hover:text-foreground sm:grid sm:place-items-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div
            ref={categoryScrollRef}
            className="no-scrollbar mask-fade-lr flex flex-1 items-center gap-3 overflow-x-auto scroll-smooth px-1 py-2"
          >
            {PROMPT_CATEGORIES.map((c) => {
              const active = activeCategory === c.id;
              return (
                <motion.button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategoryClick(c)}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  className="group flex w-24 shrink-0 flex-col items-center gap-2.5"
                >
                  <span
                    className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border transition-colors duration-300"
                    style={{
                      borderColor: active ? "transparent" : `color-mix(in srgb, ${c.accent} ${active ? 0 : 18}%, var(--imgprompt-border))`,
                      background: active
                        ? `linear-gradient(135deg, ${c.accent}, color-mix(in srgb, ${c.accent} 70%, #6d28d9))`
                        : "var(--imgprompt-card)",
                      boxShadow: active ? `0 10px 28px -8px ${c.accent}99` : "none",
                    }}
                  >
                    <span
                      className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{ background: active ? "transparent" : `color-mix(in srgb, ${c.accent} 12%, transparent)` }}
                      aria-hidden
                    />
                    <c.icon className="relative h-6 w-6 transition-transform duration-300 group-hover:scale-110" style={{ color: active ? "#fff" : c.accent }} />
                  </span>
                  <span className={cn("text-center text-xs font-medium leading-tight transition-colors", active ? "text-foreground" : "text-foreground/70 group-hover:text-foreground")}>
                    {c.label}
                  </span>
                </motion.button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => scrollCategories(1)}
            aria-label="Scroll categories right"
            className="hidden shrink-0 rounded-full border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground sm:grid sm:place-items-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>

        {/* Related-prompt auto-suggestions for the active category — up
            to 6 per category, clicking one swaps it into the input above. */}
        <AnimatePresence mode="wait">
          {activeCategoryData && (
            <motion.div
              key={activeCategoryData.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
              className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-2"
            >
              <span className="text-xs font-medium text-muted-foreground/70">Related:</span>
              {activeCategoryData.examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSuggestionClick(ex)}
                  title={ex}
                  className={cn(
                    "max-w-[280px] truncate rounded-full border px-3 py-1.5 text-xs transition-colors",
                    inputValue === ex
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-foreground/[0.02] text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  )}
                >
                  {ex}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
