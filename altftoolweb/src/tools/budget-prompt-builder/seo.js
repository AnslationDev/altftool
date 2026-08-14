const seo = {
  title: "50/30/20 Budget Prompt Builder for AI Assistants",
  metaDescription:
    "Splits take-home pay 50/30/20, sizes a 3-6 month emergency fund and the monthly saving your goal needs, then writes an AI prompt with those rupee figures.",
  steps: [
    "Enter Monthly take-home income (INR), Current essential spending per month, Household size and your savings goal with its amount and Months to reach the goal.",
    "Pick a Budgeting style — 50/30/20, zero-based or envelope — and the tool computes the needs/wants/savings caps, the 3-6 month emergency-fund range and the goal's required monthly saving.",
    "Review the Generated prompt with those exact rupee figures baked in and press Copy prompt to paste it into your chat assistant.",
  ],
  intro:
    "The Budget Prompt Builder turns your monthly take-home pay into a 50/30/20 allocation — 50% needs, 30% wants, 20% savings and debt — and writes an AI budgeting prompt that carries those exact rupee figures, your household size and your goal deadline. It also sizes an emergency fund at three to six months of essential spending and works out the monthly saving your named goal requires. It suits anyone who wants a chat assistant to plan a household budget from real numbers instead of generic advice.",
  useCases: [
    "A family of four on Rs 80,000 take-home pay who want a category-by-category monthly plan rather than a lecture on saving more",
    "Someone saving Rs 2,00,000 in 18 months who needs to know whether that fits inside the 20% savings share or requires cuts elsewhere",
    "A first-time budgeter switching from the 50/30/20 split to zero-based or envelope budgeting and wanting the same numbers restated in the new format",
  ],
  benefits: [
    ["Real figures, not guesses", "The prompt carries your income, essentials and goal so the model never invents amounts."],
    ["Overspend flagged early", "A warning appears when essentials exceed the 50% needs cap or the goal outruns the 20% savings share."],
    ["Three budgeting methods", "Switch between 50/30/20, zero-based and envelope wording without re-entering anything."],
  ],
  faqs: [
    [
      "What is the 50/30/20 budget rule?",
      "It allocates after-tax income as 50% to needs, 30% to wants and 20% to savings and debt repayment. The rule comes from Elizabeth Warren and Amelia Warren Tyagi's 2005 book All Your Worth, and it works as a first-pass sanity check rather than a strict target.",
    ],
    [
      "How much should my emergency fund be?",
      "Three to six months of essential spending held in liquid savings is the common planning guideline. If your essentials are Rs 38,000 a month, that is Rs 1,14,000 to Rs 2,28,000; single-income households and variable earners usually aim at the upper end.",
    ],
    [
      "What if my essential expenses are more than 50% of my income?",
      "The tool flags it and the prompt asks the assistant to look for reductions in needs first, because trimming the 30% wants bucket cannot close a gap created inside needs. High rent in metro cities routinely pushes essentials past 50%, in which case the split becomes a direction of travel rather than a target for this year.",
    ],
    [
      "Why use a prompt builder instead of just asking the chatbot to budget for me?",
      "A bare request makes the model guess your income, prices and priorities, and the resulting plan is usually generic. Supplying the computed caps, the emergency fund range and the required monthly saving forces the answer to be arithmetic about your situation. This is informational only — consult a registered financial adviser before acting on debt or investment decisions.",
    ],
  ],
};

export default seo;
