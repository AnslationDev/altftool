const seo = {
  intro:
    "This tracker turns a pile of vehicle paperwork into one dated queue: enter the expiry printed on each document and it returns the days remaining, the date you should start the renewal, and the statutory rule and penalty attached to that document. It covers insurance, the PUC certificate, the registration certificate, fitness, permit, driving licence and road tax, using the validity periods set by the Motor Vehicles Act, 1988 and the Central Motor Vehicles Rules, 1989. The list is stored only in your own browser.",
  useCases: [
    "Keeping the insurance, PUC and licence dates for two family cars and a two-wheeler in one place instead of on separate reminder apps",
    "Working out the date to book a PUC test so the certificate never lapses between six-month cycles",
    "Checking, before a long drive, whether anything in the glovebox expires while you are away",
  ],
  benefits: [
    ["Rule shown with the date", "Each entry carries the validity period and the section of the Act it comes from."],
    ["Lead time you control", "Default warning windows per document type, or one custom lead time across the whole list."],
    ["Stays on your device", "Registration numbers and dates are saved to browser storage, never sent to a server."],
  ],
  faqs: [
    [
      "How long is a PUC certificate valid in India?",
      "One year from the date of first registration for a new vehicle, and six months at a time after that, under Rule 115(7) of the Central Motor Vehicles Rules, 1989. Driving without a valid PUC attracts a penalty of up to ₹10,000 under section 190(2) of the Motor Vehicles Act.",
    ],
    [
      "What is the fine for driving without insurance?",
      "₹2,000 for a first offence and ₹4,000 for a repeat offence under section 196 of the Motor Vehicles Act, 1988, as amended in 2019, along with possible imprisonment of up to three months. Third-party cover is compulsory under section 146, so a lapsed policy also leaves you personally liable for any claim.",
    ],
    [
      "When does a private car's registration certificate expire?",
      "Fifteen years from the date of issue for a non-transport vehicle, after which it can be renewed five years at a time under sections 41(7) and 41(10) of the Motor Vehicles Act. Renewal applications can be made up to 60 days before expiry, which is why this tool defaults to a 60-day lead time for the RC.",
    ],
    [
      "Is my data uploaded anywhere?",
      "No. The document list is written to your browser's local storage and read back on the same device, so clearing site data or switching browsers removes it. Export or copy the summary if you want a backup.",
    ],
  ],
};

export default seo;
