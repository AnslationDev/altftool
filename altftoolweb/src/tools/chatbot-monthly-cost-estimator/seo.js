const seo = {
  title: "Chatbot Monthly Cost Estimator: Tokens vs Agents",
  metaDescription:
    "Estimate a support bot's monthly token bill from turns, system prompt and RAG context resent every turn, then set it against agent cost saved.",
  steps: [
    "Tap a preset such as Simple FAQ bot or RAG support agent, then set Conversations per month, Turns per conversation, System prompt tokens and Retrieved context tokens per turn.",
    "Enter Input rate and Output rate in USD per 1M tokens, the cached input rate and cache hit rate, then Deflection rate (%) and the fully loaded agent cost per contact.",
    "Read the Estimated monthly token bill and cost per conversation, plus Net monthly saving and the deflection needed to break even, then press Copy result.",
  ],
  intro:
    "A support chatbot's monthly bill is conversation volume × cost per conversation, and cost per conversation is driven by what gets resent on every single turn: the system prompt, the retrieved knowledge-base context, and the transcript so far. For n turns with system prompt s, retrieval r, user message u and reply a, total prompt tokens are n(s + r) + u·n(n+1)/2 + a·n(n−1)/2, and output tokens are n·a. This estimator applies that model, adds prompt-cache discounts and retrieval cost, then compares the result against the agent handling cost the bot deflects.",
  useCases: [
    "Budget a RAG support bot before launch, when you know average handle length but not the token bill.",
    "Show finance the deflection rate the bot has to hit before it pays for itself.",
    "Test whether shrinking retrieved context from 4,000 to 1,500 tokens per turn is worth the answer-quality trade-off.",
  ],
  benefits: [
    ["Per-turn reality", "Counts retrieval and system prompt on every turn, not once per conversation."],
    ["Deflection maths", "Reports net saving, ROI and the exact break-even containment rate."],
    ["Cache and retrieval", "Separate cached-input rate and a per-conversation retrieval cost line."],
  ],
  faqs: [
    [
      "How much does an AI chatbot cost per month?",
      "It is set by tokens, not by seats. A four-turn RAG conversation with an 800-token system prompt and 2,000 tokens of retrieved context runs roughly 13,000 prompt and 900 output tokens; at $1 per million input and $5 per million output that is under two cents a conversation, so 50,000 conversations cost a few hundred dollars.",
    ],
    [
      "Why is retrieved context so expensive in a RAG chatbot?",
      "Because it is injected fresh on every turn, not once. Four turns with 2,000 tokens of retrieved context means 8,000 prompt tokens of retrieval alone, which typically dwarfs the user's own words. Cutting chunk count or chunk size is usually the single biggest lever on the bill.",
    ],
    [
      "What deflection rate does a support bot need to break even?",
      "Divide the monthly bot cost by (conversations × fully loaded agent cost per contact). When a conversation costs under two cents to answer and a human contact costs several dollars, the break-even containment rate is often well under 1% — the business case usually rests on answer quality and escalation handling, not on token price.",
    ],
    [
      "Does prompt caching help a support chatbot?",
      "Yes, and more than in most workloads, because the system prompt and tool definitions are identical across every conversation. Cached input is billed far below fresh input, so a high cache hit rate on the static prefix removes most of that portion of the bill; freshly retrieved chunks and the growing transcript still bill at full rate.",
    ],
  ],
};

export default seo;
