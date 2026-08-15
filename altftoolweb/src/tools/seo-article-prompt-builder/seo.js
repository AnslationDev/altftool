const seo = {
  title: "SEO Article Prompt Builder: AI Brief with Word",
  metaDescription:
    "Turn a target query, search intent and heading plan into an AI writing prompt with per-section word budgets, title and meta limits and a ~1% query cap.",
  steps: [
    "Enter the 'Target search query' and 'Who is searching', pick a 'Search intent', then set 'Target length (words)', 'H2 sections', 'H3s per H2' and 'FAQ questions'.",
    "The builder budgets every section live — opening block, words per H2, FAQ block and conclusion — plus 'Max exact-query mentions' at a ~1% density cap.",
    "Read the 'Generated prompt' with the 60-character title-tag and 70-160 character meta-description limits written in, and click 'Copy prompt'.",
  ],
  intro:
    "The SEO Article Prompt Builder turns a target search query, its search intent and a chosen heading structure into a complete AI writing prompt with the word budget and on-page limits embedded. It is built for SEO writers and content teams, and encodes the working rules of the trade: a roughly 60-character title tag, a 70-160 character meta description, exactly one H1, an answer-first opening block, and an exact-query usage cap of about 1% of the word count to stay clear of keyword stuffing.",
  useCases: [
    "An SEO writer briefed on 'how to compress a pdf' picks informational intent, six H2s and a five-question FAQ, and gets a prompt that budgets every section by words.",
    "An agency standardises briefs so every article prompt carries the same title-tag, meta-description and query-density instructions instead of each writer improvising them.",
    "A niche-site owner planning a 2,000-word commercial comparison page gets like-for-like option sections, a shared comparison table instruction and a who-should-skip-it rule per option.",
  ],
  benefits: [
    [
      "Intent-matched structure",
      "Informational, commercial, transactional and navigational intents each swap in a different structural directive based on Broder's classic query taxonomy.",
    ],
    [
      "Stuffing guard built in",
      "The prompt caps exact-query mentions at about 1% of the word count, so drafts come back readable instead of keyword-crammed.",
    ],
    [
      "Per-heading word budget",
      "Every H2 and H3 carries its own allocation, so the draft lands near the briefed length instead of front-loading the introduction.",
    ],
  ],
  faqs: [
    [
      "How long should a title tag be for SEO?",
      "Keep title tags to roughly 60 characters. Google truncates titles at about 600 device pixels rather than a fixed character count, but ordinary mixed-case text fits within that width at around 60 characters, which is why this tool writes that limit into the prompt.",
    ],
    [
      "What keyword density should an SEO article have?",
      "Google publishes no density number — its spam policy simply prohibits keyword stuffing. A common practitioner ceiling is about 1% for the exact query, so this tool caps exact-query mentions at roughly one per 100 words (minimum 3) and tells the model to use natural variants elsewhere.",
    ],
    [
      "What are the four types of search intent?",
      "Informational (wants to understand), navigational (wants a specific page or thing), transactional (ready to act), and commercial investigation (comparing before buying). The first three come from Broder's 2002 query taxonomy; SEO practice added commercial investigation. This tool changes the article structure it asks for based on which one you pick.",
    ],
    [
      "Does a longer article rank better on Google?",
      "No — length is not a ranking factor; covering the query fully is what matters. This tool warns when your chosen structure leaves under about 100 words per H2, because sections that thin rarely cover a subtopic well, but it never pads length for its own sake.",
    ],
  ],
};

export default seo;
