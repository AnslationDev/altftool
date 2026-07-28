const seo = {
  title: "AI Domain Name Generator — Free Brandable Ideas",
  h1: "AI Domain Name Generator",
  metaDescription:
    "Free domain name generator: enter one keyword and get up to 20 ideas across 15 TLDs, built from real English dictionary synonyms. No signup required.",
  intro:
    "The AI Domain Generator turns a single keyword into domain ideas by looking that word up in the free public Dictionary API (api.dictionaryapi.dev), collecting every synonym listed under its definitions, then recombining keyword and synonym in both orders across 15 TLDs — .com, .net, .io, .in, .org, .app, .tech, .blog, .cloud, .space, .co.in, .fun, .co, .info and .ai. A Category filter appends fixed prefixes (get/try/build/launch for Startup, ai/ml/bot/neural for AI, best/top/pro for SEO), a Length filter keeps names at 3–6, 7–10 or 11+ characters, and the deduplicated list is capped at 20 names per run. Only your first keyword leaves the browser, for that dictionary lookup — the combining, filtering, copying and saving all happen on your device.",
  useCases: [
    "Brainstorm names for a new startup, product, blog or side project from one seed keyword.",
    "Find alternatives when your first-choice .com is gone, using synonym compounds across .io, .ai, .app and 12 other extensions.",
    "Build a shortlist: star the names you like, then open the selected one at a registrar to confirm availability.",
  ],
  benefits: [
    [
      "Real synonyms, not random letters",
      "Every combination is built from the synonym lists inside real English dictionary entries for your keyword, so the results read like words instead of generated noise.",
    ],
    [
      "15 TLDs by default, or only yours",
      "Each run spans .com, .net, .io, .in, .org, .app, .tech, .blog, .cloud, .space, .co.in, .fun, .co, .info and .ai. Type a comma-separated list such as com, io, ai in the TLD field to narrow it.",
    ],
    [
      "A shortlist that survives a reload",
      "Starred names are written to your browser's localStorage, so the shortlist is still there on your next visit. Copy All puts the whole result set on the clipboard, one domain per line.",
    ],
    [
      "Bulk mode for a blank page",
      "Generate Bulk Ideas runs the same generator over ten seed words — tech, app, cloud, web, smart, digital, next, pro, go, hub — for when you have no keyword yet.",
    ],
  ],
  faqs: [
    [
      "Is this domain name generator free?",
      "Yes. It is free to use with no account, signup or API key — you type a keyword and press Generate. There is no result limit per day and no paid tier for the generator.",
    ],
    [
      "Does it check if the domain name is available?",
      "No. This tool generates name ideas only — it performs no WHOIS or registry lookup, so nothing on the page tells you whether a name is taken. Select a result and click Open Registrar and it opens a Namecheap registration search for that exact domain in a new tab, which is where you confirm availability and price.",
    ],
    [
      "How many domain names does it generate at once?",
      "Up to 20 per keyword. The generator builds keyword, synonym+keyword and keyword+synonym combinations across your TLD list, removes duplicates, applies the length filter and returns the first 20. Generate Bulk Ideas runs that same process over 10 seed keywords, so it can return up to 200 names in one go.",
    ],
    [
      "Does it use AI or ChatGPT to write the names?",
      "Not in the generator you interact with. The names come from a dictionary synonym lookup plus rule-based recombination — no large language model is called when you press Generate, which is why results appear in about a second and cost nothing.",
    ],
    [
      "What domain extensions does it support?",
      "15 by default: .com, .net, .io, .in, .org, .app, .tech, .blog, .cloud, .space, .co.in, .fun, .co, .info and .ai. To use different ones, type them comma-separated in the TLD field (with or without the leading dot) and only those extensions are generated.",
    ],
    [
      "Can I generate short domain names only?",
      "Yes. Set Length to 3–6 and only names whose part before the dot is 3 to 6 characters are kept; 6–10 and 10+ work the same way. The filter applies to the name itself, not the extension, and re-filters the current results instantly without a new lookup.",
    ],
    [
      "Is my keyword sent to a server?",
      "One request leaves your browser per run: your first keyword goes to the public Dictionary API at api.dictionaryapi.dev to fetch synonyms. Nothing else is uploaded — results are assembled in your browser, and saved names are kept only in your own browser's localStorage.",
    ],
    [
      "Why did I get only a few results for my keyword?",
      "Because the dictionary had no entry for it. Invented words, brand names and misspellings return no synonyms, so the generator falls back to your keyword alone across the TLD list plus any category prefixes. Try a plain English seed word — 'travel' rather than 'travlr' — for a much wider list.",
    ],
  ],
  steps: [
    "Type a keyword and press Generate. Use a single word: only the first word of your input is used, lowercased with punctuation stripped.",
    "Narrow the list with the Category, Length and TLD controls — the visible results re-filter instantly, without another lookup.",
    "Star the names you want to keep, use Copy All to take the full list, or click a card and hit Open Registrar to check that name at Namecheap.",
  ],
};

export default seo;
