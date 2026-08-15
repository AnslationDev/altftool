const seo = {
  title: "Summary Length Planner: Words at Any Compression",
  metaDescription:
    "Give a source word count and a compression target — 15% of 2,400 words is a 360-word brief — and get the plan, with the facts the summary must preserve.",
  steps: [
    "Enter Source words — 2,400 by default — and pick a Target summary: Executive brief, Bullet summary, Social caption or Study notes.",
    "Set Compression target % (15 by default) and list what has to survive in the Must preserve box, such as numbers, dates, decisions, owners.",
    "The Summary plan panel returns the recommended summary length in words for that ratio alongside the format, source length and must-preserve line; Copy output copies the plan and Reset restores the defaults.",
  ],
  intro:
    "The Summary Length Planner converts a source word count and a compression choice into a concrete target: how many words the summary should be, roughly how many sentences and paragraphs that is at 17 words per sentence, the token budget at the 100-tokens-to-75-words rule, and the reading time saved at 238 words per minute. Pick a preset — one-line takeaway, TL;DR, APA abstract of 150–250 words, executive summary at about 10% — or set your own ratio, and it also writes a prompt that pins an AI assistant to that exact length. It is for writers and editors who need to commission or brief a summary before anyone starts drafting.",
  useCases: [
    "You have a 12,000-word report and your board wants an executive summary — you need to tell the writer a word count, not just 'keep it short'.",
    "Briefing an AI to condense a transcript and getting a wandering three-paragraph answer, when you wanted a length-locked prompt with a target and a sentence count.",
    "Deciding whether a 40,000-word source can be honestly covered in 300 words, and seeing that a 0.75% ratio lands in the headline band where real information loss is expected.",
  ],
  benefits: [
    ["Turns a ratio into a shape", "You get sentence and paragraph estimates alongside the word count, so the target is something a writer can actually structure."],
    ["Says what survives at each compression", "Density bands mark 30% as a light edit, 15% as arguments without examples and 5% as claims only, so the brief matches what is achievable."],
    ["Outputs a prompt, not just numbers", "It builds a length-locked instruction with the target words, the compression factor and a ±10% tolerance ready to paste into any assistant."],
  ],
  faqs: [
    [
      "How long should a summary be compared to the original?",
      "The common conventions are about 10% of the source for an executive summary, 15% for a bullet digest and around 5% for a chapter or section summary. Fixed-length formats are different: an APA-style abstract is 150–250 words regardless of how long the paper is.",
    ],
    [
      "How many words is a token?",
      "About 0.75 words per token for English, the published rule of thumb that 100 tokens is roughly 75 words. The planner shows both the source and target token counts so you can size an API call or check a context limit.",
    ],
    [
      "What reading speed is the time-saved figure based on?",
      "238 words per minute, the mean silent reading rate for adult non-fiction from Brysbaert's 2019 meta-analysis of 190 studies. You can change it anywhere between 80 and 1000 wpm if your audience reads faster or slower.",
    ],
    [
      "How many sentences will my target word count be?",
      "Divide by about 17 words per sentence, the midpoint of the 15–20 range plain-English style guides recommend, and group roughly three sentences per paragraph. A 200-word summary is therefore about 12 sentences across four short paragraphs.",
    ],
  ],
};

export default seo;
