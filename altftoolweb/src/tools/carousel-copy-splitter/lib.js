/**
 * Carousel copy splitter.
 *
 * Long copy is packed into slides greedily on sentence boundaries: sentences are
 * added to the current slide until the next one would pass the character budget,
 * at which point a new slide starts. A sentence longer than the budget on its own
 * is split at a clause break, then at a word break, so no word is ever cut.
 *
 * Slide one is reserved for the hook and the last slide for the call to action,
 * because both are read in isolation — the first in the feed, the last after a swipe.
 */

/**
 * Slide caps per platform. Instagram allows up to 20 items in a carousel post.
 * LinkedIn carousels are uploaded as PDF documents and accept far more pages than
 * anyone should use, so a practical working cap is applied instead.
 */
export const PLATFORMS = [
  { id: "instagram", label: "Instagram carousel", maxSlides: 20, charBudget: 220 },
  { id: "linkedin", label: "LinkedIn document post", maxSlides: 12, charBudget: 260 },
  { id: "tiktok", label: "TikTok photo post", maxSlides: 35, charBudget: 160 },
  { id: "custom", label: "Custom", maxSlides: 15, charBudget: 220 },
];

export const MIN_CHAR_BUDGET = 60;
export const MAX_CHAR_BUDGET = 600;
export const MIN_SLIDES = 3;
export const MAX_SLIDES_ALLOWED = 40;

/** Slides whose length differs from the mean by more than this read as uneven. */
export const BALANCE_TOLERANCE = 0.35;

const collapse = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

export function countWords(text) {
  const clean = collapse(text);
  if (!clean) return 0;
  return clean.split(" ").filter((token) => /[A-Za-z0-9]/.test(token)).length;
}

export function platformById(id) {
  return PLATFORMS.find((platform) => platform.id === id) || null;
}

/** Split prose into sentences, keeping the terminating punctuation. */
export function splitSentences(text) {
  const clean = collapse(text);
  if (!clean) return [];
  const matches = clean.match(/[^.!?]+[.!?]+["')\]]*|[^.!?]+$/g) || [];
  return matches.map((sentence) => sentence.trim()).filter(Boolean);
}

/** Break one over-long chunk at clause breaks, then at word breaks. */
function breakChunk(chunk, budget) {
  const pieces = [];
  let remaining = chunk.trim();

  while (remaining.length > budget) {
    const window = remaining.slice(0, budget + 1);
    // Prefer a clause break in the back half of the window, then a word break.
    // Each candidate carries its own resume offset so the punctuation that caused
    // the break never reappears at the start of the next slide.
    const candidates = [
      { index: window.lastIndexOf("; "), cutEnd: 1, resume: 2 },
      { index: window.lastIndexOf(", "), cutEnd: 1, resume: 2 },
      { index: window.lastIndexOf(" — "), cutEnd: 0, resume: 3 },
      { index: window.lastIndexOf(" - "), cutEnd: 0, resume: 3 },
    ].filter((candidate) => candidate.index >= budget * 0.5);

    let cutEnd;
    let resume;
    if (candidates.length > 0) {
      const best = candidates.reduce((a, b) => (b.index > a.index ? b : a));
      cutEnd = best.index + best.cutEnd;
      resume = best.index + best.resume;
    } else {
      const space = window.lastIndexOf(" ");
      if (space > 0) {
        cutEnd = space;
        resume = space + 1;
      } else {
        cutEnd = budget;
        resume = budget;
      }
    }

    const piece = remaining.slice(0, cutEnd).trim().replace(/[,;]\s*$/, "");
    if (piece) pieces.push(piece);
    const next = remaining.slice(resume).trim();
    if (next === remaining) break;
    remaining = next;
  }
  if (remaining) pieces.push(remaining);
  return pieces;
}

/** Pack sentences greedily into slides of at most `budget` characters. */
export function packSlides(sentences, budget) {
  const slides = [];
  let current = "";

  for (const sentence of sentences) {
    if (sentence.length > budget) {
      if (current) {
        slides.push(current);
        current = "";
      }
      for (const piece of breakChunk(sentence, budget)) slides.push(piece);
      continue;
    }
    const candidate = current ? `${current} ${sentence}` : sentence;
    if (candidate.length <= budget) {
      current = candidate;
    } else {
      if (current) slides.push(current);
      current = sentence;
    }
  }
  if (current) slides.push(current);
  return slides;
}

function standardDeviation(values) {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) * (value - mean), 0) / values.length;
  return Math.sqrt(variance);
}

/**
 * Split copy into carousel slides.
 * @param {Object} input
 * @param {string} input.body      the main copy
 * @param {string} [input.hook]    slide one; the first sentence is used when blank
 * @param {string} [input.cta]     final slide
 * @param {number} input.charBudget
 * @param {number} input.maxSlides
 */
export function splitCarousel(input) {
  const raw = input && typeof input === "object" ? input : {};

  const budget = raw.charBudget === undefined || raw.charBudget === "" ? NaN : Number(raw.charBudget);
  if (!Number.isFinite(budget) || budget < MIN_CHAR_BUDGET || budget > MAX_CHAR_BUDGET) {
    return { error: `Characters per slide must be between ${MIN_CHAR_BUDGET} and ${MAX_CHAR_BUDGET}.` };
  }

  const maxSlides = raw.maxSlides === undefined || raw.maxSlides === "" ? NaN : Number(raw.maxSlides);
  if (!Number.isInteger(maxSlides) || maxSlides < MIN_SLIDES || maxSlides > MAX_SLIDES_ALLOWED) {
    return { error: `Slide limit must be a whole number between ${MIN_SLIDES} and ${MAX_SLIDES_ALLOWED}.` };
  }

  const body = collapse(raw.body);
  if (!body) return { error: "Paste the copy you want to split across slides." };

  const cta = collapse(raw.cta);
  let hook = collapse(raw.hook);

  let sentences = splitSentences(body);
  if (!hook) {
    hook = sentences.shift() || "";
    if (!hook) return { error: "Paste the copy you want to split across slides." };
  }
  if (hook.length > budget) {
    return { error: `The hook is ${hook.length} characters — trim it to ${budget} or raise the budget.` };
  }
  if (cta && cta.length > budget) {
    return { error: `The call to action is ${cta.length} characters — trim it to ${budget} or raise the budget.` };
  }

  const bodySlides = packSlides(sentences, Math.floor(budget));

  const slides = [{ role: "hook", text: hook }];
  for (const text of bodySlides) slides.push({ role: "body", text });
  if (cta) slides.push({ role: "cta", text: cta });

  const decorated = slides.map((slide, index) => ({
    index: index + 1,
    role: slide.role,
    text: slide.text,
    characters: slide.text.length,
    words: countWords(slide.text),
    fill: Math.round((slide.text.length / budget) * 1000) / 10,
    over: slide.text.length > budget,
  }));

  const lengths = decorated.map((slide) => slide.characters);
  const totalCharacters = lengths.reduce((sum, value) => sum + value, 0);
  const mean = totalCharacters / decorated.length;
  const deviation = standardDeviation(lengths);
  const balanced = mean > 0 ? deviation / mean <= BALANCE_TOLERANCE : true;

  const capacity = maxSlides * budget;
  const overflow = decorated.length > maxSlides;
  const charsToCut = overflow ? Math.max(0, totalCharacters - capacity) : 0;

  const warnings = [];
  if (overflow) {
    warnings.push(
      `This copy needs ${decorated.length} slides but the limit is ${maxSlides}. Cut about ${charsToCut} characters, or raise the characters-per-slide budget.`,
    );
  }
  if (!cta) warnings.push("No call to action set — the last slide is where the swipe pays off.");
  if (!balanced) {
    warnings.push(
      "Slide lengths are uneven, which shows as ragged blocks of type. Merging or splitting a sentence usually fixes it.",
    );
  }
  if (decorated.length < MIN_SLIDES) {
    warnings.push(
      `Only ${decorated.length} slide${decorated.length === 1 ? "" : "s"} — a carousel usually needs at least ${MIN_SLIDES} to be worth swiping.`,
    );
  }

  return {
    slides: decorated,
    slideCount: decorated.length,
    maxSlides,
    budget: Math.floor(budget),
    totalCharacters,
    totalWords: countWords(body) + countWords(cta),
    averageCharacters: Math.round(mean * 10) / 10,
    shortest: Math.min(...lengths),
    longest: Math.max(...lengths),
    deviation: Math.round(deviation * 10) / 10,
    balanced,
    overflow,
    charsToCut,
    warnings,
  };
}

/** Render the slides as a numbered plain-text plan. */
export function toPlainText(result) {
  if (!result || result.error || !Array.isArray(result.slides)) return "";
  return result.slides
    .map((slide) => `Slide ${slide.index} (${slide.role}, ${slide.characters} chars)\n${slide.text}`)
    .join("\n\n");
}
