const seo = {
  title: "Press Release Prompt Builder with AP Dateline",
  metaDescription:
    "Build an AI press release prompt with a correct AP dateline and a 200-800 word budget split across lead, quotes and boilerplate. Runs in your browser.",
  steps: [
    "Enter the Organisation, Kind of announcement, The news in one sentence and Who it is aimed at.",
    "Set the dateline City, State or country and Release date — AP rules capitalise the city and spell out the eight states AP never abbreviates.",
    "Choose Target length in words (200-800) and Number of quotes, read the Body paragraph budget, then press Copy prompt.",
  ],
  intro:
    "The Press Release Prompt Builder turns your announcement into a complete AI drafting prompt with an Associated Press dateline, a word budget split across the inverted pyramid, and the AP style rules the model must obey. It builds the dateline from AP's own rules — city in capitals, AP state abbreviations rather than postal codes, the eight states AP never abbreviates spelled out in full, and AP month forms such as Sept. 3, 2026 — then divides your target length into lead, body, quotes and boilerplate. It is for PR managers, founders and comms teams who want a release a reporter will actually read rather than a page of adjectives.",
  useCases: [
    "Drafting a Series A funding release where the lead has to carry the amount, the round letter and the lead investor before anything else.",
    "Building an executive appointment release from a Texas dateline, where AP spells the state out in full instead of using TX.",
    "Cutting an 800-word draft back to the 300-500 word one-page convention by seeing exactly how many words the body has left after two quotes and the boilerplate.",
  ],
  benefits: [
    ["Correct AP dateline every time", "Applies AP's stand-alone city list, state abbreviations and month forms, so BOSTON needs no state but AKRON, Ohio does."],
    ["Word budgets, not guesses", "Splits your target length into a 25-40 word lead, roughly 35 words per quote and a 50-100 word boilerplate, then shows what the body has left."],
    ["Runs in your browser", "No account, no API key, and nothing you type about an unannounced deal is sent anywhere."],
  ],
  faqs: [
    [
      "How long should a press release be?",
      "300 to 500 words — the one-page convention wire services and newsrooms have used for decades, which reads in about 75 to 125 seconds at the average silent reading rate of 238 words per minute. This builder accepts 200 to 800 words and warns you when you fall outside the 300-500 range, because past 500 words a release stops being something a journalist skims.",
    ],
    [
      "What does an AP-style dateline look like?",
      "City in all capitals, then the state or country, then the AP-formatted date and an em dash: BOSTON, Sept. 3, 2026 — . AP lists around 30 US cities and 30 international ones that stand alone with no state or country after them, including Boston, Chicago, London and Tokyo, and it abbreviates states as Calif. or Sept.-style forms rather than using two-letter postal codes.",
    ],
    [
      "Which states does AP never abbreviate?",
      "Eight: Alaska, Hawaii, Idaho, Iowa, Maine, Ohio, Texas and Utah. They are always spelled out in datelines and in body text, so a release from Austin carries AUSTIN, Texas — never AUSTIN, TX. This tool applies that rule automatically and tells you which rule it used.",
    ],
    [
      "How many quotes should a press release have?",
      "One or two, of about 35 words each, from a named person with an exact title. A quote is often the only part of a release a reporter lifts verbatim, so it must add judgement, motive or context rather than restate a fact already in the body — and each quote you add takes roughly 35 words out of the body budget.",
    ],
  ],
};

export default seo;
