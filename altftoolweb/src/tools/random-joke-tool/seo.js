const seo = {
  title: "Random Joke Generator: 48 Jokes, No Repeats",
  metaDescription:
    "48 clean setup-and-punchline jokes in six categories — dad, tech, animals, food, work, school — with no repeats until a pool empties. Works offline.",
  steps: [
    "Pick a Category — Dad jokes, Tech & programming, Animals, Food, Work & office or School & science — and set Punchline to 'Hide until I tap' for a delayed reveal.",
    "Press 'Another joke' to draw an unseen joke; 'Reveal the punchline' shows the hidden line when you are ready.",
    "Watch 'Unseen left' and Pool status count down the category's 8 jokes before it restarts; Copy grabs the setup and punchline.",
  ],
  intro:
    "The Random Joke Generator serves one clean, hand-picked joke at a time from a built-in set of 48 setup-and-punchline jokes across six categories: dad jokes, tech, animals, food, work and school. It runs entirely in your browser with no API call, so it works offline and never sends anything anywhere. Every pick is driven by a seed, and the tool tracks which jokes you have already seen so a category will not repeat until you have worked through all 8 of its jokes.",
  useCases: [
    "Open a stand-up meeting or a class with a one-line icebreaker that is safe for work and safe for children.",
    "Pull a tech joke for a developer newsletter or a release-note footer without hunting through a third-party API.",
    "Give a restless child something to read out at the dinner table with the punchline hidden until they tap it.",
  ],
  benefits: [
    ["No repeats until the pool empties", "Seen jokes are excluded, so an 8-joke category gives you 8 different jokes before it restarts."],
    ["Works with no connection", "The full set ships inside the page, so there is no joke API, no rate limit and no outage."],
    ["Punchline on demand", "Hide the punchline and reveal it with a tap, which is how a joke actually lands when read aloud."],
  ],
  faqs: [
    [
      "How many jokes does this generator have?",
      "48 jokes in total, split evenly at 8 per category across dad jokes, tech and programming, animals, food, work and office, and school and science. Choosing 'Any category' draws from all 48.",
    ],
    [
      "Will it show me the same joke twice?",
      "Not until you have seen every joke in the selected category. The tool keeps a list of jokes shown in this session and excludes them; once the pool is empty it restarts and tells you so in the pool status line.",
    ],
    [
      "Are these jokes safe for work and for kids?",
      "Yes. Every joke in the set is clean wordplay with no profanity, innuendo, or references to alcohol, politics or religion, which makes it usable in classrooms and in company standups.",
    ],
    [
      "Does the generator need an internet connection or an API key?",
      "No. The joke data is part of the page and the selection maths runs in your browser, so no request leaves your device and no key or sign-in is required.",
    ],
  ],
};

export default seo;
