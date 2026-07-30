const seo = {
  intro:
    "A family smart TV is protected by several independent control layers — the device profile, the store purchase PIN, the app-install lock, and a separate parental control inside each streaming app — and this guide lists the ones that apply to your specific platform and apps. It also works out the maturity ceiling for a child's age using the ratings that carry an explicit age (TV-Y7 at 7, TV-14 at 14, TV-MA at 17; PG-13 at 13, R at 17), and counts how many separate PINs the finished setup will need.",
  useCases: [
    "Setting up a new Roku, Fire TV or Google TV in a family room and wanting purchases locked before anyone touches the remote.",
    "Stopping a child hopping into an adult Netflix profile by adding a per-profile PIN.",
    "Working out why YouTube keeps autoplaying unsuitable videos on a TV with parental controls already on.",
    "Changing a Samsung or LG TV away from its 0000 default PIN after buying it second-hand.",
  ],
  benefits: [
    ["Platform-specific paths", "Roku's PIN preference lives on a website, Fire TV's lives in Preferences — the checklist gives the right one."],
    ["App layer included", "Netflix, YouTube, Disney+ and Prime Video each have their own controls that the TV's settings do not reach."],
    ["PIN inventory", "The plan lists every distinct PIN the setup relies on, so none of them stays at a default."],
  ],
  faqs: [
    [
      "How do I stop kids buying films on a smart TV?",
      "Require a PIN for every purchase and rental in the platform's store settings, and require it for adding channels or installing apps as well. The stronger version is to remove the saved card from the account entirely and top up with gift-card balance, because a PIN can be watched over a shoulder.",
    ],
    [
      "What is the default PIN on a Samsung or LG TV?",
      "0000 on both. On Samsung, change it under Settings > General > System Manager > Change PIN; on LG, turn on Safety Mode under Settings > General > Safety and change the PIN there. Leaving the default means every rating lock you set can be lifted by anyone who has read the manual.",
    ],
    [
      "Why does my child still see adult content with parental controls on?",
      "Because controls are per-layer and per-profile. A device-level rating limit does not filter inside Netflix, Disney+ or YouTube — each of those has its own profile rating and PIN. The other common cause is a child watching on the adult profile, which is why the profile lock PIN matters as much as the rating.",
    ],
    [
      "What maturity rating should I allow for my child's age?",
      "Use the ratings that state an age: TV-Y7 is directed at children 7 and older, TV-14 is unsuitable under 14, and TV-MA is for 17 and over. For films, PG-13 flags material that may be inappropriate under 13, and R requires an accompanying adult for anyone under 17. Ratings are a floor, not a judgement about a particular child.",
    ],
  ],
};

export default seo;
