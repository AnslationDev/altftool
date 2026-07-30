const seo = {
  intro:
    "This paraphrasing tool rewrites text by substituting synonyms from a built-in dictionary of 39 common words — each with four alternatives — and then applying a set of rules chosen by mode: Formal expands contractions, Simple swaps inflated words such as utilize and facilitate back to use and help, and Creative adds connectives between sentences. Everything runs as plain text rules in your browser, with no language model and no request to a server, so the same input can be rewritten again and again for different wording. It suits writers who want a fast first pass at varying repetitive phrasing, not a replacement for editing the sentence yourself.",
  useCases: [
    "A paragraph in your draft leans on \"important\" and \"very\" three times each, and you want alternative words suggested in place so you can pick which ones to keep.",
    "You are tightening a bureaucratic document and run it through Simple mode to turn utilize into use, facilitate into help and consequently into so.",
    "An email reads too casually for a client, so Formal mode expands can't, won't, don't, doesn't, isn't and aren't into their full forms before you send it.",
  ],
  benefits: [
    [
      "Four rewriting modes, not one",
      "Standard, Formal, Simple and Creative each apply a different rule set on top of the synonym pass, so the same paragraph can be pushed toward plain English or toward a more formal register.",
    ],
    [
      "Different result every run",
      "Each matched word draws at random from its four alternatives, so re-running the same text produces a fresh variation to choose from rather than the identical output.",
    ],
    [
      "Capitalisation and sentences preserved",
      "Substitutions keep the original word's leading capital and sentence punctuation is split out before rewriting, so the result does not need re-capitalising by hand.",
    ],
  ],
  faqs: [
    [
      "Does this use AI to paraphrase?",
      "No. It is a rule-based rewriter: a dictionary of 39 common words with four synonyms each, plus mode-specific find-and-replace rules. Nothing is sent to a language model or a server, which is why it responds instantly and works offline.",
    ],
    [
      "What is the difference between the four modes?",
      "Standard applies synonym substitution only. Formal additionally expands contractions such as can't to cannot. Simple replaces heavy words with plain ones — utilize becomes use, additionally becomes also. Creative inserts linking words like Furthermore between sentences.",
    ],
    [
      "Will it change the meaning of my text?",
      "It can. Synonyms are chosen by word match, not by context, so a word like \"turn\" may be replaced with \"rotate\" where that does not fit. Always read the output before using it and correct any substitution that shifts your meaning.",
    ],
    [
      "Can I use this to avoid plagiarism detection?",
      "No, and it should not be used that way. Swapping words leaves the underlying structure and ideas intact, which is still plagiarism if the source is not cited — paraphrasing properly means restating an idea in your own construction and attributing it.",
    ],
  ],
};

export default seo;
