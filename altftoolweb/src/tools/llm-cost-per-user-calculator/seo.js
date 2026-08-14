const seo = {
  title: "LLM Cost Per User: Chat History Grows Quadratically",
  metaDescription:
    "Cost per active user from sessions, tokens and per-million rates, including the resent transcript that grows prompt tokens with the square of turn count.",
  steps: [
    "Under Usage enter Monthly active users, Sessions per user per month, Messages per session, and the system, user and reply token counts.",
    "Set Input rate, Output rate, Cached input rate and Prompt cache hit rate, and leave “Resend the full conversation history on every turn” ticked for a stateless chat API.",
    "Read Cost per active user per month, alongside cost per session, cost per message and the gross margin against your price per user.",
  ],
  intro:
    "Cost per active user is the AI unit economic that decides whether a feature is priceable: sessions per user × cost per session, where a session costs (prompt tokens × input rate + output tokens × output rate) ÷ 1,000,000. The number most spreadsheets miss is conversation history — a stateless chat API resends the system prompt and the whole transcript on every turn, so prompt tokens grow with turn number and a session's total grows quadratically. For n turns with a system prompt of s tokens, user messages of u and replies of a, total prompt tokens are n·s + u·n(n+1)/2 + a·n(n−1)/2.",
  useCases: [
    "Check whether a $20/month AI plan survives contact with a power user who runs 40 long sessions a month.",
    "Compare full-history chat against summarised or trimmed context to see how much the quadratic term is costing.",
    "Set a fair usage cap by finding how many sessions one subscription actually pays for.",
  ],
  benefits: [
    ["History-aware", "Models the quadratic token growth of resent transcripts instead of assuming flat per-message cost."],
    ["Margin in one view", "Puts cost per user next to your seat price and reports gross margin and break-even sessions."],
    ["Cache modelling", "Applies a cache hit rate at the discounted cached-input rate, the way prompt caching actually bills."],
  ],
  faqs: [
    [
      "How do I calculate AI cost per user?",
      "Multiply cost per session by sessions per user per month. Cost per session is prompt tokens times the input rate plus output tokens times the output rate, both divided by one million. At $3 per million input and $15 per million output, a five-turn session with 8,750 prompt and 2,000 output tokens costs about $0.056.",
    ],
    [
      "Why does a longer conversation cost more than proportionally more?",
      "Because the whole transcript is resent on every turn. Turn 10 pays for turns 1 through 9 again, so prompt tokens grow linearly per turn and the session total grows with the square of the turn count. Doubling conversation length can roughly quadruple the input bill.",
    ],
    [
      "What is a typical AI cost per user per month?",
      "For a light assistant on a small model it is often a few cents; for heavy multi-turn use on a frontier model with large context it can exceed several dollars. The spread between the median and the 99th-percentile user is usually the bigger risk to margin than the average itself.",
    ],
    [
      "Does prompt caching reduce cost per user?",
      "Yes, when the same prefix — system prompt, tool definitions, retrieved documents — repeats across turns, because cache reads are billed far below fresh input tokens. The saving scales with your cache hit rate, so a 70% hit rate on the prompt side removes most of the input cost but none of the output cost.",
    ],
  ],
};

export default seo;
