const seo = {
  intro:
    "This planner works out how far an AI image credit pack actually goes: images per pack (pack credits ÷ credits per image, rounded down), the effective cost per image, how many weeks the pack lasts at your volume, and the packs you must buy per month. It is built for designers and marketers on credit-based services — Leonardo, Ideogram, Stability, Canva and similar — where the advertised credit count hides the real per-image economics behind resolution- and step-dependent consumption rates.",
  useCases: [
    "A freelance designer checking whether a 1,000-credit pack covers a month of client work at 50 images a week",
    "A marketing team comparing two services by converting each pack into an effective dollars-per-image figure",
    "A hobbyist deciding between resolutions after seeing how a higher credits-per-image rate shortens the pack's lifespan",
  ],
  benefits: [
    ["True per-image cost", "Divides the pack price by the images it really yields, not the advertised credit count."],
    ["Runway at your volume", "Shows the weeks and days one pack lasts at your planned weekly output."],
    ["Monthly budget line", "Projects packs needed and cost per month using an average 4.33 weeks per month, plus credits stranded per pack."],
  ],
  faqs: [
    [
      "How many images can I generate with a credit pack?",
      "Divide the pack's credits by the credits one image consumes at your settings and round down — a 1,000-credit pack at 4 credits per image yields 250 images. The consumption rate is the key variable: higher resolutions, more inference steps and premium models all draw more credits per generation, so the same pack can yield very different image counts.",
    ],
    [
      "How do I work out the real cost per AI image on a credit plan?",
      "Divide the pack price by the number of images the pack yields, not by the credit count. A $10 pack of 1,000 credits at 4 credits per image works out to $0.04 per image; if your settings consume 8 credits, the same pack delivers only 125 images at $0.08 each — double the effective price for the identical pack.",
    ],
    [
      "How long will my image generation credits last?",
      "Divide images per pack by your weekly volume: 250 images at 50 images a week lasts 5 weeks. This tool also projects the monthly requirement using the 52-weeks-per-year average of about 4.33 weeks per month, which is more accurate for budgeting than assuming 4 flat weeks.",
    ],
    [
      "Do unused AI credits expire?",
      "On many services, yes — subscription credits commonly reset at the end of each billing cycle, while separately purchased top-up packs sometimes roll over. Check your provider's terms before buying ahead, and note this tool's stranded-credits figure: credits left in a pack that cannot cover one more image at your consumption rate are effectively lost value.",
    ],
  ],
};

export default seo;
