"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Sparkles, Loader2, Lightbulb, Wand2, ArrowRight } from "lucide-react";
import { generatePrompt, suggestIdeaFor } from "../../lib/prompt-engine";
import { IMAGE_MODELS, VIDEO_MODELS, getModel } from "../../data/models";
import { getCategory } from "../../data/categories";
import { useStudio } from "../../store/studio";
import { useAuth } from "../../providers/auth-provider";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { AssistantBar } from "./assistant-bar";
import { ControlsPanel } from "./controls-panel";
import { ResultPanel } from "./result-panel";
import { IntelligencePanel } from "./intelligence-panel";
import { ExplanationPanel } from "./explanation-panel";

const EXAMPLES = {
  default: [
    "a lone astronaut discovering a glowing alien forest at dusk",
    "luxury perfume bottle floating above rippling black silk",
    "a cozy Scandinavian reading nook bathed in afternoon light",
  ],
  video: [
    "cinematic drone flyover of a neon megacity at dusk",
    "slow dolly-in on a samurai drawing a glowing katana in the rain",
    "product reveal of a sleek electric hypercar on a turntable",
  ],
  story: [
    "a clockmaker who can pause time for sixty seconds a day",
    "two rival chefs forced to run a food truck together",
    "a lighthouse keeper who receives letters from the future",
  ],
};

/** The category-less "Prompt Studio" tools that get an AI-generated idea
 *  suggestion on load, keyed by tool type instead of a category. */
const PROMPT_STUDIO_SLUGS = ["prompt-generator", "prompt-optimizer", "image-prompt", "video-prompt", "cinema-prompt"];

export function Workspace({ tool }) {
  const idea = useStudio((s) => s.idea);
  const setIdea = useStudio((s) => s.setIdea);
  const modelId = useStudio((s) => s.modelId);
  const setModelId = useStudio((s) => s.setModelId);
  const params = useStudio((s) => s.params);
  const setParam = useStudio((s) => s.setParam);
  const result = useStudio((s) => s.result);
  const setResult = useStudio((s) => s.setResult);
  const generating = useStudio((s) => s.generating);
  const setGenerating = useStudio((s) => s.setGenerating);
  const setMode = useStudio((s) => s.setMode);
  const addHistory = useStudio((s) => s.addHistory);
  const { requireAuth } = useAuth();

  const controls = tool.controls ?? (tool.modelId ? getModel(tool.modelId).controls : ["image", "camera", "advanced"]);
  const isVideo = controls.includes("video");
  const isStory = controls.includes("story") && !controls.includes("image") && !controls.includes("video");
  const availableModels = isVideo ? VIDEO_MODELS : IMAGE_MODELS;
  const category = getCategory(tool.categorySlug);
  const model = getModel(modelId);

  const [suggesting, setSuggesting] = React.useState(false);
  const [suggestingLabel, setSuggestingLabel] = React.useState(null);

  // Coming from a category tile or landing CTA can pass ?idea=... (an
  // idea already in hand) or ?category=... (dedicated category tool pages
  // already carry their category via tool.categorySlug, so this only
  // fires for the generic Prompt Generator fallback). With neither, the
  // 5 category-less Prompt Studio tools (prompt-generator, -optimizer,
  // image/video/cinema-prompt) still get a suggestion keyed by tool type.
  // Either way we fetch a fresh AI-generated idea and drop it into the
  // box. Only applied once per tool, and only if the idea box is still
  // empty, so it never clobbers what the user typed. Read via
  // window.location directly (not useSearchParams) so this page isn't
  // forced into a Suspense boundary just for a one-time prefill.
  React.useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ideaParam = searchParams.get("idea");
    if (ideaParam) {
      if (!useStudio.getState().idea) setIdea(ideaParam);
      return;
    }
    if (useStudio.getState().idea) return;

    const targetCategory = category ?? getCategory(searchParams.get("category"));
    const targetToolSlug = !targetCategory && PROMPT_STUDIO_SLUGS.includes(tool.slug) ? tool.slug : null;
    if (!targetCategory && !targetToolSlug) return;

    let cancelled = false;
    const fetchSuggestion = () => {
      setSuggestingLabel(targetCategory?.name ?? tool.label);
      setSuggesting(true);
      suggestIdeaFor({ categorySlug: targetCategory?.slug, toolSlug: targetToolSlug })
        .then((suggestion) => {
          if (cancelled) return;
          if (suggestion && !useStudio.getState().idea) {
            setIdea(suggestion);
          } else if (!suggestion) {
            toast.error("Couldn't load a suggested idea.", {
              description: "You can still type your own.",
              action: { label: "Retry", onClick: fetchSuggestion },
            });
          }
        })
        .finally(() => {
          if (!cancelled) setSuggesting(false);
        });
    };
    fetchSuggestion();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug]);

  React.useEffect(() => {
    if (tool.modelId) {
      setModelId(tool.modelId);
    } else if (isVideo && !VIDEO_MODELS.some((m) => m.id === modelId)) {
      setModelId("runway");
    } else if (!isVideo && !IMAGE_MODELS.some((m) => m.id === modelId)) {
      setModelId("openart");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool.slug]);

  // The idea box, category tiles and suggestions are all free to use
  // without an account — sign-in is only required at the moment of
  // actually generating (the point where a real OpenAI/engine call and a
  // saved result happen). requireAuth runs the callback immediately if
  // already signed in, or opens the global auth dialog and runs it right
  // after a successful sign-in/up, so the click that triggered it never
  // has to be repeated.
  const runGenerate = React.useCallback(
    (mode, overrides) => {
      requireAuth(async () => {
        setMode(mode);
        setGenerating(true);
        const usedParams = { ...params, ...overrides };
        try {
          const res = await generatePrompt({
            idea,
            modelId: tool.modelId ?? modelId,
            categorySlug: tool.categorySlug,
            toolSlug: tool.slug,
            controls,
            params: usedParams,
            mode,
          });
          setResult(res);
          addHistory({
            idea: idea || tool.label,
            title: res.title,
            prompt: res.prompt,
            score: res.scores.overall,
            modelId: res.modelId,
            toolSlug: tool.slug,
          });
        } catch {
          toast.error("Generation failed.", {
            description: "Please try again.",
            action: { label: "Retry", onClick: () => runGenerate(mode, overrides) },
          });
        } finally {
          setGenerating(false);
        }
      });
    },
    [idea, modelId, params, tool, controls, addHistory, setGenerating, setMode, setResult, requireAuth]
  );

  const examples = isStory ? EXAMPLES.story : isVideo ? EXAMPLES.video : EXAMPLES.default;

  const onShuffle = () => {
    const seed = Math.floor(Math.random() * 100000);
    setParam("seed", seed);
    runGenerate("rewrite", { seed });
  };

  const onApplySuggestion = (key, value) => {
    setParam(key, value);
    runGenerate(useStudio.getState().mode, { [key]: value });
  };

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-gradient shadow-glow">
            <tool.icon className="h-5 w-5 text-white" />
          </span>
          <div>
            <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{tool.label}</h1>
            <p className="text-sm text-muted-foreground">
              {tool.description ?? (category ? category.description : `Craft pro ${model.name} prompts with AI intelligence.`)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="capitalize">{isVideo ? "🎬 Video" : isStory ? "📖 Story" : "🖼️ Image"}</Badge>
          <Select value={modelId} onValueChange={setModelId} disabled={Boolean(tool.modelId)}>
            <SelectTrigger className="h-9 w-[180px] text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              {availableModels.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="space-y-5">
          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="mb-2 flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Describe your idea
              </label>
              <span className="text-xs text-muted-foreground">{idea.length} chars</span>
            </div>
            {suggesting && (
              <div className="mb-2 flex items-center gap-1.5 text-xs text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Crafting an idea for {suggestingLabel ?? "this tool"}…
              </div>
            )}
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") runGenerate("generate");
              }}
              placeholder={suggesting ? "Generating a suggestion…" : `e.g. ${examples[0]}`}
              className="min-h-[130px] text-[15px] leading-relaxed"
            />

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Lightbulb className="h-3.5 w-3.5 text-amber-400" /> Try:
              </span>
              {examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setIdea(ex)}
                  className="max-w-[240px] truncate rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {ex}
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <AssistantBar onAssist={(m) => runGenerate(m)} onShuffle={onShuffle} disabled={generating} />
            </div>

            <Button size="lg" className="mt-4 w-full" onClick={() => runGenerate("generate")} disabled={generating}>
              {generating ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Prompt <span className="ml-1 rounded bg-white/20 px-1.5 py-0.5 text-[10px]">⌘↵</span></>
              )}
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card/50 p-5">
            <ControlsPanel controls={controls} />
          </div>
        </div>

        <div className="space-y-5 xl:sticky xl:top-20 xl:self-start">
          {generating && !result && <GeneratingState />}
          {result ? (
            <motion.div
              key={result.prompt.slice(0, 24)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              <ResultPanel result={result} onApplySuggestion={onApplySuggestion} onRegenerate={onShuffle} regenerating={generating} />
              <IntelligencePanel scores={result.scores} />
              <ExplanationPanel ex={result.explanation} />
            </motion.div>
          ) : (
            !generating && <EmptyState onGenerate={() => runGenerate("generate")} model={model.name} />
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onGenerate, model }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/30 p-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-gradient shadow-glow animate-pulse-glow">
        <Wand2 className="h-6 w-6 text-white" />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">Your prompt intelligence appears here</h3>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Describe an idea and hit generate. You&apos;ll get a {model}-tuned prompt, a 0–100 score, and a full explanation of why it works.
      </p>
      <Button className="mt-5" onClick={onGenerate}>
        <Sparkles className="h-4 w-4" /> Generate my first prompt <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

function GeneratingState() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card/50 p-5">
        <div className="flex items-center gap-2 text-sm text-primary">
          <Loader2 className="h-4 w-4 animate-spin" /> Engineering your prompt…
        </div>
        <div className="mt-4 space-y-2.5">
          {[100, 92, 78, 85, 60].map((w, i) => (
            <div key={i} className="h-3 rounded-full shimmer bg-foreground/[0.05]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card/50 p-5">
        <div className="mx-auto h-24 w-24 rounded-full shimmer bg-foreground/[0.05]" />
        <div className="mt-4 space-y-2.5">
          {[70, 88, 64].map((w, i) => (
            <div key={i} className="h-3 rounded-full shimmer bg-foreground/[0.05]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
