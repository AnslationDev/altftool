const seo = {
  "intro": "This checklist scores an Android phone against 27 real privacy settings — deleting the advertising ID, Web & App Activity, Location History, per-app precise versus approximate location, Wi-Fi and Bluetooth scanning, the Permission Manager, accessibility and notification access, Quick Share visibility, backup encryption and screen-lock strength — weighting each by how much exposure it actually closes rather than treating every toggle as equal. Seven controls are marked critical and hold the score at 69% while any is still open, because a precise-location grant or an unnoticed accessibility service outweighs a dozen cosmetic switches. Five risk profiles re-score the same list, so someone minimising what Google collects and someone worried about stalkerware are graded on different things.",
  "useCases": [
    "Do a full privacy pass on a new Android phone before it starts building an account-level history you never agreed to.",
    "Check a phone for stalkerware indicators — accessibility services, device admin apps, notification access and all-the-time location.",
    "Reduce what Google's account-level history stores, using auto-delete windows where switching a service off entirely is not practical.",
    "Prepare a phone for travel, focusing on what it broadcasts to nearby devices and what is readable if someone takes it."
  ],
  "benefits": [
    [
      "Knows where the real leaks are",
      "Wi-Fi scanning, accessibility access and precise location outscore the obvious toggles, because those are what actually expose you."
    ],
    [
      "Covers the vendor layer",
      "Samsung, Xiaomi and other manufacturer accounts run a parallel data pipeline that Google's settings do not touch, and it has its own item."
    ],
    [
      "Nothing leaves the tab",
      "The checklist runs entirely in your browser, reads nothing from your phone, and never asks for a Google account or password."
    ]
  ],
  "faqs": [
    [
      "How do I delete my advertising ID on Android?",
      "Settings > Security and privacy > More privacy settings > Ads, then choose Delete advertising ID. Deleting is stronger than resetting: apps that request the ID afterwards receive a string of zeros, whereas a reset simply issues a new identifier and profiling starts again from scratch. Menu wording varies by manufacturer — Samsung and Xiaomi place it slightly differently."
    ],
    [
      "Does turning off location stop my phone being tracked?",
      "Not on its own. Wi-Fi scanning and Bluetooth scanning, both under Settings > Location > Location services, let apps and services scan for nearby networks and devices to estimate your position even when location and the radios themselves are switched off. Both are on by default and need turning off separately."
    ],
    [
      "What is the difference between precise and approximate location on Android?",
      "Precise gives an app your exact coordinates, accurate enough to identify a specific building. Approximate limits it to roughly a neighbourhood — accurate enough for weather, local news, shopping and most social features. You can downgrade any app individually under Settings > Location > App location permissions, and almost nothing except turn-by-turn navigation genuinely needs precise."
    ],
    [
      "Which Android permission does stalkerware need?",
      "Accessibility service access is the one to check first: it lets an app read everything on screen and act on your behalf, which is why both banking malware and monitoring apps target it. Also check Device admin apps, which resist uninstallation, and notification access, which exposes incoming message previews and two-factor codes. If you find something you did not install and you are in an unsafe situation, consider getting help before removing it, because removal can be noticed."
    ]
  ]
};

export default seo;
