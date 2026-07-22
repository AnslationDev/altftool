"use client";

import Link from "next/link";
import { Copy, Star, Trash2, History as HistoryIcon, Sparkles } from "lucide-react";
import { useStudio } from "../../store/studio";
import { useMounted } from "../../hooks/use-mounted";
import { useCopyPrompt } from "../../hooks/use-copy-prompt";
import { getModel } from "../../data/models";
import { formatDate, cn } from "../../lib/utils";
import { ScoreRing } from "../shared/score-ring";
import { Button } from "../ui/button";

export function HistoryView({ filter = "all", title, subtitle, icon: Icon = HistoryIcon }) {
  const mounted = useMounted();
  const history = useStudio((s) => s.history);
  const toggleFavorite = useStudio((s) => s.toggleFavorite);
  const removeHistory = useStudio((s) => s.removeHistory);
  const clearHistory = useStudio((s) => s.clearHistory);
  const copyPrompt = useCopyPrompt();

  const items = mounted ? (filter === "favorites" ? history.filter((h) => h.favorite) : history) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
            <Icon className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        {items.length > 0 && filter === "all" && (
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            <Trash2 className="h-4 w-4" /> Clear
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 p-16 text-center">
          <Icon className="h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-4 font-display text-lg font-semibold">Nothing here yet</h3>
          <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
            {filter === "favorites" ? "Star prompts to save them here." : "Generate a prompt to start your history."}
          </p>
          <Button className="mt-5" asChild>
            <Link href="/imgprompt/studio/prompt-generator"><Sparkles className="h-4 w-4" /> Generate a prompt</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((h) => (
            <div key={h.id} className="flex items-start gap-4 rounded-2xl border border-border bg-card/50 p-4">
              <ScoreRing score={h.score} size={52} stroke={5} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="truncate font-medium">{h.title}</h3>
                </div>
                <div className="text-xs text-muted-foreground">
                  {getModel(h.modelId).name} · {formatDate(new Date(h.at).toISOString())}
                </div>
                <p className="mt-2 line-clamp-2 font-mono text-xs text-muted-foreground">{h.prompt}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => copyPrompt(h.prompt, h.title)}>
                    <Copy className="h-3.5 w-3.5" /> Copy → OpenArt
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toggleFavorite(h.id)}>
                    <Star className={cn("h-3.5 w-3.5", h.favorite && "fill-amber-400 text-amber-400")} />
                    {h.favorite ? "Favorited" : "Favorite"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeHistory(h.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
