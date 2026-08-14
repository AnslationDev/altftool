const seo = {
  title: "Ad Topics Explained: Reset Checklist for 10 Platforms",
  steps: [
    "Tick the platforms you use under \"Where do your ad topics live?\" — each row is labelled Browser, Account or Device and says whether a full opt-out or mute-only is available.",
    "Set \"How often will you redo this? (days)\", or press the 30d, 90d, 180d or 365d preset, to see the minutes per round and hours per year.",
    "Work through Your reset checklist — the Go to path, the numbered steps, How long it lasts and The catch for each platform — then press Copy checklist.",
  ],
  intro:
    "Ad Topic Profile Explainer describes what an interest-based ad topic is — a label a platform infers about you so advertisers can buy an audience without buying your identity — and builds a per-platform reset checklist across ten browsers, accounts and devices. For each one it gives the settings area to open, the steps in order, how long the reset lasts, and the catch that most people miss. It also totals the time the routine costs at whatever interval you choose, because the profile rebuilds itself from ongoing activity.",
  useCases: [
    "Working out why an ad followed you across sites after a single search, and where the topic that caused it is stored.",
    "Doing a quarterly pass over Google, Meta, Amazon and Apple settings without hunting for each menu.",
    "Explaining to a family member why turning off personalisation did not reduce the number of ads they see.",
    "Checking which of your platforms allow a genuine opt-out and which only let you mute topics one by one.",
  ],
  benefits: [
    [
      "Covers browser, account and device",
      "Ad topics live in three separate places, and clearing one leaves the other two untouched.",
    ],
    [
      "Names the catch for each platform",
      "Every entry says what the setting does not cover, such as past activity that stays in place after opting out.",
    ],
    [
      "Costs it honestly",
      "Shows the minutes per round and hours per year, so you can pick an interval you will actually keep to.",
    ],
  ],
  faqs: [
    [
      "What are ad topics and where do they come from?",
      "They are interest labels a platform infers and attaches to your profile — 'home improvement', 'travel', 'fitness' — so advertisers can target a group rather than a person. They come from what you do on the platform, what other companies' sites and apps report back through pixels and SDKs, customer lists advertisers upload and match to your email or phone number, approximate location from your IP address, and similarity to existing audiences.",
    ],
    [
      "Does turning off ad personalisation stop tracking?",
      "No. It changes how ads are selected, not how much data is collected, and you will see the same number of ads — chosen instead by coarse signals such as approximate location, the subject of the page and the time of day. To reduce the collection itself you also have to turn off the activity settings that feed it, and delete the history already stored.",
    ],
    [
      "How do I reset my ad topics in Chrome?",
      "Open Chrome settings, then Privacy and security, then Ad privacy, then Ad topics. You can block individual topics or switch the feature off entirely. Chrome recalculates topics on a weekly cycle and keeps only the most recent few weeks, so the list turns over by itself — but the setting is per browser profile, so you have to repeat it on every profile and device.",
    ],
    [
      "Can advertisers target me by health condition or religion?",
      "Major platforms restrict targeting on sensitive categories including health, religion, sexual orientation, race and political affiliation, and several removed detailed sensitive interest options outright. Those restrictions govern what advertisers can buy, not what the platform may infer internally, and enforcement has been imperfect — if you see a sensitive-looking topic in your own list, treat it as a reason to switch personalisation off rather than to rely on the restriction.",
    ],
  ],
};

export default seo;
