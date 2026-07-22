"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Wand2, Image as ImageIcon, Video, Clapperboard } from "lucide-react";
import { studioHref } from "../../data/navigation";
import { useAuth } from "../../providers/auth-provider";
import { SectionHeader } from "../shared/section-header";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

/** The 5 core Prompt Studio tools — kept local (rather than reading
 *  navigation.js) so this section stays a fully self-contained, reusable
 *  component with its own copy and doesn't risk touching the shared
 *  sidebar navigation data. */
const TOOLS = [
  {
    slug: "prompt-generator",
    label: "Prompt Generator",
    description: "Turn any idea into a pro prompt",
    icon: Sparkles,
    badge: "AI",
    gradient: ["#8b5cf6", "#6366f1"],
  },
  {
    slug: "prompt-optimizer",
    label: "Prompt Optimizer",
    description: "Refine & score an existing prompt",
    icon: Wand2,
    gradient: ["#3b82f6", "#22d3ee"],
  },
  {
    slug: "image-prompt",
    label: "Image Prompt",
    description: "Craft prompts tuned for AI image models",
    icon: ImageIcon,
    gradient: ["#d946ef", "#8b5cf6"],
  },
  {
    slug: "video-prompt",
    label: "Video Prompt",
    description: "Write motion-ready prompts for AI video",
    icon: Video,
    gradient: ["#f59e0b", "#ef4444"],
  },
  {
    slug: "cinema-prompt",
    label: "Cinema Prompt",
    description: "Short film & cinematic shots",
    icon: Clapperboard,
    gradient: ["#10b981", "#14b8a6"],
  },
];

export function PromptStudioSection() {
  const router = useRouter();
  const { requireAuth } = useAuth();

  const goTo = (href) => (e) => {
    e.preventDefault();
    requireAuth(() => router.push(href));
  };

  return (
    <section id="imgprompt-prompt-studio" className="relative py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeader
            align="left"
            eyebrow="AI Prompt Studio"
            title="Start with a purpose-built tool"
            subtitle="Five focused AI tools, each engineered for a different kind of prompt — pick one and get an AI-generated starting idea instantly."
          />
          <Button variant="outline" className="shrink-0" onClick={goTo("/imgprompt/studio")}>
            Open Studio <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {TOOLS.map((t, i) => (
            <motion.div
              key={t.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
            >
              <a
                href={studioHref(t.slug)}
                onClick={goTo(studioHref(t.slug))}
                className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card/40 p-4 card-hover"
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${t.gradient[0]}, ${t.gradient[1]})` }}
                />
                {t.badge && (
                  <Badge variant="gradient" className="absolute right-3 top-3">{t.badge}</Badge>
                )}
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
                  <t.icon className="h-5 w-5 text-white" />
                </span>
                <div className="mt-6">
                  <div className="font-display text-sm font-semibold leading-tight transition-colors group-hover:text-primary">
                    {t.label}
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{t.description}</div>
                </div>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
