const seo = {
  intro:
    "Podcast Episode Title Generator writes candidate titles from eight editorial patterns — keyword-first, guest-led, how-to, numbered, contrarian and others — and scores each on the things that decide whether anyone finds the episode. Scoring covers character count against the roughly 60-character search-result cut and the 100-character YouTube cap, how early the keyword appears, and whether the title still makes sense after the roughly 40 characters a phone episode list shows. It is for hosts and producers who need a title that works in a directory search, not just in the edit notes.",
  useCases: [
    "Rewrite a vague working title such as \"Chat with Ana\" into something a stranger could find.",
    "Decide between a guest-led title and a topic-led one before publishing an interview episode.",
    "Check that the keyword survives the truncation in the Apple Podcasts episode list on a phone.",
    "Produce five title options for a co-host to choose from without a brainstorming call.",
  ],
  benefits: [
    ["Scored against real limits", "Uses the published YouTube 100-character cap and the practical 60-character search cut."],
    ["Front-loading checked", "Tells you the exact character position of your keyword, not just whether it is present."],
    ["Eight patterns, one input set", "Fill in the topic once and compare structures side by side."],
  ],
  faqs: [
    [
      "How long should a podcast episode title be?",
      "Aim for under 60 characters, and put the distinguishing words in the first 40. Phone episode lists truncate at roughly 40 characters and search results at about 60, so a long title is not wrong — it just stops being read.",
    ],
    [
      "Should the episode number go in the podcast title?",
      "No. Apple Podcasts has a dedicated <itunes:episode> tag and a separate <itunes:title> for the title itself, so putting \"Ep. 42\" in the title duplicates data the app already has and eats characters listeners could be reading instead.",
    ],
    [
      "Do podcast titles affect search rankings?",
      "They affect discovery inside podcast apps, where search is mostly matched against the title, show name and description. A title that names the topic in plain words tends to be found more often than a clever one that names nothing.",
    ],
    [
      "Should podcast titles use title case or sentence case?",
      "Either is defensible, but sentence case reads as calmer in a dense episode list and is easier to keep consistent across a long back catalogue. Whichever you pick, apply it to every episode — mixed capitalisation is the thing listeners actually notice.",
    ],
  ],
};

export default seo;
