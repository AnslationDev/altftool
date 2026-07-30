const seo = {
  intro:
    "The fake traffic challan scam is a smishing campaign in which an SMS or WhatsApp message impersonates an e-challan notice and pushes the reader either to install an Android package file or to pay a fine into a private UPI ID. This explainer breaks the campaign into seven stages, scores the message you received against a weighted twelve-point checklist, validates the registration number it quotes against the real Indian format including the Bharat (BH) series, and totals the statutory penalty under the Motor Vehicles Act, 1988 as amended in 2019 so you can see how the demanded amount compares.",
  useCases: [
    "An SMS from a 10-digit number claims a 4,500 rupee challan for signal jumping and links to a shortened URL.",
    "Checking whether the vehicle number in a challan message is even a well-formed Indian registration mark.",
    "Comparing a demanded fine against the section-wise amount the Act sets — 1,000 rupees for no helmet under Section 194D, 10,000 for no PUC under Section 190(2).",
    "Explaining to a family member why tapping an APK link in a challan SMS is the attack itself, not a step towards paying.",
  ],
  benefits: [
    [
      "Offline number validation",
      "Parses the state code, RTO number, series and serial without sending your registration anywhere.",
    ],
    [
      "Section-wise penalty table",
      "Fourteen offences with their Motor Vehicles Act section and both first and repeat-offence amounts.",
    ],
    [
      "Names the decisive tells",
      "An APK download, a non-gov.in link and a UPI demand each rule out a genuine challan on their own.",
    ],
  ],
  faqs: [
    [
      "How do I check if a traffic challan SMS is real?",
      "Ignore the link entirely and look the challan up yourself at echallan.parivahan.gov.in using your vehicle number, driving licence number or the challan number. A genuine e-challan appears there with the offence, location, date and a photograph. If nothing is listed against your vehicle, no challan was issued.",
    ],
    [
      "Why does the challan link download an APK file?",
      "Because the APK is the attack. Installing it grants an app that requests SMS, notification and accessibility permissions, which lets it read one-time passwords and authorise transactions or forward the same message to your contacts. No transport department distributes an app through an SMS link — mParivahan is published on Google Play and the App Store only.",
    ],
    [
      "What is the real fine for riding without a helmet or driving without a PUC certificate?",
      "Under the Motor Vehicles (Amendment) Act, 2019, riding without a helmet carries 1,000 rupees plus a three-month licence disqualification under Section 194D, and driving without a valid pollution under control certificate carries 10,000 rupees under Section 190(2). These are the central figures; states set their own compounding amounts under Section 200, so the amount charged locally can differ.",
    ],
    [
      "I already installed the app from the link. What now?",
      "Put the phone in aeroplane mode, uninstall the app, and then change your net banking, UPI and email passwords from a different, clean device rather than the affected phone. Call your bank to freeze transactions, report at cybercrime.gov.in or on helpline 1930, and consider a factory reset. Reporting a fraudulent debit quickly is what makes a beneficiary-account freeze possible.",
    ],
  ],
};

export default seo;
