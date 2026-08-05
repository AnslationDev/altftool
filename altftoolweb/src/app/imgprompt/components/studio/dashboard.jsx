"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles, Wand2, Image as ImageIcon, Video, Clapperboard, TrendingUp,
  Star, History, Zap, ArrowRight, Palette, Layers,
} from "lucide-react";
import { useStudio } from "../../store/studio";
import { useAuth } from "../../providers/auth-provider";
import { useMounted } from "../../hooks/use-mounted";
import { formatDate } from "../../lib/utils";
import { getModel } from "../../data/models";
import { TRENDING_PROMPTS } from "../../data/prompts";
import { PromptCard } from "../shared/prompt-card";
import { ScoreRing } from "../shared/score-ring";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const QUICK_TOOLS = [
  { label: "Prompt Generator", slug: "prompt-generator", icon: Sparkles, accent: "#8b5cf6" },
  { label: "Image Prompt", slug: "image-prompt", icon: ImageIcon, accent: "#3b82f6" },
  { label: "Video Prompt", slug: "video-prompt", icon: Video, accent: "#f87171" },
  { label: "Cinema Prompt", slug: "cinema-prompt", icon: Clapperboard, accent: "#22d3ee" },
  { label: "Midjourney", slug: "midjourney", icon: Palette, accent: "#22d3ee" },
  { label: "OpenArt", slug: "openart", icon: Layers, accent: "#8b5cf6" },
  { label: "Optimizer", slug: "prompt-optimizer", icon: Wand2, accent: "#ec4899" },
  { label: "Trending", slug: "trending", icon: TrendingUp, accent: "#f59e0b" },
];

export function Dashboard() {
  const { user } = useAuth();
  const mounted = useMounted();
  const history = useStudio((s) => s.history);

  const generated = mounted ? history.length : 0;
  const favorites = mounted ? history.filter((h) => h.favorite).length : 0;
  const avg = mounted && history.length ? Math.round(history.reduce((a, h) => a + h.score, 0) / history.length) : 0;
  const modelsUsed = mounted ? new Set(history.map((h) => h.modelId)).size : 0;

  const STATS = [
    { label: "Prompts Generated", value: generated, icon: Zap },
    { label: "Avg. Score", value: avg || "—", icon: Sparkles },
    { label: "Favorites", value: favorites, icon: Star },
    { label: "Models Used", value: modelsUsed, icon: Layers },
  ];

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          {/* The sole h1 on /imgprompt/studio, an indexable page titled "AI
              Prompt Studio", used to read "Welcome back 👋" — the greeting is
              what a signed-out visitor and a crawler both saw, so the one
              heading on the page named neither the product nor the topic. The
              greeting keeps its place directly underneath. */}
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            AI Prompt Studio
          </h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""} 👋 — your
            creative command center for image, video and story prompts.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/imgprompt/studio/prompt-generator"><Sparkles className="h-4 w-4" /> New Prompt</Link>
        </Button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card/50 p-5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-2 font-display text-3xl font-bold text-gradient-brand">{s.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-semibold">Quick start</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {QUICK_TOOLS.map((t) => (
            <Link
              key={t.slug}
              href={`/imgprompt/studio/${t.slug}`}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/40 p-4 text-center card-hover"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${t.accent}1a`, border: `1px solid ${t.accent}33` }}>
                <t.icon className="h-5 w-5" style={{ color: t.accent }} />
              </span>
              <span className="text-xs font-medium leading-tight group-hover:text-primary">{t.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Trending prompts</h2>
            <Button variant="ghost" size="sm" asChild><Link href="/imgprompt/studio/trending">View all <ArrowRight className="h-4 w-4" /></Link></Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {TRENDING_PROMPTS.slice(0, 4).map((p, i) => (
              <PromptCard key={p.id} prompt={p} index={i} />
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-4 font-display text-lg font-semibold">Recent activity</h2>
          <div className="rounded-2xl border border-border bg-card/50 p-4">
            {!mounted || history.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <History className="h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No prompts yet.<br />Generate your first one!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.slice(0, 6).map((h) => (
                  <div key={h.id} className="flex items-center gap-3">
                    <ScoreRing score={h.score} size={40} stroke={4} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{h.title}</div>
                      <div className="text-xs text-muted-foreground">{getModel(h.modelId).name} · {formatDate(new Date(h.at).toISOString())}</div>
                    </div>
                    {h.favorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/imgprompt/studio/history">Full history</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="mt-4 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent p-5">
            <Badge variant="gradient" className="mb-2">Pro tip</Badge>
            <p className="text-sm text-foreground/85">
              Every prompt copies straight to <span className="text-primary">OpenArt</span> — just hit Copy Prompt and paste to render.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
