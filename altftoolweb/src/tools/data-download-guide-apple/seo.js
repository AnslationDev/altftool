const seo = {
  intro:
    "This guide plans an Apple ID data request at privacy.apple.com and estimates how large the archive will be, how many part files it will arrive in, and which categories Apple physically cannot include. Apple states that a request may take up to 7 days while it verifies the request came from you, and the finished archive stays available to download for 14 days. It also separates portal data from end-to-end encrypted data such as Health, passwords and message content, which you export from the iPhone or Mac instead.",
  useCases: [
    "Size an iCloud Photos export before requesting it, so you know whether it needs an external drive rather than a laptop SSD.",
    "Request only Apple Media Services and account information to review purchase, listening and sign-in history without pulling any media.",
    "Work out which part size to choose so every downloaded file finishes inside one sitting on a slow connection.",
    "Build a complete pre-migration checklist that also covers the Health export and password export the portal leaves out.",
  ],
  benefits: [
    ["Separates portal from device", "Flags the categories Apple cannot decrypt, so nothing is quietly missed."],
    ["Real portal limits", "Uses Apple's stated 7-day preparation and 14-day download window, plus its part-size choices."],
    ["Risk-ranked", "Every category carries a 1-5 sensitivity rating so you can leave the riskiest items out of the archive."],
  ],
  faqs: [
    [
      "How do I request a copy of my Apple data?",
      "Sign in at privacy.apple.com with the Apple Account you want, choose 'Request a copy of your data', tick the categories, and pick a maximum file part size. Apple emails you when the archive is ready.",
    ],
    [
      "How long does an Apple data request take?",
      "Apple states it may take up to 7 days, because it first verifies that the request genuinely came from you. Once the archive is ready it remains available to download for 14 days, after which you have to submit the request again.",
    ],
    [
      "Is my Health data or my passwords included in the Apple export?",
      "No. Health data and iCloud Keychain passwords are end-to-end encrypted, so Apple cannot read them and cannot put them in the archive. Export Health from the Health app using 'Export All Health Data', and export logins from the Passwords app; delete any plain-text password file as soon as it has been imported.",
    ],
    [
      "Why is my Apple archive split into several files?",
      "You choose a maximum part size when you make the request, and anything larger is split into numbered parts, up to a largest option of 25 GB. Download every part — an archive is incomplete and will not extract if one file is missing. This page is informational only and not legal advice.",
    ],
  ],
};

export default seo;
