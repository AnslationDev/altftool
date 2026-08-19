const seo = {
  title: "iPhone Privacy Settings Checklist: 27 Controls",
  metaDescription:
    "Score your iPhone on 27 weighted settings — App Tracking, Significant Locations, Find My shares, Advanced Data Protection, Stolen Device Protection.",
  steps: [
    "Choose a profile in \"Who are you locking this down for?\" — Everyday personal iPhone is the first option — and set the Target score (%) field.",
    "Work through the 27 settings in the grouped cards, ticking each one you have applied; every row prints the Settings path under \"Where:\" and the consequence under \"If you skip it:\".",
    "Read the Protection score with Critical settings still open, Remaining exposure by area and \"Shortest route to your target\", then press Copy result.",
  ],
  "intro": "This checklist scores an iPhone against 27 real privacy and security settings — App Tracking Transparency, Apple's separate personalised ads, Significant Locations, per-app Precise Location, photo GPS metadata, Find My sharing, Advanced Data Protection, lock screen access, Stolen Device Protection and Apple Account two-factor — weighting each by how much exposure it actually closes. Eight controls are marked critical and hold the score at 69% while any is still open, because a forgotten Find My share or an accessible lock screen outweighs any number of advertising toggles. Five risk profiles re-score the same list, so someone protecting against phone theft and someone worried a partner has their passcode are graded on completely different priorities.",
  "useCases": [
    "Set up a new iPhone properly, including the settings the setup assistant never asks about.",
    "Check what a partner, parent or ex can still see — Find My shares, shared albums, Family Sharing and iCloud access — using Safety Check as the fast path.",
    "Harden a phone against street theft, where the attacker has watched you type your passcode before taking it.",
    "Prepare a phone for higher-risk work, focusing on Advanced Data Protection, backup contents and reduced attack surface."
  ],
  "benefits": [
    [
      "Finds the buried settings",
      "Significant Locations, System Services location and lock screen access are all several levels deep and all scored heavily, because that is where the exposure sits."
    ],
    [
      "Warns before you lock yourself out",
      "Advanced Data Protection is scored alongside account recovery, because enabling one without the other is how people lose their data permanently."
    ],
    [
      "Nothing leaves the tab",
      "The checklist runs entirely in your browser, reads nothing from your phone, and never asks for an Apple Account or passcode."
    ]
  ],
  "faqs": [
    [
      "What are Significant Locations on iPhone and should I turn them off?",
      "Significant Locations is a timestamped log of the places you visit regularly, kept so the phone can offer location-based suggestions. It is encrypted and stored on the device rather than in the cloud, but anyone who knows your passcode can read your movement history from it in under a minute. Find it at Settings > Privacy & Security > Location Services > System Services > Significant Locations, where you can turn it off and clear the existing history."
    ],
    [
      "Does turning off App Tracking Transparency stop all tracking?",
      "No. That switch covers apps tracking you across other companies' apps and websites. Apple's own advertising in the App Store, News and Stocks is governed by a separate setting at Settings > Privacy & Security > Apple Advertising, and analytics sharing at Settings > Privacy & Security > Analytics & Improvements is a third. All three need turning off individually."
    ],
    [
      "What does Stolen Device Protection actually do?",
      "It defends against a thief who watched you type your passcode before taking the phone. When enabled and you are away from familiar locations, sensitive actions — changing the Apple Account password, turning off Find My, accessing stored passwords — require Face ID or Touch ID with no passcode fallback, and the most critical ones also enforce a one-hour security delay with a second biometric check. Turn it on at Settings > Face ID & Passcode."
    ],
    [
      "Should I turn on Advanced Data Protection for iCloud?",
      "It extends end-to-end encryption to most iCloud categories, including iCloud Backup, which otherwise leaves your message history recoverable by Apple. The trade-off is real: with it on, Apple genuinely cannot recover your account, so if you lose your devices, your recovery key and your recovery contact, the data is gone permanently. Set up account recovery first, then enable it."
    ]
  ]
};

export default seo;
