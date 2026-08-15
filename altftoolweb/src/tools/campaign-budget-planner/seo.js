const seo = {
  title: "Campaign Budget Planner: Channel CPA, ROAS, 30",
  metaDescription:
    "Split a budget across six channels, each with its own CPC and conversion rate, for per-channel and blended CPA, ROAS from your LTV, and a 30-day plan.",
  intro:
    "This planner splits a marketing budget across channels and projects what that split should buy: for each channel it divides budget by cost-per-click to get clicks, applies the conversion rate to get conversions, then rolls the lot up into a blended CPA (total spend ÷ total conversions) and a ROAS of projected revenue ÷ spend using your average customer LTV. It ships with six editable channels — paid search, paid social, influencer, email, SEO and content, and offline events — a target CPA you set, and a 30-day phase timeline with a task list. Channels whose projected CPA lands under your target are highlighted, so the reallocation decision is visible rather than buried in a spreadsheet.",
  useCases: [
    "You have a fixed quarter budget and need to show a manager what shifting 20% from paid social to email does to blended CPA before the money is committed",
    "You are pitching a launch plan and need a defensible conversion and revenue projection per channel, not a flat \"we'll spend $10k on ads\"",
    "Two weeks into a campaign the actual CPCs came in higher than planned, and you want to re-enter the real numbers and see which channels are now above your target CPA",
  ],
  benefits: [
    ["Channel economics, not just a pie chart", "Each row carries its own CPC and conversion rate feeding the projection (CTR is tracked per channel as reference context), so the projection reflects that email converting at 4.5% behaves nothing like display traffic."],
    ["Target CPA is a live threshold", "Set the number once and every channel whose projected acquisition cost falls below it is highlighted, turning \"where should the next dollar go\" into a visible answer."],
    ["Objective presets that respect your total", "Applying the Lead Generation, Brand Awareness or Product Launch preset redistributes your existing total by percentage rather than replacing your budget with sample figures."],
  ],
  faqs: [
    [
      "How is CPA calculated here?",
      "Blended CPA is total budget divided by total projected conversions across all channels. Conversions per channel come from budget ÷ CPC × conversion rate, so a $3,000 paid search budget at $1.50 CPC and a 2.2% conversion rate projects 2,000 clicks and 44 conversions.",
    ],
    [
      "What ROAS should I be aiming for?",
      "There is no universal number — it depends on your margin — but the tool shows ROAS as projected revenue ÷ spend and converts it to ROI as (ROAS − 1) × 100, so a 3x ROAS displays as 200% ROI. Revenue is driven entirely by the average LTV you enter, which defaults to $120, so set that to your real figure before reading anything into the result.",
    ],
    [
      "What are the four campaign phases?",
      "The built-in 30-day timeline runs Creative Setup on days 1-10, Tracking Setup on days 11-15, Campaign Launch on days 16-25 and Scale & Optimize on days 26-30. Tasks are tagged to a phase, so moving the day slider shows what should be in flight at that point.",
    ],
    [
      "Does my plan get saved if I close the tab?",
      "Yes. Channel budgets and metrics, tasks, your target CPA, average LTV and the current timeline day are written to your browser's local storage, so the plan is still there when you return on the same browser. Nothing is sent to a server, which also means the plan does not follow you to another device.",
    ],
  ],
};

export default seo;
