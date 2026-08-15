const seo = {
  title: "Android Hardening Checklist by Version & Patch",
  metaDescription:
    "Filter dozens of Android security settings to your OS version and threat profile, weight them by impact, and grade your security patch date.",
  steps: [
    "Pick your Android version, answer How is this phone used? (everyday, someone who might get their hands on my phone, high risk, or work phone/BYOD), and enter the Security patch level date.",
    "Tick the items that apply, from Use a PIN of at least six digits and Enable lockdown mode on the power menu to Turn off 2G, Set a SIM PIN and Move sensitive apps into Private Space.",
    "Read the Hardening score with the count of items done weighted by impact, the patch-level grade against Android's monthly bulletins, and the settings your version does not have.",
  ],
  intro:
    "Android Hardening Checklist filters roughly three dozen concrete Android security settings to the version you are actually running and the situation the phone is used in, then weights each one by how much risk it removes to produce a hardening score. Items are tagged with the Android release that introduced them — lockdown mode in Android 9, the 2G switch and privacy dashboard in Android 12, restricted settings in Android 13, Private Space and theft detection in Android 15, Advanced Protection in Android 16 — so nothing sends you looking for a menu that does not exist. It also grades your security patch level against Android's monthly bulletin cycle.",
  useCases: [
    "Harden a new Android phone in one pass, in order of how much each setting actually helps.",
    "Check how many monthly security bulletins a phone has missed and whether the device is still supported at all.",
    "Audit a phone for stalkerware indicators — accessibility services, device admin apps and install-unknown-apps grants.",
    "Prepare a device before a border crossing or a situation where someone else may get physical access to it.",
  ],
  benefits: [
    ["Version-aware", "Every item shows the Android release it arrived in, and settings your version does not have are listed separately rather than silently."],
    ["Weighted, not alphabetical", "A SIM PIN and account two-factor outrank Quick Share visibility, and the score reflects that."],
    ["Patch level graded", "Enter the security patch date and it converts to how many monthly bulletins you are behind."],
  ],
  faqs: [
    [
      "How do I check my Android security patch level?",
      "Settings, then Security & privacy, then System & updates, then Security update — the date shown there is your actual patch level. Android publishes a security bulletin every month, so a patch date more than about 90 days old means several bulletins have been missed, and the Android version number on its own tells you nothing about which fixes you have.",
    ],
    [
      "Is a six-digit PIN better than a fingerprint on Android?",
      "They protect against different things. A fingerprint is faster and encourages you to keep a strong PIN behind it, but the PIN is the actual key — a four-digit PIN has 10,000 combinations against a million for six digits. Lockdown mode, on the power menu since Android 9, disables biometrics and Smart Lock until the PIN is entered, which is the control worth knowing about.",
    ],
    [
      "How do I check my Android phone for stalkerware?",
      "Look in three places: Settings then Accessibility then Downloaded apps, Settings then Security & privacy then More security settings then Device admin apps, and Settings then Apps then Special app access then Install unknown apps. Monitoring apps need accessibility access to read the screen and often register as device admins to resist removal, so anything unfamiliar in those lists deserves investigation. If you may be at risk from someone with physical access, seek support from a specialist organisation before changing settings, since sudden changes can be noticed.",
    ],
    [
      "Should I turn off 2G on my phone?",
      "If your carrier no longer needs it, yes. 2G has no mutual authentication and weak or absent encryption, which is exactly what cell-site simulators rely on by forcing a downgrade from a modern network. Android 12 added a per-SIM Allow 2G switch under Network & internet. Some regions still use 2G for emergency calling fallback, and Android keeps emergency calls working regardless of the setting.",
    ],
  ],
};

export default seo;
