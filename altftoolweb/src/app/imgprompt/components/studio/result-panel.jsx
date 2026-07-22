"use client";

import { toast } from "sonner";
import { Copy, Download, Ban, ArrowUpRight, Wand2, RefreshCw, Camera, Sun, Aperture, Frame, Palette, Smile } from "lucide-react";
import { cn, copyToClipboard, downloadJson } from "../../lib/utils";
import { useCopyPrompt } from "../../hooks/use-copy-prompt";
import { useRedirectConfig } from "../../store/redirect-config";
import { getModel } from "../../data/models";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const SUGGESTION_MAP = [
  { key: "camera", label: "Camera", icon: Camera, field: "cameras" },
  { key: "lighting", label: "Lighting", icon: Sun, field: "lighting" },
  { key: "lens", label: "Lens", icon: Aperture, field: "lenses" },
  { key: "composition", label: "Composition", icon: Frame, field: "composition" },
  { key: "mood", label: "Mood", icon: Smile, field: "moods" },
  { key: "palette", label: "Palette", icon: Palette, field: "palette" },
];

export function ResultPanel({ result, onApplySuggestion, onRegenerate, regenerating }) {
  const copyPrompt = useCopyPrompt();
  const destinationUrl = useRedirectConfig((s) => s.redirectUrl);
  const model = getModel(result.modelId);

  return (
    <div className="rounded-2xl border border-primary/20 bg-card/60 p-5 shadow-glow">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-gradient">
            <Wand2 className="h-4 w-4 text-white" />
          </span>
          <div>
            <div className="text-sm font-semibold leading-tight">{result.title}</div>
            <div className="text-[11px] text-muted-foreground">
              {model.name} · {result.meta.words} words · {result.meta.tokens} tokens · {result.meta.engine === "openai" ? "OpenAI" : "AI engine"}
            </div>
          </div>
        </div>
        <Badge variant="gradient">Ready</Badge>
      </div>

      <div className="relative">
        <pre className="max-h-64 overflow-auto app-scroll whitespace-pre-wrap rounded-xl border border-border bg-black/40 p-4 font-mono text-[13px] leading-relaxed text-foreground/90">
{result.prompt}
        </pre>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button className="flex-1 min-w-[160px]" onClick={() => copyPrompt(result.prompt, result.title)}>
          <Copy className="h-4 w-4" /> Copy Prompt → OpenArt
        </Button>
        <Button
          variant="outline" size="icon"
          onClick={() => downloadJson(result.title.toLowerCase().replace(/\s+/g, "-") || "prompt", {
            title: result.title, prompt: result.prompt, negativePrompt: result.negativePrompt,
            model: model.name, scores: result.scores,
          })}
          title="Download JSON"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="secondary" asChild>
          <a href={destinationUrl} target="_blank" rel="noopener noreferrer" title="Open OpenArt">
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </Button>
        {onRegenerate && (
          <Button variant="outline" onClick={onRegenerate} disabled={regenerating} title="Generate a new variation">
            <RefreshCw className={cn("h-4 w-4", regenerating && "animate-spin")} /> Regenerate
          </Button>
        )}
      </div>

      {result.negativePrompt && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-rose-400">
              <Ban className="h-3 w-3" /> Negative Prompt
            </span>
            <button
              onClick={() => copyToClipboard(result.negativePrompt).then(() => toast.success("Negative prompt copied"))}
              className="text-[11px] text-primary hover:underline"
            >
              Copy
            </button>
          </div>
          <p className="rounded-xl border border-rose-500/15 bg-rose-500/[0.04] p-3 font-mono text-[12px] leading-relaxed text-muted-foreground">
            {result.negativePrompt}
          </p>
        </div>
      )}

      <div className="mt-5">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
          One-tap AI suggestions
        </div>
        <div className="space-y-2.5">
          {SUGGESTION_MAP.map(({ key, label, icon: Icon, field }) => {
            const options = result.suggestions[field];
            if (!options?.length) return null;
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="flex w-24 shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" /> {label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        onApplySuggestion?.(key, opt);
                        toast.success(`Applied ${label.toLowerCase()}: ${opt}`);
                      }}
                      className="rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-[11px] text-foreground/80 transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
