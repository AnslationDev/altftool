import { clamp, seededRandom } from "../utils";
import { CAMERAS, LENSES, LIGHTING, QUALITY_BOOSTERS } from "../modifiers";

function containsAny(text, list) {
  const lower = text.toLowerCase();
  return list.reduce((n, k) => (lower.includes(k.toLowerCase().split(" ")[0]) ? n + 1 : n), 0);
}

/** Small deterministic jitter so scores feel organic but never random per render. */
function jitter(seed, spread = 6) {
  return (seededRandom(seed) - 0.5) * spread;
}

/**
 * Compute the full Prompt Intelligence panel from a composed prompt.
 * Heuristic today; swap for a model-scored payload once OpenAI is wired.
 */
export function computeScores(prompt, negative, input) {
  const words = prompt.trim().split(/\s+/).filter(Boolean).length;
  const { params } = input;

  const lengthSignal = clamp(
    words < 12 ? words / 24 : words <= 75 ? 1 : 1 - (words - 75) / 160,
    0.2,
    1
  );
  const cameraSignal = clamp(containsAny(prompt, CAMERAS) * 0.6 + (params.camera !== "auto" ? 0.4 : 0), 0, 1);
  const lightSignal = clamp(containsAny(prompt, LIGHTING) * 0.4 + (params.lighting !== "auto" ? 0.5 : 0.2), 0, 1);
  const lensSignal = clamp(containsAny(prompt, LENSES) * 0.5 + (params.lens !== "auto" ? 0.4 : 0.1), 0, 1);
  const qualitySignal = clamp(containsAny(prompt, QUALITY_BOOSTERS) / 3 + params.quality / 200, 0, 1);
  const negativeSignal = negative.trim().length > 0 ? 1 : 0.4;
  const specificity = clamp((prompt.match(/,/g)?.length ?? 0) / 10, 0.2, 1);
  const detail = clamp((cameraSignal + lightSignal + lensSignal + qualitySignal + specificity) / 5, 0, 1);

  const s = input.idea + prompt.length + input.modelId;

  const quality = clamp(58 + detail * 40 + jitter(s + "q"), 40, 99);
  const composition = clamp(60 + (params.composition !== "auto" ? 30 : 18) + lengthSignal * 8 + jitter(s + "c"), 45, 99);
  const lighting = clamp(55 + lightSignal * 40 + jitter(s + "l"), 45, 99);
  const realism = clamp(
    52 + qualitySignal * 30 + cameraSignal * 14 + (params.artStyle === "hyperrealistic" ? 6 : 0) + jitter(s + "r"),
    40,
    99
  );
  const creativity = clamp(50 + params.creativity * 0.35 + params.chaos * 0.15 + jitter(s + "cr"), 42, 99);
  const commercial = clamp(56 + (input.categorySlug ? 24 : 12) + specificity * 14 + jitter(s + "co"), 45, 98);
  const keywordDensity = clamp(40 + specificity * 45 + detail * 15 + jitter(s + "kd"), 35, 98);
  const optimization = clamp((quality + composition + keywordDensity) / 3 + jitter(s + "op"), 45, 99);
  const seo = clamp(48 + (input.categorySlug ? 26 : 10) + specificity * 20 + jitter(s + "seo"), 40, 97);
  const trend = clamp(52 + seededRandom(s + "t") * 40, 45, 98);
  const viral = clamp((trend + creativity) / 2 - 4 + jitter(s + "v"), 40, 97);
  const conversion = clamp((commercial + seo) / 2 + jitter(s + "cv"), 42, 97);
  const confidence = clamp(60 + detail * 30 + negativeSignal * 8 + jitter(s + "cf", 4), 50, 99);

  const overall = clamp(
    Math.round(
      quality * 0.2 +
        composition * 0.12 +
        lighting * 0.1 +
        realism * 0.12 +
        creativity * 0.12 +
        commercial * 0.1 +
        optimization * 0.12 +
        confidence * 0.12
    ),
    40,
    99
  );

  const round = (n) => Math.round(n);
  return {
    overall,
    quality: round(quality),
    commercial: round(commercial),
    creativity: round(creativity),
    realism: round(realism),
    composition: round(composition),
    lighting: round(lighting),
    keywordDensity: round(keywordDensity),
    optimization: round(optimization),
    seo: round(seo),
    trend: round(trend),
    viral: round(viral),
    conversion: round(conversion),
    confidence: round(confidence),
  };
}
