const seo = {
  title: "AI Image Cost Calculator: DALL·E 3, GPT-image-1",
  metaDescription:
    "Cost a batch at OpenAI's published rates, $0.040 for a standard DALL·E 3 1024×1024 up to $0.120 HD, with a retry allowance for discards.",
  steps: [
    "Choose from \"Model, quality and resolution\" — presets run from DALL·E 2 — 256×256 at $0.016 through DALL·E 3 — HD, 1024×1792 / 1792×1024 at $0.120, plus GPT-image-1 approximations — or pick Custom price per image and type your own USD rate.",
    "Enter \"Images per prompt (variants)\" and \"Number of prompts\", then set the \"Retry allowance (%)\" for generations you expect to discard; it accepts 0 to 500 in steps of 5.",
    "Read Estimated total cost with the Planned images, Retry generations, Billed images, Cost per kept image and Cost per 100 kept images rows, then press Copy result or Reset.",
  ],
  intro:
    "This calculator estimates the total cost of an AI image generation run: billed images × price per image, where billed images include a retry allowance for generations you discard. It ships with OpenAI's published per-image prices — DALL·E 3 from $0.040 (standard 1024×1024) to $0.120 (HD 1792×1024), DALL·E 2 from $0.016, and GPT-image-1's published per-image approximations — plus a custom rate for any other service. It is built for designers, marketers and developers budgeting image batches before running them.",
  useCases: [
    "A marketer costing 25 product-shot prompts at 4 variants each on DALL·E 3 HD before pitching the campaign budget",
    "A developer comparing standard versus HD quality cost for the same 500-image workload",
    "An indie game artist converting a credit-pack price into an effective per-image rate and projecting spend with a 30% reroll rate",
  ],
  benefits: [
    ["Published prices built in", "DALL·E 2, DALL·E 3 and GPT-image-1 per-image rates by resolution and quality tier, straight from OpenAI's pricing page."],
    ["Retry-aware totals", "A retry percentage adds the throwaway generations everyone actually pays for, so the estimate matches the real bill."],
    ["True cost per keeper", "Shows cost per kept image and per 100 keepers — the number that matters when comparing tools."],
  ],
  faqs: [
    [
      "How much does it cost to generate an image with DALL·E 3?",
      "$0.040 per standard-quality 1024×1024 image via the OpenAI API, rising to $0.080 for standard wide formats (1024×1792 or 1792×1024) or HD square, and $0.120 for HD wide. A hundred standard square images therefore cost about $4 before retries.",
    ],
    [
      "How much does GPT-image-1 cost per image?",
      "GPT-image-1 is billed by token rather than per image, but OpenAI publishes per-image approximations of roughly $0.011 for low quality, $0.042 for medium and $0.167 for high quality at 1024×1024. Exact cost varies with the prompt and output, which is why this tool marks those presets as approximate.",
    ],
    [
      "Why should I budget for retries when generating AI images?",
      "Because in practice a meaningful share of generations are discarded for wrong composition, artifacts or off-brief results, and every one of them is billed. A 20% retry allowance — one reroll per five planned images — is a conservative starting point; heavy iteration workflows often run 50% or more, which this calculator lets you model up to 500%.",
    ],
    [
      "How do I work out a per-image cost for credit-based image generators?",
      "Divide the pack price by the number of images one pack actually yields at your settings, then enter that as the custom price. For example, a $10 pack that generates 400 images at your chosen resolution works out to $0.025 per image; higher resolutions or extra steps usually consume more credits per image, so recompute per configuration.",
    ],
  ],
};

export default seo;
