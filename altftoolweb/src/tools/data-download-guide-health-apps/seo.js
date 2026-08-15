const seo = {
  title: "Health App Data Export Guide + Record Count Estimate",
  metaDescription:
    "Choose the categories, enter wear hours, and see the heart-rate, activity and sleep record counts in a health export — and which are GDPR Art. 9 data.",
  steps: [
    "Tick the categories to export — Heart rate and variability, Sleep, Workouts with GPS, Cycle and reproductive tracking and the rest — or use 'Select all'.",
    "Enter 'Years of history', 'Hours a day the device is worn', 'Recorded workouts per week' and 'Average workout length (minutes)'.",
    "Read the sensor-record count, estimated archive size and special-category flags, then press 'Copy plan' to save the whole summary.",
  ],
  intro:
    "A wearable writes a heart-rate sample roughly every 5 seconds it is worn, a step and energy record every minute, and a sleep-stage score every 30 seconds — which is why a few years of tracking becomes millions of records. This planner turns your wear time and workout habit into that record count, sizes the export, and separates the categories that count as special-category health data under GDPR Art. 9 and sensitive personal information under India's SPDI Rules 2011. It also names the right export route for each platform, since Apple Health, Google Fit, Fitbit, Strava, Samsung Health and Garmin all differ.",
  useCases: [
    "See how many heart-rate samples four years of daily wear has produced before opening the export in a spreadsheet that cannot hold it.",
    "Export Strava activity files for a training analysis, after enabling privacy zones so the routes no longer start at your front door.",
    "Pull cycle-tracking and mood data specifically, to check whether it is stored on the device or synced to a cloud account.",
    "Audit the connected-apps list before an export, to find third-party services that have been receiving your health data for years.",
  ],
  benefits: [
    ["Counts real records", "Uses actual wearable sampling rates instead of a vague 'health data' label."],
    ["Flags special-category data", "Marks the items that carry extra legal protection so they get extra care."],
    ["Platform-correct routes", "Apple Health exports on-device, Fit and Fitbit through Takeout, Strava through its own bulk archive."],
  ],
  faqs: [
    [
      "How do I export my Apple Health data?",
      "Open the Health app, tap your profile picture at the top right, scroll down and choose Export All Health Data. It produces a zipped XML file on the device. Apple's privacy portal cannot include it because Health data is end-to-end encrypted, so this is the only route.",
    ],
    [
      "How do I download Fitbit or Google Fit data?",
      "For accounts linked to a Google Account, both export through Google Takeout — deselect everything else first so the archive stays small. Older Fitbit accounts that were never migrated still export from Fitbit's own account settings.",
    ],
    [
      "Why is my health export so large?",
      "Because continuous sensors write constantly: at a five-second heart-rate interval, sixteen hours of daily wear produces over eleven thousand samples a day, plus a per-minute activity record and a sleep score every thirty seconds. Multiply that by several years and the file runs to hundreds of megabytes before any GPS is included.",
    ],
    [
      "Is fitness data treated differently from ordinary personal data?",
      "Yes. Health data is a special category under GDPR Article 9, which requires a stronger legal basis to process, and India's SPDI Rules 2011 classify health information as sensitive personal data or information. Store the export encrypted and do not upload it to converters or analysis sites you do not control. This page is informational and is not medical or legal advice.",
    ],
  ],
};

export default seo;
