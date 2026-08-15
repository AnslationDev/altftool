const seo = {
  title: "AI Subscription vs API Cost Calculator: Break-Even Point",
  metaDescription:
    "Finds the messages per month where a flat AI seat beats pay-per-token API rates for your prompt sizes, plus how much of the plan's value you actually use.",
  steps: [
    "Enter the plan price per seat per month, seat count and working days per month, or tap a plan preset chip to fill the price.",
    "Describe the API side: messages per seat per month, input and output tokens per message, USD rates per 1M tokens and an optional prompt cache hit rate.",
    "Read the break-even usage per seat in messages per month and per working day, the monthly and annual difference, and the plan-value-used bar; \"Copy result\" exports it.",
  ],
  intro:
    "A flat AI seat is a fixed monthly cost while an API bill rises linearly with tokens, so the two cross at exactly one usage level: break-even messages = plan price per seat ÷ cost per message, where cost per message = (input tokens × input rate + output tokens × output rate) ÷ 1,000,000. This calculator finds that crossover for your own prompt sizes and rates, and expresses current usage as a percentage of the plan's value so light users can see how much of a seat they are leaving on the table.",
  useCases: [
    "Decide whether ten occasional users are better served by API keys than by ten $20 seats.",
    "Show a heavy user that their usage is already past the break-even point and the seat is the cheaper option.",
    "Set an internal fair-use threshold in messages per day that matches the seat price you pay.",
  ],
  benefits: [
    ["One clear crossover", "Reports the exact messages per month and per working day where the two options meet."],
    ["Plan utilisation", "Shows what share of the subscription price your usage actually consumes."],
    ["Team-level view", "Multiplies both sides by seat count so the monthly and annual delta is concrete."],
  ],
  faqs: [
    [
      "Is the API cheaper than a $20 AI subscription?",
      "It depends entirely on volume. At 800 input and 400 output tokens per message priced at $3 and $15 per million, each message costs about $0.0084, so a $20 seat only pays for itself at roughly 2,380 messages a month — about 108 on each of 22 working days. Below that the API is cheaper.",
    ],
    [
      "How do I calculate the break-even point between a plan and pay-per-token?",
      "Divide the monthly plan price by the cost of one message. Cost per message is your input tokens times the input rate plus output tokens times the output rate, both per million. The answer is how many messages a month you would need before the flat plan wins.",
    ],
    [
      "Why does my API cost per message keep rising in a chat?",
      "Because a stateless API resends the whole transcript each turn, so later messages carry far more input tokens than the first. Use an average that reflects your real conversation length rather than the size of a single question, or the break-even estimate will be far too optimistic.",
    ],
    [
      "What does a subscription include that API access does not?",
      "Typically the client apps, file and image handling, memory or workspace features, generous rate limits, and support — none of which you get from a raw API key. Building the equivalent yourself is an engineering cost that no per-token comparison captures, so treat the token maths as a floor, not a full answer.",
    ],
  ],
};

export default seo;
