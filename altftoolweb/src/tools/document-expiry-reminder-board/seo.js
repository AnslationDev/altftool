const seo = {
  title: "Document Expiry Tracker: Passport, Licence, PUC",
  metaDescription:
    "Track every expiry date with a staged reminder ladder, the date each renewal window opens, and a six-month passport check against your travel date.",
  steps: [
    "Set Today's date and, if you are travelling, a Planned travel date, then for each row pick a Document type such as Passport, Driving licence, Pollution Under Control certificate or Warranty or AMC, give it a Name on the board and a Reference number, and set the date it Expires on.",
    "Edit \"Remind me this many days before (comma separated)\" to set that document's reminder ladder, and press Add a document for every other item you want tracked.",
    "The summary reports Documents tracked, Already expired, Expiring within 90 days, the Next expiry and any Travel validity problems, a Before you travel section names the documents at risk, and Copy result exports the whole board.",
  ],
  intro:
    "This board tracks the expiry date of every document you own and turns each one into a reminder ladder — typically 90, 30 and 7 days out — instead of a single alarm that arrives too late to be useful. It also dates the day each renewal window opens, using the real rules: an Indian passport may be re-issued from a year before expiry, and a driving licence may be renewed from 30 days before it under section 15 of the Motor Vehicles Act. Add a travel date and it checks passports and visas against the six-month validity rule most destinations apply on entry.",
  useCases: [
    "Find out whether a passport expiring in November is valid enough for a trip in August under the six-month rule.",
    "Get the date a driving licence renewal can first be filed, rather than discovering the window after it closed.",
    "Keep a household's passports, PUC certificates, insurance and warranties on one printable page.",
    "Set three graded reminders for a professional certification that needs continuing-education credits collected months in advance.",
  ],
  benefits: [
    ["A ladder, not one alarm", "Each document gets several reminders, so there is time to start and time to chase."],
    ["Renewal windows dated", "It shows the earliest date each authority will accept an application, not just the deadline."],
    ["Travel validity check", "Passports and visas are tested against the six-month and Schengen three-month rules."],
  ],
  faqs: [
    [
      "How early can I renew an Indian passport?",
      "Up to one year before it expires, and a re-issue application is still accepted for up to three years after expiry at the normal fee. Applying earlier than a year out is generally not accepted, so a year before expiry is the practical first reminder.",
    ],
    [
      "What is the six-month passport rule?",
      "Many countries require a passport to remain valid for at least six months beyond the date you enter. The Schengen area applies a different test — validity of at least three months beyond your intended departure, plus a rule that the passport was issued within the previous ten years. This board's travel check only tests the expiry-date side of these rules (the six-month and three-month validity windows) against the expiry date you entered — it doesn't collect a passport's issue date, so a clean 'Before you travel' section doesn't confirm the ten-year-issuance part of the Schengen rule. Check that yourself, and remember airlines enforce all of this at check-in, so a technically valid passport can still stop you boarding.",
    ],
    [
      "When can a driving licence be renewed in India?",
      "From 30 days before expiry, under section 15 of the Motor Vehicles Act, 1988. Renewing more than 30 days after expiry attracts a late fee, and if more than five years have passed since expiry you have to take the driving test again.",
    ],
    [
      "How long is a PUC certificate valid?",
      "Six months for a vehicle in normal use, and one year from the date of registration for a new vehicle. Driving without a valid Pollution Under Control certificate is a fineable offence, and insurers can ask to see one at renewal.",
    ],
  ],
};

export default seo;
