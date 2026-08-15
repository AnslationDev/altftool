const seo = {
  title: "AI Cost Per Conversation Calculator",
  metaDescription:
    "Models the resent transcript that makes input tokens grow quadratically, adds prompt-cache rates and expected human escalation cost.",
  steps: [
    "Enter Assistant replies per conversation, System prompt + retrieved context tokens, Tokens in one user message and Tokens in one assistant reply.",
    "Add Input price per 1M tokens, Cached input price per 1M tokens, Input tokens served from cache (%), and Conversations escalated to a human (%) with Agent minutes on an escalated conversation.",
    "Read \"All-in cost per conversation\" split into model cost plus expected escalation, then press Copy result.",
  ],
  intro:
    "The Cost Per Conversation Calculator prices a full multi-turn AI conversation, including the part most estimates miss: because chat APIs are stateless, every turn resends the system prompt and the transcript so far, so total input tokens grow as n*s + n*u + (u+a)*n(n-1)/2 rather than linearly with turns. It applies prompt-cache pricing to whatever share of input is cached, adds the expected cost of human escalation, and compares the all-in figure with handling the same conversation entirely by hand. Support, sales and product teams use it to set a defensible cost-per-contact number before committing to volume.",
  useCases: [
    "Price a support deflection business case before rolling an assistant out to the full queue.",
    "See how much of your input bill is resent transcript, and whether trimming history or summarising is worth building.",
    "Test whether prompt caching pays for the engineering work at your conversation length.",
    "Compare a chatty six-turn assistant against a tighter three-turn flow on cost per contact.",
  ],
  benefits: [
    ["Correct token maths", "Models the quadratic growth of resent context instead of multiplying turns by tokens."],
    ["Escalation included", "Adds the expected human cost, which usually dwarfs the model cost at realistic escalation rates."],
    ["Cache-aware", "Splits input between fresh and cached rates so the saving shows up in the per-conversation figure."],
  ],
  faqs: [
    [
      "How do you calculate the cost of an AI conversation?",
      "Add the input and output token costs for every turn, remembering that each turn resends the system prompt plus the earlier transcript. For six turns with an 800-token system prompt, 120-token user messages and 260-token replies that is 11,220 input and 1,560 output tokens — at 3 and 15 per million, about 0.057 per conversation.",
    ],
    [
      "Why do longer AI conversations cost more than expected?",
      "Because the transcript is resent on every turn, input tokens grow with the square of the turn count, not linearly. In the six-turn example above, 5,700 of the 11,220 input tokens — 51% of the input bill — are history being re-read, which is why summarising or truncating older turns is one of the highest-leverage cost fixes.",
    ],
    [
      "Does prompt caching actually reduce cost per conversation?",
      "Yes, where the repeated prefix is large. Caching applies a lower rate to the unchanged portion of the prompt, so a long fixed system prompt and retrieved context benefit most; short prompts with highly variable content see little effect because there is nothing stable to cache.",
    ],
    [
      "Is AI cheaper than a human agent per conversation?",
      "On the model cost alone, usually by a wide margin — cents against the cost of several agent minutes. The economics turn on the escalation rate: at 20% escalation and seven agent minutes at 24 an hour, the expected human cost of 0.56 is roughly ten times the model cost, so reducing escalations matters far more than optimising prompts.",
    ],
  ],
};

export default seo;
