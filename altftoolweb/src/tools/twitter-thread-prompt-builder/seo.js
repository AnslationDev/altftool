const seo = {
  title: "Twitter/X Thread Prompt Builder: 280-Char Math",
  metaDescription:
    "Builds an AI prompt for a numbered X thread on the real 280-character budget per post — minus numbering overhead and 23 characters for a t.co link.",
  steps: [
    "Describe the thread in \"What the thread teaches or argues\", set \"Target reader\", \"Number of posts\" (3–25), one of five \"Hook style\" patterns and a \"CTA for the final post\".",
    "Tick \"Final post includes a link\" to subtract the flat 23-character t.co cost — the plan shows numbering overhead and the content budget per post out of 280 characters.",
    "Copy the finished drafting prompt from \"Generated prompt\" with \"Copy prompt\".",
  ],
  intro:
    "The Twitter Thread Prompt Builder computes the real per-post character budget for a numbered X thread — the 280-character standard limit minus the 'n/total' numbering overhead, minus the flat 23 characters t.co charges for any link — and writes an AI drafting prompt around it. Choose the post count, one of five hook styles and a single CTA, and the prompt enforces one idea per post with each post quotable on its own.",
  useCases: [
    "A founder planning a 9-post thread on pricing mistakes gets a 276-character content budget per post and a numbered-list hook that states the count and stakes up front.",
    "A developer advocate linking to documentation in the final post sees the budget drop by exactly 23 characters for the t.co-wrapped link before drafting.",
    "A ghostwriter standardises thread briefs so every draft arrives numbered, one idea per post, with [fact needed] markers instead of invented statistics.",
  ],
  benefits: [
    [
      "Real character maths",
      "Numbering overhead is computed from the actual digit width — a 9-post thread loses 4 characters per post, a 12-post thread loses 6.",
    ],
    [
      "Five hook patterns",
      "Payoff promise, contrarian, numbered list, story and question hooks each swap a different opening instruction into the prompt.",
    ],
    [
      "Completion-aware length",
      "The tool warns beyond 15 posts, where thread completion falls off steeply, and refuses threads under 3 posts — those should be single posts.",
    ],
  ],
  faqs: [
    [
      "What is the character limit for a tweet on X?",
      "280 characters for standard (non-premium) accounts, a limit in place since November 2017 when it doubled from 140. X Premium subscribers can write much longer posts, but this tool budgets to 280 so the thread works from any account.",
    ],
    [
      "How many characters does a link use on Twitter/X?",
      "Every link counts as a flat 23 characters, regardless of its real length, because X wraps all URLs with its t.co shortener. When you tick the link option, this tool subtracts exactly 23 characters from the final post's budget.",
    ],
    [
      "How many tweets should a thread be?",
      "Between 3 and about 15 posts is the workable range: below 3 the content belongs in a single post, and reader completion falls off steeply on longer threads. This tool accepts up to 25 posts but warns once you pass 15.",
    ],
    [
      "How do you write a good hook for a Twitter thread?",
      "Make the first post work standing alone: promise a concrete payoff, state a number, or take a defensible contrarian position — and never open with 'a thread 🧵'. The generated prompt includes one of five hook directives and bans thread-announcement filler outright.",
    ],
  ],
};

export default seo;
