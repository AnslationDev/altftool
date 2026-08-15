const seo = {
  title: "Fitness App Permission Audit: Score 16 Permissions",
  metaDescription:
    "Score the 16 permissions a fitness app holds — background location, body sensors, Health Connect, ad ID — weighted by sensitivity, with a revoke list.",
  steps: [
    "Type the App name for the report and stay on Checklist, or switch to \"Paste list\" and paste the permissions from the Play Store listing (About this app > App permissions > See more), one per line.",
    "Tick every permission the tracker currently holds, or start from the \"Typical tracker\", \"Everything granted\" or \"Clear all\" presets; each row is marked \"Required for core features\", \"Optional feature only\" or \"Not needed by a fitness app\".",
    "Read the privacy score out of 100 with its verdict band, the counts for Revoke now and Restricted / special access granted, and the \"Revoke these first\" list, with the Android manifest constant and iOS prompt for each of the 16 permissions in the table below.",
  ],
  intro:
    "The Fitness App Permission Audit scores the permissions a workout or step-tracking app holds against the data-minimisation rule: a permission passes only when a core feature cannot work without it. Sixteen Android and iOS permissions — physical activity, body sensors, Health Connect, precise and background location, nearby devices, camera, contacts and the advertising ID — are weighted by sensitivity, with Google Play restricted permissions such as ACCESS_BACKGROUND_LOCATION and BODY_SENSORS_BACKGROUND carrying the heaviest weight. You get a 0-100 privacy score, a ranked revoke list and the exact manifest name to look for in Settings.",
  useCases: [
    "Decide whether a running app really needs 'Allow all the time' location or whether 'While using the app' covers your GPS routes.",
    "Check a new smartwatch companion app before granting Health Connect 'Allow all' across every record type.",
    "Explain to a parent or colleague why a step counter asking for Contacts and Phone is over-collecting.",
    "Re-audit a tracker after an update that added background body-sensor access for 24x7 heart rate.",
  ],
  benefits: [
    [
      "Weighted, not a plain checklist",
      "Restricted permissions score five times a normal one, so a single background-location grant outweighs several harmless ones.",
    ],
    [
      "Names the exact setting",
      "Every row shows the Android manifest constant and the matching iOS prompt so you can find it in Settings.",
    ],
    [
      "Verdict caps",
      "One unnecessary grant holds the verdict at 'Low exposure' even when the raw score looks good.",
    ],
  ],
  faqs: [
    [
      "Does a fitness app need background location?",
      "No, not for tracking a workout you start yourself — 'While using the app' is enough, because the app is in the foreground with an active workout notification. ACCESS_BACKGROUND_LOCATION is only justified for automatic workout detection, and Google Play classes it as a restricted permission requiring a core-functionality declaration.",
    ],
    [
      "Why does my step counter ask for Physical activity permission?",
      "ACTIVITY_RECOGNITION (Motion & Fitness on iOS) is what lets the app read the phone's hardware step counter and motion classifier. Denying it stops step, floor and automatic activity logging, so it is the one permission a step tracker genuinely cannot do without.",
    ],
    [
      "Is it safe to give a fitness app my contacts?",
      "Granting Contacts uploads names and numbers of people who never installed the app or agreed to anything, and no core tracking feature needs it — friend features work from a username or invite link. Revoke it and share a link instead.",
    ],
    [
      "What is the difference between Body sensors and Health Connect?",
      "Body sensors (BODY_SENSORS) reads live readings from a sensor right now, such as heart rate from a band or phone. Health Connect, or HealthKit on iOS, is a shared store that hands over history written by every other app, so grant its record types individually rather than using 'Allow all'.",
    ],
  ],
};

export default seo;
