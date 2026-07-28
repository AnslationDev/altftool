const seo = {
  title: "Username Generator — Free Random & Leet Usernames",
  h1: "Username Generator",
  metaDescription:
    "Free username generator — type a keyword and get 5 instant username ideas in Normal, Numbers, Underscore or Leet style. Runs in your browser, no signup.",
  intro:
    "The Username Generator turns a keyword you type into five handle ideas at once. Each result appends a three-character suffix drawn with JavaScript's Math.random() from a 36-character a–z0–9 alphabet, which gives 46,656 possible endings for the same base word. Four styles are available: Normal (keyword + random suffix), Numbers (keyword + an integer from 0 to 998), Underscores (keyword_suffix), and Leet, which substitutes a→4, e→3, i→1, o→0 and s→5 in your keyword before adding the suffix. It is a client-side React component with no API call, so the keyword you type never leaves your browser.",
  useCases: [
    "Build a gamertag, Discord tag or Twitch handle from your name or a favourite word",
    "Find a spare Instagram, X, Reddit or YouTube handle when the plain keyword is already taken",
    "Create throwaway handles for test accounts, demo data or QA fixtures",
  ],
  benefits: [
    [
      "Four predictable styles",
      "Normal, Numbers, Underscores and Leet each apply a different, well-defined transformation, so you can aim at a gaming-style handle or a clean, professional one.",
    ],
    [
      "Five fresh ideas per click",
      "Every press of Generate redraws the random suffix and returns five new combinations, with no cap on how many times you can run it.",
    ],
    [
      "One-click copy",
      "Each result has a copy button that writes the handle straight to your clipboard through the browser Clipboard API and shows a checkmark to confirm.",
    ],
    [
      "Runs entirely in your browser",
      "Generation is plain JavaScript on your own device — no account, no signup and no server request, so the keyword you type is never uploaded.",
    ],
  ],
  faqs: [
    [
      "How do I come up with a username that isn't taken?",
      "Add a short random suffix to a word you already like — that is exactly what this generator does. It appends three random characters (a–z, 0–9) or a number up to 998 to your keyword, producing 46,656 or 999 variants of the same base name. The tool does not check availability, so paste a result into the platform's signup field to confirm the handle is free.",
    ],
    [
      "Does this username generator check if a name is available on Instagram or Discord?",
      "No. It generates ideas locally in your browser and has no connection to any platform's account database, so availability has to be checked on the site itself. Generate a handful of variants and test them in order.",
    ],
    [
      "What does the Leet style actually do?",
      "It swaps five letters for lookalike digits before adding the random suffix: a→4, e→3, i→1, o→0 and s→5. So \"shadow\" becomes \"5h4d0w\" plus three random characters, for example 5h4d0wk2p. The match is case-insensitive, and any letter outside that map is left exactly as you typed it.",
    ],
    [
      "How many usernames does it generate at once?",
      "Five per click. Press Generate Usernames again for another five — there is no daily limit, no queue and no signup, and each run draws a new random suffix.",
    ],
    [
      "Is the Username Generator free to use?",
      "Yes — free, with no account and no usage limit. The whole generator is a client-side React component, so there is no API cost behind it and nothing you type is sent anywhere.",
    ],
    [
      "Do I have to enter a keyword?",
      "Yes. The generator needs a non-empty keyword: if the field is blank or contains only spaces, it shows a \"Please enter a keyword\" message and produces nothing. Your name, a hobby word, a game title or a brand term all work as the base.",
    ],
    [
      "Why do all my results look similar?",
      "Because every result keeps the keyword you entered and only the ending changes. Switch style or shorten the keyword for a bigger shift — Leet, for instance, rewrites the word itself rather than just the tail. Numbers style draws from only 999 values, so an occasional repeat inside a batch is possible; the three-character styles have 46,656 endings and effectively never collide.",
    ],
    [
      "Can I use these usernames on gaming, social and streaming platforms?",
      "Yes, anywhere a handle is allowed. Check the signup field's own rules first, since platforms differ on maximum length and on which punctuation they accept — the Underscores style adds an underscore character that a few services disallow, while Normal, Numbers and Leet output only letters and digits.",
    ],
  ],
  steps: [
    "Type a keyword into the Keyword field — your name, a hobby, a game or a brand word.",
    "Pick a style (Normal, Numbers, Underscores or Leet) and click Generate Usernames.",
    "Five ideas appear on the right; click the copy icon beside any one to copy it to your clipboard, or generate again for a new set.",
  ],
};

export default seo;
