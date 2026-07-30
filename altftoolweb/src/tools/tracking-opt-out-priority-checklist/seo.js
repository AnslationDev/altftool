const seo = {
  intro:
    "Tracking Opt-Out Priority Checklist scores each available opt-out by how much tracking it actually removes divided by the minutes it takes, then fills the time you have with the highest-value ones first. It filters the list to the devices and accounts you genuinely use, flags which settings survive a cookie clear and which have to be redone, and calls out the opt-outs that no longer do anything. The result is an ordered list you can work through in one sitting rather than a wall of advice.",
  useCases: [
    "Spend a focused twenty minutes and get the largest possible reduction in ad tracking, in the right order.",
    "Work out whether the industry opt-out pages are worth the effort compared with a device-level advertising ID deletion.",
    "Set up a new phone and account in a way that avoids building an advertising profile from day one.",
    "Give a family member a short, ranked list instead of telling them to change every privacy setting they own.",
  ],
  benefits: [
    ["Ranked by benefit per minute", "The two-minute settings that block the most tracking come before the hour-long ones."],
    ["Filtered to your devices", "Only the opt-outs that exist on the platforms and accounts you tick are shown."],
    ["Honest about what is useless", "Opt-outs that are stored as cookies or that nobody honours are separated out instead of padding the list."],
  ],
  faqs: [
    [
      "What is the single most effective tracking opt-out?",
      "On mobile, deleting or blocking the advertising identifier. Switching off \"Allow Apps to Request to Track\" on iOS denies every app the IDFA at once, and Android 12 and later can delete the advertising ID outright so apps that request it receive zeros. Both take under two minutes and apply to every app on the device.",
    ],
    [
      "Does Do Not Track do anything?",
      "No. The header was only ever a request, sites were free to ignore it, and almost all did. Firefox removed the setting in version 135 because it added fingerprinting surface without protecting anyone. Global Privacy Control replaced it and is treated as a legally valid opt-out of the sale or sharing of personal data in California, Colorado and Connecticut.",
    ],
    [
      "Why do my ad opt-outs stop working after I clear cookies?",
      "Because the older industry opt-out pages record your choice in a cookie on your browser, so clearing cookies deletes the opt-out along with everything else. Device-level and account-level settings, such as the advertising ID switch or your Google ad settings, are stored elsewhere and survive a browser clean-up.",
    ],
    [
      "Are data broker removal requests worth the time?",
      "They remove real exposure — home address, relatives and phone numbers on people-search sites — but they are the most expensive item on the list, often several hours, and brokers commonly re-list the same records within six months. Do the fast device and account opt-outs first, then treat broker removals as a recurring task rather than a one-off. Rights of erasure differ by jurisdiction; check your own regulator's guidance.",
    ],
  ],
};

export default seo;
