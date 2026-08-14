const seo = {
  title: "Email Thread Summarizer — Local, No-AI Extraction",
  metaDescription:
    "Paste up to 100,000 characters of email chain and get decisions, action items with owners and deadlines, and open questions — parsed locally, no upload.",
  steps: [
    "Paste your chain (up to 100,000 characters) into the \"Paste email thread\" box — From, Date and Subject headers improve results.",
    "Pick a Summary length of Brief, Standard or Detailed, which keep the top 3, 6 or 10 scored sentences alongside decisions, action items and questions.",
    "Click Copy for the analysis as Markdown, or download it as email-analysis.md or email-analysis.json.",
  ],
  intro:
    "The Email Thread Summarizer splits a pasted email chain into its individual messages, then extracts decisions, action items with owners and deadlines, unanswered questions and a ranked set of highlights using keyword patterns rather than a language model. It is for anyone who has been added to a 30-message thread and needs to know what was agreed and what is now theirs to do. Because every rule is a local regex, the same thread always produces the same summary, and the text never leaves the browser.",
  useCases: [
    "You were CC'd late on a long procurement chain and want the decisions and open questions pulled out before you reply, without reading forty messages upstream.",
    "A project thread ended with several 'can you' asks scattered across replies, and you need them listed with inferred owners and any stated deadline like 'by Friday EOD'.",
    "You are writing meeting notes from an email discussion and want a Markdown block with overview, decisions, action items and questions ready to paste into your doc.",
  ],
  benefits: [
    [
      "Understands thread structure",
      "It splits on From/To/Subject/Date headers, drops quoted lines starting with > and strips sign-offs like 'Best regards', so replies are not counted twice.",
    ],
    [
      "Owners and deadlines, not just sentences",
      "Each action item is matched to a participant named in the text, or to the sender for 'I will' and to Team for 'we will', with any date phrase captured separately.",
    ],
    [
      "Deterministic and offline",
      "No model call and no randomness — the same thread yields the same decisions, questions and highlights every time, and nothing is uploaded.",
    ],
  ],
  faqs: [
    [
      "How does it decide which sentences make the summary?",
      "Each sentence gets a score and the top ones are kept: +3 if it matches an action pattern, +3 for a decision pattern, +2 for a question, +2 for being the opening sentence of a message, +1 for words like because, however, deadline, budget, risk or priority, plus a small bonus for appearing later in the thread. Brief keeps the top 3, Standard 6 and Detailed 10.",
    ],
    [
      "How many action items and decisions will it pull out?",
      "Up to 12 action items, 10 decisions and 10 questions per thread, after near-duplicate sentences are collapsed. Action items are sentences containing cues such as please, need to, should, must, can you, could you, follow-up or due.",
    ],
    [
      "Does it send my email to a server or an AI service?",
      "No. Parsing, scoring and summarising all run in your browser with regular expressions and a scoring loop, so the thread is never transmitted. Copy and the Markdown and JSON downloads are generated locally too.",
    ],
    [
      "How reliable is the 'answered' status on open questions?",
      "Treat it as a prompt, not a verdict. A question is marked 'Possibly answered' only when a later message contains words like yes, no, confirmed, agreed, approved or will — the tool cannot tell whether that reply addressed the specific question, so check the original thread before acting on anything consequential.",
    ],
  ],
};

export default seo;
