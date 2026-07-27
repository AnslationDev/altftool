const seo = {
  intro:
    "Podcast Show Notes Formatter turns the rough lines you type during an edit into publishable show notes: timestamps are parsed from m:ss or h:mm:ss, sorted and re-rendered consistently, URLs are lifted into a labelled links list, and the remaining bullets become the episode summary section. The chapter list is checked against YouTube's published requirements — the first timestamp must be 00:00, there must be at least three, and each chapter must run for at least 10 seconds — and the finished text is measured against the 4,000-character Apple Podcasts and Spotify limits and the 5,000-character YouTube limit. Output is available as Markdown, plain text, a YouTube description and Podcasting 2.0 chapters JSON.",
  useCases: [
    "Turn timestamps jotted down during an edit into a description YouTube will convert into clickable chapters.",
    "Publish the same episode to Apple Podcasts, Spotify and YouTube without rewriting the notes three times.",
    "Generate a Podcasting 2.0 chapters JSON file for players that support chapter navigation.",
    "Check a long sponsor-heavy description before it silently exceeds the 4,000-character Apple limit.",
  ],
  benefits: [
    ["Platform rules, checked", "Flags the exact reason YouTube would refuse to build chapters from your description."],
    ["One paste, four outputs", "Markdown, plain text, a YouTube description and chapters JSON from the same notes."],
    ["Timestamps normalised", "Mixed m:ss and h:mm:ss input is parsed, sorted and re-rendered in one consistent format."],
  ],
  faqs: [
    [
      "How do I add chapters to a podcast on YouTube?",
      "Put timestamps in the video description with the first one at 00:00, list at least three in ascending order, and make every chapter at least 10 seconds long. YouTube then converts them into clickable chapters automatically — if any of those three conditions fails, it silently leaves them as plain text.",
    ],
    [
      "How long can a podcast episode description be?",
      "Apple Podcasts and Spotify both cap an episode description at 4,000 characters, and a YouTube video description at 5,000. Front-load the useful text: most apps only show the first two or three lines before a \"more\" link.",
    ],
    [
      "What should show notes include?",
      "An episode summary, timestamped chapters, guest names with where to find them, and every link or resource mentioned. Chapters and links are what listeners actually come back to the page for, and they give search engines something concrete to index.",
    ],
    [
      "What is the Podcasting 2.0 chapters format?",
      "It is a JSON file, referenced from the RSS feed, holding a version string and an array of chapter objects each with a startTime in seconds and a title. Supporting apps use it to draw a chapter list without the host having to duplicate timestamps in the description.",
    ],
  ],
};

export default seo;
