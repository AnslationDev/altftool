const seo = {
  title: "Art Style Prompt Explorer: 16 Movements",
  metaDescription:
    "Pick up to 3 of 16 art movements and get a prompt plus a negative prompt built from what each style structurally avoids, with a 75-token CLIP estimate.",
  steps: [
    "Describe the picture in the 'Subject' box — it opens with 'a lighthouse on a rocky headland at dawn'.",
    "Tap up to three of the sixteen movement chips (Bauhaus, Ukiyo-e, Art Nouveau, Impressionism, Suprematism and the rest), then set 'Medium', 'Lighting', 'Composition', 'Colour treatment' and 'Detail density'.",
    "Check the estimated token count against the 75-token CLIP window, then use 'Copy prompt', 'Copy negatives' — assembled from each movement's 'Never' list — or 'Copy trimmed' when the prompt runs over.",
  ],
  intro:
    "The Art Style Prompt Explorer is a reference table of 16 art movements — their period, documented visual hallmarks, characteristic palette and the things they never do — wired to a prompt composer that turns your choices into an image-generation prompt plus a matching negative prompt. It flags movement pairs that pull against each other, caps blending at three, and estimates whether the result fits the 75 usable tokens in CLIP's text window. For anyone who keeps typing 'make it artistic' and getting the same beige render back.",
  useCases: [
    "Learning what actually distinguishes Bauhaus from Swiss International before naming either in a prompt",
    "Blending two movements deliberately — Ukiyo-e composition with risograph printing, for example — instead of hoping",
    "Building a negative prompt from what a movement structurally avoids, such as cast shadows in woodblock print",
    "Shortening an overlong prompt so a Stable Diffusion or SDXL model reads all of it rather than truncating",
  ],
  benefits: [
    ["Real hallmarks, not adjectives", "Each movement lists concrete visual rules a model can actually act on."],
    ["Conflicts flagged", "Pairs like Minimalism and Baroque are called out before you waste a generation."],
    ["Token-aware", "Reports the estimate and emits a trimmed prompt that fits the 75-token CLIP window."],
  ],
  faqs: [
    [
      "How long can an image generation prompt be?",
      "CLIP's text encoder, used by Stable Diffusion 1.x, 2.x and SDXL, has a context length of 77 tokens — 75 for your words once the start and end tokens are counted. Some interfaces chunk longer prompts, but the safest assumption is that anything past roughly 75 tokens either gets truncated or gets weighted much less.",
    ],
    [
      "How many art styles can I combine in one prompt?",
      "Two blends cleanly and three is the practical ceiling. Beyond that the model averages the styles toward a generic painterly look, and any movement whose rules contradict another — flat colour against chiaroscuro, for instance — simply loses.",
    ],
    [
      "What should go in a negative prompt for an art style?",
      "The things the movement structurally does not do. Ukiyo-e has no cast shadows and no linear perspective, so both belong in the negative prompt; Bauhaus has no gradients or ornament; Suprematism has no representational detail. Adding generic negatives like watermark, signature and garbled text on top costs nothing.",
    ],
    [
      "What is the difference between Bauhaus and Swiss International style?",
      "Bauhaus (1919–1933) is a workshop philosophy built on primary geometry and primary colour, applied across furniture, architecture and print. Swiss International Typographic style (1950s–1960s) is narrower and later: a strict modular grid, neo-grotesque type ranged left, generous white space and photography treated as a flat rectangle. Bauhaus looks constructed; Swiss looks organised.",
    ],
  ],
};

export default seo;
