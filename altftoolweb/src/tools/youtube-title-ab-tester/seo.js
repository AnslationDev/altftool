const seo = {
  title: "YouTube Title A/B Tester: Truncation Preview +",
  metaDescription:
    "Rank up to 12 title variants on YouTube's 100-character limit, where each clips at 40, 55 and 70 characters, keyword position and caps, scored out of 100.",
  steps: [
    "Type the Focus keyword, then put the drafts into 'Title variants, one per line (up to 12)', one title on each line.",
    "Every variant is scored out of 100: 30 points for fitting the mobile feed, 25 for the keyword inside the first 40 characters, and 15 each for a concrete number, no shouting, and length.",
    "Read the ranking with 'Best variant score', Average score and 'Spread between best and worst', plus each title clipped at Suggested / sidebar 40, Mobile home feed 55 and Desktop search results 70, then press Copy ranking.",
  ],
  intro:
    "This tester compares video title variants on the mechanical properties that decide whether a title is readable where it appears: total length against YouTube's 100-character limit, the point at which it clips in the sidebar, mobile feed and desktop search, whether the focus keyword survives inside the first 40 characters, and whether the title shouts. Each variant is scored out of 100 against a published five-part rubric, with every point traceable to a criterion. It measures structure, not click-through rate — that only a real test can tell you.",
  useCases: [
    "Check whether a 78-character title still makes sense after the mobile feed clips it around 55 characters.",
    "Decide between a short punchy title and a longer descriptive one by comparing what each shows in the suggested sidebar.",
    "Confirm the search phrase you are targeting appears early enough to survive truncation on every surface.",
    "Catch shouting and repeated punctuation in a draft before it goes live on the channel.",
  ],
  benefits: [
    ["Truncation preview", "See each title clipped at four different surface widths, not just one generic count."],
    ["Transparent rubric", "Thirty points for fitting the feed, twenty-five for keyword position, and so on — no hidden model."],
    ["Side-by-side ranking", "Up to twelve variants ranked with the spread between best and worst shown."],
  ],
  faqs: [
    [
      "What is the maximum length of a YouTube title?",
      "One hundred characters, including spaces. Anything longer is rejected when you publish. The practical limit is much lower, because most surfaces clip the title well before that point.",
    ],
    [
      "How many characters of a YouTube title are visible?",
      "It depends on the surface and device, but roughly 40 characters in the suggested sidebar, 55 in the mobile home feed and 70 in desktop search results. Treat those as working approximations — font, language and screen width all shift the real cut-off, which is why the important words belong first.",
    ],
    [
      "Does capitalising words improve click-through rate?",
      "There is no reliable evidence that full capitals help, and they cost readability and accessibility — screen readers may spell out capitalised words letter by letter. One capitalised word for emphasis is common; a title in all caps mostly signals low quality.",
    ],
    [
      "Can this tool tell me which title will get more views?",
      "No. It measures length, truncation, keyword position and tone, which are the things you can check before publishing. Actual performance depends on thumbnail, topic and audience, so run a genuine test in YouTube Studio to compare variants on real traffic.",
    ],
  ],
};

export default seo;
