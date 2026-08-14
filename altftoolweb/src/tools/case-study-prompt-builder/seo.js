const seo = {
  title: "Case Study AI Prompt Builder with STAR Framework",
  metaDescription:
    "Turn your problem, approach and measurable results into a case study prompt on Problem-Solution-Result, STAR or Challenge-Solution-Impact.",
  steps: [
    "Fill \"The problem (required)\", \"The approach / solution (required)\" and \"Measurable results (required)\", plus Client name, Industry and \"Key metrics to quote verbatim (optional)\".",
    "Choose a Framework — \"Problem – Solution – Result\", \"STAR (Situation, Task, Action, Result)\" or \"Challenge – Solution – Impact\" — then a Case study length of Brief (one-pager), Standard or Deep dive, a Tone and an Audience, and tick \"Anonymise the client\" if the name cannot be used.",
    "The Generated prompt is assembled below with \"Estimated prompt tokens\" at roughly 4 characters per token; \"Copy prompt\" puts it on the clipboard to paste into your AI assistant.",
  ],
  intro:
    "The Case Study Prompt Builder assembles a complete, structured AI prompt for writing a business case study from the three facts every case study needs: the problem, the approach and the measurable result. It structures the prompt around a recognised framework — Problem–Solution–Result, STAR (Situation, Task, Action, Result) or Challenge–Solution–Impact — and instructs the AI to use only the facts you supply, so nothing gets invented. It is built for marketers, founders and consultants who have the raw wins but not the time to brief a writer.",
  useCases: [
    "A SaaS marketer turning a customer's before/after metrics into a 1,000-word case study prompt for ChatGPT or Claude without the AI fabricating numbers",
    "A consultant preparing an anonymised Challenge–Solution–Impact case study where the client cannot be named",
    "A founder drafting a crisp one-pager for a sales deck using the STAR framework and an executive, numbers-first tone",
  ],
  benefits: [
    ["Three proven frameworks", "Choose Problem–Solution–Result, STAR or Challenge–Solution–Impact, each with a ready-made section outline."],
    ["Anti-hallucination rules built in", "The prompt tells the AI to use only your source facts and to quote key metrics verbatim."],
    ["Token estimate included", "See prompt length in words, characters and estimated tokens (~4 characters per token) before you paste it."],
  ],
  faqs: [
    [
      "What structure should a business case study follow?",
      "The most common structure is Problem–Solution–Result: client background, the problem and its business cost, the approach step by step, then quantified results. Two well-known alternatives are STAR (Situation, Task, Action, Result), popular in consulting and interviewing, and Challenge–Solution–Impact, common in B2B marketing decks. This builder outputs a section-by-section outline for whichever you pick.",
    ],
    [
      "How do I stop AI from making up numbers in a case study?",
      "Put every real metric in the prompt and explicitly instruct the model to use only those facts. The prompts generated here include a rule that every results claim must lead with a concrete number from your source facts, and that outcomes without numbers must be described qualitatively rather than invented. Always verify names and figures in the draft before publishing.",
    ],
    [
      "How long should a case study be?",
      "Published guidance across B2B content marketing generally puts case studies at roughly 500 to 1,500 words. This builder offers three targets — a brief one-pager around 500 words, a standard piece around 1,000 words, and a deep dive around 1,800 words for the most detail-heavy write-ups — chosen separately from who the case study is written for, so you can pair any length with any audience.",
    ],
    [
      "Can I write a case study without naming the client?",
      "Yes. Enable the anonymise option and the prompt instructs the AI to use a descriptive stand-in such as “a mid-size logistics company” and never to invent a real-sounding company name. This is standard practice when an NDA or client policy prevents attribution.",
    ],
  ],
};

export default seo;
