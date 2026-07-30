const seo = {
  intro:
    "The Airport and Transit Security Checklist scores how well your devices, documents and screens are protected across the four moments that actually matter: leaving home, the security tray, the lounge and cabin, and the immigration queue. Items are weighted by severity, and four are treated as hard rules — full-disk encryption, a six-digit-or-longer passcode, powering devices fully off before a border, and disabling biometric unlock there — because leaving any of them undone cannot be offset by the rest of the list. Aimed at ordinary travellers and at anyone carrying a work laptop through an unfamiliar border.",
  useCases: [
    "Run through the list the night before a long-haul flight instead of remembering the tray habit at the scanner.",
    "Prepare a work laptop for a border crossing where device inspection is possible, and know what to leave behind.",
    "Brief a family member or a first-time flyer on the handful of habits that prevent almost all in-transit device loss.",
    "Check the return leg, when you are tired and most likely to leave a passport in a seat pocket.",
  ],
  benefits: [
    [
      "Ordered by the trip, not by topic",
      "Each item sits in the phase where you can actually do it, so nothing is a reminder you cannot act on.",
    ],
    [
      "Hard rules that cannot be scored around",
      "Missing encryption, a weak passcode or a powered-on device at the border caps the score at 49% regardless of the rest.",
    ],
    [
      "Explains why, in one line",
      "Every item carries the mechanism behind it, so you can decide which trade-offs are worth it for your trip.",
    ],
  ],
  faqs: [
    [
      "Should I turn my phone off before going through immigration?",
      "Yes, a full power-off is the single most effective step. A phone that has been rebooted and not yet unlocked is in a Before First Unlock state, where the file-encryption keys are not held in memory; once it has been unlocked even once, many keys stay resident and forensic extraction becomes far easier. Locking the screen is not the same thing as powering off.",
    ],
    [
      "Why should I disable Face ID or fingerprint unlock at a border?",
      "Because a biometric can be applied to a device you are holding in seconds, while a passcode has to be given. Both platforms have a one-gesture lockout that forces passcode-only entry: on iPhone hold the side button with either volume button until the power slider appears, or press the side button five times; on Android use Lockdown from the power menu. Legal treatment of compelled unlock varies by country, so check the rules for your destination.",
    ],
    [
      "Is it safe to charge my phone at an airport USB port?",
      "Use your own charger, a power bank, or a charge-only cable or USB data blocker instead. The FBI and the FCC have both issued public warnings about compromised public charging points, and a charge-only cable removes the risk entirely because it has no data pins. A wall socket with your own adapter is always safer than a bare USB port.",
    ],
    [
      "Why should I not post a photo of my boarding pass?",
      "The barcode encodes your booking reference, which on most airline websites is enough to open the reservation with just your surname. From there someone can read your itinerary and contact details, see or change your frequent flyer number, and in some cases cancel the flight. Destroy the pass after travel rather than leaving it in a seat pocket or a bin.",
    ],
  ],
};

export default seo;
