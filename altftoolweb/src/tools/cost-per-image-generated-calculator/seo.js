const seo = {
  title: "AI Image Cost Calculator: Price per Usable Image",
  metaDescription:
    "Divide spend by keepers, not renders: acceptance rate, retouch passes, review time and fixed costs give the real cost per usable image and a batch budget.",
  steps: [
    "Enter 'Images generated (billed renders)', price per render, 'Acceptance rate (% usable)', extra passes per keeper and review seconds; pick USD, INR, EUR or GBP.",
    "Read 'Cost per usable image' with renders per keeper and the multiple of the sticker price.",
    "Enter 'Finished images needed' under Budget for a finished set to get the Projected budget, then click 'Copy result'.",
  ],
  intro:
    "Cost per usable image is the total spend on a generation run divided by the number of images good enough to ship, not the price of a single render. This calculator takes your render count, price per render, acceptance rate, retouch passes and human review time, then returns the real unit cost, the money lost on rejected renders and the budget for a target number of finished images. It is built for designers, marketers and product teams pricing AI image work before they commit to a volume.",
  useCases: [
    "Price a 500-image product catalogue shoot when only one render in four passes brand review.",
    "Compare a cheaper model with a 15% hit rate against a pricier model that lands 60% of the time.",
    "Show a client why a 5-cent render becomes a 40-cent asset once culling and upscaling are counted.",
    "Decide whether spending an hour tightening the prompt pays for itself across the rest of the batch.",
  ],
  benefits: [
    ["Counts the rejects", "Acceptance rate drives the result, so wasted renders show up in the unit cost instead of hiding."],
    ["Includes human time", "Review seconds per render times your hourly cost is added, which is often larger than the API bill."],
    ["Projects a real budget", "Enter how many finished images you need and get the renders and spend required to get there."],
  ],
  faqs: [
    [
      "How do I calculate the cost per AI-generated image?",
      "Divide total spend by the number of usable images: cost per usable image = (renders x price per render + retouch cost + review cost + fixed cost) / (renders x acceptance rate). At a 25% acceptance rate you burn four renders per keeper, so a $0.04 render costs $0.16 per shipped image before any retouch or review time.",
    ],
    [
      "What is a realistic acceptance rate for AI image generation?",
      "It depends far more on the prompt than the model. A first-pass prompt often lands 10-25% of renders, while a settled prompt with a fixed style, seed and aspect ratio commonly reaches 50-80%. Track your own ratio over a few batches rather than assuming a number.",
    ],
    [
      "Should review time be counted in the cost per image?",
      "Yes, when a person is paid to cull the output. At 15 seconds per render and a $30 hourly cost, reviewing 100 renders adds $12.50 — more than three times the $4 API spend on those renders at $0.04 each. Leave the hourly rate at zero if the culling is genuinely free.",
    ],
    [
      "Does this include per-megapixel or per-step billing?",
      "No. It assumes a flat price per render, which is how most hosted image APIs and credit packs are sold. If your provider bills per megapixel, per diffusion step or per GPU second, work out your average cost of one render first and enter that figure.",
    ],
  ],
};

export default seo;
