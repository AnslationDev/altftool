const seo = {
  intro:
    "Logo & Slogan Generator turns a brand name plus a short description of your style, industry and audience into 5 to 7 concise, distinct taglines you can put under a logo. The request goes to a Gemini model briefed to answer as a branding specialist and return nothing but the list — no preamble, no explanation — so you get usable lines rather than an essay about your brand. It is built for founders, freelance designers and marketers who need a batch of directions to react to before committing to one. Generating a batch sends your brand details to AltFTool's own server, which produces the lines, so this tool needs a connection.",
  useCases: [
    "You are designing a logo lockup and need three or four candidate taglines of the right length to test under the wordmark before the client presentation.",
    "You have registered a business name but the tagline field on your website, invoices and Instagram bio is still empty, and you want options that match a 'premium, sustainable, friendly' positioning.",
    "You are rebranding and the old slogan no longer fits the audience, so you feed the new positioning statement in and use the results as a starting list for a naming workshop.",
  ],
  benefits: [
    [
      "Positioning in, not just a name",
      "The style and audience description is part of the prompt, so a slogan for a coffee shop for remote workers reads differently from one for a luxury roastery.",
    ],
    [
      "A batch you can compare",
      "Every run returns 5 to 7 distinct lines rather than one answer, which is how tagline selection actually works — you pick by contrast.",
    ],
    [
      "Clean list output",
      "Numbering, bullets and stray punctuation are stripped from the model's reply, so lines paste straight into a deck or a brief.",
    ],
  ],
  faqs: [
    [
      "How many slogans does it generate at once?",
      "Between 5 and 7 per run, and the display caps at 7. The model is instructed to return only a numbered list of concise slogans, so each run gives you a fresh comparable set rather than variations on one line.",
    ],
    [
      "Is there a limit on how much detail I can enter?",
      "Yes — the brand name is capped at 80 characters and the style or description at 500 characters. Requests are also rate limited to 8 generations per minute, so space out bulk brainstorming.",
    ],
    [
      "Can I trademark a slogan this produces?",
      "Possibly, but nothing here checks it. Generated lines are not screened against existing trademarks or in-use taglines, so run a clearance search and speak to a trademark attorney before you register or build a campaign around one.",
    ],
    [
      "Why do I get different slogans each time with the same input?",
      "The generation is non-deterministic, so repeated runs on identical input produce different lines by design. Use that to widen the option pool, and make the style description more specific — industry, tone, audience — when the results feel generic.",
    ],
  ],
  steps: [
    "Enter your Brand Name in the first field (placeholder \"e.g., Stellar Coffee Co.\", maximum 80 characters) and your positioning in the three-row Brand Style / Description box (placeholder \"e.g., Premium, sustainable, and friendly coffee shop for remote workers.\", maximum 500 characters).",
    "Click Generate Slogans. The button stays disabled until both fields have text and reads Generating... while the request runs; generations are rate limited to 8 per minute.",
    "The results card, headed \"Suggested Slogans for\" plus your brand name in capitals, lists the taglines as a numbered list of up to 7, with the model's own bullets and numbering stripped from each line. Press Clear to empty both fields and the results; a failed request shows the same card headed Generation Error.",
  ],
};

export default seo;
