/**
 * Storytelling Prompt Builder — assembles a structured LLM prompt for writing
 * fiction around a chosen narrative arc, point of view, tone and pacing.
 *
 * The arcs encoded here are the classic, widely documented story structures:
 * the three-act structure as formalised by Syd Field in "Screenplay" (1979),
 * the Hero's Journey as condensed by Christopher Vogler from Joseph Campbell's
 * monomyth, Freytag's pyramid from Gustav Freytag's "Die Technik des Dramas"
 * (1863), and kishōtenketsu, the four-part East Asian structure.
 */

/**
 * Rule of thumb published by OpenAI in its tokenizer documentation:
 * one token corresponds to roughly 4 characters of common English text.
 */
export const CHARS_PER_TOKEN = 4;

/**
 * Word bands follow common editorial definitions: flash fiction is usually
 * capped at 1,000–1,500 words, and most magazines define a short story as
 * roughly 1,500–7,500 words (SFWA uses under 7,500 for its short story award).
 */
export const LENGTH_OPTIONS = [
  { id: "flash", label: "Flash fiction", words: 1000 },
  { id: "short", label: "Short story", words: 3000 },
  { id: "long-short", label: "Long short story", words: 6000 },
];

export const ARC_OPTIONS = [
  {
    id: "three-act",
    label: "Three-act structure (Syd Field)",
    beats: [
      "Act I — Setup: establish the protagonist, their world and what they want; end on an inciting incident that upends it (about the first quarter)",
      "Act II — Confrontation: escalating obstacles, a midpoint reversal that raises the stakes, and a low point where the goal seems lost (about half the story)",
      "Act III — Resolution: the climax where the protagonist confronts the central conflict, then a brief resolution showing the changed world (final quarter)",
    ],
  },
  {
    id: "heros-journey",
    label: "Hero's Journey (Campbell / Vogler)",
    beats: [
      "Ordinary world: show the hero's normal life and its quiet flaw",
      "Call to adventure and initial refusal",
      "Meeting the mentor and crossing the first threshold",
      "Tests, allies and enemies in the unfamiliar world",
      "The ordeal: the hero's greatest fear or hardest trial",
      "The reward, and the road back with renewed pursuit",
      "Resurrection: a final, transformative confrontation",
      "Return with the elixir: what the hero brings home, changed",
    ],
  },
  {
    id: "freytag",
    label: "Freytag's pyramid",
    beats: [
      "Exposition: setting, characters and the seed of conflict",
      "Inciting incident that sets the drama moving",
      "Rising action: complications build tension step by step",
      "Climax: the turning point of greatest tension",
      "Falling action: consequences unwind",
      "Denouement: resolution and final emotional note",
    ],
  },
  {
    id: "kishotenketsu",
    label: "Kishōtenketsu (four-part, twist-driven)",
    beats: [
      "Ki (introduction): establish characters and situation calmly",
      "Shō (development): deepen the situation without major conflict",
      "Ten (twist): introduce an unexpected element or perspective shift that recasts everything before it",
      "Ketsu (conclusion): reconcile the twist with what came before",
    ],
  },
];

export const POV_OPTIONS = [
  {
    id: "first",
    label: "First person",
    instruction:
      "first person (“I”) — stay locked inside the narrator's head; the reader knows only what the narrator perceives, remembers or believes",
  },
  {
    id: "second",
    label: "Second person",
    instruction:
      "second person (“you”) — address the reader as the protagonist and keep the immediacy consistent throughout",
  },
  {
    id: "third-limited",
    label: "Third person limited",
    instruction:
      "third person limited — one viewpoint character per scene; render only that character's thoughts and perceptions, no head-hopping",
  },
  {
    id: "third-omniscient",
    label: "Third person omniscient",
    instruction:
      "third person omniscient — a knowing narrator who may move between minds, but with a consistent narrative voice and deliberate transitions",
  },
];

export const TONE_OPTIONS = [
  { id: "hopeful", label: "Hopeful / uplifting" },
  { id: "dark", label: "Dark / unsettling" },
  { id: "melancholy", label: "Melancholy / wistful" },
  { id: "comic", label: "Comic / playful" },
  { id: "suspenseful", label: "Tense / suspenseful" },
  { id: "neutral", label: "Understated / literary" },
];

export const PACING_OPTIONS = [
  {
    id: "slow-burn",
    label: "Slow burn",
    instruction:
      "slow-burn pacing — linger on atmosphere, interiority and sensory detail; let tension accumulate gradually and delay revelations",
  },
  {
    id: "balanced",
    label: "Balanced",
    instruction:
      "balanced pacing — alternate scene (real-time action and dialogue) with brief summary; vary sentence length to control rhythm",
  },
  {
    id: "fast",
    label: "Fast / propulsive",
    instruction:
      "fast, propulsive pacing — short scenes, hard cuts, minimal exposition; start scenes late and leave them early",
  },
];

export const ENDING_OPTIONS = [
  { id: "resolved", label: "Resolved ending", instruction: "a resolved ending that answers the story's central question" },
  { id: "ambiguous", label: "Ambiguous ending", instruction: "an ambiguous, open ending that leaves the central question deliberately unresolved" },
  { id: "twist", label: "Twist ending", instruction: "a twist ending that recontextualises earlier events — plant fair clues so it feels earned, not arbitrary" },
];

/** Count words in a plain-text string; empty and whitespace-only strings count as 0. */
export function countWords(text) {
  if (typeof text !== "string") return 0;
  const trimmed = text.trim();
  if (trimmed === "") return 0;
  return trimmed.split(/\s+/).length;
}

/** Estimate LLM tokens from character count using the ~4 chars/token rule of thumb. */
export function estimateTokens(text) {
  if (typeof text !== "string" || text.length === 0) return 0;
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Build the storytelling prompt.
 * Required: premise — without one the prompt has no story to tell, so the
 * builder refuses rather than emitting a hollow template.
 */
export function buildStoryPrompt({
  premise,
  protagonist = "",
  setting = "",
  genre = "",
  themes = "",
  arcId = "three-act",
  povId = "third-limited",
  toneId = "neutral",
  pacingId = "balanced",
  endingId = "resolved",
  lengthId = "short",
}) {
  const premiseText = typeof premise === "string" ? premise.trim() : "";
  if (!premiseText) {
    return { error: "Enter a story premise — one or two sentences describing what the story is about." };
  }

  const arc = ARC_OPTIONS.find((a) => a.id === arcId) ?? ARC_OPTIONS[0];
  const pov = POV_OPTIONS.find((p) => p.id === povId) ?? POV_OPTIONS[2];
  const tone = TONE_OPTIONS.find((t) => t.id === toneId) ?? TONE_OPTIONS[5];
  const pacing = PACING_OPTIONS.find((p) => p.id === pacingId) ?? PACING_OPTIONS[1];
  const ending = ENDING_OPTIONS.find((e) => e.id === endingId) ?? ENDING_OPTIONS[0];
  const length = LENGTH_OPTIONS.find((l) => l.id === lengthId) ?? LENGTH_OPTIONS[1];

  const lines = [];
  lines.push(
    `You are a skilled fiction writer. Write an original${genre.trim() ? ` ${genre.trim()}` : ""} story of about ${length.words} words.`,
  );
  lines.push("");
  lines.push(`Premise: ${premiseText}`);
  if (protagonist.trim()) lines.push(`Protagonist: ${protagonist.trim()}`);
  if (setting.trim()) lines.push(`Setting: ${setting.trim()}`);
  if (themes.trim()) lines.push(`Themes to explore (subtly, never stated outright): ${themes.trim()}`);
  lines.push("");
  lines.push(`Narrative arc — follow the ${arc.label} structure:`);
  arc.beats.forEach((beat, index) => {
    lines.push(`${index + 1}. ${beat}`);
  });
  lines.push("");
  lines.push("Craft constraints:");
  lines.push(`- Point of view: ${pov.instruction}.`);
  lines.push(`- Tone: ${tone.label.toLowerCase()} — establish it in the opening paragraph and hold it consistently.`);
  lines.push(`- Pacing: ${pacing.instruction}.`);
  lines.push(`- Ending: ${ending.instruction}.`);
  lines.push("- Show, don't tell: convey emotion through action, dialogue and concrete sensory detail rather than naming feelings.");
  lines.push("- Give the protagonist a clear want and a competing need; make every scene move one of them.");
  lines.push("- Avoid clichés and stock phrases; prefer specific, surprising images.");
  lines.push("- Open with a line that raises a question, not with waking up or weather.");

  const prompt = lines.join("\n");

  return {
    prompt,
    arcLabel: arc.label,
    beatCount: arc.beats.length,
    targetWords: length.words,
    promptWords: countWords(prompt),
    promptChars: prompt.length,
    estTokens: estimateTokens(prompt),
  };
}
