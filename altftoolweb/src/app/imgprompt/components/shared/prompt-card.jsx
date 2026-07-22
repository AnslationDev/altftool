"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Copy, Maximize2, Bookmark, Share2, ArrowUpRight, Sparkles } from "lucide-react";
import { getModel } from "../../data/models";
import { getCategory } from "../../data/categories";
import { cn, copyToClipboard, formatDate, scoreColor } from "../../lib/utils";
import { useCopyPrompt } from "../../hooks/use-copy-prompt";
import { Badge } from "../ui/badge";
import { PromptThumb } from "./prompt-thumb";
import { PromptDetailDialog } from "./prompt-detail-dialog";

export function PromptCard({ prompt, index = 0 }) {
  const [open, setOpen] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const copyPrompt = useCopyPrompt();
  const model = getModel(prompt.modelId);
  const category = getCategory(prompt.categorySlug);

  const share = async (e) => {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/imgprompt?p=${prompt.slug}` : prompt.slug;
    await copyToClipboard(url);
    toast.success("Share link copied");
  };

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.3) }}
        className="gradient-ring group relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/60 backdrop-blur-xl card-hover"
      >
        <div className="relative">
          <PromptThumb
            seed={prompt.seed}
            emoji={category?.emoji}
            gradient={category?.gradient}
            count={prompt.images}
            rounded="rounded-none"
            className="h-52 w-full"
          />
          <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-lg bg-black/50 px-2 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles className={cn("h-3.5 w-3.5", scoreColor(prompt.score))} />
            <span className={scoreColor(prompt.score)}>{prompt.score}</span>
          </div>
          <div className="absolute right-2.5 bottom-2.5 flex gap-1.5 opacity-0 translate-y-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <button
              onClick={(e) => { e.stopPropagation(); setSaved((s) => !s); }}
              className="grid h-8 w-8 place-items-center rounded-lg bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
              aria-label="Bookmark"
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current text-primary")} />
            </button>
            <button
              onClick={share}
              className="grid h-8 w-8 place-items-center rounded-lg bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/70"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
          <div className="absolute left-2.5 bottom-2.5">
            <Badge variant="gradient" className="shadow-glow">{model.name}</Badge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <span className="text-xs text-muted-foreground">{formatDate(prompt.createdAt)}</span>

          <button onClick={() => setOpen(true)} className="mt-1.5 flex items-start gap-1.5 text-left">
            <h3 className="font-display text-lg font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
              {prompt.title}
            </h3>
            <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
          </button>

          <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{prompt.description}</p>

          <div className="relative mt-3.5">
            <p className="line-clamp-3 rounded-xl border border-border bg-black/25 p-3 pr-9 font-mono text-[12.5px] leading-relaxed text-foreground/75">
              {prompt.prompt}
            </p>
            <button
              onClick={() => setOpen(true)}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Expand prompt"
            >
              <Maximize2 className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            onClick={() => copyPrompt(prompt.prompt, prompt.title)}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(124,58,237,0.6)] transition-all hover:brightness-110 hover:shadow-glow active:scale-[0.98]"
          >
            <Copy className="h-4 w-4" /> Copy Prompt
          </button>
        </div>
      </motion.article>

      <PromptDetailDialog prompt={prompt} open={open} onOpenChange={setOpen} />
    </>
  );
}
