const seo = {
  intro:
    "This spelling checker runs your text through the LanguageTool proofreading engine set to en-US and returns each flagged span with the rule that caught it and up to five replacement suggestions you can apply with a click. It catches more than misspellings — LanguageTool's rules cover grammar, agreement, punctuation and commonly confused word pairs — which makes it useful for anyone doing a last read of an email, essay or product description. Apply a single suggestion, or use Apply All Suggestions to accept the top replacement for every issue at once.",
  useCases: [
    "You are about to send a job application and want a second pass over the cover letter for the typos your own eyes keep skipping.",
    "You wrote product copy in a hurry and need to know whether it is 'affect' or 'effect' in a sentence, with the rule explained rather than just corrected.",
    "A student is proofreading an essay and wants to see each issue listed separately with alternatives, instead of a rewritten paragraph they cannot learn from.",
  ],
  benefits: [
    [
      "Explains the issue, not just the fix",
      "Every flagged span comes with LanguageTool's own message describing which rule matched, so you can decide whether the suggestion is right for your sentence.",
    ],
    [
      "Up to five alternatives per issue",
      "Instead of forcing one correction, it lists as many as five replacements per match, each a single click to apply in place.",
    ],
    [
      "One-click bulk accept",
      "Apply All Suggestions inserts the first replacement for every match in one pass, adjusting offsets as it goes so later corrections still land in the right place.",
    ],
  ],
  faqs: [
    [
      "Is my text sent anywhere?",
      "Yes — checking sends the text in the box to LanguageTool's public API at api.languagetool.org for analysis, so this is not an offline tool. Do not paste confidential material, passwords or personal data you would not want leaving your device.",
    ],
    [
      "Which English does it check against?",
      "It checks against en-US, American English. Spellings such as colour, organise and centre will therefore be flagged as errors even though they are correct British forms — treat those particular matches as expected rather than as mistakes.",
    ],
    [
      "Does it check grammar as well as spelling?",
      "Yes. The check button runs LanguageTool's full rule set, which covers grammar, subject-verb agreement, punctuation, spacing and confusable word pairs alongside spelling, so a correctly spelled but wrongly used word can still be flagged.",
    ],
    [
      "Why did a long document fail to check?",
      "The free public LanguageTool endpoint enforces limits on request size and how often you can call it, so very long text or repeated rapid checks can be rejected. Split a long document into sections and check them one at a time, leaving a few seconds between runs.",
    ],
  ],
};

export default seo;
