const seo = {
  title: "Keyboard App Permission Audit & Revoke List",
  metaDescription:
    "Scores what a third-party keyboard reaches beyond the keys — network, cloud sync, clipboard history, contacts — out of 100, with a ranked revoke list.",
  steps: [
    "Type the App name (for the report), then choose Checklist or Paste list to enter what the keyboard holds.",
    "Tick items under Permissions and settings this app currently holds, or start from the Typical keyboard preset and adjust.",
    "Read the Privacy score out of 100 with Revoke these first, Worth reviewing and Every item, with its manifest name, then press Copy result.",
  ],
  intro:
    "The Keyboard App Permission Audit scores what a third-party keyboard can reach beyond the keys — network access, cloud dictionary sync, clipboard history, contacts and location — and returns a 0-100 privacy score with a ranked list of what to switch off. Being your keyboard is inherently high-trust: Android warns that an input method may collect all the text you type, including passwords and card numbers, and on iOS a keyboard cannot reach the network at all until you turn on Allow Full Access. The audit weights each item by sensitivity and by whether typing genuinely needs it.",
  useCases: [
    "Decide whether to leave Allow Full Access on for a keyboard you use to type banking messages.",
    "Check a newly installed keyboard before you let it learn from your typing.",
    "Work out which of a keyboard's settings to turn off instead of uninstalling it outright.",
    "Compare a cloud-prediction keyboard against an offline one before choosing a default.",
  ],
  benefits: [
    [
      "Separates the inherent risk from the extras",
      "Seeing your keystrokes comes with being a keyboard; network access, cloud sync and contacts do not.",
    ],
    [
      "Covers settings, not just permissions",
      "Clipboard history and 'learn from my typing' are toggles, and they leak more than most runtime permissions.",
    ],
    [
      "Points at the exact switch",
      "Every row names the Android manifest constant or the iOS setting so you can find it and change it.",
    ],
  ],
  faqs: [
    [
      "Can a third-party keyboard steal my passwords?",
      "It can technically see any text typed through it, which is why Android shows an explicit warning when you enable one. Two things limit the damage: password fields marked secure are usually excluded from learning, and on iOS a keyboard is sandboxed with no network access until you turn on Allow Full Access.",
    ],
    [
      "What does 'Allow Full Access' actually do on iOS?",
      "It lets the keyboard extension talk to the network and share data with its containing app — required for cloud prediction, GIF search, translation and theme downloads. With it off, the keyboard runs sandboxed and cannot send anything you type off the device.",
    ],
    [
      "Should a keyboard have my contacts?",
      "No. Contact access is offered so the keyboard can suggest names, but it already learns names as you type them, and granting it uploads details of people who never consented. Revoke it and let the personal dictionary do the work.",
    ],
    [
      "Is clipboard history in a keyboard risky?",
      "Yes, because password managers and OTP messages both work by copying to the clipboard, and a keyboard with clipboard history keeps those strings ready to paste. Android 12 and later shows a toast whenever an app reads the clipboard — turn history off or set it to auto-clear.",
    ],
  ],
};

export default seo;
