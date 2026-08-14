const seo = {
  title: "Kids Milestone & Vaccine Vault: Private Local Log",
  metaDescription:
    "Log first steps, first words and shot dates as entries kept in your browser's local storage - searchable, deletable and exportable as JSON.",
  steps: [
    "Write the shot or milestone into the Milestone or vaccine box and the date into Date and details.",
    "Press Add record — the entry is written to this browser's local storage and appears under Saved records, which the Search records box filters across both fields.",
    "Press Export JSON to save every record as kids-milestone-vaccine-vault.json; Import JSON reads that file back into another browser, replacing what is stored there.",
  ],
  intro:
    "The Kids Milestone & Vaccine Vault is a private log where each entry has two fields — the milestone or vaccine, and the date and details — kept in your own browser's local storage rather than on a server or in an account. You can search across every saved entry, delete individual records, and export the whole set as a JSON file you can back up or import into another browser. It is for parents who want one running record of first steps, first words and shot dates without handing that information to an app.",
  useCases: [
    "You came home from a well-child visit with a vaccine given and a date, and want it written down before the paper card goes missing.",
    "Your pediatrician asks when your child first walked or said a first word, and you want a searchable log instead of scrolling through camera-roll dates.",
    "You are changing clinics or moving countries and want an exportable file of everything recorded so far to hand over or re-enter.",
  ],
  benefits: [
    ["Nothing leaves the device", "Records are written only to this browser's local storage — there is no account, no sync and no upload step."],
    ["Searchable across both fields", "The search box matches text anywhere in an entry, so typing MMR or a year narrows a long list instantly."],
    ["Portable JSON export and import", "One click writes every record to a JSON file you control, and the same file can be imported back into another browser or device."],
  ],
  faqs: [
    [
      "Is the data encrypted?",
      "No — entries are stored as plain JSON in this browser's local storage, and the export is a plain JSON file. That means anyone with access to your unlocked device or to the exported file can read it, so rely on your device's own lock screen and disk encryption, and store exports somewhere protected.",
    ],
    [
      "Will my records still be there tomorrow?",
      "Yes, as long as you use the same browser on the same device and do not clear site data. Clearing browsing data, using private or incognito mode, or switching browsers will lose the entries, so export the JSON file periodically as a backup.",
    ],
    [
      "Can I use this instead of the official immunisation card?",
      "No — keep the card or clinic record your provider issues, because schools, travel requirements and clinics need the documentation signed by the provider. Treat this as your own convenient copy and the official record as the source of truth.",
    ],
    [
      "Does it tell me which vaccines are due?",
      "No, it stores what you enter and does not carry a schedule or send reminders. Vaccination schedules differ by country and are adjusted for a child's history, so ask your pediatrician or check your national immunisation schedule for what is due and when.",
    ],
  ],
};

export default seo;
