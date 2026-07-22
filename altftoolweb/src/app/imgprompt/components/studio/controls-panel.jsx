"use client";

import { RotateCcw } from "lucide-react";
import { useStudio } from "../../store/studio";
import {
  ART_STYLES, RENDER_STYLES, CAMERAS, LENSES, LIGHTING, COMPOSITION, MOODS, PALETTES, TRANSITIONS,
} from "../../lib/modifiers";
import { Slider } from "../ui/slider";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "../ui/accordion";
import { Button } from "../ui/button";

const ASPECTS = ["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"];
const RESOLUTIONS = ["1024×1024", "1536×1024", "2048×1152", "1024×1536", "1536×2048", "4096×2304"];
const FPS = ["24", "30", "48", "60"];
const VOICES = ["warm narrator", "energetic host", "calm female", "deep male", "cinematic trailer", "friendly guide"];
const NARRATION = ["documentary", "storyteller", "commercial", "educational", "dramatic"];
const MUSIC = ["cinematic ambient", "upbeat pop", "epic orchestral", "lofi chill", "tense suspense", "inspirational"];

function SelectRow({ label, value, onChange, options, auto = true }) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>
          {auto && <SelectItem value="auto">Auto (AI picks)</SelectItem>}
          {options.map((o) => (
            <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

function SliderRow({ label, value, min, max, step = 1, suffix = "", onChange }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{label}</span>
        <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[11px] text-foreground">{value}{suffix}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}

export function ControlsPanel({ controls }) {
  const params = useStudio((s) => s.params);
  const setParam = useStudio((s) => s.setParam);
  const resetParams = useStudio((s) => s.resetParams);

  const has = (c) => controls.includes(c);
  const p = params;
  const set = (k) => (v) => setParam(k, v);

  const defaultOpen = ["direction", "params"];

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Studio Controls</h3>
        <Button variant="ghost" size="sm" onClick={resetParams} className="h-7 text-xs">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </Button>
      </div>

      <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2.5">
        {(has("image") || has("camera")) && (
          <AccordionItem value="direction">
            <AccordionTrigger className="py-3 text-sm">🎨 Creative Direction</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-3">
                <SelectRow label="Art Style" value={p.artStyle} onChange={set("artStyle")} options={ART_STYLES} />
                <SelectRow label="Rendering" value={p.renderStyle} onChange={set("renderStyle")} options={RENDER_STYLES} />
                <SelectRow label="Camera" value={p.camera} onChange={set("camera")} options={CAMERAS} />
                <SelectRow label="Lens" value={p.lens} onChange={set("lens")} options={LENSES} />
                <SelectRow label="Lighting" value={p.lighting} onChange={set("lighting")} options={LIGHTING} />
                <SelectRow label="Composition" value={p.composition} onChange={set("composition")} options={COMPOSITION} />
                <SelectRow label="Mood" value={p.mood} onChange={set("mood")} options={MOODS} />
                <SelectRow label="Color Palette" value={p.palette} onChange={set("palette")} options={PALETTES} />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {has("image") && (
          <AccordionItem value="params">
            <AccordionTrigger className="py-3 text-sm">⚙️ Image Parameters</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-3">
                <SelectRow label="Aspect Ratio" value={p.aspectRatio} onChange={set("aspectRatio")} options={ASPECTS} auto={false} />
                <SelectRow label="Resolution" value={p.resolution} onChange={set("resolution")} options={RESOLUTIONS} auto={false} />
              </div>
              <div className="mt-4 space-y-4">
                <SliderRow label="Image Count" value={p.imageCount} min={1} max={8} onChange={set("imageCount")} />
                <SliderRow label="Quality" value={p.quality} min={0} max={100} suffix="%" onChange={set("quality")} />
                <SliderRow label="Prompt Strength" value={p.promptStrength} min={0} max={100} suffix="%" onChange={set("promptStrength")} />
                <SliderRow label="AI Creativity" value={p.creativity} min={0} max={100} suffix="%" onChange={set("creativity")} />
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Seed (0 = random)</span>
                  <Input type="number" value={p.seed} onChange={(e) => setParam("seed", Number(e.target.value) || 0)} className="h-9" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {has("advanced") && (
          <AccordionItem value="advanced">
            <AccordionTrigger className="py-3 text-sm">🧪 Advanced (Midjourney-style)</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <SliderRow label="Chaos" value={p.chaos} min={0} max={100} onChange={set("chaos")} />
                <SliderRow label="Stylize" value={p.stylize} min={0} max={1000} step={10} onChange={set("stylize")} />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {has("video") && (
          <AccordionItem value="video">
            <AccordionTrigger className="py-3 text-sm">🎬 Video & Motion</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <SliderRow label="Duration" value={p.videoDuration} min={2} max={60} suffix="s" onChange={set("videoDuration")} />
                <SliderRow label="Motion Level" value={p.motionLevel} min={0} max={100} suffix="%" onChange={set("motionLevel")} />
                <div className="grid grid-cols-2 gap-3">
                  <SelectRow label="FPS" value={String(p.fps)} onChange={(v) => setParam("fps", Number(v))} options={FPS} auto={false} />
                  <SelectRow label="Transition" value={p.transition} onChange={set("transition")} options={TRANSITIONS} auto={false} />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {has("audio") && (
          <AccordionItem value="audio">
            <AccordionTrigger className="py-3 text-sm">🔊 Voice & Music</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-1 gap-3">
                <SelectRow label="Voice Style" value={p.voiceStyle} onChange={set("voiceStyle")} options={VOICES} auto={false} />
                <SelectRow label="Narration Style" value={p.narrationStyle} onChange={set("narrationStyle")} options={NARRATION} auto={false} />
                <SelectRow label="Music Mood" value={p.musicMood} onChange={set("musicMood")} options={MUSIC} auto={false} />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="negative">
          <AccordionTrigger className="py-3 text-sm">🚫 Negative Prompt</AccordionTrigger>
          <AccordionContent>
            <Textarea
              value={p.negativePrompt}
              onChange={(e) => setParam("negativePrompt", e.target.value)}
              placeholder="Things to avoid (auto-suggestions are added on generate)…"
              className="min-h-[80px] text-sm"
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
