export const SITE = {
  name: "Imaginnex",
  fullName: "Imaginnex AI Prompt Studio",
  tagline: "Create Professional AI Prompts in Seconds",
  description:
    "The world's best AI prompt-engineering platform. Generate better AI image, video & story prompts with Prompt Intelligence.",
};

/** Every generated prompt's final destination. */
export const OPENART_URL = process.env.NEXT_PUBLIC_OPENART_URL ?? "https://openart.ai/";

/** Seconds to count down before auto-redirecting to OpenArt after a copy. */
export const REDIRECT_DELAY_SECONDS = 3;
