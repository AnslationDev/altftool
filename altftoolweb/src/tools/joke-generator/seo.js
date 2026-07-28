const seo = {
  title: "Random Joke Generator — Free, 9 Joke Categories",
  h1: "Random Joke Generator",
  metaDescription:
    "Free random joke generator with 9 categories — programming, dad jokes, science, animals. Save favorites, copy, share or download as .txt. No signup.",
  intro:
    "The Joke Generator requests a random joke from the public Official Joke API (official-joke-api.appspot.com) directly from your browser, joins each setup and punchline into one line, and picks one at random with Math.random() while excluding the joke already on screen. If that request fails or comes back empty, the tool falls back to a dataset of 65 jokes across 9 categories bundled into the page itself, and the badge above the card switches from \"Live API\" to \"Local Dataset\" so you always know which source you are reading. Favorites are written to your browser's localStorage under the key altftool_joke_generator_favorites — they stay on your device and are never sent to a server.",
  useCases: [
    "Opening a standup, class, or team meeting with a quick programming or office one-liner.",
    "Collecting kid-friendly jokes from the Kids category for a lunchbox note, birthday card, or party game.",
    "Running Auto mode on a screen at an event or in a background tab so a fresh joke appears every five seconds.",
  ],
  benefits: [
    [
      "Nine categories, not one grab bag",
      "Filter to Programming, General, Dad Joke, Technology, Science, Animals, Office, Food, or Kids. Your choice is sent straight to the API path — lowercased with spaces turned into underscores, so \"Dad Joke\" requests dad_joke — and the same filter narrows the built-in dataset when the API is unavailable.",
    ],
    [
      "Never the same joke twice in a row",
      "Before choosing, the picker removes the currently displayed joke's ID from the pool, so pressing Generate actually changes the joke instead of repeating what you just read (the only exception is a pool holding a single joke).",
    ],
    [
      "Favorites that survive a refresh",
      "Hearted jokes are saved to localStorage, so they are still there on your next visit in the same browser. The Favorites panel lets you search them by text or category, copy one, delete one, or export all of them as a numbered favorite-jokes.txt.",
    ],
    [
      "Still works when the API is down",
      "65 jokes ship inside the page, so a blocked network, an ad blocker, or an API outage still returns a joke rather than an error screen — and the source badge tells you exactly what happened.",
    ],
  ],
  faqs: [
    [
      "Is this joke generator free?",
      "Yes — free, with no account, no signup, and nothing to install. Open the page, press Generate, and a joke appears. Live jokes come from a free public API, and the 65-joke fallback set is bundled into the page itself.",
    ],
    [
      "Where do the jokes come from?",
      "Live jokes are fetched by your browser from the Official Joke API at official-joke-api.appspot.com. If that request fails, is blocked, or returns nothing usable, the tool serves one of 65 jokes built into the page. The badge under the heading reads \"Live API\" or \"Local Dataset\" so the source is always visible.",
    ],
    [
      "Can I get only dad jokes or programming jokes?",
      "Yes. Tap a category chip: All, Programming, General, Dad Joke, Technology, Science, Animals, Office, Food, or Kids. Choosing one requests that category from the API, clears the search box, and generates immediately; if the API has nothing for it, jokes tagged with that category in the local dataset are used instead.",
    ],
    [
      "Are the jokes clean and safe for kids?",
      "The 65 built-in jokes are clean, and the Kids category holds simple one-liners written for children. Live results come from a third-party API and are not filtered or moderated by this tool, so read a joke yourself before reading it out to a classroom.",
    ],
    [
      "How do I save the jokes I like?",
      "Press the heart button on any joke. Favorites are stored in your browser's localStorage on your device — they are not uploaded, do not sync between devices, and are erased if you clear site data. Open the Favorites panel to search, copy, remove, or download every saved joke as favorite-jokes.txt.",
    ],
    [
      "Can I copy, share, or download a joke?",
      "All three. Copy places the joke on your clipboard wrapped in quotation marks. Share opens your device's native share sheet through the Web Share API and quietly falls back to copying when that API is unavailable. Download saves a plain-text file named joke-<category>.txt.",
    ],
    [
      "What does the Auto button do?",
      "Auto mode generates a new joke every 5 seconds until you press Pause. Prev steps back through the jokes you have already seen this session, and Next moves forward through that history or generates a new joke once you reach the end.",
    ],
    [
      "Does the search box search every joke?",
      "It searches the pool currently loaded — the API batch (at most the first 10 results) or the local jokes in the active category — and jumps to the first joke containing your text. Matching is case-insensitive and only starts once you have typed 2 characters. The Favorites panel has a separate search that covers both joke text and category.",
    ],
  ],
  steps: [
    "Pick a category chip — All, Programming, General, Dad Joke, Technology, Science, Animals, Office, Food, or Kids — or leave it on All for an unfiltered random pull.",
    "Press Generate for a new joke, or Auto to cycle a fresh one every 5 seconds; Prev and Next walk through the jokes you have already seen.",
    "Tap the heart to save a joke to your browser, then Copy, Share, or Download it as a .txt file — or export every favorite at once from the Favorites panel.",
  ],
};

export default seo;
