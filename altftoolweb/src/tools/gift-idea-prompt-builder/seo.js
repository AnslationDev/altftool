const seo = {
  title: "AI Gift Idea Prompt Builder: Budget & Lead Time",
  metaDescription:
    "Build an AI gift-idea prompt that sticks to your real budget — tax and shipping reserve, per-person share, lead-time check and an under-3 safety flag.",
  steps: [
    "Fill in Who is it for?, Recipient age, Interests and Avoid, plus the Total budget, Currency, Recipients and Tax/shipping reserve % fields.",
    "Set the Today and Occasion date fields to compute lead time, pick the Occasion, and tick Preferred categories.",
    "Review the Per person, Main gift, Lead time and Prompt size cards above the generated prompt, then click Copy prompt to paste it into your AI chat.",
  ],
  intro:
    "The Gift Idea Prompt Builder divides a gift budget into a reserve for tax and shipping, a per-recipient share, and a split between the main gift and a small extra, then writes an AI prompt that keeps the suggestions inside those figures. Give it both dates and it also counts the whole days of lead time left and tells the model which delivery options are still realistic. If the recipient is under three, it adds the US CPSC small-parts rule to the prompt.",
  useCases: [
    "Split a 200 budget across four colleagues and get ideas that respect the 44 per person you actually have after shipping.",
    "Check whether there is still time for a personalised or made-to-order gift before the date.",
    "Get ideas for someone whose interests you know but whose taste you do not, without the usual generic candle suggestions.",
    "Brief an AI on what to avoid — repeat gifts, allergies, things they already own — so the list is usable first time.",
  ],
  benefits: [
    ["Budget the model cannot ignore", "The prompt states the per-person figure and forbids suggestions above it."],
    ["Lead time built in", "Whole days to the occasion map to a shipping tier, from 21+ days comfortable down to same-day."],
    ["Child-safety flag", "Under-3 recipients trigger the CPSC 16 CFR 1501 small-parts warning inside the prompt."],
  ],
  faqs: [
    [
      "How much should I spend on a gift?",
      "There is no fixed rule, so work backwards from what you can comfortably spend in total and divide it by the number of people. Hold back roughly 10-15% for sales tax and shipping first — that reserve is the reason so many gift budgets overrun.",
    ],
    [
      "How many days before a birthday should I order a gift?",
      "For a stocked item, 10 days is comfortable with standard shipping and 4 days is the point where you should switch to guaranteed express. Anything personalised, engraved or made to order usually needs three weeks or more, because the production time sits before the shipping time.",
    ],
    [
      "Are toys with small parts safe for toddlers?",
      "Under US CPSC rules (16 CFR Part 1501), a toy intended for children under three must not contain a small part that fits entirely inside the small-parts cylinder, roughly 3.2 cm long by 3.1 cm across. Always follow the age label on the specific product, and treat button batteries and high-powered magnets as hazards at any age.",
    ],
    [
      "Why does the AI need to know what the person dislikes?",
      "Negative constraints cut more bad suggestions than positive ones add good ones — 'no scented candles, already owns a Kindle' removes a whole class of default answers. The prompt passes those constraints through verbatim and asks the model to question you rather than guess when the brief is thin.",
    ],
  ],
};

export default seo;
