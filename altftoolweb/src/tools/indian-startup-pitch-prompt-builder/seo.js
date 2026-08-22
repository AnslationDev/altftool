const seo = {
  title: "Indian Startup Pitch Prompt Builder: Runway Maths",
  metaDescription:
    "Turns stage, sector, cash and burn into an AI prompt carrying your runway, implied pre- and post-money and a second-by-second slide budget.",
  steps: [
    "Set Startup name, What you do, in one sentence, Stage, Sector, Audience and Pitch length (minutes), then choose What to write — Full pitch deck, Monthly investor update, Demo day script or Cold intro email to a VC.",
    "Enter Cash in bank (INR), Net monthly burn (INR), Raise amount (INR) and Equity offered (%) so the runway and valuation arithmetic has your real figures.",
    "Current runway appears with Implied post-money, Implied pre-money and Runway after the round, a Slide-by-slide time budget in seconds, and the Generated prompt; Copy prompt takes it.",
  ],
  intro:
    "The Indian Startup Pitch Prompt Builder turns your stage, sector and round details into an AI prompt that already contains your runway, implied pre- and post-money valuation and a second-by-second slide budget. Runway is cash divided by net monthly burn; post-money is round size divided by the equity fraction sold, and pre-money is post-money minus the round. It is for founders raising from Indian angels, accelerators and early-stage funds who want a deck draft that cannot quietly invent traction numbers.",
  useCases: [
    "Turning a 6 crore seed raise at 15% into a 10-minute pitch deck outline with the implied 40 crore post-money stated on the ask slide.",
    "Writing a monthly investor update in the standard highlights / lowlights / metrics / asks format without rewriting the structure each month.",
    "Drafting a cold intro email to a VC that stays under 150 words and leads with the one number that actually matters at your stage.",
  ],
  benefits: [
    ["Numbers stay yours", "The prompt lists your figures verbatim and tells the model to mark anything missing as [FOUNDER TO FILL]."],
    ["Stage-aware questions", "Each stage carries what an investor is really testing and the evidence they expect to see."],
    ["Timing that fits the room", "Slide seconds are allocated by largest remainder, so a 3-minute or 10-minute pitch always adds up exactly."],
  ],
  faqs: [
    [
      "How do you calculate startup runway?",
      "Runway in months equals cash in bank divided by net monthly burn. With 1.2 crore in the bank and a 15 lakh monthly burn, that is 8 months. Founders usually start the next raise about 6 months before zero, because a priced round in India commonly takes 4 to 6 months to close.",
    ],
    [
      "How do I work out the valuation from my raise and dilution?",
      "Post-money valuation is the round size divided by the equity fraction sold, and pre-money is post-money minus the round. Raising 6 crore for 15% implies a 40 crore post-money and a 34 crore pre-money. This is arithmetic, not a view on what your company is worth.",
    ],
    [
      "How long should a startup pitch be?",
      "Most Indian accelerator and demo-day slots run 3 to 10 minutes, with a longer partner meeting following. Give traction the largest single share of speaking time - roughly 15% - because at seed and beyond, that is the slide the room is waiting for.",
    ],
    [
      "Can AI write my pitch deck for me?",
      "It can structure and phrase it, but it must never supply the numbers. Any traction, market size or customer name that did not come from you is a liability in a diligence conversation. Use generated copy as a draft, then have a CA or lawyer review anything that will appear in a term sheet discussion.",
    ],
  ],
};

export default seo;
