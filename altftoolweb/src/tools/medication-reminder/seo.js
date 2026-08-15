const seo = {
  title: "Medication Reminder — Private Daily Dose Schedule",
  metaDescription:
    "Keep a private list of medicines — name, dosage, frequency, time — with doses sorted into an upcoming schedule. Stored in your browser; no account.",
  steps: [
    "Click + Add Medication and enter the Medication Name, Dosage (e.g. 500mg, 1 tablet) and Time of Day.",
    "Pick a Frequency — Daily, Twice Daily, Weekly or As Needed — and press Save Medication.",
    "Read the Upcoming Doses list, sorted by time of day; entries persist in this browser's local storage between visits.",
  ],
  intro:
    "The Medication Reminder is a private daily medication list: you record each medicine's name, dosage, frequency (daily, twice daily, weekly or as needed) and time of day, and it builds an upcoming-doses view sorted from earliest to latest time. Entries are saved in your own browser so the list is still there next visit, with no account and no data sent anywhere. It is a written schedule for your own reference, not an alarm and not medical advice.",
  useCases: [
    "You have been discharged with four new medicines on different schedules and want one written list, ordered by time of day, that you can glance at each morning.",
    "You are looking after a parent and need a clear card to leave by the kettle showing exactly which tablet, what dose and at what time — without installing a health app that wants an account.",
    "You are about to see your doctor or pharmacist and want to read out an accurate current list, including the as-needed medicines that are easy to forget you are on.",
  ],
  benefits: [
    ["Sorted into a real day", "Doses are ordered by clock time rather than by the order you added them, so the list reads the way your day actually runs."],
    ["Dosage travels with the name", "Every entry keeps its own dose text — 500mg, 1 tablet, half a sachet — so the strength is never separated from the medicine."],
    ["No account, no upload", "The list lives in your browser's local storage only, which keeps a sensitive health list off any server."],
  ],
  faqs: [
    [
      "Will this send me an alert or notification when a dose is due?",
      "No. It is a schedule you read, not an alarm — it does not use push notifications, sound or your device's alarm clock, so the page must be open for you to see it. If you need to be actively prompted, set a repeating alarm on your phone alongside this list.",
    ],
    [
      "What frequencies can I choose?",
      "Four options: daily, twice daily, weekly, and as needed. Each entry also carries a single time of day, so for twice-daily medicines many people add two entries — one for the morning dose and one for the evening.",
    ],
    [
      "Where is my medication list stored?",
      "In your browser's local storage on the device you used, under a single key. Nothing is uploaded, which also means the list will not appear on another device or browser, and clearing your site data or using a private window will erase it — keep a written copy of anything important.",
    ],
    [
      "Can I use this to decide what or when to take something?",
      "No. This tool only records what you type; it does not check doses, interactions, contraindications or timing, and it has no drug database behind it. Dosing decisions, changes and interaction questions belong with your prescriber or pharmacist.",
    ],
  ],
};

export default seo;
