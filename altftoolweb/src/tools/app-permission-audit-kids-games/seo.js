const seo = {
  title: "Kids Game Permission Audit: What to Revoke",
  metaDescription:
    "Score the 16 permissions a child's game can hold, from precise location to the Advertising ID, and see which to revoke and exactly what each one breaks.",
  steps: [
    "Enter the Player's age (years) and tick what the game honestly does — voice chat, photo or avatar import, map-based play, same-room multiplayer.",
    "Under Permissions the game currently has, tick each of the 16 permissions it holds, using Select all or Clear all to start quickly.",
    "Read the Exposure score out of 100, the red-flag count and the Revoke these now list, which names the feature each revoke breaks.",
  ],
  intro:
    "This audit scores the permissions a children's game app holds on a phone and tells you which to revoke, which to keep, and exactly what each one breaks. It weighs 16 real Android and iOS permissions — from ACCESS_FINE_LOCATION and READ_CONTACTS to the Advertising ID and accessibility services — by how much harm they cause on a child's device, then escalates the verdict when a high-harm permission has no gameplay justification. Guidance is anchored to COPPA (16 CFR Part 312) for under-13s, India's DPDP Act 2023 section 9 for under-18s, and the Google Play Families and Apple Kids Category store rules.",
  useCases: [
    "A free puzzle game your seven-year-old installed is asking for contacts and precise location — decide in a minute whether to revoke both or uninstall.",
    "Do a termly sweep of every game on a child's tablet and record which permissions you turned off, so you can tell later if an update quietly asked again.",
    "Check whether an app that claims to be 'made for kids' is actually consistent with Google Play's Families policy on the Advertising ID before you allow the install.",
    "Work out which permission you can safely remove when a game with real voice chat also wants camera, photos and physical activity access.",
  ],
  benefits: [
    ["Tells you what breaks", "Every revoke suggestion names the feature that stops working, so you are not guessing whether the game will still run."],
    ["Weighted, not a tick list", "Contacts, SMS and the Advertising ID score far higher than notifications, so the biggest problem surfaces first."],
    ["Age-aware", "Under 13 pulls in COPPA and the store child-audience rules; under 18 pulls in the DPDP Act's ban on targeted advertising to children."],
  ],
  faqs: [
    [
      "Which permissions should a kids game never have?",
      "Contacts, SMS, call log, calendar, all-files access and any accessibility service — none of them have a gameplay use, and an accessibility service can read every screen and simulate taps in any app, so a game requesting one is a reason to uninstall. Precise location and the Advertising ID also belong on that list unless the game is genuinely map-based.",
    ],
    [
      "Is it illegal for a children's game to track my child?",
      "In the US, COPPA (16 CFR Part 312) requires verifiable parental consent before a child-directed service collects personal information from anyone under 13, and precise geolocation and persistent identifiers like advertising IDs count as personal information. In India, section 9 of the DPDP Act 2023 goes further and bars tracking, behavioural monitoring and targeted advertising directed at anyone under 18. Enforcement is a matter for regulators — for a specific complaint, speak to a lawyer or your data protection authority.",
    ],
    [
      "How do I stop a game from seeing all my photos without breaking its avatar feature?",
      "Switch from full library access to a picker. On Android set Photos and videos to 'Ask every time' so the system Photo Picker hands over only the chosen image, and on iOS set Photos to 'Limited Access' and pick the specific images. The avatar upload still works and the app never sees the rest of the camera roll or the location data stored in each file.",
    ],
    [
      "Will revoking permissions make the game stop working?",
      "Usually not. On Android 6 and later, and on iOS, apps must handle a denied permission gracefully, and Android 11 already auto-resets permissions for apps left unused for a few months. The one real trade-off is a feature the game actually uses — voice chat needs the microphone, same-room multiplayer needs nearby devices — which is why this audit separates those from the permissions with no justification at all.",
    ],
  ],
};

export default seo;
