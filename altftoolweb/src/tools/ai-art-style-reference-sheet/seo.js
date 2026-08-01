const seo = {
  intro:
    "AI Art Style Reference Sheet builds a reusable image-prompt style definition across eight axes — medium, lighting, lens, composition, colour, era, surface finish and mood — and scores how many of them you have actually named. It de-duplicates phrases, applies (phrase:weight) attention syntax to one axis when you want to push it, and estimates the prompt against CLIP's 77-token context so you know when the tail of your prompt stops being read. For anyone who gets one good image and then cannot reproduce the look.",
  useCases: [
    "Lock down a house style for a series of images so every prompt shares the same lighting, lens and finish.",
    "Diagnose why two prompts look different by comparing which axes each one actually names.",
    "Push lighting harder with (phrase:1.3) attention weighting without rewriting the whole prompt.",
    "Trim a bloated prompt back under the 75-token window that a Stable Diffusion 1.x model reads in one chunk.",
  ],
  benefits: [
    ["Eight axes, one score", "Coverage tells you which parts of the look you have left to the model's imagination."],
    ["Reproducible, not lucky", "The sheet is a saved definition you paste again, so the same look survives across sessions."],
    ["Token-aware", "An estimate against CLIP's 75 usable tokens warns you before the end of the prompt gets ignored."],
  ],
  faqs: [
    [
      "How long can a Stable Diffusion prompt be?",
      "CLIP, the text encoder used by Stable Diffusion 1.x and 2.x, has a context length of 77 tokens, two of which are start and end markers — so 75 tokens of prompt text per chunk. Interfaces like AUTOMATIC1111 split longer prompts into further chunks, but the first 75 tokens carry the most influence.",
    ],
    [
      "What does (phrase:1.3) mean in an image prompt?",
      "It is attention weighting in AUTOMATIC1111 and ComfyUI: the number multiplies how strongly that phrase pulls the image. This tool allows 0.5 to 2.0. Most useful results stay between 0.5 and 1.5 — past about 1.6 the phrase starts dominating and distorting everything else, so save the top of the range for a phrase that genuinely needs to win.",
    ],
    [
      "Why do my AI images look inconsistent between prompts?",
      "Usually because some style axes are unstated, so the model fills them in differently each time. Naming the medium, lighting, lens, composition, colour, era, finish and mood explicitly removes most of that drift; a fixed seed removes the rest.",
    ],
    [
      "Do negative prompts actually help?",
      "They help for specific, recurring failures — hands, watermarks, text, jpeg artifacts — because they steer away from a concept the model has clearly learned. Long generic negative lists mostly waste tokens; six to eight targeted phrases is usually enough.",
    ],
  ],
};

export default seo;
