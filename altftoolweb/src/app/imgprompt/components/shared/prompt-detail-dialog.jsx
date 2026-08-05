"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, Download, Share2, ArrowUpRight, Ban } from "lucide-react";
import { getModel } from "../../data/models";
import { getCategory } from "../../data/categories";
import { copyToClipboard, downloadJson } from "../../lib/utils";
import { useCopyPrompt } from "../../hooks/use-copy-prompt";
import { useRedirectConfig } from "../../store/redirect-config";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { PromptThumb } from "./prompt-thumb";

export function PromptDetailDialog({ prompt, open, onOpenChange }) {
  const copyPrompt = useCopyPrompt();
  const destinationUrl = useRedirectConfig((s) => s.redirectUrl);
  const destinationLabel = useRedirectConfig((s) => s.redirectLabel);
  const model = getModel(prompt.modelId);
  const category = getCategory(prompt.categorySlug);

  const share = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/imgprompt?p=${prompt.slug}` : prompt.slug;
    if (navigator.share) {
      try {
        await navigator.share({ title: prompt.title, text: prompt.description, url });
        return;
      } catch {
        /* fall through */
      }
    }
    await copyToClipboard(url);
    toast.success("Share link copied");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="relative">
          <PromptThumb
            seed={prompt.seed}
            emoji={category?.emoji}
            gradient={category?.gradient}
            rounded="rounded-none"
            className="h-44 w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute bottom-3 left-5 flex items-center gap-2">
            <Badge variant="gradient">{model.name}</Badge>
            {category && <Badge variant="secondary">{category.emoji} {category.name}</Badge>}
            <Badge variant="outline">{prompt.aspectRatio}</Badge>
          </div>
        </div>

        <div className="max-h-[68vh] overflow-y-auto app-scroll p-6 pt-4">
          <div>
            <DialogTitle className="text-2xl">{prompt.title}</DialogTitle>
            <p className="mt-1.5 text-sm text-muted-foreground">{prompt.description}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <Badge variant="secondary">{prompt.difficulty}</Badge>
          </div>

          <Separator className="my-5" />

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompt</span>
              <button
                onClick={() => copyToClipboard(prompt.prompt).then(() => toast.success("Prompt copied"))}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Copy className="h-3 w-3" /> Copy text
              </button>
            </div>
            <p className="rounded-xl border border-border bg-black/30 p-4 font-mono text-[13px] leading-relaxed text-foreground/90">
              {prompt.prompt}
            </p>
          </div>

          {prompt.negativePrompt && (
            <div className="mt-4 space-y-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-rose-400">
                <Ban className="h-3 w-3" /> Negative Prompt
              </span>
              <p className="rounded-xl border border-rose-500/15 bg-rose-500/[0.04] p-4 font-mono text-[13px] leading-relaxed text-muted-foreground">
                {prompt.negativePrompt}
              </p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {prompt.tags.map((t) => (
              <Badge key={t} variant="secondary">#{t}</Badge>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button className="flex-1 min-w-[180px]" onClick={() => copyPrompt(prompt.prompt, prompt.title)}>
              <Copy className="h-4 w-4" /> Copy Prompt → {destinationLabel}
            </Button>
            <Button variant="outline" onClick={() => downloadJson(prompt.slug, {
              title: prompt.title, prompt: prompt.prompt, negativePrompt: prompt.negativePrompt,
              model: model.name, category: category?.name, tags: prompt.tags,
            })}>
              <Download className="h-4 w-4" /> JSON
            </Button>
            <Button variant="outline" onClick={share}>
              <Share2 className="h-4 w-4" /> Share
            </Button>
            <Button variant="secondary" asChild>
              <a href={destinationUrl} target="_blank" rel="noopener noreferrer">
                {destinationLabel} <ArrowUpRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
